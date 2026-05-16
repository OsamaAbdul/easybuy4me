import { useState, useRef } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Menu01Icon,
  Cancel01Icon,
  WhatsappIcon,
  TelegramIcon,
} from '@hugeicons/core-free-icons';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Use Cases', href: '#personas' },
  { label: 'Security', href: '#security' },
  { label: 'FAQ', href: '#faq' }
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMerged, setIsMerged] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  // Detect scroll direction and position
  useMotionValueEvent(scrollY, "change", (latest) => {
    const direction = latest > lastScrollY.current ? "down" : "up";
    
    if (direction === "down" && latest > 50) {
      setIsMerged(true);
    } else if (direction === "up") {
      setIsMerged(false);
    }
    
    lastScrollY.current = latest;
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none p-4">
      <motion.div
        animate={{ 
          top: isMerged ? '16px' : '24px',
          width: '100%',
          maxWidth: isMerged ? '800px' : '1024px'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full flex items-center justify-center"
      >
        <div className="flex items-center justify-between w-full md:justify-center">
          {/* Logo Pill */}
          <motion.div
            layout
            animate={{
              opacity: isMerged ? 0.9 : 1,
              scale: isMerged ? 0.95 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="pointer-events-auto bg-white rounded-[24px] px-3 py-2 flex items-center shadow-md cursor-pointer z-10"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/easybuy4me-logo.jpg" alt="EasyBuy4Me Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-brand-primary font-bold tracking-tight text-lg md:text-xl">EasyBuy<span className="text-xl md:text-2xl">4</span>Me</span>
            </div>
          </motion.div>

          {/* Dynamic Spacer (Left) - Desktop Only */}
          <motion.div
            layout
            animate={{ width: isMerged ? '8px' : '160px' }}
            className="hidden md:block"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {/* Navigation Pill (Middle) - Desktop Only */}
          <motion.div
            layout
            className="hidden md:flex pointer-events-auto bg-white rounded-[24px] px-4 py-2 items-center gap-2 shadow-md relative"
          >
            {navLinks.map((item, i) => (
              <a
                key={item.label}
                href={item.href}
                className="relative px-6 py-2 text-sm font-semibold text-[#4A4A4A] hover:text-black transition-colors whitespace-nowrap z-10"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {hoveredIndex === i && (
                  <motion.div
                    layoutId="nav-hover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-brand-secondary rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {item.label}
              </a>
            ))}
          </motion.div>

          {/* Dynamic Spacer (Right) - Desktop Only */}
          <motion.div
            layout
            animate={{ width: isMerged ? '8px' : '160px' }}
            className="hidden md:block"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {/* Actions Pill */}
          <motion.div
            layout
            animate={{
              opacity: isMerged ? 0.9 : 1,
              scale: isMerged ? 0.95 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="pointer-events-auto bg-white rounded-[24px] px-2 py-2 md:px-4 md:py-2 flex items-center gap-2 shadow-md z-10"
          >
            <div className="flex items-center gap-1.5 md:gap-2">
              <motion.button
                initial="initial"
                whileHover="hover"
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#F2F2F2] md:bg-transparent flex items-center justify-center hover:bg-gray-200 transition-colors overflow-hidden"
              >
                <div className="relative h-[20px] overflow-hidden pointer-events-none">
                  <motion.div
                    variants={{
                      initial: { y: 0 },
                      hover: { y: "-50%" }
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex flex-col items-center"
                  >
                    <div className="h-[20px] flex items-center justify-center">
                      <HugeiconsIcon icon={WhatsappIcon} size={20} color="#25D366" strokeWidth={1.5} />
                    </div>
                    <div className="h-[20px] flex items-center justify-center">
                      <HugeiconsIcon icon={WhatsappIcon} size={20} color="#25D366" strokeWidth={1.5} />
                    </div>
                  </motion.div>
                </div>
              </motion.button>

              <motion.button
                initial="initial"
                whileHover="hover"
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#F2F2F2] md:bg-transparent flex items-center justify-center hover:bg-gray-200 transition-colors overflow-hidden"
              >
                <div className="relative h-[20px] overflow-hidden pointer-events-none">
                  <motion.div
                    variants={{
                      initial: { y: 0 },
                      hover: { y: "-50%" }
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex flex-col items-center"
                  >
                    <div className="h-[20px] flex items-center justify-center">
                      <HugeiconsIcon icon={TelegramIcon} size={20} color="#0088CC" strokeWidth={1.5} />
                    </div>
                    <div className="h-[20px] flex items-center justify-center">
                      <HugeiconsIcon icon={TelegramIcon} size={20} color="#0088CC" strokeWidth={1.5} />
                    </div>
                  </motion.div>
                </div>
              </motion.button>
            </div>

            <motion.button
              initial="initial"
              whileHover="hover"
              className="md:hidden w-10 h-10 rounded-xl bg-[#F2F2F2] flex items-center justify-center text-text-primary overflow-hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="relative h-[20px] overflow-hidden pointer-events-none">
                <motion.div
                  variants={{
                    initial: { y: 0 },
                    hover: { y: "-50%" }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex flex-col items-center"
                >
                  <div className="h-[20px] flex items-center justify-center">
                    <HugeiconsIcon icon={isOpen ? Cancel01Icon : Menu01Icon} size={20} strokeWidth={1.5} />
                  </div>
                  <div className="h-[20px] flex items-center justify-center">
                    <HugeiconsIcon icon={isOpen ? Cancel01Icon : Menu01Icon} size={20} strokeWidth={1.5} />
                  </div>
                </motion.div>
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="md:hidden absolute top-[calc(100%+12px)] left-0 right-0 bg-white rounded-[24px] p-4 flex flex-col gap-2 shadow-xl border border-gray-100 pointer-events-auto"
          >
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setIsOpen(false)} className="px-4 py-3 text-sm font-semibold text-[#4A4A4A] hover:bg-gray-50 rounded-xl transition-colors">
                {item.label}
              </a>
            ))}
            <hr className="border-gray-100 my-1" />
            <button className="w-full py-4 rounded-xl bg-brand-primary text-white font-bold text-sm">
              Get Started
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
