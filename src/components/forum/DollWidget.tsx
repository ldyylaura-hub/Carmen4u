import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';

const IDLE_MESSAGES = [
  "Welcome back! ✨",
  "Don't forget to check the new posts!",
  "Have a nice day! 🌈",
  "Click me! 👇",
  "Is it time for a break? ☕",
  "I'm watching you... just kidding! 👀",
  "Kirby is so cute! 💖",
];

const CONTEXT_MESSAGES: Record<string, string[]> = {
  'BUTTON': ["Clicking buttons? Nice!", "What does this button do?", "Go ahead!"],
  'A': ["Going somewhere?", "Check out this link!", "Exploring?"],
  'INPUT': ["Typing something cool?", "Share your thoughts!", "I'm listening..."],
  'TEXTAREA': ["Writing a masterpiece?", "Don't be shy!", "Type away!"],
};

export default function DollWidget() {
  const [message, setMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring animation for the parallax effect
  const rotateX = useSpring(useTransform(mouseY, [-500, 500], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-500, 500], [-10, 10]), { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to window center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName;
      
      if (CONTEXT_MESSAGES[tagName]) {
        const msgs = CONTEXT_MESSAGES[tagName];
        const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
        setMessage(randomMsg);
        setIsVisible(true);
        // Reset timer
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsVisible(false), 4000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    // Attach to body for capturing bubble events
    document.body.addEventListener('mouseover', handleElementHover);

    // Initial message
    setMessage(IDLE_MESSAGES[0]);
    setIsVisible(true);
    const initialTimer = setTimeout(() => setIsVisible(false), 5000);

    // Periodic idle messages
    const idleInterval = setInterval(() => {
      if (!isVisible) {
        const randomMsg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
        setMessage(randomMsg);
        setIsVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsVisible(false), 5000);
      }
    }, 20000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseover', handleElementHover);
      clearTimeout(initialTimer);
      clearInterval(idleInterval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    const randomMsg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
    setMessage(randomMsg);
    setIsVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsVisible(false), 5000);
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setIsVisible(false), 3000);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-0 right-8 z-50 flex flex-col items-end pointer-events-none perspective-1000"
      style={{ perspective: '1000px' }}
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mb-2 mr-16 bg-white border-2 border-[color:var(--k-ink)] p-3 rounded-2xl shadow-[4px_4px_0_var(--k-ink)] max-w-[220px] relative pointer-events-auto"
          >
            <p className="dotgothic16-regular text-sm text-[color:var(--k-ink)] font-bold leading-tight">{message}</p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b-2 border-r-2 border-[color:var(--k-ink)] rotate-45 transform"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doll Image with Parallax & Breathing */}
      <motion.div
        className="w-48 h-auto cursor-pointer pointer-events-auto"
        style={{ 
          rotateX, 
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.img 
          src="https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/picture/doll.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWN0dXJlL2RvbGwucG5nIiwiaWF0IjoxNzcxMDkzNjg0LCJleHAiOjE5Mjg3NzM2ODR9.2on-OKLQ6Kg2AmjwIUbRglVB-Ec6dRAkMHeQPiGUhRc" 
          alt="Mascot" 
          className="w-full h-full object-contain drop-shadow-xl"
          animate={{ 
            y: [0, -8, 0],
            scale: [1, 1.02, 1] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </motion.div>
    </div>
  );
}
