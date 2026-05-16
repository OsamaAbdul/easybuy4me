import { motion, useScroll, useTransform } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon } from '@hugeicons/core-free-icons';
import { useRef } from 'react';
import { ShieldCheck, CheckCircle2, User, BatteryMedium, Signal, Wifi, CheckCheck } from 'lucide-react';
import imageLogo from "../../public/easybuy4me-logo.jpg"

export const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-screen flex items-center isolate">
      {/* Background Image with Blur and Dark Overlay */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 -z-10 bg-black">
        <div
          className="absolute inset-0 opacity-50 blur-[1px]"
          style={{
            backgroundImage: 'url("/shawn-fields-zsppCWsxJy0-unsplash.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </motion.div>

      <div className="max-w-[1024px] mx-auto px-6 text-center relative z-10 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium mb-12 backdrop-blur-md"
        >
          <span className="bg-brand-accent text-black px-2 py-0.5 rounded-md text-[10px] font-bold mr-1">New</span>
          <span>Run errands for yourself, friends and family with ease</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.1] max-w-4xl mx-auto"
        >
          Talk about errands<br />
          We get it done.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-16 leading-relaxed"
        >
          Easybuy4Me AI is a super-intelligent Errands assistant built for Nigerians and the world.
        </motion.p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <motion.button
            initial="initial"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            className="group w-full md:w-auto px-10 py-4 rounded-full bg-white text-black hover:bg-white/90 transition-all text-lg font-bold flex items-center justify-center gap-2 shadow-xl overflow-hidden"
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
                <span className="h-[1.5em] flex items-center justify-center">Start with WhatsApp</span>
                <span className="h-[1.5em] flex items-center justify-center">Start with WhatsApp</span>
              </motion.div>
            </div>
          </motion.button>

          <motion.button
            initial="initial"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            className="group w-full md:w-auto px-10 py-4 rounded-full border border-white/30 bg-white/5 hover:bg-white/10 transition-all text-lg font-bold flex items-center justify-center gap-3 backdrop-blur-sm overflow-hidden"
          >
            <HugeiconsIcon
              icon={PlayIcon}
              size={24}
              color="#7E1514"
              strokeWidth={1.5}
            />
            <div className="relative h-[1.5em] overflow-hidden pointer-events-none">
              <motion.div
                variants={{
                  initial: { y: 0 },
                  hover: { y: "-50%" }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex flex-col text-center"
              >
                <span className="h-[1.5em] flex items-center justify-center">See How It Works</span>
                <span className="h-[1.5em] flex items-center justify-center">See How It Works</span>
              </motion.div>
            </div>
          </motion.button>
        </div>

        {/* Visual Mockup Section */}
        <div className="mt-24 relative max-w-5xl mx-auto flex justify-center items-end gap-4 md:gap-12 pb-20">
          {/* Left Card: Security */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotate: -15 }}
            animate={{ opacity: 1, x: 0, rotate: -6 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hidden md:flex flex-col items-center gap-4 p-6 rounded-3xl bg-[#1A1C1E]/80 backdrop-blur-xl border border-white/10 shadow-2xl mb-24"
          >
            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <p className="text-xs font-semibold text-white/70 max-w-[120px] text-center leading-tight">
              Whatsapp Grade Security
            </p>
          </motion.div>

          {/* Central Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            animate={{ opacity: 1, y: 220 }}
            transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 50 }}
            className="relative z-10 w-full max-w-[300px] bg-white rounded-[3rem] p-2.5 shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-[8px] border-[#1A1C1E]"
          >
            {/* Phone Screen */}
            <div className="bg-[#F0F2F5] rounded-[2.2rem] overflow-hidden aspect-[9/19] flex flex-col w-full relative">
              <style dangerouslySetInnerHTML={{
                __html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              ` }} />
              {/* Status Bar */}
              <div className="bg-[#075E54] px-5 py-2 flex justify-between items-center text-[10px] text-white/90">
                <span className="font-medium">11:50</span>
                <div className="flex items-center gap-1.5">
                  <Signal size={12} strokeWidth={2.5} />
                  <Wifi size={12} strokeWidth={2.5} />
                  <BatteryMedium size={14} strokeWidth={2.5} className="rotate-0" />
                </div>
              </div>
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] p-4 pt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <User className="w-6 h-6" />
                  <img
                    className='rounded-full'
                    src={imageLogo}
                    alt="image logo"
                    width={200}
                    height={200}
                  />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-xs">EasyBuy4Me</p>
                  <p className="text-white/70 text-[9px]">online</p>
                </div>
              </div>
              {/* Chat Area */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-[#E5DDD5] scrollbar-hide">
                <div className="bg-white p-2.5 rounded-xl rounded-tl-none shadow-sm max-w-[85%] text-left">
                  <p className="text-[11px] text-gray-800 font-medium mb-1">Hello Osama! which errand do you want me to run for you today?</p>
                  <div className="flex justify-end text-[8px] text-gray-400">
                    <span>11:43</span>
                  </div>
                </div>
                <div className="bg-[#DCF8C6] p-2.5 rounded-xl rounded-tr-none shadow-sm max-w-[85%] ml-auto text-left">
                  <p className="text-[11px] text-gray-800 mb-1">I'm hungry, i need jollof rice and chicken from chicken
                    republic.</p>
                  <div className="flex justify-end items-center gap-0.5 text-[8px] text-gray-500">
                    <span>11:45</span>
                    <CheckCheck size={10} className="text-[#34B7F1]" />
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl rounded-tl-none shadow-sm max-w-[90%] text-left">
                  <p className="text-[11px] text-gray-800 leading-snug mb-1">Your order has been placed successfully. Your bills is <span className="font-bold text-[#1A1C1E]">₦4,500</span>.</p>
                  <div className="flex justify-end text-[8px] text-gray-400">
                    <span>11:46</span>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl rounded-tl-none shadow-sm max-w-[90%] text-left">
                  <p className="text-[11px] text-gray-800 leading-snug mb-1">How would you like to pay? <span className="font-bold text-[#1A1C1E]">Opay or Bank Transfer</span>.</p>
                  <div className="flex justify-end text-[8px] text-gray-400">
                    <span>11:46</span>
                  </div>
                </div>
                <div className="bg-[#DCF8C6] p-2.5 rounded-xl rounded-tr-none shadow-sm max-w-[85%] ml-auto text-left">
                  <p className="text-[11px] text-gray-800 mb-1">Opay please send the details, i will be waiting...</p>
                  <div className="flex justify-end items-center gap-0.5 text-[8px] text-gray-500">
                    <span>11:47</span>
                    <CheckCheck size={10} className="text-[#34B7F1]" />
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl rounded-tl-none shadow-sm max-w-[90%] text-left">
                  <p className="text-[11px] text-gray-800 leading-snug mb-1">Opay</p>
                  <p className="text-[11px] text-gray-800 leading-snug mb-1">8145096342</p>
                  <p className="text-[11px] text-gray-800 leading-snug mb-1">EasyBuy4Me</p>
                  <div className="flex justify-end text-[8px] text-gray-400">
                    <span>11:48</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Card: Success */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotate: 15 }}
            animate={{ opacity: 1, x: 0, rotate: 6 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="hidden md:flex flex-col items-center gap-4 p-6 rounded-3xl bg-[#1A1C1E]/80 backdrop-blur-xl border border-white/10 shadow-2xl mb-16"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="text-white w-8 h-8" />
            </div>
            <p className="text-xs font-semibold text-white/70 max-w-[120px] text-center leading-tight">
              Delivered Successfully!
            </p>
          </motion.div>
        </div>


        {/* Stats/Trust */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-20 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-bold"></span>
            <span className="text-white/40 text-sm"></span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-bold"></span>

          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-bold"></span>
            <span className="text-white/40 text-sm"></span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-bold"></span>
            <span className="text-white/40 text-sm"></span>
          </div>
        </motion.div>
      </div>

      {/* Wave Transition Effect */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-30">

        <svg width="100%" height="100%" id="svg" viewBox="0 0 1440 590" xmlns="http://www.w3.org/2000/svg" className="transition duration-300 ease-in-out delay-150"><path d="M 0,600 L 0,0 C 148.93333333333334,84.53333333333333 297.8666666666667,169.06666666666666 480,199 C 662.1333333333333,228.93333333333334 877.4666666666667,204.26666666666665 1043,162 C 1208.5333333333333,119.73333333333333 1324.2666666666667,59.86666666666667 1440,0 L 1440,600 L 0,600 Z" stroke="none" stroke-width="0" fill="#ffffff" fill-opacity="1" className="transition-all duration-300 ease-in-out delay-150 path-0"></path></svg>
      </div>
    </section>
  );
};
