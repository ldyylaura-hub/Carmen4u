import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { User } from '@supabase/supabase-js'
import PixelBadge from '../pixel/PixelBadge'
import PixelButton from '../pixel/PixelButton'
import PixelCard from '../pixel/PixelCard'
import PixelChip from '../pixel/PixelChip'
import PixelIconButton from '../pixel/PixelIconButton'
import PixelInput from '../pixel/PixelInput'
import PixelTextarea from '../pixel/PixelTextarea'

type CreatePostProps = {
  user: User
  initialCategory?: string
  onCancel: () => void
  onSuccess: () => void
}

export default function CreatePost({ user, initialCategory, onCancel, onSuccess }: CreatePostProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(initialCategory || 'General')
  const [images, setImages] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages([...images, ...Array.from(e.target.files)])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const addTag = () => {
    const v = currentTag.trim()
    if (v && !tags.includes(v)) {
      setTags([...tags, v])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    // Force category to General if user tries to submit admin category without permission
    const adminCategories = ['headline', 'announcement', 'event'];
    if (adminCategories.includes(category) && user?.user_metadata?.role !== 'admin') {
      alert('You do not have permission to post in this category.');
      return;
    }

    setSubmitting(true)
    const imageUrls: string[] = []

    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const fileExt = file.name.split('.').pop()
        const filePath = `posts/${user.id}-${Date.now()}-${i}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('forum_images').upload(filePath, file)
        if (!uploadError) {
          const { data } = supabase.storage.from('forum_images').getPublicUrl(filePath)
          imageUrls.push(data.publicUrl)
        }
      }
    }

    const { error } = await supabase.from('forum_posts').insert({
      user_id: user.id,
      title,
      content,
      category,
      image_urls: imageUrls,
      tags,
    })

    if (error) {
      alert(error.message)
    } else {
      // Update local post count metadata for immediate feedback
      const currentCount = user.user_metadata?.post_count || 0;
      await supabase.auth.updateUser({
        data: { post_count: currentCount + 1 }
      });
      onSuccess()
    }

    setSubmitting(false)
  }

  return (
    <motion.div
      key="create"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-4 md:p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <PixelIconButton onClick={onCancel} aria-label="Back">
          <ArrowLeft size={18} />
        </PixelIconButton>
        <div className="dotgothic16-regular font-extrabold text-lg">Create New Post</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
        <div>
          <div className="dotgothic16-regular font-extrabold mb-2">Title</div>
          <PixelInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind?"
            autoFocus
          />
        </div>

        <div>
          <div className="dotgothic16-regular font-extrabold mb-2">Category</div>
          <div className="flex flex-wrap gap-2">
            {['General', 'Fan Art', 'Off-topic'].map((cat) => (
              <PixelButton
                key={cat}
                type="button"
                variant={category === cat ? 'primary' : 'secondary'}
                onClick={() => setCategory(cat)}
                size="sm"
              >
                {cat}
              </PixelButton>
            ))}
            {/* Admin only categories */}
            {user?.user_metadata?.role === 'admin' && ['headline', 'announcement', 'event'].map((cat) => (
              <PixelButton
                key={cat}
                type="button"
                variant={category === cat ? 'primary' : 'secondary'}
                onClick={() => setCategory(cat)}
                size="sm"
                className="bg-[color:var(--k-yellow)]"
              >
                {cat.toUpperCase()}
              </PixelButton>
            ))}
          </div>
        </div>

        <div>
          <div className="dotgothic16-regular font-extrabold mb-2">Tags</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <PixelChip key={tag} active>
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="inline-flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </PixelChip>
            ))}
          </div>
          <div className="flex gap-2">
            <PixelInput
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="Add a tag..."
            />
            <PixelButton type="button" variant="secondary" onClick={addTag}>
              Add
            </PixelButton>
          </div>
        </div>

        <div>
          <div className="dotgothic16-regular font-extrabold mb-2">Content</div>
          <PixelTextarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-40"
            placeholder="Share your thoughts..."
          />
        </div>

        <div>
          <div className="dotgothic16-regular font-extrabold mb-2">Images</div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((file, idx) => (
              <PixelCard key={idx} className="relative aspect-square overflow-hidden">
                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-white border-2 border-[color:var(--k-ink)] shadow-[3px_3px_0_var(--k-ink)] p-1"
                >
                  <X size={14} />
                </button>
              </PixelCard>
            ))}
            <label className="aspect-square pixel-card flex flex-col items-center justify-center gap-2 cursor-pointer pixel-bg">
              <ImageIcon size={22} />
              <PixelBadge>ADD</PixelBadge>
              <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <PixelButton type="submit" disabled={submitting} size="lg">
            {submitting ? 'Publishing...' : 'Publish Post'}
          </PixelButton>
        </div>
      </form>
    </motion.div>
  )
}
