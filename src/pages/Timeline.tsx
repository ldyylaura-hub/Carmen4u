import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Star, Music, Award, Gift, ShoppingBag, Trophy, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TimelineEvent {
  id: string;
  event_date: string;
  title: string;
  description: string;
  category: string;
  display_order: number;
  image_url?: string;
  cover_url?: string;
  album_id?: string;
}

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .order('display_order', { ascending: true }) // Prioritize custom order
        .order('event_date', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-800">
            Journey to Stardom
          </h1>
          <p className="text-slate-500">The key moments that defined Carmen's career.</p>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 via-purple-300 to-transparent transform md:-translate-x-1/2 rounded-full"></div>

          <div className="space-y-12 pb-20">
            {events.map((event, index) => (
              <TimelineItem key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ event, index }: { event: TimelineEvent; index: number }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const isEven = index % 2 === 0;

  // Determine color and icon based on category (default to Star if null)
  const getCategoryStyles = (category: string | null) => {
    const cat = (category || '').toLowerCase();
    switch (cat) {
      case 'debut':
      case 'comeback':
      case 'release':
        return { color: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-100', icon: <Music size={16} /> };
      case 'endorsement':
        return { color: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-100', icon: <ShoppingBag size={16} /> };
      case 'personal':
        return { color: 'text-pink-500', bg: 'bg-pink-500', border: 'border-pink-100', icon: <Gift size={16} /> };
      case 'variety':
      case 'award':
        return { color: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-100', icon: <Trophy size={16} /> };
      default:
        return { color: 'text-slate-500', bg: 'bg-slate-500', border: 'border-slate-100', icon: <Star size={16} /> };
    }
  };

  const styles = getCategoryStyles(event.category);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="relative md:flex items-center justify-between"
    >
       {/* Mobile Dot */}
       <div className={`absolute left-4 top-0 w-4 h-4 rounded-full ${styles.bg} border-2 border-white shadow-md md:hidden z-10 transform -translate-x-1/2`} />
       
       {/* Center Dot (Desktop) */}
       <div className={`hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full ${styles.bg} border-4 border-white shadow-md z-10`} />

       {/* Left Side */}
       <div className={`pl-12 md:pl-0 md:w-5/12 ${isEven ? 'md:text-right md:pr-10' : 'md:order-last md:pl-10'}`}>
          
          <div className="md:hidden">
             {/* Mobile View */}
             <span className={`${styles.color} font-bold text-sm mb-1 flex items-center gap-1`}>
               <Calendar size={12} />
               {new Date(event.event_date).getFullYear()}
             </span>
             <ContentCard event={event} styles={styles} />
          </div>

          <div className="hidden md:block">
            {/* Desktop View */}
            {isEven ? (
               <div className="flex flex-col items-end">
                 <span className={`${styles.color} font-black text-4xl drop-shadow-sm`}>
                   {new Date(event.event_date).getFullYear()}
                 </span>
                 <span className="text-slate-400 font-medium text-sm uppercase tracking-wide">
                   {new Date(event.event_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                 </span>
               </div>
            ) : (
               <ContentCard event={event} styles={styles} />
            )}
          </div>
       </div>

       {/* Right Side */}
       <div className={`hidden md:block md:w-5/12 ${isEven ? 'md:pl-10' : 'md:order-first md:pr-10 md:text-right'}`}>
          {isEven ? (
            <ContentCard event={event} styles={styles} />
          ) : (
             <div className="flex flex-col items-start">
               <span className={`${styles.color} font-black text-4xl drop-shadow-sm`}>
                 {new Date(event.event_date).getFullYear()}
               </span>
               <span className="text-slate-400 font-medium text-sm uppercase tracking-wide">
                 {new Date(event.event_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
               </span>
             </div>
          )}
       </div>
    </motion.div>
  );
}

function ContentCard({ event, styles }: { event: TimelineEvent, styles: any }) {
  const displayImage = event.cover_url || event.image_url;

  return (
    <div className={`bg-white/90 backdrop-blur-sm p-4 rounded-2xl border ${styles.border} shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-left group overflow-hidden`}>
      {displayImage && (
        <div className="w-full h-40 mb-4 rounded-xl overflow-hidden relative">
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full bg-white/80 backdrop-blur-md ${styles.color} text-xs font-bold shadow-sm z-10 flex items-center gap-1`}>
             {styles.icon}
             <span className="capitalize">{event.category || 'Event'}</span>
          </div>
          <img 
            src={displayImage} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
      <div className="px-2 pb-2">
        <h3 className="text-xl font-bold mb-2 text-slate-800 group-hover:text-pink-600 transition-colors">{event.title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">{event.description}</p>
        
        {event.album_id && (
          <Link to={`/gallery?album=${event.album_id}`} className="inline-flex items-center gap-2 text-pink-500 font-bold text-sm hover:underline">
            View Album <ExternalLink size={14} />
          </Link>
        )}

        {!displayImage && !event.album_id && (
           <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 ${styles.color} text-xs font-bold border ${styles.border} capitalize`}>
             {styles.icon}
             {event.category || 'Event'}
           </span>
        )}
      </div>
    </div>
  );
}
