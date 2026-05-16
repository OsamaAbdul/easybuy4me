import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Cancel01Icon, CustomerServiceIcon } from '@hugeicons/core-free-icons';

const faqs = [
  {
    question: "What is EasyBuy4Me?",
    answer: "EasyBuy4Me is an on-demand errand and personal shopping service that connects you with verified runners to handle your market runs, grocery shopping, document deliveries, and even international procurement."
  },
  {
    question: "Is EasyBuy4Me secure?",
    answer: "Absolutely. We use secure escrow payments where funds are only released after you confirm delivery. Every runner is background-checked, and every errand is tracked in real-time."
  },
  {
    question: "How do I pay for errands?",
    answer: "You can pay securely via bank transfer, card, or your digital wallet. Your payment is held securely in escrow and only transferred to the runner once you are satisfied with the service."
  },
  {
    question: "Can I track my runner?",
    answer: "Yes! Once your runner starts your errand, you'll receive a tracking link to monitor their real-time location and progress until they arrive at your doorstep."
  },
  {
    question: "What if my item is unavailable?",
    answer: "Our runners communicate with you in real-time. If an item is out of stock, they'll send you photos of alternatives or call you to decide whether to substitute or skip the item."
  }
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-[1024px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24">
          
          {/* Left Side: Header & Contact Card */}
          <div className="space-y-12">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-500 text-xs font-bold mb-8 uppercase tracking-widest"
              >
                Common questions
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1C1E]"
              >
                Frequently <br />
                asked questions
              </motion.h2>
            </div>

            {/* Support Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group"
            >
              <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/30 group-hover:scale-110 transition-transform">
                <HugeiconsIcon icon={CustomerServiceIcon} size={24} color="#FFFFFF" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-6 text-[#1A1C1E]">Can't find your answer?</h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-[#0F1113] text-white rounded-full font-bold text-lg shadow-xl shadow-black/10 w-full md:w-auto"
              >
                Contact us
              </motion.button>
            </motion.div>
          </div>

          {/* Right Side: Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                >
                  <span className="text-lg font-bold text-[#1A1C1E]">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openIndex === index ? 'bg-gray-100 rotate-0' : 'bg-gray-50'}`}>
                    <HugeiconsIcon 
                      icon={openIndex === index ? Cancel01Icon : Add01Icon} 
                      size={20} 
                      className="text-gray-500"
                    />
                  </div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-8 pb-8 text-gray-500 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
