import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ShoppingBasket01Icon,
  CreditCardIcon,
  Task01Icon,
  GlobalIcon,
  SecurityLockIcon,
  WhatsappIcon,
  Agreement02Icon,
  ServingFoodIcon
} from '@hugeicons/core-free-icons';

const tags = ['#Groceries', '#FoodDelivery', '#Shopping', '#laundry', '#GlobalShipping'];

const features = [
  {
    icon: <HugeiconsIcon icon={ShoppingBasket01Icon} size={28} strokeWidth={1.5} />,
    title: "Grocery Errands",
    description: "Send us your list, and we'll handle the market runs. From local produce to supermarket essentials."
  },
  {
    icon: <HugeiconsIcon icon={ServingFoodIcon} size={28} strokeWidth={1.5} />,
    title: "Fast Food Delivery",
    description: "Cravings satisfied. We pick up from your favorite restaurants and deliver fresh and hot."
  },
  {
    icon: <HugeiconsIcon icon={Task01Icon} size={28} strokeWidth={1.5} />,
    title: "General Errands",
    description: "Pickup laundry, drop off documents, or handle bill payments. Consider it done."
  },
  {
    icon: <HugeiconsIcon icon={CreditCardIcon} size={28} strokeWidth={1.5} />,
    title: "Instant Payments",
    description: "Seamlessly pay for your errands via Opay or Bank Transfer with instant confirmation."
  },
  {
    icon: <HugeiconsIcon icon={GlobalIcon} size={28} strokeWidth={1.5} />,
    title: "Global Procurement",
    description: "Want something from abroad? We procure and ship international items directly to your doorstep."
  },
  {
    icon: <HugeiconsIcon icon={SecurityLockIcon} size={28} strokeWidth={1.5} />,
    title: "Trusted Service",
    description: "Verified agents and secure transactions. Your errands are in safe, professional hands."
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-[1024px] mx-auto px-6 relative z-10">
        {/* Hashtag Tags */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-[#1A1C1E] text-center"
        >
          Trusted by 2000+ busy people. <br className="hidden md:block" />
          <span className="text-gray-400">5000+ errands completed this month</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-500 text-lg max-w-2xl mx-auto text-center"
        >
          One Platform to rule your daily errands. From market runs to international shipping, EASYBUY4ME simplifies your life.
        </motion.p>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tags.map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="px-4 py-2 bg-white rounded-full text-sm font-bold text-brand-primary shadow-sm border border-gray-100"
            >
              {tag}
            </motion.span>
          ))}
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[32px] bg-[#FFFFFF] border border-gray-100 shadow-md hover:shadow-xl hover:border-brand-primary/20 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#F2F2F2] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform text-brand-primary">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#1A1C1E]">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Rating*/}

        <div className="text-center mb-24">
          {/* Social Proof Pill */}




          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-12 mb-20">
            <motion.button
              initial="initial"
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              className="group w-full md:w-auto px-8 py-4 rounded-full bg-[#0F1113] text-white transition-all text-lg font-bold flex items-center justify-center gap-2 shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden"
            >
              <div className="relative h-[1.5em] overflow-hidden pointer-events-none">
                <motion.div
                  variants={{
                    initial: { y: 0 },
                    hover: { y: "-50%" }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex flex-col text-center"
                >
                  <div className="h-[1.5em] flex items-center justify-center gap-3">
                    <HugeiconsIcon icon={WhatsappIcon} size={24} color="#25D366" strokeWidth={2} />
                    <span>Start on WhatsApp</span>
                  </div>
                  <div className="h-[1.5em] flex items-center justify-center gap-3">
                    <HugeiconsIcon icon={WhatsappIcon} size={24} color="#25D366" strokeWidth={2} />
                    <span>Start on WhatsApp</span>
                  </div>
                </motion.div>
              </div>
            </motion.button>

            <motion.button
              initial="initial"
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              className="group w-full md:w-auto px-8 py-4 rounded-full bg-[#EAEAEA] text-[#0F1113] transition-all text-lg font-bold flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="relative h-[1.5em] overflow-hidden pointer-events-none">
                <motion.div
                  variants={{
                    initial: { y: 0 },
                    hover: { y: "-50%" }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex flex-col text-center"
                >
                  <div className="h-[1.5em] flex items-center justify-center gap-3">
                    <HugeiconsIcon icon={Agreement02Icon} size={24} strokeWidth={2} />
                    <span>Partner with Us</span>
                  </div>
                  <div className="h-[1.5em] flex items-center justify-center gap-3">
                    <HugeiconsIcon icon={Agreement02Icon} size={24} strokeWidth={2} />
                    <span>Partner with Us</span>
                  </div>
                </motion.div>
              </div>
            </motion.button>
          </div>


        </div>
      </div>
    </section>
  );
};
