import React, { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { ForumPost } from '../../types';
import PixelCard from '../pixel/PixelCard';
import PixelButton from '../pixel/PixelButton';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeadlinesSectionProps {
  user: User | null;
  onSelectPost: (id: string) => void;
}

export default function HeadlinesSection({ user, onSelectPost }: HeadlinesSectionProps) {
  const [headlines, setHeadlines] = useState<ForumPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAdmin = user?.user_metadata?.role === 'admin';

  useEffect(() => {
    fetchHeadlines();
  }, []);

  const fetchHeadlines = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('category', 'headline')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching headlines:', error);
        return;
      }
      
      if (data) setHeadlines(data);
    } catch (err) {
      console.error('Unexpected error fetching headlines:', err);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % headlines.length);
  }, [headlines.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + headlines.length) % headlines.length);
  }, [headlines.length]);

  // Auto-advance
  useEffect(() => {
    if (headlines.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [headlines.length, nextSlide]);

  if (headlines.length === 0) {
    return (
      <PixelCard className="h-full bg-white flex flex-col items-center justify-center p-6 min-h-[220px] border-2 border-[color:var(--k-ink)] relative">
        <h3 className="dotgothic16-regular text-2xl text-[color:var(--k-ink)] opacity-40 font-bold mb-4">
          NO HEADLINES
        </h3>
        {isAdmin && (
           <PixelButton onClick={() => onSelectPost('create_headline')}>
             <Plus size={16} className="mr-2" /> Add Headline
           </PixelButton>
        )}
      </PixelCard>
    );
  }

  const currentHeadline = headlines[currentIndex];

  return (
    <div className="relative h-full group">
      <PixelCard className="h-full bg-white relative overflow-hidden p-0 border-2 border-[color:var(--k-ink)]">
        <AnimatePresence mode='wait'>
          <motion.div 
            key={currentHeadline.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full cursor-pointer"
            onClick={() => onSelectPost(currentHeadline.id)}
          >
            {/* Image Background */}
            <div className="w-full h-full absolute inset-0 bg-gray-200">
               {currentHeadline.image_urls?.[0] ? (
                 <img 
                   src={currentHeadline.image_urls[0]} 
                   alt={currentHeadline.title}
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full bg-[color:var(--k-pink-light)] flex items-center justify-center">
                    <span className="dotgothic16-regular text-4xl text-[color:var(--k-pink)] opacity-50">HEADLINE</span>
                 </div>
               )}
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent pt-20 pb-6 px-6 text-white">
               <h2 className="dotgothic16-regular text-2xl md:text-3xl font-extrabold drop-shadow-md mb-2 line-clamp-2">
                 {currentHeadline.title}
               </h2>
               <div className="flex items-center gap-2 opacity-80 text-sm">
                 <span className="bg-[color:var(--k-pink)] px-2 py-0.5 text-xs font-bold rounded-sm border border-white/50">TOPIC</span>
                 <span>{new Date(currentHeadline.created_at).toLocaleDateString()}</span>
               </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        {headlines.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 border-2 border-black shadow-[2px_2px_0_black] opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 border-2 border-black shadow-[2px_2px_0_black] opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronRight size={20} />
            </button>
            
            {/* Dots */}
            <div className="absolute top-4 right-4 flex gap-1.5 z-20">
              {headlines.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 border border-black cursor-pointer ${idx === currentIndex ? 'bg-[color:var(--k-pink)]' : 'bg-white'}`}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                />
              ))}
            </div>
          </>
        )}

        {/* Admin Edit Button */}
        {isAdmin && (
          <button 
            onClick={(e) => { e.stopPropagation(); onSelectPost('create_headline'); }}
            className="absolute top-4 left-4 bg-[color:var(--k-yellow)] text-black p-2 border-2 border-black shadow-[2px_2px_0_black] hover:scale-105 transition-transform z-30"
            title="Add Headline"
          >
            <Plus size={16} />
          </button>
        )}
      </PixelCard>
    </div>
  );
}
