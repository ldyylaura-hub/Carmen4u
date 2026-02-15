import React from 'react';
import { User } from '@supabase/supabase-js';
import { LogIn, Plus, User as UserIcon, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import PixelCard from '@/components/common/pixel/PixelCard';
import PixelButton from '@/components/common/pixel/PixelButton';
import PixelBadge from '@/components/common/pixel/PixelBadge';

interface UserSidebarProps {
  user: User | null;
  onCreate: () => void;
  onProfile: () => void;
  onSelectTag?: (tag: string) => void;
  className?: string;
}

export default function UserSidebar({ user, onCreate, onProfile, onSelectTag, className = '' }: UserSidebarProps) {
  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_metadata?.nickname || 'anon'}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* User Info Card */}
      <PixelCard className="p-5 text-center bg-white relative overflow-visible">
        <div className="absolute top-0 left-0 w-full h-16 bg-[color:var(--k-pink)] opacity-20 border-b-2 border-[color:var(--k-ink)]"></div>
        
        <div className="relative z-10 pt-4">
          <div className="w-20 h-20 mx-auto mb-3 relative">
             <img
              src={getAvatarUrl()}
              alt="avatar"
              className="w-full h-full object-cover bg-white border-2 border-[color:var(--k-ink)] shadow-[3px_3px_0_var(--k-ink)]"
            />
            {user?.user_metadata?.role === 'admin' && (
              <div className="absolute -bottom-2 -right-2 bg-[color:var(--k-yellow)] border-2 border-[color:var(--k-ink)] p-1">
                <Shield size={12} />
              </div>
            )}
          </div>

          {user ? (
            <>
              <h3 className="dotgothic16-regular font-extrabold text-lg text-[color:var(--k-ink)] mb-1">
                {user.user_metadata?.nickname || 'Community Member'}
              </h3>
              <p className="text-xs text-[color:var(--k-ink)] opacity-60 mb-4 font-mono">
                @{user.email?.split('@')[0]}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="bg-[rgba(255,79,184,0.1)] p-2 border-2 border-[color:var(--k-ink)]">
                  <div className="font-extrabold">{user.user_metadata?.post_count || 0}</div>
                  <div className="opacity-60">Posts</div>
                </div>
                <div className="bg-[rgba(255,79,184,0.1)] p-2 border-2 border-[color:var(--k-ink)]">
                  <div className="font-extrabold">{user.user_metadata?.like_count || 0}</div>
                  <div className="opacity-60">Likes</div>
                </div>
              </div>

              <div className="space-y-2">
                <PixelButton onClick={onCreate} className="w-full justify-center">
                  <Plus size={16} /> New Post
                </PixelButton>
                <PixelButton variant="secondary" onClick={onProfile} className="w-full justify-center">
                  <UserIcon size={16} /> My Profile
                </PixelButton>
              </div>
            </>
          ) : (
            <>
              <h3 className="dotgothic16-regular font-extrabold text-lg text-[color:var(--k-ink)] mb-4">
                Guest
              </h3>
              <p className="text-sm text-[color:var(--k-ink)] opacity-80 mb-6">
                Join the Carmen community to share your pixel art and thoughts!
              </p>
              <Link to="/login" className="block w-full">
                <PixelButton className="w-full justify-center">
                  <LogIn size={16} /> Login / Register
                </PixelButton>
              </Link>
            </>
          )}
        </div>
      </PixelCard>

      {/* Forum Stats / Info */}
      <PixelCard className="p-4 bg-white">
        <h4 className="dotgothic16-regular font-extrabold text-[color:var(--k-pink)] border-b-2 border-[color:var(--k-pink-border)] pb-2 mb-3 uppercase tracking-wider text-sm">
          Forum Stats
        </h4>
        <ul className="space-y-2 text-sm">
           <li className="flex justify-between items-center">
             <span className="opacity-70">Online Users</span>
             <PixelBadge variant="neutral" className="text-xs text-green-600">128</PixelBadge>
           </li>
           <li className="flex justify-between items-center">
             <span className="opacity-70">Total Posts</span>
             <span className="font-bold font-mono">1,240</span>
           </li>
           <li className="flex justify-between items-center">
             <span className="opacity-70">New Today</span>
             <span className="font-bold font-mono text-[color:var(--k-pink)]">+24</span>
           </li>
        </ul>
      </PixelCard>

       {/* Categories Quick Links */}
       <PixelCard className="p-4 bg-white">
        <h4 className="dotgothic16-regular font-extrabold text-[color:var(--k-pink)] border-b-2 border-[color:var(--k-pink-border)] pb-2 mb-3 uppercase tracking-wider text-sm">
          Partitions
        </h4>
        <div className="flex flex-wrap gap-2">
            {['General', 'Fan Art', 'Theories', 'Off-topic'].map(tag => (
                <PixelBadge 
                  key={tag} 
                  variant="neutral" 
                  className="cursor-pointer hover:bg-[var(--k-pink-light)]"
                  onClick={() => onSelectTag?.(tag)}
                >
                    {tag}
                </PixelBadge>
            ))}
        </div>
      </PixelCard>
    </div>
  );
}
