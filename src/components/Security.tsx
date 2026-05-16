import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  LockKeyIcon, 
  Shield01Icon, 
  ViewOffIcon, 
  UserCheckIcon 
} from '@hugeicons/core-free-icons';

const securityFeatures = [
  {
    title: 'Verified Errand Runners',
    description: 'Every agent on our platform undergoes rigorous background checks and identity verification for your safety.',
    icon: UserCheckIcon,
    color: 'bg-green-600',
    glow: 'shadow-green-500/50'
  },
  {
    title: 'Encrypted Task Details',
    description: 'Your delivery addresses and personal instructions are encrypted end-to-end, visible only to you and your runner.',
    icon: Shield01Icon,
    color: 'bg-red-600',
    glow: 'shadow-red-500/50'
  },
  {
    title: 'Secure Escrow Payments',
    description: 'Funds are held securely and only released once you confirm the errand is successfully completed.',
    icon: LockKeyIcon,
    color: 'bg-blue-600',
    glow: 'shadow-blue-500/50'
  },
  {
    title: 'Data Privacy First',
    description: 'We never share your shopping habits or personal data with third parties. Your privacy is non-negotiable.',
    icon: ViewOffIcon,
    color: 'bg-purple-600',
    glow: 'shadow-purple-500/50'
  }
];

export const Security = () => {
  return (
    <section id="security" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-[1024px] mx-auto px-6 relative z-10">
        
        {/* Top Feature Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-500 text-xs font-bold mb-8 uppercase tracking-widest">
              Account Protection
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-[#1A1C1E]">
              Secure Your Errands, <br />
              <span className="text-gray-400 text-brand-primary">Protect Your Privacy</span>
            </h2>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed max-w-md">
              Whether it's a lost phone or a security concern, EasyBuy4Me lets you freeze your account instantly via WhatsApp. We ensure your funds and errand history are protected while you recover.
            </p>
            <motion.button
              initial="initial"
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              className="group px-8 py-4 bg-[#0F1113] text-white rounded-full font-bold text-lg shadow-2xl shadow-black/20 overflow-hidden"
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
                  <span className="h-[1.5em] flex items-center justify-center">Block Account</span>
                  <span className="h-[1.5em] flex items-center justify-center">Block Account</span>
                </motion.div>
              </div>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl">
              <img 
                src="https://framerusercontent.com/images/uykCErNLvY2PKaqeRkR8xETwgY.png?scale-down-to=1024&width=2000&height=2000" 
                alt="Secure Account Illustration" 
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Bottom Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-8 shadow-lg ${feature.glow} group-hover:scale-110 transition-transform`}>
                <HugeiconsIcon icon={feature.icon} size={24} color="#FFFFFF" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold mb-4 text-[#1A1C1E]">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
