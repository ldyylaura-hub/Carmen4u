import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Pin, Search, Flame, Clock, X } from 'lucide-react'
import PixelCard from '@/components/common/pixel/PixelCard'
import PixelChip from '@/components/common/pixel/PixelChip'
import PixelInput from '@/components/common/pixel/PixelInput'
import PixelBadge from '@/components/common/pixel/PixelBadge'
import { cn } from '@/utils'
import type { User } from '@supabase/supabase-js'
import type { ForumPost } from '@/types'

type ForumListProps = {
  posts: ForumPost[]
  loading: boolean
  user: User | null
  likedPosts: Set<string>
  selectedTag: string | null
  onSelectTag: (tag: string | null) => void
  onToggleLike: (postId: string, e: React.MouseEvent) => void
  onCreate: () => void
  onProfile: () => void
  onSelect: (id: string) => void
}

export default function ForumList({
  posts,
  loading,
  onSelect,
  likedPosts,
  onToggleLike,
  selectedTag,
  onSelectTag,
}: ForumListProps) {
  const [activeTab, setActiveTab] = useState<'latest' | 'trending'>('latest');

  // Separate pinned and regular posts
  const pinnedPosts = useMemo(() => posts.filter(p => p.is_pinned), [posts]);
  const regularPosts = useMemo(() => posts.filter(p => !p.is_pinned), [posts]);

  // Sort regular posts based on active tab
  const sortedPosts = useMemo(() => {
    return [...regularPosts].sort((a, b) => {
      if (activeTab === 'latest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        // Trending logic: Weighted sum of replies (2pts) and likes (1pt)
        const scoreA = ((a.replies?.[0]?.count || 0) * 2) + (a.like_count || 0);
        const scoreB = ((b.replies?.[0]?.count || 0) * 2) + (b.like_count || 0);
        return scoreB - scoreA;
      }
    });
  }, [regularPosts, activeTab]);

  const renderPostItem = (post: ForumPost) => (
    <PixelCard
      key={post.id}
      onClick={() => onSelect(post.id)}
      className={cn(
        'p-4 md:p-5 cursor-pointer transition-transform hover:-translate-y-0.5',
        post.is_pinned ? 'bg-[rgba(255,79,184,0.06)] border-2 border-[color:var(--k-pink)]' : 'bg-white',
      )}
    >
      {post.is_pinned && (
        <div className="absolute top-0 right-0 bg-[color:var(--k-pink)] text-white px-2 py-1 text-xs dotgothic16-regular font-extrabold flex items-center gap-1">
          <Pin size={12} fill="currentColor" /> TOP
        </div>
      )}

      <div className="flex items-start gap-4">
        <img
          src={
            post.user?.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.nickname || 'anon'}`
          }
          className="w-12 h-12 rounded-full bg-white object-cover flex-shrink-0 border-2 border-[color:var(--k-ink)] shadow-[3px_3px_0_var(--k-ink)]"
          alt="avatar"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="dotgothic16-regular font-extrabold text-[color:var(--k-ink)] line-clamp-1 text-lg">
                  {post.title}
                </h3>
                {(post.user?.role === 'admin' || post.user?.nickname === 'carmen_club') && (
                  <PixelBadge variant="pink">ADMIN</PixelBadge>
                )}
              </div>
              <div className="mt-1 text-sm opacity-80 line-clamp-2">{post.content}</div>
            </div>
            <PixelBadge className="whitespace-nowrap hidden sm:inline-flex">{post.category}</PixelBadge>
          </div>

          {post.image_urls && post.image_urls.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {post.image_urls.slice(0, 3).map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  className="h-16 w-16 object-cover bg-white border-2 border-[color:var(--k-ink)] shadow-[3px_3px_0_var(--k-ink)]"
                  alt={`attachment-${idx}`}
                />
              ))}
              {post.image_urls.length > 3 && (
                <div className="h-16 w-16 bg-white border-2 border-[color:var(--k-ink)] shadow-[3px_3px_0_var(--k-ink)] flex items-center justify-center dotgothic16-regular font-extrabold">
                  +{post.image_urls.length - 3}
                </div>
              )}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {post.tags.map((tag: string) => (
                <PixelChip
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectTag(tag)
                  }}
                >
                  #{tag}
                </PixelChip>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4 text-xs">
            <span className="dotgothic16-regular font-extrabold opacity-90">
              By {post.user?.nickname || 'Unknown'}
            </span>
            <span className="opacity-40">•</span>
            <span className="opacity-80">{new Date(post.created_at).toLocaleDateString()}</span>
            <div className="flex-1" />
            <button
              onClick={(e) => onToggleLike(post.id, e)}
              className={cn(
                'pixel-button h-8 px-2 py-0 bg-white inline-flex items-center gap-1.5 dotgothic16-regular font-extrabold transition-colors',
                likedPosts.has(post.id) ? 'text-[color:var(--k-pink)]' : 'text-[color:var(--k-ink)] hover:text-[color:var(--k-pink)]',
              )}
              type="button"
            >
              <Heart size={14} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
              {post.like_count || 0}
            </button>
            <span className="inline-flex items-center gap-1.5 dotgothic16-regular font-extrabold text-[color:var(--k-ink)]">
              <MessageCircle size={14} />
              {post.replies?.[0]?.count || 0}
            </span>
          </div>
        </div>
      </div>
    </PixelCard>
  );

  return (
    <motion.div
      key="list"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4 md:p-6 space-y-8"
    >
      {/* Search Bar */}
      <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--k-ink)]">
            <Search size={18} />
          </div>
          <PixelInput placeholder="Search topics..." className="pl-11 w-full" />
      </div>

      {selectedTag && (
        <div className="flex items-center gap-2">
          <span className="dotgothic16-regular font-extrabold">Filtering:</span>
          <PixelChip active onClick={() => onSelectTag(null)}>
            #{selectedTag}
            <X size={14} />
          </PixelChip>
        </div>
      )}

      {loading ? (
         <div className="text-center py-20 dotgothic16-regular">Loading posts...</div>
      ) : (
        <>
          {/* Headlines Section */}
          {pinnedPosts.length > 0 && !selectedTag && (
            <section className="space-y-4">
               <div className="flex items-center gap-2 border-b-2 border-[color:var(--k-pink-border)] pb-2">
                  <span className="text-xl">📢</span>
                  <h2 className="dotgothic16-regular font-extrabold text-xl text-[color:var(--k-pink)]">HEADLINES</h2>
               </div>
               <div className="grid gap-4">
                 {pinnedPosts.map(renderPostItem)}
               </div>
            </section>
          )}

          {/* Regular Posts Section with Tabs */}
          <section className="space-y-4">
             <div className="flex items-center gap-4 border-b-2 border-[color:var(--k-ink)] pb-0">
                <button 
                  onClick={() => setActiveTab('latest')}
                  className={cn(
                    "px-4 py-2 dotgothic16-regular font-extrabold text-lg flex items-center gap-2 border-t-2 border-x-2 border-[color:var(--k-ink)] transition-colors relative top-[2px]",
                    activeTab === 'latest' ? "bg-[color:var(--k-pink)] text-white" : "bg-white text-[color:var(--k-ink)] opacity-60 hover:opacity-100"
                  )}
                >
                   <Clock size={16} /> Latest
                </button>
                <button 
                  onClick={() => setActiveTab('trending')}
                  className={cn(
                    "px-4 py-2 dotgothic16-regular font-extrabold text-lg flex items-center gap-2 border-t-2 border-x-2 border-[color:var(--k-ink)] transition-colors relative top-[2px]",
                    activeTab === 'trending' ? "bg-[color:var(--k-pink)] text-white" : "bg-white text-[color:var(--k-ink)] opacity-60 hover:opacity-100"
                  )}
                >
                   <Flame size={16} /> Trending
                </button>
             </div>

             <div className="grid gap-4 pt-2">
                {sortedPosts.length === 0 ? (
                  <div className="text-center py-10 opacity-60 dotgothic16-regular">No posts found.</div>
                ) : (
                  sortedPosts.map(renderPostItem)
                )}
             </div>
          </section>
        </>
      )}
    </motion.div>
  )
}
