import { motion } from 'framer-motion';
import { GlobePulse } from './ui/cobe-globe-pulse';

export const GlobeStats = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-[1024px] mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-500 text-xs font-bold mb-8 uppercase tracking-widest"
          >
            Real tasks. Real people. Real impact.
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-[#1A1C1E]"
          >
            How Nigerians get <br />
            things done with <span className="text-gray-400 text-brand-primary">EASYBUY4ME</span>
          </motion.h2>

          {/* Big Stat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="relative inline-block"
          >
            <span className="text-6xl md:text-9xl font-black tracking-tighter bg-gradient-to-r from-[#FF4D00] to-[#FF8700] bg-clip-text text-transparent">
              ₦200M+
            </span>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -right-12 -bottom-4 bg-white shadow-lg border border-gray-100 px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold text-gray-500 whitespace-nowrap rotate-6"
            >
              Transaction volume processed
            </motion.div>
          </motion.div>
        </div>

        {/* Globe Visualization */}
        <div className="relative flex justify-center -mt-10 md:-mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl"
          >
            <GlobePulse className="w-full h-full" />
            {/* Fade effect at the bottom of the globe to blend with stats */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-20" />
          </motion.div>
        </div>

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16 pt-16 border-t border-gray-50">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-2 flex justify-center items-baseline gap-1"
            >
              <span>98</span>
              <span className="text-brand-primary text-2xl">%</span>
            </motion.div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              AI Transaction Accuracy
            </p>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-2 flex justify-center items-baseline gap-1"
            >
              <span>10</span>
              <span className="text-[#9D34FF] text-2xl">K</span>
            </motion.div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              Errands completed
            </p>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-2 flex justify-center items-baseline gap-1"
            >
              <span>1</span>
              <span className="text-[#347FFF] text-2xl">+</span>
            </motion.div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              Region Supported
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
