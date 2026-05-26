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
                image: { link: 'https://easybuy4me.com/easybuy4me-logo.jpg' }
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
                image: { link: 'https://easybuy4me.com/easybuy4me-logo.jpg' }
              },
              body: { text: `Hey ${senderName}! 👋 Welcome to *EasyBuy4Me*.  It looks like you don't have an account yet. Please register to continue.` },
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

      // Intercept Explicit Button Actions
      const interactiveId = messageType === 'interactive' ? (message.interactive?.button_reply?.id || message.interactive?.list_reply?.id) : null;
      
      if (interactiveId === 'btn_errands') {
        const replyMsg = `Would you like us to run an errand for you, or do you want to buy food from a vendor?`;
        await sendWhatsAppMessage({
          messaging_product: 'whatsapp',
          to: whatsappNumber,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: replyMsg },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'btn_run_errand', title: 'Run an Errand' } },
                { type: 'reply', reply: { id: 'btn_buy_food', title: 'Buy Food' } }
              ]
            }
          }
        });
        await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
        return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
      } else if (interactiveId === 'btn_run_errand') {
        const replyMsg = `Great! Please type exactly what errand you need us to run for you.`;
        await sendWhatsAppMessage({ messaging_product: 'whatsapp', to: whatsappNumber, type: 'text', text: { body: replyMsg } });
        await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
        return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
      } else if (interactiveId === 'btn_buy_food') {
        const { data: vendors } = await supabase.from('vendors').select('id, name, address').eq('category', 'restaurant').eq('is_active', true).limit(10);
        
        if (!vendors || vendors.length === 0) {
           const replyMsg = `Sorry, no food vendors are available at the moment.`;
           await sendWhatsAppMessage({ messaging_product: 'whatsapp', to: whatsappNumber, type: 'text', text: { body: replyMsg } });
           return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
        }

        const rows = vendors.map((v) => ({ id: `vendor_${v.id}`, title: v.name.substring(0, 24), description: (v.address || '').substring(0, 72) }));
        const replyMsg = `Please select a vendor from the list below:`;
        await sendWhatsAppMessage({
          messaging_product: 'whatsapp',
          to: whatsappNumber,
          type: 'interactive',
          interactive: {
            type: 'list',
            body: { text: replyMsg },
            action: {
              button: 'View Vendors',
              sections: [{ title: 'Restaurants', rows: rows }]
            }
          }
        });
        await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
        return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
      } else if (interactiveId?.startsWith('vendor_')) {
        const vendorId = interactiveId.replace('vendor_', '');
        const { data: menuItems } = await supabase.from('menu_items').select('id, name, price, description').eq('vendor_id', vendorId).eq('is_available', true).limit(10);
        
        if (!menuItems || menuItems.length === 0) {
           const replyMsg = `Sorry, this vendor currently has no items available.`;
           await sendWhatsAppMessage({ messaging_product: 'whatsapp', to: whatsappNumber, type: 'text', text: { body: replyMsg } });
           return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
        }

        const rows = menuItems.map((m) => ({ id: `food_${m.id}`, title: m.name.substring(0, 24), description: `₦${m.price} - ${(m.description || '')}`.substring(0, 72) }));
        const replyMsg = `Please select a food item to buy:`;
        await sendWhatsAppMessage({
          messaging_product: 'whatsapp',
          to: whatsappNumber,
          type: 'interactive',
          interactive: {
            type: 'list',
            body: { text: replyMsg },
            action: {
              button: 'View Menu',
              sections: [{ title: 'Menu Items', rows: rows }]
            }
          }
        });
        await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
        return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
      } else if (interactiveId?.startsWith('food_')) {
        const foodId = interactiveId.replace('food_', '');
        const { data: foodItem } = await supabase.from('menu_items').select('name, price, vendor_id').eq('id', foodId).single();
        
        if (foodItem) {
          const { data: existingOrder } = await supabase
            .from('orders')
            .select('id, vendor_id, items, subtotal')
            .eq('customer_id', customerId)
            .eq('status', 'pending_confirmation')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          let subtotal = foodItem.price;

          if (existingOrder) {
            if (existingOrder.vendor_id === foodItem.vendor_id) {
              const newItems = [...(existingOrder.items as any[] || []), { name: foodItem.name, qty: 1, price: foodItem.price }];
              subtotal = existingOrder.subtotal + foodItem.price;
              
              await supabase.from('orders').update({
                items: newItems,
                subtotal: subtotal,
                raw_text: `Added ${foodItem.name}`
              }).eq('id', existingOrder.id);
            } else {
              await supabase.from('orders').delete().eq('id', existingOrder.id);
              await supabase.from('orders').insert({
                customer_id: customerId,
                vendor_id: foodItem.vendor_id,
                status: 'pending_confirmation',
                items: [{ name: foodItem.name, qty: 1, price: foodItem.price }],
                subtotal: foodItem.price,
                raw_text: `Selected ${foodItem.name}`
              });
            }
          } else {
            await supabase.from('orders').insert({
              customer_id: customerId,
              vendor_id: foodItem.vendor_id,
              status: 'pending_confirmation',
              items: [{ name: foodItem.name, qty: 1, price: foodItem.price }],
              subtotal: foodItem.price,
              raw_text: `Selected ${foodItem.name}`
            });
          }

          const replyMsg = `Added *${foodItem.name}* to your cart!\n\n🛒 Current Subtotal: *₦${subtotal}*\n\nWhat would you like to do next?`;
          await sendWhatsAppMessage({
            messaging_product: 'whatsapp',
            to: whatsappNumber,
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: replyMsg },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'btn_add_more', title: 'Add More Items' } },
                  { type: 'reply', reply: { id: 'btn_checkout', title: 'Checkout' } },
                  { type: 'reply', reply: { id: 'btn_cancel', title: 'Cancel Order' } }
                ]
              }
            }
          });
          await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
          return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
        }
      } else if (interactiveId === 'btn_add_more') {
        const { data: latestOrder } = await supabase
          .from('orders')
          .select('vendor_id')
          .eq('customer_id', customerId)
          .eq('status', 'pending_confirmation')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestOrder && latestOrder.vendor_id) {
          const { data: menuItems } = await supabase.from('menu_items').select('id, name, price, description').eq('vendor_id', latestOrder.vendor_id).eq('is_available', true).limit(10);
          if (menuItems && menuItems.length > 0) {
            const rows = menuItems.map((m) => ({ id: `food_${m.id}`, title: m.name.substring(0, 24), description: `₦${m.price} - ${(m.description || '')}`.substring(0, 72) }));
            const replyMsg = `Please select another item to add:`;
            await sendWhatsAppMessage({
              messaging_product: 'whatsapp',
              to: whatsappNumber,
              type: 'interactive',
              interactive: {
                type: 'list',
                body: { text: replyMsg },
                action: {
                  button: 'View Menu',
                  sections: [{ title: 'Menu Items', rows: rows }]
                }
              }
            });
            await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
            return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
          }
        }
        
        const replyMsg = `Sorry, couldn't load the menu. Please start a new order.`;
        await sendWhatsAppMessage({ messaging_product: 'whatsapp', to: whatsappNumber, type: 'text', text: { body: replyMsg } });
        return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });

      } else if (interactiveId === 'btn_checkout') {
        const replyMsg = `Great! Please reply with your delivery address or use the 📍 Location attachment so we can finalize your order.`;
        await sendWhatsAppMessage({ messaging_product: 'whatsapp', to: whatsappNumber, type: 'text', text: { body: replyMsg } });
        await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
        return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
      } else if (interactiveId === 'btn_confirm_order') {
        const { data: latestOrder } = await supabase
          .from('orders')
          .select('id, total_amount')
          .eq('customer_id', customerId)
          .eq('status', 'pending_confirmation')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestOrder) {
          await supabase.from('orders').update({ status: 'pending_payment' }).eq('id', latestOrder.id);
          const replyMsg = `Awesome! Please choose your payment method for your total of ₦${latestOrder.total_amount} to validate your order.`;
          await sendWhatsAppMessage({
            messaging_product: 'whatsapp',
            to: whatsappNumber,
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: replyMsg },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'btn_bank_transfer', title: 'Bank Transfer' } },
                  { type: 'reply', reply: { id: 'btn_pay_on_delivery', title: 'Pay on Delivery' } },
                  { type: 'reply', reply: { id: 'btn_cancel', title: 'Cancel Order' } }
                ]
              }
            }
          });
          await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
          return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
        }
      } else if (interactiveId === 'btn_bank_transfer') {
        const replyMsg = `Please transfer to the following account:\n\n🏦 Bank: *GTBank*\n🔢 Account: *0123456789*\n👤 Name: *EasyBuy4Me*\n\nOnce done, click "I Have Paid" below.`;
        await sendWhatsAppMessage({
          messaging_product: 'whatsapp',
          to: whatsappNumber,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: replyMsg },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'btn_paid', title: 'I Have Paid' } },
                { type: 'reply', reply: { id: 'btn_cancel', title: 'Cancel Order' } }
              ]
            }
          }
        });
        await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
        return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
      } else if (interactiveId === 'btn_pay_on_delivery') {
        const { data: latestOrder } = await supabase
          .from('orders')
          .select('id, tracking_code, total_amount')
          .eq('customer_id', customerId)
          .eq('status', 'pending_payment')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestOrder) {
          await supabase.from('orders').update({ status: 'preparing', payment_method: 'pay_on_delivery' }).eq('id', latestOrder.id);
          const replyMsg = `Awesome! 🤝 You chose Pay on Delivery for ₦${latestOrder.total_amount}. Your order is now being processed.\n\n🚚 Your Tracking Code is: *${latestOrder.tracking_code}*\n\nTrack live updates here: https://easybuy4me.com/tracker?code=${latestOrder.tracking_code}`;
          await sendWhatsAppMessage({
            messaging_product: 'whatsapp',
            to: whatsappNumber,
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: replyMsg },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'btn_track', title: 'Track Order' } }
                ]
              }
            }
          });
          await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
          return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
        }
      } else if (interactiveId === 'btn_paid') {
        const { data: latestOrder } = await supabase
          .from('orders')
          .select('id, tracking_code, total_amount')
          .eq('customer_id', customerId)
          .eq('status', 'pending_payment')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestOrder) {
          await supabase.from('orders').update({ status: 'preparing' }).eq('id', latestOrder.id);
          const replyMsg = `Awesome! 💸 We are verifying your payment of ₦${latestOrder.total_amount}. Your order is now being processed.\n\n🚚 Your Tracking Code is: *${latestOrder.tracking_code}*\n\nTrack live updates here: https://easybuy4me.com/tracker?code=${latestOrder.tracking_code}`;
          await sendWhatsAppMessage({
            messaging_product: 'whatsapp',
            to: whatsappNumber,
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: replyMsg },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'btn_track', title: 'Track Order' } }
                ]
              }
            }
          });
          await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
          return new Response(JSON.stringify({ status: 'success', intent: 'MAKE_PAYMENT' }), { status: 200, headers: corsHeaders });
        }
      } else if (interactiveId === 'btn_track') {
        const { data: latestOrder } = await supabase
          .from('orders')
          .select('tracking_code, status, total_amount')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestOrder) {
          const replyMsg = `🔴 *EasyBuy4Me: Live Tracker* 🟡\n\nHere is your latest order status:\n\n📦 Order Code: *${latestOrder.tracking_code}*\n⚡ Status: *${latestOrder.status.toUpperCase().replace('_', ' ')}*\n💰 Total: *₦${latestOrder.total_amount.toLocaleString()}*\n\nTrack live updates on our website: https://easybuy4me.com/tracker?code=${latestOrder.tracking_code}`;
          await sendWhatsAppMessage({ messaging_product: 'whatsapp', to: whatsappNumber, type: 'text', text: { body: replyMsg } });
          await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
          return new Response(JSON.stringify({ status: 'success', intent: 'TRACK_ORDER' }), { status: 200, headers: corsHeaders });
        } else {
          const replyMsg = `You don't have any recent orders to track right now!`;
          await sendWhatsAppMessage({ messaging_product: 'whatsapp', to: whatsappNumber, type: 'text', text: { body: replyMsg } });
          await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
          return new Response(JSON.stringify({ status: 'success', intent: 'TRACK_ORDER' }), { status: 200, headers: corsHeaders });
        }
      } else if (interactiveId === 'btn_cancel') {
        const { data: latestOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('customer_id', customerId)
          .in('status', ['pending_payment', 'pending_confirmation'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestOrder) {
          await supabase.from('orders').update({ status: 'cancelled' }).eq('id', latestOrder.id);
        }
        const replyMsg = `No problem! Your order has been cancelled. Let us know if you need anything else from the Main Menu.`;
        await sendWhatsAppMessage({ messaging_product: 'whatsapp', to: whatsappNumber, type: 'text', text: { body: replyMsg } });
        await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
        return new Response(JSON.stringify({ status: 'success', intent: 'CANCEL_ORDER' }), { status: 200, headers: corsHeaders });
      }

      if (latitude && longitude) {
        await sendWhatsAppMessage({
          messaging_product: 'whatsapp',
          to: whatsappNumber,
          type: 'text',
          text: { body: "Calculating your delivery fee and compiling your order... ⏳" }
        });

        // Check if there's a pending_confirmation order we can confirm immediately without the LLM
        const { data: latestOrder } = await supabase
          .from('orders')
          .select('id, subtotal, items')
          .eq('customer_id', customerId)
          .eq('status', 'pending_confirmation')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestOrder) {
          const deliveryFee = 500;
          const totalAmount = latestOrder.subtotal + deliveryFee + 500;
          
          await supabase.from('orders').update({
            delivery_fee: deliveryFee,
            service_fee: 500,
            total_amount: totalAmount,
            payment_method: 'bank_transfer'
          }).eq('id', latestOrder.id);

          const itemsList = latestOrder.items as any[] || [];
          const itemsText = itemsList.length > 0 ? itemsList.map((i: any) => `${i.qty || 1}x ${i.name}`).join(', ') : 'Custom Order';
          const replyMsg = `Here is your order breakdown:\n\n🍔 Items: *${itemsText}*\n💵 Subtotal: *₦${latestOrder.subtotal}*\n🚚 Delivery: *₦${deliveryFee}*\n⚙️ Service: *₦500*\n\n💰 *Total: ₦${totalAmount}*\n\nIs everything correct?`;
          
          await sendWhatsAppMessage({
            messaging_product: 'whatsapp',
            to: whatsappNumber,
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: replyMsg },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'btn_confirm_order', title: 'Confirm Order' } },
                  { type: 'reply', reply: { id: 'btn_cancel', title: 'Cancel' } }
                ]
              }
            }
          });
          await supabase.from('whatsapp_messages').insert({ customer_id: customerId, direction: 'outbound', message_body: replyMsg });
          return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders });
        }
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

      // 4. Send Read Receipt
      sendWhatsAppMessage({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      });

      // 5. Call Groq API
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
  "next_action": "text" | "services_menu" | "buy_food_menu" | "request_location" | "confirm_order" | "payment_prompt" | "add_more_items" | "checkout_cart",
  "update_name": "string or null"
}

CONVERSATION FLOW RULES:
1. When a user first says hi or asks what you do, or when they select "Main Menu", set next_action="services_menu" and write a short welcoming reply_message.
2. If the user selects "Errands & Food" or says they want an errand, DO NOT send a menu. Instead, set next_action="text" and prompt them to type exactly what they need us to buy or do.
3. CRITICAL RULE: If the user MANUALLY types out a request for FOOD (e.g., "I want rice", "buy chicken"), YOU MUST set next_action="buy_food_menu" and tell them to select a restaurant. HOWEVER, if the chat history shows the user already used the interactive menu (e.g., the Assistant said "You selected..."), DO NOT use this rule. Proceed to Rule 6 if they provided a location.
4. If the user tells you they want to add more items to their cart, set next_action="add_more_items". 
5. If they tell you they are ready to checkout, set next_action="checkout_cart".
6. If they want a NON-FOOD errand, ask for the list of items and their budget. Once you have those, you MUST ask for their location: set next_action="request_location" and tell them: "Please send your delivery address or use the WhatsApp Location attachment so we can finalize your order."
7. If the user provides their location (either for a non-food errand OR after selecting a food item from the menu/cart), the delivery fee is a FLAT ₦500. IMPORTANT: The delivery fee CANNOT be bigger than their food_budget (if they have one). If ₦500 is greater than their food_budget, reduce the delivery fee to match their food_budget exactly. Then, calculate the total (food_budget + delivery fee + 500 service fee), summarize the complete order breakdown to the user, ask them to confirm if everything is correct, and set next_action="confirm_order".
8. If the user confirms the order is correct (e.g., they say "Yes" or click "Confirm Order"), set next_action="payment_prompt" and tell them to make a payment to validate the order placement.
9. If the user tells you their name or asks you to change/update their name, extract it and set update_name="Their Name", and politely confirm the update in reply_message.

TONE: Fun, easy, friendly. Use 🔴 and 🟡 emojis. Bold the brand name *EasyBuy4Me*.`;

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

      const { intent, items, food_budget, reply_message, next_action, update_name } = parsedResult;

      if (update_name) {
        await supabase.from('customers').update({ full_name: update_name }).eq('id', customerId);
      }

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
      } else if (next_action === 'buy_food_menu') {
        const { data: vendors } = await supabase.from('vendors').select('id, name, address').eq('category', 'restaurant').eq('is_active', true).limit(10);
        if (!vendors || vendors.length === 0) {
           waPayload.type = 'text';
           waPayload.text = { body: 'Sorry, no food vendors are available at the moment.' };
        } else {
           const rows = vendors.map((v) => ({ id: `vendor_${v.id}`, title: v.name.substring(0, 24), description: (v.address || '').substring(0, 72) }));
           waPayload.type = 'interactive';
           waPayload.interactive = {
             type: 'list',
             body: { text: reply_message || 'Please select a restaurant to order your food from!' },
             action: {
               button: 'View Vendors',
               sections: [{ title: 'Restaurants', rows: rows }]
             }
           };
        }
      } else if (next_action === 'add_more_items') {
        const { data: latestOrder } = await supabase
          .from('orders')
          .select('vendor_id')
          .eq('customer_id', customerId)
          .eq('status', 'pending_confirmation')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestOrder && latestOrder.vendor_id) {
          const { data: menuItems } = await supabase.from('menu_items').select('id, name, price, description').eq('vendor_id', latestOrder.vendor_id).eq('is_available', true).limit(10);
          if (menuItems && menuItems.length > 0) {
            const rows = menuItems.map((m) => ({ id: `food_${m.id}`, title: m.name.substring(0, 24), description: `₦${m.price} - ${(m.description || '')}`.substring(0, 72) }));
            waPayload.type = 'interactive';
            waPayload.interactive = {
              type: 'list',
              body: { text: reply_message || 'Please select another item to add:' },
              action: {
                button: 'View Menu',
                sections: [{ title: 'Menu Items', rows: rows }]
              }
            };
          } else {
             waPayload.type = 'text';
             waPayload.text = { body: 'Sorry, couldn\'t load the menu. Please start a new order.' };
          }
        } else {
           waPayload.type = 'text';
           waPayload.text = { body: 'You don\'t have an active cart. Please select "Errands & Food" from the main menu.' };
        }
      } else if (next_action === 'checkout_cart') {
         waPayload.type = 'text';
         waPayload.text = { body: reply_message || 'Great! Please reply with your delivery address or use the 📍 Location attachment so we can finalize your order.' };
      } else if (next_action === 'confirm_order') {
        let deliveryFee = 500;
        if (food_budget && deliveryFee > food_budget) {
          deliveryFee = food_budget;
        }

        const { data: latestOrder } = await supabase
          .from('orders')
          .select('id, subtotal')
          .eq('customer_id', customerId)
          .eq('status', 'pending_confirmation')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestOrder) {
          const totalAmount = latestOrder.subtotal + deliveryFee + 500;
          await supabase.from('orders').update({
            delivery_fee: deliveryFee,
            service_fee: 500,
            total_amount: totalAmount,
            payment_method: 'bank_transfer'
          }).eq('id', latestOrder.id);
        } else if (items && items.length > 0) {
          const totalAmount = (food_budget || 0) + deliveryFee + 500;
          await supabase.from('orders').insert({
            customer_id: customerId,
            status: 'pending_confirmation',
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
          body: { text: reply_message || 'Please confirm your order details above.' },
          action: {
            buttons: [
              { type: 'reply', reply: { id: 'btn_confirm_order', title: 'Confirm Order' } },
              { type: 'reply', reply: { id: 'btn_cancel', title: 'Cancel' } }
            ]
          }
        };
      } else if (next_action === 'payment_prompt') {
        waPayload.type = 'interactive';
        waPayload.interactive = {
          type: 'button',
          body: { text: reply_message || 'Please choose your payment method to validate your order.' },
          action: {
            buttons: [
              { type: 'reply', reply: { id: 'btn_bank_transfer', title: 'Bank Transfer' } },
              { type: 'reply', reply: { id: 'btn_pay_on_delivery', title: 'Pay on Delivery' } },
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
