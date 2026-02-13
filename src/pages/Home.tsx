import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Mic2, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);
  const videos = [
    "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/video/greetingvideo1.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlby9ncmVldGluZ3ZpZGVvMS5tcDQiLCJpYXQiOjE3NzEwMDE5OTEsImV4cCI6MTgwMjUzNzk5MX0.1hwmZqMF26PJ36WwqNuIoxMiL702XWn4GQ-I2ktcMTw",
    "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/video/greetingvideo2.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlby9ncmVldGluZ3ZpZGVvMi5tcDQiLCJpYXQiOjE3NzEwMDI1OTEsImV4cCI6MTgwMjUzODU5MX0.8hSoma1Dki--OMLHDmu5fJVLmjHbrmUZ-uxwCTnSGyY"
  ];

  // Preload next video to minimize gap
  const nextVideoIndex = (currentVideoIndex + 1) % videos.length;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Double Video Buffer Technique */}
        {videos.map((src, index) => {
          // Determine if this video should be playing
          const isPlaying = index === currentVideoIndex;
          // Preload the next video so it's ready
          const isNext = index === nextVideoIndex;
          
          return (
            <video 
              key={src}
              // Use a ref to control playback programmatically if needed, but autoPlay usually works
              // The key is to make sure it plays when it becomes visible
              ref={(el) => {
                if (el) {
                  if (isPlaying) {
                    el.play().catch(e => console.log("Auto-play prevented:", e));
                  } else if (!isNext) {
                    // Reset other videos so they start from beginning next time
                    el.currentTime = 0;
                    el.pause();
                  }
                }
              }}
              muted 
              playsInline
              className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
              style={{ display: isPlaying || isNext ? 'block' : 'none' }}
              onEnded={() => {
                if (isPlaying) {
                  setCurrentVideoIndex(nextVideoIndex);
                }
              }}
            >
              <source src={src} type="video/mp4" />
            </video>
          );
        })}
        
        {/* Fallback image */}
        <img 
          src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=2070&auto=format&fit=crop" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover -z-10" 
        />
        
        {/* Gradient Overlay - Adjusted for video readability */}
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-50 via-transparent to-transparent z-10" />

        {/* Content */}
        <div className="relative z-20 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="mb-6 inline-block"
          >
             <span className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-md text-pink-600 font-bold text-sm tracking-widest uppercase shadow-lg border border-pink-100">
               Official Fan Site
             </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-7xl md:text-9xl font-black mb-4 text-white drop-shadow-lg tracking-tight"
            style={{ textShadow: '0 4px 20px rgba(236, 72, 153, 0.5)' }}
          >
            CARMEN
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-xl md:text-2xl text-slate-800 font-medium mb-10 tracking-widest uppercase bg-white/50 inline-block px-6 py-2 rounded-lg backdrop-blur-sm"
          >
            The Voice. The Vision. The Vibe.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <Link to="/why-stan" className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              了解 Carmen 🌴
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown className="w-10 h-10 text-pink-500 drop-shadow-md" />
          </motion.div>
        </motion.div>
      </section>

      {/* Charm Showcase */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 text-slate-800"
          >
            Why We Love Her
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Charm 1 */}
            <CharmCard 
              icon={<Mic2 className="w-12 h-12 text-pink-500" />}
              title="Angelic Vocals"
              description="A voice that transcends genres, delivering emotion in every note."
              delay={0.2}
            />
            {/* Charm 2 */}
            <CharmCard 
              icon={<Sparkles className="w-12 h-12 text-purple-500" />}
              title="Stunning Visuals"
              description="Captivating stage presence and an iconic fashion sense."
              delay={0.4}
            />
            {/* Charm 3 */}
            <CharmCard 
              icon={<Heart className="w-12 h-12 text-red-500" />}
              title="Golden Personality"
              description="Humble, funny, and deeply connected with her fans."
              delay={0.6}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function CharmCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-pink-100 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all text-center group"
    >
      <div className="flex justify-center mb-6 p-4 bg-pink-50 rounded-full w-24 h-24 mx-auto items-center group-hover:bg-pink-100 transition-colors">{icon}</div>
      <h3 className="text-2xl font-bold mb-4 text-slate-800">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
