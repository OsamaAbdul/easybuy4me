import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClickPoint {
  id: number;
  x: number;
  y: number;
}

export const ClickEffect = () => {
  const [clicks, setClicks] = useState<ClickPoint[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newClick = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };
      setClicks((prev) => [...prev, newClick]);
      
      // Auto-remove after animation
      setTimeout(() => {
        setClicks((prev) => prev.filter((c) => c.id !== newClick.id));
      }, 600);
    };

    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {clicks.map((click) => (
          <div
            key={click.id}
            className="absolute"
            style={{ left: click.x, top: click.y }}
          >
            {/* Crown/Arc Sparks */}
            {[...Array(4)].map((_, i) => {
              const angles = [-60, -20, 20, 60]; // Crown arrangement
              const angle = angles[i];
              const radius = 12;
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, y: 0, x: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.1, 0.8],
                    x: Math.sin((angle * Math.PI) / 180) * (radius + 8),
                    y: -Math.cos((angle * Math.PI) / 180) * (radius + 8),
                  }}
                  transition={{ 
                    duration: 0.35,
                    ease: "easeOut"
                  }}
                  className="absolute w-[3px] h-[7px] bg-white rounded-full"
                  style={{ 
                    left: -1.5,
                    top: -3.5,
                    transform: `rotate(${angle}deg) translateY(-${radius}px)`,
                    transformOrigin: 'center bottom'
                  }}
                />
              );
            })}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
