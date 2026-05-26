import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // GET: WhatsApp Webhook Handshake Verification
  if (method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const expectedToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'easybuy4me_secret_token';

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('Webhook verified successfully!');
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      console.error('Handshake verification failed.');
      return new Response('Verification token mismatch', { status: 403 });
    }
  }

  // POST: Receiving message events from WhatsApp
  if (method === 'POST') {
    try {
      const body = await req.json();
      console.log('WhatsApp Webhook payload:', JSON.stringify(body));

      // Quick validation
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const val = changes?.value;
      const message = val?.messages?.[0];

      if (!message) {
        return new Response(JSON.stringify({ status: 'ignored' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const whatsappNumber = message.from;
      const messageId = message.id;
      const messageType = message.type;
      const senderName = val?.contacts?.[0]?.profile?.name || 'WhatsApp User';
      const timestamp = message.timestamp;

      // Extract text content and location
      let messageBody = '';
      let latitude = null;
      let longitude = null;

      if (messageType === 'text') {
        messageBody = message.text?.body || '';
      } else if (messageType === 'interactive') {
        const interactive = message.interactive;
        if (interactive.type === 'button_reply') {
          messageBody = interactive.button_reply?.title || '';
          if (interactive.button_reply?.id === 'register_now') {
            messageBody = 'Register Now';
          }
        } else if (interactive.type === 'list_reply') {
          messageBody = interactive.list_reply?.title || '';
        }
      } else if (messageType === 'location') {
        latitude = message.location?.latitude;
        longitude = message.location?.longitude;
        messageBody = `Location sent: ${latitude}, ${longitude}`;
      }

      if (!messageBody) {
        return new Response(JSON.stringify({ status: 'no_text_or_location' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Initialize Supabase Client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // 1. Find customer
      const { data: customer, error: customerErr } = await supabase
        .from('customers')
        .select('id, full_name')
        .eq('whatsapp_number', whatsappNumber)
        .maybeSingle();

      if (customerErr) throw customerErr;

      let customerId = '';
      const whatsappAccessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || '';
      const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '';

      const sendWhatsAppMessage = async (payload: any) => {
        const res = await fetch(`https://graph.facebook.com/v19.0/${whatsappPhoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.error('Failed to send WA message', await res.text());
        }
        return res;
      };

      // Registration Flow (if customer doesn't exist)
      if (!customer) {
        if (messageBody === 'Register Now') {
          const { data: newCustomer, error: createErr } = await supabase
            .from('customers')
            .insert({ whatsapp_number: whatsappNumber, full_name: senderName })
            .select('id')
            .single();
          if (createErr) throw createErr;
          customerId = newCustomer.id;

          // Customer registered, send Main Menu using interactive buttons
          await sendWhatsAppMessage({
            messaging_product: 'whatsapp',
            to: whatsappNumber,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: {
                type: 'image',
                image: { link: 'https://easybuy4me.vercel.app/easybuy4me-logo.jpg' }
              },
              body: { text: `Awesome ${senderName}! 🎉 You are registered. What do you need today?` },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'btn_errands', title: 'Errands & Food' } },
                  { type: 'reply', reply: { id: 'btn_wallet', title: 'My Wallet' } },
                  { type: 'reply', reply: { id: 'btn_track', title: 'Track Order' } }
                ]
              }
            }
          });
          return new Response(JSON.stringify({ status: 'registered' }), { status: 200, headers: corsHeaders });
        } else {
          // Ask to register
          await sendWhatsAppMessage({
            messaging_product: 'whatsapp',
            to: whatsappNumber,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: {
                type: 'image',
                image: { link: 'https://easybuy4me.vercel.app/easybuy4me-logo.jpg' }
              },
              body: { text: `Hey ${senderName}! 👋 Welcome to *EasyBuy4Me*. Happy International Women's Day! It looks like you don't have an account yet. Please register to continue.` },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'register_now', title: 'Register Now' } }
                ]
              }
            }
          });
          return new Response(JSON.stringify({ status: 'unregistered' }), { status: 200, headers: corsHeaders });
        }
      } else {
        customerId = customer.id;
      }

      // 2. Log inbound message
      await supabase
        .from('whatsapp_messages')
        .insert({
          customer_id: customerId,
          direction: 'inbound',
          message_sid: messageId,
          message_body: messageBody,
          metadata: { message_type: messageType, timestamp, latitude, longitude }
        });

      // Distance & Price Calculation Function (Haversine)
      // Base location: Ikeja, Lagos (6.5965, 3.3421) as an example
      const BASE_LAT = 6.5965;
      const BASE_LNG = 3.3421;
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // km
      };

      let systemPromptInjection = '';
      if (latitude && longitude) {
        const distance = calculateDistance(BASE_LAT, BASE_LNG, latitude, longitude);
        const baseFee = 500;
        const perKmFee = 150;
        const calculatedDeliveryFee = Math.round(baseFee + (distance * perKmFee));
        systemPromptInjection = `\n\n[SYSTEM NOTIFICATION]: The user just sent their location. Distance to hub is ${distance.toFixed(1)} km. The calculated delivery fee is ₦${calculatedDeliveryFee}. The AI must acknowledge the location, present the calculated delivery fee, and prompt the user to make payment (next_action="payment_prompt").`;
      }

      // 3. Get Chat History Context
      const { data: history } = await supabase
        .from('whatsapp_messages')
        .select('direction, message_body')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(8);

      let historyText = '';
      if (history) {
        const chronoHistory = [...history].reverse();
        historyText = chronoHistory
          .map((msg) => `${msg.direction === 'inbound' ? 'Customer' : 'Assistant'}: ${msg.message_body}`)
          .join('\n');
      }

      // 4. Call Groq API
      const groqApiKey = Deno.env.get('GROQ_API_KEY') || '';
      if (!groqApiKey) throw new Error('GROQ_API_KEY is not defined.');

      const systemPrompt = `You are the core AI intelligence engine of *EasyBuy4Me*, a premium logistics and errand assistant. Your task is to process incoming WhatsApp messages and return a JSON response dictating what to say and what interactive elements to show next.

JSON SCHEMA:
{
  "intent": "PLACE_ORDER" | "MAKE_PAYMENT" | "TRACK_ORDER" | "GENERAL_CONVERSATION" | "UNKNOWN",
  "items": [{ "name": "string", "qty": number, "spec": "string" }],
  "vendor_name": "string or null",
  "food_budget": "number or null",
  "delivery_address": "string or null",
  "reply_message": "string (the exact text to send the user)",
  "next_action": "text" | "services_menu" | "request_location" | "payment_prompt"
}

CONVERSATION FLOW RULES:
1. When a user first says hi or asks what you do, or when they select "Main Menu", set next_action="services_menu" and write a short welcoming reply_message.
2. If they select "Errands & Food", ask them what specific errands or food they want.
3. If they mention food, make sure to ask for their *budget for the food*.
4. Once you have the list of items (and budget if food), you MUST ask for their location: set next_action="request_location" and tell them: "Please send your current location using the WhatsApp attachment (📍 Location) so we can calculate your delivery fee."
5. If the system notification says they sent a location and gives a delivery fee, you must set next_action="payment_prompt", summarize their total order (budget + delivery fee), and tell them to pay to validate the order.

TONE: Fun, easy, friendly. Use 🔴 and 🟡 emojis. Bold the brand name *EasyBuy4Me*.${systemPromptInjection}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Chat History:\n${historyText}\n\nNew Incoming Message: "${messageBody}"` },
          ],
          temperature: 0.2,
        }),
      });

      if (!response.ok) throw new Error(`Groq API returned error: ${response.status}`);
      const groqData = await response.json();
      const parsedResult = JSON.parse(groqData.choices?.[0]?.message?.content || '{}');
      console.log('Parsed LLM Result:', parsedResult);

      const { intent, items, food_budget, reply_message, next_action } = parsedResult;

      // 5. Construct final WhatsApp Message Payload based on next_action
      let waPayload: any = {
        messaging_product: 'whatsapp',
        to: whatsappNumber,
      };

      if (next_action === 'services_menu') {
        waPayload.type = 'interactive';
        waPayload.interactive = {
          type: 'button',
          header: {
            type: 'image',
            image: { link: 'https://easybuy4me.com/easybuy4me-logo.jpg' }
          },
          body: { text: reply_message || 'What do you need today?' },
          action: {
            buttons: [
              { type: 'reply', reply: { id: 'btn_errands', title: 'Errands & Food' } },
              { type: 'reply', reply: { id: 'btn_wallet', title: 'My Wallet' } },
              { type: 'reply', reply: { id: 'btn_track', title: 'Track Order' } }
            ]
          }
        };
      } else if (next_action === 'payment_prompt') {
        // Create the order in DB if we have items
        if (items && items.length > 0) {
          let deliveryFee = 0;
          if (latitude && longitude) {
            const distance = calculateDistance(BASE_LAT, BASE_LNG, latitude, longitude);
            deliveryFee = Math.round(500 + (distance * 150));
          } else {
            deliveryFee = 1500; // fallback
          }
          const totalAmount = (food_budget || 0) + deliveryFee + 500; // 500 service fee

          await supabase.from('orders').insert({
            customer_id: customerId,
            status: 'pending_payment',
            items: items,
            raw_text: messageBody,
            subtotal: food_budget || 0,
            delivery_fee: deliveryFee,
            service_fee: 500,
            total_amount: totalAmount,
            payment_method: 'bank_transfer'
          });
        }

        waPayload.type = 'interactive';
        waPayload.interactive = {
          type: 'button',
          body: { text: reply_message || 'Please make a payment to validate your order.' },
          action: {
            buttons: [
              { type: 'reply', reply: { id: 'btn_paid', title: 'I Have Paid' } },
              { type: 'reply', reply: { id: 'btn_cancel', title: 'Cancel Order' } }
            ]
          }
        };
      } else {
        // fallback for text and request_location (which is just text asking to use the attachment)
        waPayload.type = 'text';
        waPayload.text = { body: reply_message };
      }

      // Send to WhatsApp
      const waResponse = await sendWhatsAppMessage(waPayload);
      let whatsappMsgSid = '';
      if (waResponse.ok) {
        const waData = await waResponse.json();
        whatsappMsgSid = waData.messages?.[0]?.id || '';
      }

      // 7. Log outbound message
      await supabase
        .from('whatsapp_messages')
        .insert({
          customer_id: customerId,
          direction: 'outbound',
          message_sid: whatsappMsgSid,
          message_body: reply_message,
        });

      return new Response(JSON.stringify({ status: 'success', intent }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (err: any) {
      console.error('Error processing WhatsApp Webhook:', err.message);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // Fallback
  return new Response('Not Found', { status: 404 });
});
