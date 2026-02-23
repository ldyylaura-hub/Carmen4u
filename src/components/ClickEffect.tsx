import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClickSpark {
  id: number;
  x: number;
  y: number;
}

const DOLL_IMAGE = "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/picture/doll.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWN0dXJlL2RvbGwucG5nIiwiaWF0IjoxNzcxMDA1MTE0LCJleHAiOjE5Mjg2ODUxMTR9.55MkHT6qU80g14pdb5DJdTHX3rTHLcUfUyisfp3X6Nw";

export const ClickEffect = () => {
  const [sparks, setSparks] = useState<ClickSpark[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newSpark = {
        id: Date.now(),
        x: e.pageX,
        y: e.pageY,
      };

      setSparks((prev) => [...prev, newSpark]);

      // Cleanup after animation
      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
      }, 1000);
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.img
            key={spark.id}
            src={DOLL_IMAGE}
            initial={{ opacity: 1, scale: 0.5, x: spark.x - 25, y: spark.y - 25 }}
            animate={{ 
              opacity: 0, 
              y: spark.y - 100,
              scale: 1.2
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute w-12 h-12 object-contain"
            style={{ 
              left: 0, 
              top: 0, 
              // We use x/y in initial/animate, but setting position absolute requires careful handling
              // Actually, Framer Motion handles absolute positioning with x/y relative to the parent?
              // No, let's just use inline styles for initial position to be safe, 
              // but we are using `fixed inset-0` wrapper, so absolute positioning is relative to viewport if using clientX/Y.
              // But wait, pageX/Y includes scroll. `fixed` wrapper means we should use clientX/Y or subtract scroll if using pageX/Y.
              // Let's retry using clientX/Y logic or just position absolute.
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Re-write component to be safer with positioning
export const ClickEffectSafe = () => {
  const [sparks, setSparks] = useState<ClickSpark[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // use clientX/Y because the container is fixed to viewport
      const newSpark = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };

      setSparks((prev) => [...prev, newSpark]);

      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
      }, 1000);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            initial={{ opacity: 1, scale: 0, x: spark.x, y: spark.y }}
            animate={{ 
              opacity: 0, 
              y: spark.y - 100, // Move up
              scale: 1.5
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute w-16 h-16"
            style={{ 
              // Center the image on the click
              marginLeft: -32, 
              marginTop: -32 
            }}
          >
            <img src={DOLL_IMAGE} alt="sparkle" className="w-full h-full object-contain drop-shadow-md" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ClickEffectSafe;
