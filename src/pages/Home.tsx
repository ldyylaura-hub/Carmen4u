import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const fetchVideo = async () => {
      // Fetch the plural key first
      let { data } = await supabase.from('home_content').select('value').eq('key', 'greeting_videos').single();
      
      // Fallback to old key if not found
      if (!data) {
         const { data: oldData } = await supabase.from('home_content').select('value').eq('key', 'greeting_video').single();
         data = oldData;
      }

      if (data && data.value) {
        try {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
              setVideoUrls(parsed);
          } else {
              setVideoUrls([data.value]);
          }
        } catch {
          setVideoUrls([data.value]);
        }
      }
    };
    fetchVideo();
  }, []);

  const handleVideoEnded = () => {
    if (videoUrls.length > 1) {
        setCurrentVideoIndex((prev) => (prev + 1) % videoUrls.length);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-pink-200">
        {videoUrls.length > 0 ? (
          <video 
            key={videoUrls[currentVideoIndex]} // Key change forces re-render for new source
            src={videoUrls[currentVideoIndex]}
            autoPlay
            muted={true}
            loop={videoUrls.length === 1}
            playsInline={true}
            onEnded={handleVideoEnded}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          /* Fallback image if no video is set */
          <img 
            src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=2070&auto=format&fit=crop" 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover -z-10" 
          />
        )}
        
        {/* Gradient Overlay */}
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

      {/* Charm Showcase -> Fan Moments */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 text-slate-800 flex items-center justify-center gap-3"
          >
            <Sparkles className="text-yellow-400 w-8 h-8" />
            我的入坑契机
            <Sparkles className="text-yellow-400 w-8 h-8" />
          </motion.h2>

          <FanMoments />
        </div>
      </section>
    </div>
  );
}

function FanMoments() {
    const [moments, setMoments] = useState<{id: string, content: string}[]>([]);

    useEffect(() => {
        fetchMoments();
    }, []);

    const fetchMoments = async () => {
        // Fetch approved charms/moments
        const { data } = await supabase.from('idol_charms').select('id, content').eq('is_approved', true);
        
        let allItems = data || [];
        
        // If not enough, add defaults
        if (allItems.length < 3) {
            const defaults = [
                { id: 'def1', content: 'The Chase 的高音太震撼了！' },
                { id: 'def2', content: '看了综艺被性格圈粉，太可爱了' },
                { id: 'def3', content: '始于颜值，陷于才华，忠于人品' }
            ];
            allItems = [...allItems, ...defaults];
        }

        // Randomly pick 3
        const shuffled = allItems.sort(() => 0.5 - Math.random()).slice(0, 3);
        setMoments(shuffled);
    };

    return (
        <div className="grid md:grid-cols-3 gap-8 justify-items-center">
            {moments.map((moment, index) => (
                <FlipCharmCard key={moment.id} content={moment.content} index={index} />
            ))}
        </div>
    );
}

function FlipCharmCard({ content, index }: { content: string, index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Use the provided doll image as background
  const dollImage = "https://kzqqwvwfyvpghvawxpnv.supabase.co/storage/v1/object/sign/picture/doll.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTk4NjdjNC00OTg0LTRiNzItYmMxNS1jNWVmNjljOThmOTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWN0dXJlL2RvbGwucG5nIiwiaWF0IjoxNzcxMDA1MTE0LCJleHAiOjE5Mjg2ODUxMTR9.55MkHT6qU80g14pdb5DJdTHX3rTHLcUfUyisfp3X6Nw";
  
  // Subtle rotation for organic feel
  const rotate = ((index * 7) % 10) - 5; 

  return (
    <div 
      className="w-64 h-80 cursor-pointer group perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="w-full h-full relative transition-all duration-500"
        style={{ 
          transformStyle: 'preserve-3d',
          rotate: `${rotate}deg`
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Front Side: Just the Doll Image */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-xl overflow-hidden bg-pink-50"
        >
          <img 
             src={dollImage} 
             alt="Back" 
             className="w-full h-full object-contain object-center"
             loading="lazy"
          />
          {/* Optional: "Click Me" hint on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
            <span className="bg-white/90 px-4 py-2 rounded-full text-pink-500 text-sm font-bold shadow-sm">Click to Flip! ✨</span>
          </div>
        </div>

        {/* Back Side: Text Content */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-xl overflow-hidden bg-white p-6 flex items-center justify-center text-center border-4 border-pink-100"
          style={{ 
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {/* Background Doll Watermark */}
          <div 
             className="absolute inset-0 opacity-10 pointer-events-none"
             style={{
               backgroundImage: `url('${dollImage}')`,
               backgroundSize: 'contain',
               backgroundRepeat: 'no-repeat',
               backgroundPosition: 'center',
             }}
          />
          
          <div className="relative z-10">
            <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
            <p className="text-slate-700 font-bold text-lg leading-relaxed">{content}</p>
            <div className="mt-4 text-pink-400 text-xs font-bold uppercase tracking-widest">My Reason</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
