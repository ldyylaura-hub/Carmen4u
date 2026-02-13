import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import { Play, Image as ImageIcon } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'photo' | 'video' | 'audio';
  title: string;
  url: string;
  thumbnail_url?: string;
}

export default function Gallery() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');

  useEffect(() => {
    async function fetchMedia() {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching media:', error);
      } else {
        setMedia(data || []);
      }
      setLoading(false);
    }

    fetchMedia();
  }, []);

  const filteredMedia = filter === 'all' ? media : media.filter(m => m.type === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-800">
            Media Gallery
          </h1>
          <p className="text-slate-500 mb-8">Capturing the moments that shine.</p>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full border font-medium transition-all shadow-sm ${
                filter === 'all' 
                  ? 'bg-pink-500 border-pink-500 text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300 hover:text-pink-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('photo')}
              className={`px-6 py-2 rounded-full border font-medium transition-all shadow-sm flex items-center gap-2 ${
                filter === 'photo' 
                  ? 'bg-pink-500 border-pink-500 text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300 hover:text-pink-500'
              }`}
            >
              <ImageIcon size={16} /> Photos
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-6 py-2 rounded-full border font-medium transition-all shadow-sm flex items-center gap-2 ${
                filter === 'video' 
                  ? 'bg-pink-500 border-pink-500 text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300 hover:text-pink-500'
              }`}
            >
              <Play size={16} /> Videos
            </button>
          </div>
        </motion.div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredMedia.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-md hover:shadow-xl transition-all duration-300 group"
            >
              {item.type === 'video' ? (
                <div className="aspect-video relative">
                  <ReactPlayer 
                    url={item.url} 
                    width="100%" 
                    height="100%" 
                    light={true} 
                    controls={true}
                    playIcon={
                      <div className="w-16 h-16 bg-pink-500/90 rounded-full flex items-center justify-center group-hover:bg-pink-600 transition-colors backdrop-blur-sm shadow-lg">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    }
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] overflow-hidden relative cursor-pointer group">
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <p className="text-white font-bold text-lg drop-shadow-md">{item.title}</p>
                  </div>
                </div>
              )}
              
              {item.type === 'video' && (
                <div className="p-4 bg-white">
                  <h3 className="text-lg font-bold text-slate-800 truncate">{item.title}</h3>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {filteredMedia.length === 0 && (
           <div className="text-center py-20 text-slate-400">
             No media items found.
           </div>
        )}
      </div>
    </div>
  );
}
