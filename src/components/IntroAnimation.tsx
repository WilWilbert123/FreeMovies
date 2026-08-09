"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIntroStore } from "@/store/useIntroStore";

export default function IntroAnimation() {
  const [showIntro, setShowIntro] = useState(true);
  const setIsIntroPlaying = useIntroStore((state) => state.setIsIntroPlaying);

  useEffect(() => {
    setIsIntroPlaying(true);
    
    // Play intro sound
    const audio = new Audio('/soundintro.mp3');
    audio.play().catch(e => console.log('Audio autoplay blocked by browser:', e));

    // For testing purposes, we can clear this to see it every load.
    // Uncomment this to make it play only once per session:
    // if (sessionStorage.getItem("introPlayed") === "true") {
    //   setShowIntro(false);
    //   return;
    // }

    const timer = setTimeout(() => {
      setShowIntro(false);
      setIsIntroPlaying(false);
      // sessionStorage.setItem("introPlayed", "true");
    }, 6000); // Sequence takes about 6 seconds

    return () => {
      clearTimeout(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  if (!showIntro) return null;

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          key="intro-bg"
          className="fixed inset-0 z-[9998] bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      )}
      {showIntro && (
        <motion.div
          key="intro-content"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-none"
        >
          {/* Main container to center everything */}
          <div className="relative flex items-center justify-center h-20 w-full max-w-[400px]">
          {/* The Logo (F) Container */}
          <motion.div layoutId="main-logo" className="relative h-16 w-auto z-20 flex items-center justify-center">
            {/* Base Image */}
            <motion.img
              src="/logofm2.png"
              alt="Logo"
              className="h-16 w-auto relative z-20"
              initial={{ x: 0, opacity: 0 }}
              animate={{
                x: [0, 0, -110, -110, 0, 0],
                opacity: [0, 1, 1, 1, 1, 1],
              }}
              transition={{
                times: [0, 0.16, 0.33, 0.66, 0.83, 1],
                duration: 6,
                ease: "easeInOut",
              }}
            />
            
            {/* Shiny Overlay for the Image */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-30"
              style={{
                backgroundImage: `linear-gradient(120deg, transparent 0%, transparent 35%, #ffffff 50%, transparent 65%, transparent 100%)`,
                backgroundSize: '200% auto',
                WebkitMaskImage: `url('/logofm2.png')`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
              }}
              initial={{ backgroundPosition: "150% center", x: 0, opacity: 0 }}
              animate={{
                backgroundPosition: ["150% center", "150% center", "150% center", "-50% center", "-50% center"],
                x: [0, 0, -110, -110, 0, 0],
                opacity: [0, 1, 1, 1, 1, 1],
              }}
              transition={{
                backgroundPosition: { times: [0, 0.3, 0.4, 0.6, 1], duration: 6, ease: "linear" },
                x: { times: [0, 0.16, 0.33, 0.66, 0.83, 1], duration: 6, ease: "easeInOut" },
                opacity: { times: [0, 0.16, 0.33, 0.66, 0.83, 1], duration: 6, ease: "easeInOut" },
              }}
            />
          </motion.div>

          {/* The Text (REEMOVIES) */}
          <motion.div
            className="font-bebas text-5xl md:text-6xl font-bold tracking-wider overflow-hidden whitespace-nowrap absolute left-[50%] -translate-x-[50%] z-10 flex items-center h-full top-[50%] -translate-y-[50%]"
            style={{ 
              marginLeft: "40px",
              backgroundImage: `linear-gradient(120deg, #e50914 0%, #e50914 35%, #ffffff 50%, #e50914 65%, #e50914 100%)`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            initial={{ width: 0, opacity: 0, backgroundPosition: "150% center" }}
            animate={{
              width: [0, 0, 240, 240, 0, 0],
              opacity: [0, 0, 1, 1, 0, 0],
              backgroundPosition: ["150% center", "150% center", "150% center", "-50% center", "-50% center"],
            }}
            transition={{
              width: { times: [0, 0.16, 0.33, 0.66, 0.83, 1], duration: 6, ease: "easeInOut" },
              opacity: { times: [0, 0.16, 0.33, 0.66, 0.83, 1], duration: 6, ease: "easeInOut" },
              backgroundPosition: { times: [0, 0.3, 0.4, 0.6, 1], duration: 6, ease: "linear" },
            }}
          >
            REEMOVIES
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
