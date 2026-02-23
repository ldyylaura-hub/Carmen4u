import React, { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, Heart, Pin, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { User } from '@supabase/supabase-js'
import PixelBadge from '../pixel/PixelBadge'
import PixelButton from '../pixel/PixelButton'
import PixelCard from '../pixel/PixelCard'
import PixelChip from '../pixel/PixelChip'
import PixelIconButton from '../pixel/PixelIconButton'
import PixelInput from '../pixel/PixelInput'
import PixelTextarea from '../pixel/PixelTextarea'
import { cn } from '../../lib/utils'

type PostRow = {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  created_at: string
  like_count: number | null
  is_pinned: boolean | null
  image_urls: string[] | null
  tags: string[] | null
}

type PublicUserRow = {
  nickname: string
  avatar_url: string | null
  role: 'user' | 'admin' | null
}

type ReplyRow = {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
}

type ReplyWithUser = ReplyRow & { user?: PublicUserRow | null }

type PostDetailProps = {
  postId: string
  user: User | null
  onBack: () => void
  likedPosts: Set<string>
  onToggleLike: (postId: string, e: React.MouseEvent) => void
}

export default function PostDetail({ postId, user, onBack, likedPosts, onToggleLike }: PostDetailProps) {
  const [post, setPost] = useState<(PostRow & { user?: PublicUserRow | null }) | null>(null)
  const [replies, setReplies] = useState<ReplyWithUser[]>([])
  const [newReply, setNewReply] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const fetchDetail = useCallback(async () => {
    const { data: p } = await supabase.from('forum_posts').select('*').eq('id', postId).single<PostRow>()
    if (p) {
      const { data: u } = await supabase
        .from('users')
        .select('nickname, avatar_url, role')
        .eq('id', p.user_id)
        .single<PublicUserRow>()
      setPost({ ...p, user: u })
    }

    const { data: r } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .returns<ReplyRow[]>()

    if (r && r.length > 0) {
      const userIds = [...new Set(r.map((item) => item.user_id))]
      const { data: users } = await supabase
        .from('users')
        .select('id, nickname, avatar_url, role')
        .in('id', userIds)
        .returns<Array<PublicUserRow & { id: string }>>()

      setReplies(
        r.map((item) => ({
          ...item,
          user: users?.find((u) => u.id === item.user_id) || null,
        })),
      )
    } else {
      setReplies([])
    }
  }, [postId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReply.trim()) return
    if (!user) return
    setSubmitting(true)

    const { error } = await supabase.from('forum_replies').insert({
      post_id: postId,
      user_id: user.id,
      content: newReply,
    })

    if (!error) {
      setNewReply('')
      fetchDetail()
    }
    setSubmitting(false)
  }

  const handleReport = async () => {
    if (!user) {
      alert('Please login to report posts')
      return
    }
    if (!reportReason.trim()) return

    const { error } = await supabase.from('forum_reports').insert({
      post_id: postId,
      reporter_id: user.id,
      reason: reportReason,
    })

    if (error) {
      alert('Error reporting post: ' + error.message)
    } else {
      alert('Post reported successfully. Admins will review it.')
      setReporting(false)
      setReportReason('')
    }
  }

  if (!post) return <div className="p-10 text-center dotgothic16-regular">Loading...</div>

  const isLiked = likedPosts.has(post.id)

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full min-h-[600px]"
    >
      <div className="pixel-titlebar px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <PixelIconButton onClick={onBack} aria-label="Back">
          <ArrowLeft size={18} />
        </PixelIconButton>
        <div className="dotgothic16-regular font-extrabold truncate">{post.title}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pixel-bg">
        <PixelCard className={cn('p-4 md:p-5 relative', post.is_pinned ? 'bg-[rgba(255,79,184,0.06)]' : 'bg-white')}>
          {post.is_pinned && (
            <div className="absolute top-4 right-4 text-[color:var(--k-pink)] rotate-45">
              <Pin size={20} fill="currentColor" />
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <img
              src={post.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.nickname}`}
              className="w-10 h-10 rounded-full bg-white border-2 border-[color:var(--k-ink)] shadow-[3px_3px_0_var(--k-ink)]"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="dotgothic16-regular font-extrabold truncate">{post.user?.nickname}</span>
                {(post.user?.role === 'admin' || post.user?.nickname === 'carmen_club') && <PixelBadge variant="pink">ADMIN</PixelBadge>}
              </div>
              <div className="text-xs opacity-70">{new Date(post.created_at).toLocaleString()}</div>
            </div>
            <div className="ml-auto">
              <PixelBadge>{post.category}</PixelBadge>
            </div>
          </div>

          <div className="text-[color:var(--k-ink)] leading-relaxed whitespace-pre-wrap text-base md:text-lg">
            {post.content}
          </div>

          {post.image_urls && post.image_urls.length > 0 && (
            <div className="mt-5 space-y-4">
              {post.image_urls.map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  className="w-full bg-white border-[3px] border-[color:var(--k-ink)] shadow-[6px_6px_0_var(--k-ink)]"
                />
              ))}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 mt-5 flex-wrap">
              {post.tags.map((tag: string) => (
                <PixelChip key={tag}>#{tag}</PixelChip>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t-2 border-[color:var(--k-ink)] flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <PixelButton variant="secondary" onClick={() => setReporting(!reporting)}>
              <AlertTriangle size={18} /> Report
            </PixelButton>
            <PixelButton
              variant={isLiked ? 'primary' : 'secondary'}
              onClick={(e) => onToggleLike(post.id, e)}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} /> {post.like_count || 0}
            </PixelButton>
          </div>

          {reporting && (
            <PixelCard className="mt-4 p-4 pixel-bg">
              <div className="dotgothic16-regular font-extrabold">Report this post</div>
              <PixelTextarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="mt-3 h-24"
                placeholder="Why are you reporting this post?"
              />
              <div className="flex justify-end gap-2 mt-3">
                <PixelButton variant="secondary" onClick={() => setReporting(false)}>
                  Cancel
                </PixelButton>
                <PixelButton variant="danger" onClick={handleReport}>
                  Submit
                </PixelButton>
              </div>
            </PixelCard>
          )}
        </PixelCard>

        <div className="space-y-4">
          <div className="dotgothic16-regular font-extrabold">Replies ({replies.length})</div>
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <img
                src={
                  reply.user?.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user?.nickname}`
                }
                className="w-9 h-9 rounded-full bg-white border-2 border-[color:var(--k-ink)] shadow-[3px_3px_0_var(--k-ink)] flex-shrink-0"
              />
              <PixelCard className="flex-1 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="dotgothic16-regular font-extrabold truncate">{reply.user?.nickname}</span>
                    {(reply.user?.role === 'admin' || reply.user?.nickname === 'carmen_club') && <PixelBadge variant="pink">ADMIN</PixelBadge>}
                  </div>
                  <span className="text-xs opacity-70 whitespace-nowrap">{new Date(reply.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-2 text-sm opacity-90 whitespace-pre-wrap">{reply.content}</div>
              </PixelCard>
            </div>
          ))}
        </div>
      </div>

      {user ? (
        <div className="px-4 py-3 border-t-[3px] border-[color:var(--k-ink)] bg-white">
          <form onSubmit={submitReply} className="flex gap-2">
            <PixelInput
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write a reply..."
            />
            <PixelButton type="submit" disabled={submitting || !newReply.trim()}>
              <Send size={18} />
            </PixelButton>
          </form>
        </div>
      ) : (
        <div className="p-6 text-center pixel-bg border-t-[3px] border-[color:var(--k-ink)]">
          <Link to="/login" className="dotgothic16-regular font-extrabold underline">
            Login to reply
          </Link>
        </div>
      )}
    </motion.div>
  )
}
