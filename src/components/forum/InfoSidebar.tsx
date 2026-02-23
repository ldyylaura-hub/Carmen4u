import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ForumPost } from '../../types';
import PixelCard from '../pixel/PixelCard';
import { Bell, Calendar, ChevronRight, Plus } from 'lucide-react';
import { User } from '@supabase/supabase-js';

export default function InfoSidebar({ user, onAddPost, onSelectPost }: { user: User | null, onAddPost: (category: string) => void, onSelectPost: (id: string) => void }) {
  const [announcement, setAnnouncement] = useState<ForumPost | null>(null);
  const [event, setEvent] = useState<ForumPost | null>(null);
  const isAdmin = user?.user_metadata?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      // Fetch latest announcement
      const { data: annData } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('category', 'announcement')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (annData) setAnnouncement(annData);

      // Fetch latest event
      const { data: evtData } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('category', 'event')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (evtData) setEvent(evtData);
    };

    fetchData();
  }, []);

  const InfoBlock = ({ title, icon: Icon, post, type }: { title: string, icon: React.ElementType, post: ForumPost | null, type: 'announcement' | 'event' }) => (
    <PixelCard className="bg-white p-4 relative flex-1 flex flex-col h-full border-2 border-[color:var(--k-ink)] shadow-[6px_6px_0_var(--k-pink-2)] rounded-lg overflow-hidden">
      <div className="flex-1 relative z-10">
        <div className="flex items-center justify-between mb-3 border-b-2 border-[color:var(--k-ink)] pb-2">
            <div className="flex items-center gap-2">
                <Icon size={18} className={type === 'announcement' ? 'text-[color:var(--k-blue)]' : 'text-[color:var(--k-pink)]'} />
                <h3 className="dotgothic16-regular font-extrabold text-lg uppercase">{title}</h3>
            </div>
            {isAdmin && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onAddPost(type); }}
                    className="p-1 hover:bg-gray-100 rounded text-[color:var(--k-ink)]"
                    title="Add New"
                >
                    <Plus size={16} />
                </button>
            )}
        </div>
        
        {post ? (
            <div 
              className="cursor-pointer group"
              onClick={() => onSelectPost(post.id)}
            >
            <h4 className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-[color:var(--k-pink)]">
                {post.title}
            </h4>
            <p className="text-xs opacity-60 line-clamp-3 mb-2">
                {post.content}
            </p>
            </div>
        ) : (
            <div className="py-4 text-center opacity-40 text-sm italic">
            No active {title.toLowerCase()}
            </div>
        )}
      </div>

      {post && (
        <div className="flex justify-between items-center text-xs mt-auto pt-2">
            <span className="opacity-50 font-mono">{new Date(post.created_at).toLocaleDateString()}</span>
            <button 
              onClick={() => onSelectPost(post.id)}
              className="text-[color:var(--k-pink)] font-bold flex items-center hover:underline"
            >
            READ <ChevronRight size={12} />
            </button>
        </div>
      )}
    </PixelCard>
  );

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 min-h-[140px]">
        <InfoBlock title="Announcements" icon={Bell} post={announcement} type="announcement" />
      </div>
      <div className="flex-1 min-h-[140px]">
        <InfoBlock title="Events" icon={Calendar} post={event} type="event" />
      </div>
    </div>
  );
}
