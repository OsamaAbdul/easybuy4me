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
        // Meta sends read/delivery statuses which we can ignore
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

      // Extract text content
      let messageBody = '';
      if (messageType === 'text') {
        messageBody = message.text?.body || '';
      } else if (messageType === 'interactive') {
        const interactive = message.interactive;
        if (interactive.type === 'button_reply') {
          messageBody = interactive.button_reply?.title || '';
        } else if (interactive.type === 'list_reply') {
          messageBody = interactive.list_reply?.title || '';
        }
      }

      if (!messageBody) {
        return new Response(JSON.stringify({ status: 'no_text_content' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Initialize Supabase Client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // 1. Find or create customer
      let customerId = '';
      const { data: customer, error: customerErr } = await supabase
        .from('customers')
        .select('id')
        .eq('whatsapp_number', whatsappNumber)
        .maybeSingle();

      if (customerErr) throw customerErr;

      if (customer) {
        customerId = customer.id;
      } else {
        const { data: newCustomer, error: createErr } = await supabase
          .from('customers')
          .insert({ whatsapp_number: whatsappNumber, full_name: senderName })
          .select('id')
          .single();

        if (createErr) throw createErr;
        customerId = newCustomer.id;
      }

      // 2. Log inbound message
      await supabase
        .from('whatsapp_messages')
        .insert({
          customer_id: customerId,
          direction: 'inbound',
          message_sid: messageId,
          message_body: messageBody,
          metadata: { message_type: messageType, timestamp }
        });

      // 3. Get Chat History Context (past 5 messages for context)
      const { data: history } = await supabase
        .from('whatsapp_messages')
        .select('direction, message_body')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(6); // current message + 5 past ones

      let historyText = '';
      if (history) {
        const chronoHistory = [...history].reverse();
        historyText = chronoHistory
          .map((msg) => `${msg.direction === 'inbound' ? 'Customer' : 'Assistant'}: ${msg.message_body}`)
          .join('\n');
      }

      // 4. Call Groq API (Llama 3.1 8B) for Intent Parsing
      const groqApiKey = Deno.env.get('GROQ_API_KEY') || '';
      if (!groqApiKey) {
        throw new Error('GROQ_API_KEY is not defined in environment.');
      }

      const systemPrompt = `You are the core AI intelligence engine of *EasyBuy4Me*, a premium logistics, errand, and VTU/subscription assistant. Your task is to process the incoming WhatsApp message from a customer and return a structured JSON response.

DATABASE/SYSTEM CONTEXT:
- Supported payment methods: 'flutterwave' (default online), 'opay_manual' (Opay transfer), 'bank_transfer' (general bank transfer).
- Standard errand statuses: pending_payment, preparing, assigned, in_transit, delivered, cancelled.

Respond ONLY with a valid JSON object matching the schema below. Do not wrap in markdown code blocks.

JSON SCHEMA:
{
  "intent": "PLACE_ORDER" | "MAKE_PAYMENT" | "TRACK_ORDER" | "GENERAL_CONVERSATION" | "UNKNOWN",
  "items": [
    {
      "name": "string (e.g. laundry, Jollof Rice, dynamic grocery item)",
      "qty": number,
      "spec": "string (e.g. extra chicken, wash and fold, green plantains)"
    }
  ],
  "vendor_name": "string or null",
  "payment_method": "flutterwave" | "Opay" | "bank_transfer" | null,
  "delivery_address": "string or null",
  "reply_message": "string"
}

TONE & STYLE GUIDELINES (CRITICAL):
1. **Bold Brand Name**: Always format the brand name as *EasyBuy4Me* (using asterisks for bold on WhatsApp). Never write it without asterisks.
2. **Color Aesthetics**: Use 🔴 (red circle) and 🟡 (yellow/gold circle) emojis matching the brand colors to separate headers and highlight important options.
3. **Keep it Natural**: The tone must be casual, super friendly, natural, and "easy as fuck". Do not sound robotic or use stuffy corporate-speak. Use expressions like "Hey!", "Got you covered!", "Let's get this sorted.", "Awesome!"
4. **Structured Menu Navigation**: Limit the user to picking structured options.
   - If they are greeting you or asking general things (GENERAL_CONVERSATION), introduce *EasyBuy4Me* by prefixing the website logo URL: "https://easybuy4me.vercel.app/easybuy4me-logo.jpg" at the absolute beginning of the message. Then present the MAIN MENU:
     "https://easybuy4me.vercel.app/easybuy4me-logo.jpg
     
     🔴 *EasyBuy4Me* 🟡
     
     Hey ${senderName}! Let's make your life easy as fuck. 🚀 What are we doing today?
     
     Reply with a number to choose:
     1️⃣ *Errands & Groceries* 🛍️ (Send a list, market runs, laundry)
     2️⃣ *Order Food* 🍔 (Meals from your favorite restaurants)
     3️⃣ *My Wallet* 💳 (Fund wallet, check balance)
     4️⃣ *Data & Airtime (VTU)* 📱 (Super cheap data/airtime)
     5️⃣ *EasyLunch* 🍱 (Daily/weekly lunch subscription)
     6️⃣ *Track Order* 🚚 (Check status of a delivery)"
   - If they select a number or ask for one of these categories, present the specific sub-options under it.
     - For example, if they selected "My Wallet" (Option 3):
       "🔴 *EasyBuy4Me: My Wallet* 🟡
       
       Manage your wallet balance and funds here:
       
       A. *Check Wallet Balance* 💰
       B. *Fund My Wallet* 💵
       
       Reply with *A* or *B* to proceed!"
     - For "Data & Airtime" (Option 4):
       "🔴 *EasyBuy4Me: VTU Service* 🟡
       
       Super fast and cheap data/airtime:
       
       A. *Buy Data Bundle* 📶
       B. *Purchase Airtime* 📞
       
       Reply with *A* or *B* to proceed!"
     - For "EasyLunch" (Option 5):
       "🔴 *EasyBuy4Me: EasyLunch* 🟡
       
       Hot, delicious lunch delivered to your home/office daily. Under NGN 4,900 subscription.
       
       Reply *A* to subscribe now!"

RULES for "intent":
- PLACE_ORDER: If customer is requesting items to purchase, food, groceries, custom errands (e.g., 'buy jollof rice', 'help me pick up my laundry', 'need 5 tomatoes from the market').
- MAKE_PAYMENT: If customer confirms payment, asks for payment details, or requests payment options (e.g., 'send bank details', 'can I pay with Opay', 'I have made the transfer').
- TRACK_ORDER: If customer is asking for the progress of an order or where the rider is.
- GENERAL_CONVERSATION: Normal greetings (hi, hello, thanks, etc.) or when navigating the menus.

RULES for "reply_message":
- If intent is PLACE_ORDER: Summarize items clearly and ask for delivery address: "Hey! I've noted down your errand request:\n🛍️ *Items*:\n[list items here with qty/spec]\n\nPlease reply with your *delivery address* next so we can get this sorted!"
- If intent is MAKE_PAYMENT: "Awesome! You can pay seamlessly via card or bank transfer. If you prefer manual transfer, here are our OPay details:\n\n🔴 *OPay Account*:\nBank: *OPay*\nAccount Number: *8145096342*\nAccount Name: *EasyBuy4Me*\n\nLet me know once you've made the transfer!"
- If intent is TRACK_ORDER: "Searching for your order status. Hold on one sec, or reply with your Order Tracking Code (e.g., EBY-123456) if you have it handy."`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Chat History Context:\n${historyText}\n\nNew Incoming Message: "${messageBody}"` },
          ],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API returned error: ${response.status} - ${errorText}`);
      }

      const groqData = await response.json();
      const aiResponseContent = groqData.choices?.[0]?.message?.content;
      console.log('Groq completion response:', aiResponseContent);

      const parsedResult = JSON.parse(aiResponseContent);
      const { intent, items, vendor_name, payment_method, delivery_address, reply_message } = parsedResult;

      // 5. Handle Intent Operations
      if (intent === 'PLACE_ORDER' && items && items.length > 0) {
        const subtotal = 0.00;
        const deliveryFee = 1500.00; // Base delivery fee in NGN
        const serviceFee = 500.00;
        const totalAmount = subtotal + deliveryFee + serviceFee;

        // Check if there is a vendor name, search or insert it if not
        let vendorId = null;
        if (vendor_name) {
          const { data: vendor } = await supabase
            .from('vendors')
            .select('id')
            .eq('name', vendor_name)
            .maybeSingle();
          if (vendor) {
            vendorId = vendor.id;
          } else {
            const { data: newVendor } = await supabase
              .from('vendors')
              .insert({ name: vendor_name, category: 'other' })
              .select('id')
              .single();
            if (newVendor) vendorId = newVendor.id;
          }
        }

        // Insert new order
        const { error: orderErr } = await supabase
          .from('orders')
          .insert({
            customer_id: customerId,
            vendor_id: vendorId,
            status: 'pending_payment',
            items: items,
            raw_text: messageBody,
            errand_description: reply_message,
            subtotal,
            delivery_fee: deliveryFee,
            service_fee: serviceFee,
            total_amount: totalAmount,
            payment_method: payment_method || 'flutterwave'
          });

        if (orderErr) {
          console.error('Error creating order in Supabase:', orderErr);
        }
      } else if (intent === 'TRACK_ORDER') {
        const { data: latestOrder } = await supabase
          .from('orders')
          .select('tracking_code, status, total_amount')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestOrder) {
          parsedResult.reply_message = `🔴 *EasyBuy4Me: Live Tracker* 🟡\n\nHere is your latest order status:\n\n📦 Order Code: *${latestOrder.tracking_code}*\n⚡ Status: *${latestOrder.status.toUpperCase().replace('_', ' ')}*\n💰 Total: *₦${latestOrder.total_amount.toLocaleString()}*\n\nTrack live updates on our website: https://easybuy4me.vercel.app/#tracker?code=${latestOrder.tracking_code}`;
        } else {
          parsedResult.reply_message = `🔴 *EasyBuy4Me: Live Tracker* 🟡\n\nI couldn't find any active orders under your number. Let me know what errand you want me to run today! 🚀`;
        }
      }

      // 6. Send Response to WhatsApp Cloud API
      const whatsappAccessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || '';
      const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '';

      const whatsappRes = await fetch(
        `https://graph.facebook.com/v19.0/${whatsappPhoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: whatsappNumber,
            type: 'text',
            text: { body: parsedResult.reply_message },
          }),
        }
      );

      let whatsappMsgSid = '';
      if (whatsappRes.ok) {
        const whatsappResData = await whatsappRes.json();
        whatsappMsgSid = whatsappResData.messages?.[0]?.id || '';
        console.log('WhatsApp reply sent successfully! Message SID:', whatsappMsgSid);
      } else {
        const errText = await whatsappRes.text();
        console.error('Failed to send WhatsApp message. Error:', errText);
      }

      // 7. Log outbound message
      await supabase
        .from('whatsapp_messages')
        .insert({
          customer_id: customerId,
          direction: 'outbound',
          message_sid: whatsappMsgSid,
          message_body: parsedResult.reply_message,
        });

      return new Response(JSON.stringify({ status: 'success', intent: parsedResult.intent }), {
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
