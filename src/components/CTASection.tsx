import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { WhatsappIcon, TelegramIcon } from '@hugeicons/core-free-icons';

export const CTASection = () => {
  const rollingTextVariants = {
    initial: { y: 0 },
    hover: { y: "-50%" }
  };

  const rollingTransition = { type: "spring" as const, stiffness: 300, damping: 25 };

  return (
    <section className="py-32 bg-white relative overflow-hidden isolate">
      {/* Background Cloud Image with Gradient Blending */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center transition-all duration-700 opacity-40"
        style={{
          backgroundImage: 'url("/cloud.jpg")',
          maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
        }}
      />

      <div className="max-w-[1024px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-12 lg:gap-8 items-center">

          {/* Left Side: Messaging & Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 order-2 lg:order-1 text-center lg:text-left"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1C1E]">
              Send. Shop. <br />
              Errand. <span className="text-gray-400">Smarter.</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-sm mx-auto lg:mx-0">
              Groceries, document deliveries, international shopping, and more — all powered by our intelligent errand runners.
            </p>

            <div className="flex flex-col gap-4 max-w-xs mx-auto lg:mx-0">
              {/* WhatsApp Button */}
              <motion.button
                initial="initial"
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-3 px-6 py-4 bg-[#0F1113] text-white rounded-2xl font-bold text-lg shadow-2xl shadow-black/20 overflow-hidden"
              >
                <HugeiconsIcon icon={WhatsappIcon} size={24} color="#25D366" />
                <div className="relative h-[1.5em] overflow-hidden pointer-events-none flex-1">
                  <motion.div
                    variants={rollingTextVariants}
                    transition={rollingTransition}
                    className="flex flex-col text-left"
                  >
                    <span className="h-[1.5em] flex items-center">Try Now on WhatsApp</span>
                    <span className="h-[1.5em] flex items-center">Try Now on WhatsApp</span>
                  </motion.div>
                </div>
              </motion.button>

              {/* Telegram Button */}
              <motion.button
                initial="initial"
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 text-[#1A1C1E] rounded-2xl font-bold text-lg shadow-xl shadow-black/5 overflow-hidden"
              >
                <HugeiconsIcon icon={TelegramIcon} size={24} color="#24A1DE" />
                <div className="relative h-[1.5em] overflow-hidden pointer-events-none flex-1 text-left">
                  <motion.div
                    variants={rollingTextVariants}
                    transition={rollingTransition}
                    className="flex flex-col"
                  >
                    <span className="h-[1.5em] flex items-center">Try Now on Telegram</span>
                    <span className="h-[1.5em] flex items-center text-brand-primary">Try Now on Telegram</span>
                  </motion.div>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Middle: iPhone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: "spring", bounce: 0.3 }}
            className="order-1 lg:order-2 flex justify-center lg:px-4"
          >
            <div className="w-[280px] md:w-[320px] relative">
              <img
                src="/iphone-15-plus-mockup-front-view-floating-in-air-for-digital-product-presentation-0698-removebg-preview.png"
                alt="EasyBuy4Me Mobile Interface"
                className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]"
              />
            </div>
          </motion.div>

          {/* Right Side: QR Code */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 order-3 text-center lg:text-left"
          >
            <h3 className="text-2xl font-bold text-[#1A1C1E]">
              Scan the QR code <br />
              to start using <span className="text-brand-primary">EasyBuy4Me</span>
            </h3>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-block"
            >
              <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-2xl shadow-black/5 flex items-center justify-center">
                <img
                  src="/qr_code.png"
                  alt="EasyBuy4Me QR Code"
                  className="w-32 md:w-48 h-auto rounded-3xl"
                />
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
