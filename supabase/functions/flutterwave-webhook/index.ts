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

  if (method === 'POST') {
    try {
      // 1. Signature Verification
      const signature = req.headers.get('verif-hash');
      const expectedSignature = Deno.env.get('FLUTTERWAVE_SECRET_HASH') || 'easybuy4me_flw_secret_hash';

      if (!signature || signature !== expectedSignature) {
        console.error('Flutterwave signature verification failed. Signature:', signature);
        return new Response(JSON.stringify({ error: 'Unauthorized request signature' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const body = await req.json();
      console.log('Flutterwave webhook payload:', JSON.stringify(body));

      const event = body.event;
      const status = body.data?.status;
      const amount = body.data?.amount;
      const currency = body.data?.currency;
      const txRef = body.data?.tx_ref; // This is the Order UUID
      const flwRef = body.data?.flw_ref || body.data?.id;

      if (event !== 'charge.completed' || status !== 'successful') {
        console.log(`No-op: Event is ${event}, status is ${status}. Ignored.`);
        return new Response(JSON.stringify({ status: 'ignored' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Initialize Supabase Client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // 2. Log payment in payments table
      const { data: payment, error: paymentErr } = await supabase
        .from('payments')
        .insert({
          order_id: txRef,
          reference: txRef,
          transaction_id: String(flwRef),
          amount: amount,
          currency: currency || 'NGN',
          status: 'successful',
          payment_gateway: 'flutterwave',
          raw_payload: body
        })
        .select('*')
        .single();

      if (paymentErr) {
        console.error('Error logging payment:', paymentErr);
        throw paymentErr;
      }

      // 3. Update order in database (this triggers dispatcher matching trigger)
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .update({
          status: 'preparing',
          payment_method: 'flutterwave'
        })
        .eq('id', txRef)
        .select('id, tracking_code, customer_id')
        .single();

      if (orderErr) {
        console.error('Error updating order:', orderErr);
        throw orderErr;
      }

      // 4. Fetch customer details
      const { data: customer, error: customerErr } = await supabase
        .from('customers')
        .select('whatsapp_number, full_name')
        .eq('id', order.customer_id)
        .single();

      if (customerErr) {
        console.error('Error fetching customer details:', customerErr);
        throw customerErr;
      }

      // 5. Send confirmation message to customer via WhatsApp
      const whatsappAccessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || '';
      const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '';
      const replyMessage = `Hi ${customer.full_name}! We've received your payment of ₦${amount.toLocaleString()} for order ${order.tracking_code}. Your order is now being prepared! We'll notify you as soon as a dispatcher is assigned.`;

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
            to: customer.whatsapp_number,
            type: 'text',
            text: { body: replyMessage },
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

      // 6. Log outbound message
      await supabase
        .from('whatsapp_messages')
        .insert({
          customer_id: order.customer_id,
          direction: 'outbound',
          message_sid: whatsappMsgSid,
          message_body: replyMessage,
        });

      return new Response(JSON.stringify({ status: 'success', order_id: txRef }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (err: any) {
      console.error('Error processing Flutterwave Webhook:', err.message);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // Fallback
  return new Response('Not Found', { status: 404 });
});
