import React from 'react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { LogIn, Shield, Star, Users, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import PixelCard from '../pixel/PixelCard';
import PixelButton from '../pixel/PixelButton';

interface UserProfileCardProps {
  user: User | null;
  className?: string;
  onCreate?: () => void;
  onProfile?: () => void;
}

export default function UserProfileCard({ user, className = '', onCreate, onProfile }: UserProfileCardProps) {
  const [realPostCount, setRealPostCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (user) {
      const fetchCount = async () => {
        const { count } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (count !== null) setRealPostCount(count);
      };
      fetchCount();
    }
  }, [user]);

  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_metadata?.nickname || 'anon'}`;
  };

  const getDaysJoined = () => {
    if (!user?.created_at) return 0;
    const joined = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joined.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  return (
    <PixelCard className={`h-full bg-white relative overflow-visible ${className}`}>
      {/* Header Pattern */}
      <div className="absolute top-0 left-0 w-full h-20 bg-[color:var(--k-pink)] opacity-20 border-b-2 border-[color:var(--k-ink)]"></div>
      
      <div className="relative z-10 pt-6 px-4 pb-4 flex flex-col items-center h-full">
        {/* Avatar */}
        <div className="w-24 h-24 mb-3 relative group cursor-pointer">
           <img
            src={getAvatarUrl()}
            alt="avatar"
            className="w-full h-full object-cover bg-white border-2 border-[color:var(--k-ink)] shadow-[4px_4px_0_var(--k-ink)] transition-transform group-hover:scale-105"
          />
          {user?.user_metadata?.role === 'admin' && (
            <div className="absolute -bottom-2 -right-2 bg-[color:var(--k-yellow)] border-2 border-[color:var(--k-ink)] p-1.5 shadow-[2px_2px_0_var(--k-ink)]">
              <Shield size={14} />
            </div>
          )}
        </div>

        {user ? (
          <>
            <h3 className="dotgothic16-regular font-extrabold text-xl text-[color:var(--k-ink)] mb-1 text-center">
              {user.user_metadata?.nickname || 'Community Member'}
            </h3>
            <p className="text-xs text-[color:var(--k-ink)] opacity-60 mb-6 font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
              UID: {user.id.slice(0, 8)}
            </p>

            {/* Stats Grid */}
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <div className="flex flex-col items-center p-2 bg-[rgba(255,79,184,0.05)] border-2 border-[color:var(--k-ink)] hover:bg-[rgba(255,79,184,0.1)] transition-colors">
                <Users size={16} className="text-[color:var(--k-pink)] mb-1" />
                <span className="font-extrabold text-lg">{user.user_metadata?.followers_count || 0}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60">Followers</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-[rgba(255,79,184,0.05)] border-2 border-[color:var(--k-ink)] hover:bg-[rgba(255,79,184,0.1)] transition-colors">
                <Star size={16} className="text-[color:var(--k-yellow)] mb-1" />
                <span className="font-extrabold text-lg">{user.user_metadata?.favorites_count || 0}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60">Favorites</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-[rgba(255,79,184,0.05)] border-2 border-[color:var(--k-ink)] hover:bg-[rgba(255,79,184,0.1)] transition-colors">
                <FileText size={16} className="text-[color:var(--k-blue)] mb-1" />
                <span className="font-extrabold text-lg">{realPostCount ?? user.user_metadata?.post_count ?? 0}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60">Posts</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-[rgba(255,79,184,0.05)] border-2 border-[color:var(--k-ink)] hover:bg-[rgba(255,79,184,0.1)] transition-colors">
                <Calendar size={16} className="text-[color:var(--k-green)] mb-1" />
                <span className="font-extrabold text-lg">{getDaysJoined()}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60">Days</span>
              </div>
            </div>

            <div className="w-full space-y-2 mt-auto">
              {onCreate && (
                <PixelButton onClick={onCreate} className="w-full justify-center py-2 text-sm">
                  New Post
                </PixelButton>
              )}
              {onProfile && (
                <PixelButton variant="secondary" onClick={onProfile} className="w-full justify-center py-2 text-sm">
                  My Profile
                </PixelButton>
              )}
            </div>
          </>
        ) : (
          <>
            <h3 className="dotgothic16-regular font-extrabold text-xl text-[color:var(--k-ink)] mb-4">
              Guest
            </h3>
            <p className="text-sm text-center text-[color:var(--k-ink)] opacity-80 mb-8 px-2">
              Log in to track your stats, collect favorites, and join the conversation!
            </p>
            <Link to="/login" className="w-full mt-auto">
              <PixelButton className="w-full justify-center">
                <LogIn size={16} className="mr-2" /> Login
              </PixelButton>
            </Link>
          </>
        )}
      </div>
    </PixelCard>
  );
}
