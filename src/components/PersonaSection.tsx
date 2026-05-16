import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Home01Icon, 
  Briefcase01Icon, 
  GlobalIcon, 
  Book02Icon
} from '@hugeicons/core-free-icons';
import { GridPattern } from './ui/grid-pattern';
import { cn } from '../lib/utils';

const personas = [
  {
    id: 'families',
    title: 'Busy Families',
    icon: Home01Icon,
    description: 'We handle the market runs and grocery shopping so you can spend more quality time with your loved ones.',
    highlight: '98% on-time grocery delivery',
    image: '/busy_family.png'
  },
  {
    id: 'professionals',
    title: 'Professionals',
    icon: Briefcase01Icon,
    description: 'From document deliveries to office lunch runs, we act as your personal assistant on the go.',
    highlight: 'Save 10+ hours weekly',
    image: '/professional.png'
  },
  {
    id: 'global',
    title: 'Global Shoppers',
    icon: GlobalIcon,
    description: 'Want something from abroad? We procure and ship international items directly to your doorstep.',
    highlight: 'Global shipping made easy',
    image: '/global_shipping.png'
  },
  {
    id: 'students',
    title: 'Students',
    icon: Book02Icon,
    description: 'Late-night snacks or stationery emergencies? We’ve got you covered with lightning-fast campus delivery.',
    highlight: 'Student-friendly rates',
    image: '/student.png'
  }
];

export const PersonaSection = () => {
  const [activeTab, setActiveTab] = useState(personas[0].id);

  const activePersona = personas.find(p => p.id === activeTab)!;

  return (
    <section id="personas" className="py-32 bg-white relative overflow-hidden isolate">
      {/* Grid Pattern Background - Skewed Demo Version */}
      <GridPattern
        squares={[
          [4, 4],
          [5, 1],
          [8, 2],
          [5, 3],
          [5, 5],
          [10, 10],
          [12, 15],
          [15, 10],
          [10, 15],
          [15, 10],
          [10, 15],
          [15, 10],
        ]}
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 opacity-100",
        )}
      />

      <div className="max-w-[1024px] mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-[#1A1C1E]"
          >
            Fits every <span className="text-gray-400">lifestyle.</span>
          </motion.h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <div className="bg-[#F2F2F2] p-1.5 rounded-full flex flex-wrap justify-center gap-1">
            {personas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => setActiveTab(persona.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === persona.id 
                    ? 'bg-white text-brand-primary shadow-sm' 
                    : 'text-gray-500 hover:text-[#1A1C1E]'
                }`}
              >
                <HugeiconsIcon icon={persona.icon} size={18} strokeWidth={2} />
                {persona.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="relative h-[500px] md:h-[600px] w-full rounded-[40px] overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {/* Internal Card Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                style={{ 
                  backgroundImage: `url(${activePersona.image})`,
                }}
              />
              <div className="absolute inset-0 bg-black/20" />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 flex items-end justify-end p-6 md:p-12">
                <div className="max-w-sm bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] text-white shadow-2xl mb-4 mr-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-white/90 text-sm md:text-base mb-6 leading-relaxed font-medium">
                      {activePersona.description}
                    </p>
                    
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl md:text-4xl font-bold">92%</span>
                      <span className="text-xs md:text-sm text-white/60 font-medium uppercase tracking-wider">
                        {activePersona.highlight}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
