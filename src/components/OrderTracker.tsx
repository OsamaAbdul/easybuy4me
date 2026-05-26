import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  Loader2, 
  Phone, 
  User, 
  ShoppingBag,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface Order {
  id: string;
  tracking_code: string;
  customer_id: string;
  vendor_id: string | null;
  dispatcher_id: string | null;
  status: 'pending_payment' | 'preparing' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  items: Array<{ name: string; qty: number; spec?: string }>;
  raw_text: string;
  errand_description: string;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  total_amount: number;
  payment_method: string | null;
  created_at: string;
}

interface Dispatcher {
  id: string;
  name: string;
  phone_number: string;
  vehicle_type: string;
  status: string;
  current_latitude: number | null;
  current_longitude: number | null;
}

export const OrderTracker = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [dispatcher, setDispatcher] = useState<Dispatcher | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll or subscribe to updates
  useEffect(() => {
    if (!order) return;

    // Subscribe to order updates
    const orderSubscription = supabase
      .channel(`order-realtime-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          console.log('Realtime order update:', payload.new);
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, [order?.id]);

  // Subscribe to dispatcher updates
  useEffect(() => {
    if (!order?.dispatcher_id) {
      setDispatcher(null);
      return;
    }

    // Fetch initial dispatcher info
    const fetchDispatcher = async () => {
      const { data, error } = await supabase
        .from('dispatchers')
        .select('*')
        .eq('id', order.dispatcher_id)
        .single();
      
      if (!error && data) {
        setDispatcher(data as Dispatcher);
      }
    };
    fetchDispatcher();

    // Subscribe to updates
    const dispatcherSubscription = supabase
      .channel(`dispatcher-realtime-${order.dispatcher_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dispatchers',
          filter: `id=eq.${order.dispatcher_id}`,
        },
        (payload) => {
          console.log('Realtime dispatcher update:', payload.new);
          setDispatcher(payload.new as Dispatcher);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dispatcherSubscription);
    };
  }, [order?.dispatcher_id]);

  const fetchOrder = async (code: string) => {
    setLoading(true);
    setError(null);
    setOrder(null);
    setDispatcher(null);

    try {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(code.trim());
      const queryField = isUuid ? 'id' : 'tracking_code';

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq(queryField, code.trim().toUpperCase())
        .single();

      if (error) {
        throw new Error('Order not found. Please check your tracking code.');
      }

      if (data) {
        setOrder(data as Order);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while tracking the order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    
    let code = urlParams.get('code');
    if (!code && hash.includes('?code=')) {
      code = hash.split('?code=')[1]?.split('&')[0];
    }

    if (code) {
      setTrackingCode(code);
      fetchOrder(code);
    }
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    await fetchOrder(trackingCode);
  };

  const getStepStatus = (step: number) => {
    if (!order) return 'upcoming';
    const statusMap: Record<Order['status'], number> = {
      'pending_payment': 0,
      'preparing': 1,
      'assigned': 2,
      'in_transit': 3,
      'delivered': 4,
      'cancelled': -1,
    };
    
    const currentStep = statusMap[order.status];
    if (currentStep === -1) return 'cancelled';
    if (currentStep > step) return 'completed';
    if (currentStep === step) return 'current';
    return 'upcoming';
  };

  // Mock checkout function for Flutterwave integration
  const initiateFlutterwavePayment = () => {
    if (!order) return;
    
    // Configure real Flutterwave checkout URL redirect
    // E.g., redirect to api or open Flutterwave standard modal
    const email = "payment@easybuy4me.com";
    const phone = "2348145096342";
    const name = "EasyBuy4Me Customer";
    const paymentUrl = `https://checkout.flutterwave.com/v3/hosted/pay`;
    
    console.log(`Initiating checkout to ${paymentUrl} for Order ${order.id} (${order.total_amount} NGN) for ${name} (${phone}, ${email})`);
    
    alert(`Redirecting to Flutterwave to pay ₦${order.total_amount.toLocaleString()}...\nIn a live environment, this calls Flutterwave Standard Checkout.`);
  };

  return (
    <section id="tracker" className="py-24 bg-brand-black text-white relative overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[800px] mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-accent text-xs font-semibold mb-4"
          >
            <Clock size={12} />
            <span>Realtime Errand Delivery Status</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Track Your Delivery
          </h2>
          <p className="text-white/60 text-md max-w-lg mx-auto">
            Enter the tracking code sent to your WhatsApp (e.g. EBY-123456) to view live progress.
          </p>
        </div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-xl shadow-2xl mb-8"
        >
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Enter Tracking Code (EBY-XXXXXX)"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 transition-all font-semibold uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 rounded-2xl bg-white text-black font-bold hover:bg-white/90 disabled:bg-white/50 transition-colors flex items-center justify-center gap-2 min-w-[140px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track Order'}
            </button>
          </form>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tracking Details Display */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              {/* Stepper Progress Bar */}
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-white/40 text-xs block uppercase tracking-wider font-semibold">Order ID</span>
                    <span className="text-brand-accent font-bold text-lg">{order.tracking_code}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white/40 text-xs block uppercase tracking-wider font-semibold">Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      order.status === 'in_transit' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
                  {/* Vertical line for mobile, horizontal for desktop */}
                  <div className="absolute left-[19px] md:left-0 top-0 md:top-1/2 -translate-y-0 md:-translate-y-1/2 w-0.5 md:w-full h-full md:h-0.5 bg-white/10 -z-10" />
                  
                  {/* Step 1: Payment */}
                  <div className="flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold transition-all ${
                      getStepStatus(0) === 'completed' ? 'bg-brand-green border-brand-green text-white' :
                      getStepStatus(0) === 'current' ? 'bg-brand-accent border-brand-accent text-black animate-pulse' :
                      'bg-[#1A1C1E] border-white/20 text-white/40'
                    }`}>
                      {getStepStatus(0) === 'completed' ? <CheckCircle2 size={18} /> : <CreditCard size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Payment</p>
                      <p className="text-xs text-white/50">{getStepStatus(0) === 'completed' ? 'Verified' : 'Pending'}</p>
                    </div>
                  </div>

                  {/* Step 2: Preparing */}
                  <div className="flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold transition-all ${
                      getStepStatus(1) === 'completed' ? 'bg-brand-green border-brand-green text-white' :
                      getStepStatus(1) === 'current' ? 'bg-brand-accent border-brand-accent text-black' :
                      'bg-[#1A1C1E] border-white/20 text-white/40'
                    }`}>
                      {getStepStatus(1) === 'completed' ? <CheckCircle2 size={18} /> : <ShoppingBag size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Preparing</p>
                      <p className="text-xs text-white/50">{getStepStatus(1) === 'completed' ? 'Ready' : getStepStatus(1) === 'current' ? 'Preparing Items' : 'Queued'}</p>
                    </div>
                  </div>

                  {/* Step 3: Assigned */}
                  <div className="flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold transition-all ${
                      getStepStatus(2) === 'completed' ? 'bg-brand-green border-brand-green text-white' :
                      getStepStatus(2) === 'current' ? 'bg-brand-accent border-brand-accent text-black' :
                      'bg-[#1A1C1E] border-white/20 text-white/40'
                    }`}>
                      {getStepStatus(2) === 'completed' ? <CheckCircle2 size={18} /> : <User size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Rider Matched</p>
                      <p className="text-xs text-white/50">{getStepStatus(2) === 'completed' ? 'Assigned' : getStepStatus(2) === 'current' ? 'Rider Found' : 'Finding Rider'}</p>
                    </div>
                  </div>

                  {/* Step 4: In Transit */}
                  <div className="flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold transition-all ${
                      getStepStatus(3) === 'completed' ? 'bg-brand-green border-brand-green text-white' :
                      getStepStatus(3) === 'current' ? 'bg-brand-accent border-brand-accent text-black' :
                      'bg-[#1A1C1E] border-white/20 text-white/40'
                    }`}>
                      {getStepStatus(3) === 'completed' ? <CheckCircle2 size={18} /> : <Truck size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">In Transit</p>
                      <p className="text-xs text-white/50">{getStepStatus(3) === 'completed' ? 'Arrived' : getStepStatus(3) === 'current' ? 'On the Way' : 'Pending'}</p>
                    </div>
                  </div>

                  {/* Step 5: Delivered */}
                  <div className="flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold transition-all ${
                      getStepStatus(4) === 'completed' ? 'bg-brand-green border-brand-green text-white' :
                      getStepStatus(4) === 'current' ? 'bg-brand-green border-brand-green text-white' :
                      'bg-[#1A1C1E] border-white/20 text-white/40'
                    }`}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Delivered</p>
                      <p className="text-xs text-white/50">{getStepStatus(4) === 'completed' || getStepStatus(4) === 'current' ? 'Completed' : 'Pending'}</p>
                    </div>
                  </div>
                </div>

                {/* Conditional Call to Action for Payments */}
                {order.status === 'pending_payment' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-12 p-6 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-brand-accent">Payment Required</h4>
                        <p className="text-xs text-white/70">To start running this errand, please pay ₦{order.total_amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                      <button
                        onClick={initiateFlutterwavePayment}
                        className="flex-1 md:flex-none px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 text-black font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Pay via Flutterwave</span>
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Errand & Dispatch Details Split Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Card: Errand details */}
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-xl shadow-2xl text-left">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <ShoppingBag className="text-brand-accent w-5 h-5" />
                    <span>Errand Details</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-white/40 block">Description</span>
                      <p className="text-sm font-semibold">{order.errand_description || order.raw_text}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Items List</span>
                      <ul className="space-y-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <li key={idx} className="text-sm flex justify-between bg-white/5 px-3 py-2 rounded-lg">
                              <span className="font-bold">{item.name} {item.spec && <span className="font-normal text-xs text-white/50">({item.spec})</span>}</span>
                              <span className="text-brand-accent font-bold">x{item.qty}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-white/40">Custom Errands Service</li>
                        )}
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between text-sm">
                      <span className="text-white/40">Total Amount:</span>
                      <span className="font-bold text-brand-accent">₦{order.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Dispatch details */}
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-xl shadow-2xl text-left flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Truck className="text-brand-accent w-5 h-5" />
                      <span>Rider Details</span>
                    </h3>
                    
                    {dispatcher ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold">{dispatcher.name}</p>
                            <p className="text-xs text-white/40 capitalize">{dispatcher.vehicle_type} delivery agent</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={`tel:${dispatcher.phone_number}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-colors"
                          >
                            <Phone size={14} />
                            <span>Call Rider</span>
                          </a>
                        </div>
                        <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl flex items-center gap-2 text-brand-green text-xs">
                          <ShieldCheck size={14} />
                          <span>Verified EasyBuy4Me Logistics Agent</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-white/30 space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin text-white/10" />
                        <p className="text-sm">Rider details will appear as soon as payment is confirmed and a delivery partner accepts the task.</p>
                      </div>
                    )}
                  </div>
                  
                  {dispatcher && dispatcher.current_latitude && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <span className="text-xs text-white/40 block mb-1">Rider Current Location</span>
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <MapPin size={12} className="text-brand-accent" />
                        <span>Lat: {dispatcher.current_latitude.toFixed(4)}, Lng: {dispatcher.current_longitude?.toFixed(4)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
