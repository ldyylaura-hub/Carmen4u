import React, { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, Edit2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import PixelBadge from '@/components/common/pixel/PixelBadge'
import PixelButton from '@/components/common/pixel/PixelButton'
import PixelCard from '@/components/common/pixel/PixelCard'
import PixelIconButton from '@/components/common/pixel/PixelIconButton'
import PixelInput from '@/components/common/pixel/PixelInput'

type ProfileRow = {
  id: string
  email: string
  nickname: string
  avatar_url: string | null
}

type MyPostRow = {
  id: string
  title: string
  created_at: string
  status: 'approved' | 'pending' | 'rejected' | null
}

type UserProfileProps = {
  user: User
  onBack: () => void
}

export default function UserProfile({ user, onBack }: UserProfileProps) {
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [myPosts, setMyPosts] = useState<MyPostRow[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState('')
  const [uploading, setUploading] = useState(false)

  const fetchProfile = useCallback(async () => {
    const { data: p } = await supabase.from('users').select('id, email, nickname, avatar_url').eq('id', user.id).single<ProfileRow>()
    if (p) {
      setProfile(p)
      setNickname(p.nickname)
    }

    const { data: posts } = await supabase
      .from('forum_posts')
      .select('id, title, created_at, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .returns<MyPostRow[]>()
    if (posts) setMyPosts(posts)
  }, [user.id])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath)

    // Update public table
    await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id)
    
    // Update auth metadata for global state
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    })

    fetchProfile()
    setUploading(false)
  }

  const saveNickname = async () => {
    await supabase.from('users').update({ nickname }).eq('id', user.id)
    setIsEditing(false)
    fetchProfile()
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await supabase.from('forum_posts').delete().eq('id', id)
    fetchProfile()
  }

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 md:p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <PixelIconButton onClick={onBack} aria-label="Back">
          <ArrowLeft size={18} />
        </PixelIconButton>
        <div className="dotgothic16-regular font-extrabold text-lg">My Profile</div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={
                profile?.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.nickname || 'user'}`
              }
              className="w-28 h-28 rounded-full bg-white object-cover border-[3px] border-[color:var(--k-ink)] shadow-[6px_6px_0_var(--k-ink)]"
            />
            <label className="absolute -bottom-2 -right-2 pixel-button h-10 w-10 p-0 bg-[color:var(--k-pink)] text-white inline-flex items-center justify-center cursor-pointer">
              <Camera size={16} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          {uploading && <span className="text-xs dotgothic16-regular font-extrabold">Uploading...</span>}
        </div>

        <PixelCard className="flex-1 p-4 md:p-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="dotgothic16-regular font-extrabold text-sm">Email</div>
              <div className="mt-1 text-sm opacity-90 break-all">{profile?.email}</div>
            </div>
            <div>
              <div className="dotgothic16-regular font-extrabold text-sm">Nickname</div>
              <div className="mt-2">
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <PixelInput value={nickname} onChange={(e) => setNickname(e.target.value)} />
                    <div className="flex gap-2">
                      <PixelButton variant="primary" onClick={saveNickname} type="button">
                        Save
                      </PixelButton>
                      <PixelButton variant="secondary" onClick={() => setIsEditing(false)} type="button">
                        Cancel
                      </PixelButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="dotgothic16-regular font-extrabold text-xl">{profile?.nickname}</span>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="pixel-button h-10 w-10 p-0 bg-white inline-flex items-center justify-center"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PixelCard>
      </div>

      <div className="dotgothic16-regular font-extrabold text-lg mb-3">My Posts</div>
      <div className="space-y-3">
        {myPosts.length === 0 ? (
          <PixelCard className="p-6 pixel-bg dotgothic16-regular font-extrabold">You haven't posted anything yet.</PixelCard>
        ) : (
          myPosts.map((post) => (
            <PixelCard key={post.id} className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="dotgothic16-regular font-extrabold truncate">{post.title}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <PixelBadge
                    variant={
                      post.status === 'approved'
                        ? 'blue'
                        : post.status === 'rejected'
                          ? 'warn'
                          : 'neutral'
                    }
                  >
                    {post.status?.toUpperCase() || 'PENDING'}
                  </PixelBadge>
                  <span className="text-xs opacity-75">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <PixelButton variant="danger" onClick={() => deletePost(post.id)} type="button" size="sm">
                Delete
              </PixelButton>
            </PixelCard>
          ))
        )}
      </div>
    </motion.div>
  )
}
