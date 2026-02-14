import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Send, Plus, Search, ChevronRight, ArrowLeft, MessageCircle, User as UserIcon, Camera, Edit2, Pin, Image as ImageIcon, X, AlertTriangle, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { ForumPost, ForumReply } from '../types';

export default function Community() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // View State: 'list' | 'create' | 'detail' | 'profile'
  const [view, setView] = useState<'list' | 'create' | 'detail' | 'profile'>('list');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    if (view === 'list') fetchPosts();

    return () => authListener.subscription.unsubscribe();
  }, [view, selectedTag]); // Fetch when tag changes

  // Fetch user likes when user changes
  useEffect(() => {
    if (user) {
        supabase.from('forum_post_likes').select('post_id').eq('user_id', user.id)
            .then(({ data }) => {
                if (data) setLikedPosts(new Set(data.map(l => l.post_id)));
            });
    }
  }, [user]);

  async function fetchPosts() {
    setLoading(true);
    
    // 1. Fetch posts (ONLY APPROVED)
    let query = supabase
      .from('forum_posts')
      .select('*')
      .eq('status', 'approved')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(0, 19); 

    if (selectedTag) {
        query = query.contains('tags', [selectedTag]);
    }

    const { data: postsData, error: postsError } = await query;

    if (postsError) {
        console.error('Error fetching posts:', postsError);
        setLoading(false);
        return;
    }

    if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
    }

    // 2. Fetch users for these posts
    const userIds = [...new Set(postsData.map(p => p.user_id))];
    const { data: usersData } = await supabase
      .from('users')
      .select('id, nickname, avatar_url, role') // fetch role for admin badge
      .in('id', userIds);

    // 3. Fetch reply counts (Simplified)
    const { data: replyCounts } = await supabase.from('forum_replies').select('post_id');
    const countsMap: Record<string, number> = {};
    replyCounts?.forEach((r: any) => { countsMap[r.post_id] = (countsMap[r.post_id] || 0) + 1; });

    // 4. Combine
    const combinedPosts = postsData.map(post => {
        const user = usersData?.find(u => u.id === post.user_id);
        return {
            ...post,
            user: user || { nickname: 'Unknown User', avatar_url: null },
            replies: [{ count: countsMap[post.id] || 0 }]
        };
    });

    setPosts(combinedPosts);
    setLoading(false);
  }

  const toggleLike = async (postId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) {
          alert('Please login to like posts');
          return;
      }

      const isLiked = likedPosts.has(postId);
      const newSet = new Set(likedPosts);
      if (isLiked) {
          newSet.delete(postId);
          await supabase.from('forum_post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
          setPosts(posts.map(p => p.id === postId ? { ...p, like_count: (p.like_count || 0) - 1 } : p));
      } else {
          newSet.add(postId);
          await supabase.from('forum_post_likes').insert({ post_id: postId, user_id: user.id });
          setPosts(posts.map(p => p.id === postId ? { ...p, like_count: (p.like_count || 0) + 1 } : p));
      }
      setLikedPosts(newSet);
  };

  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-slate-800 flex items-center justify-center gap-3">
             <MessageSquare className="text-pink-500 fill-pink-500" /> 卡比论坛
          </h1>
          <p className="text-slate-500 font-medium">Chat, Share, and Connect with Carmen Fans!</p>
        </motion.div>

        <div className="bg-white rounded-3xl shadow-xl border border-pink-100 min-h-[600px] overflow-hidden relative">
           <AnimatePresence mode='wait'>
             {view === 'list' && (
               <ForumList 
                 posts={posts} 
                 loading={loading} 
                 user={user} 
                 likedPosts={likedPosts}
                 selectedTag={selectedTag}
                 onSelectTag={setSelectedTag}
                 onToggleLike={toggleLike}
                 onCreate={() => setView('create')} 
                 onProfile={() => setView('profile')}
                 onSelect={(id: string) => { setSelectedPostId(id); setView('detail'); }} 
               />
             )}
             {view === 'create' && (
               <CreatePost 
                 user={user} 
                 onCancel={() => setView('list')} 
                 onSuccess={() => setView('list')} 
               />
             )}
             {view === 'detail' && selectedPostId && (
               <PostDetail 
                 postId={selectedPostId} 
                 user={user} 
                 likedPosts={likedPosts}
                 onToggleLike={toggleLike}
                 onBack={() => { setSelectedPostId(null); setView('list'); }} 
               />
             )}
             {view === 'profile' && user && (
               <UserProfile 
                 user={user} 
                 onBack={() => setView('list')} 
                 onEditPost={(id: string) => { /* Reuse CreatePost logic or new EditPost logic */ setSelectedPostId(id); /* Placeholder */ }}
               />
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ForumList({ posts, loading, user, onCreate, onSelect, onProfile, likedPosts, onToggleLike, selectedTag, onSelectTag }: any) {
  return (
    <motion.div 
      key="list"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Search topics..." className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-pink-200 transition-all outline-none" />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto justify-end">
            {user ? (
            <>
                <button onClick={onCreate} className="ml-2 bg-pink-500 hover:bg-pink-600 text-white px-4 md:px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-pink-200 transition-all hover:-translate-y-1">
                    <Plus size={20} /> <span className="hidden md:inline">New Post</span>
                </button>
                <button onClick={onProfile} className="ml-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                    <UserIcon size={20} /> <span className="hidden md:inline">My Profile</span>
                </button>
            </>
            ) : (
            <Link to="/login" className="ml-4 bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
                Login to Post
            </Link>
            )}
        </div>
      </div>

      {selectedTag && (
          <div className="mb-6 flex items-center gap-2">
              <span className="text-slate-500 font-bold">Filtering by:</span>
              <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  #{selectedTag}
                  <button onClick={() => onSelectTag(null)} className="hover:text-pink-800"><X size={14} /></button>
              </span>
          </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
             <MessageCircle size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-500 font-medium">No approved posts yet. Be the first!</p>
          </div>
        ) : (
          posts.map((post: any) => (
            <div 
              key={post.id} 
              onClick={() => onSelect(post.id)}
              className={`bg-white hover:bg-pink-50/30 p-5 rounded-2xl border transition-all cursor-pointer group relative ${post.is_pinned ? 'border-pink-300 shadow-md bg-pink-50/10' : 'border-slate-100 hover:border-pink-200'}`}
            >
              {post.is_pinned && (
                  <div className="absolute top-4 right-4 text-pink-500 transform rotate-45">
                      <Pin size={20} fill="currentColor" />
                  </div>
              )}
              <div className="flex items-start gap-4">
                <img 
                   src={post.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.nickname || 'anon'}`} 
                   className="w-12 h-12 rounded-full bg-slate-100 object-cover flex-shrink-0" 
                   alt="avatar" 
                />
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start pr-8">
                     <h3 className="text-lg font-bold text-slate-800 group-hover:text-pink-600 transition-colors line-clamp-1">{post.title}</h3>
                     <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md ml-2 whitespace-nowrap">{post.category}</span>
                   </div>
                   <p className="text-slate-500 text-sm mt-1 line-clamp-2">{post.content}</p>
                   
                   {/* Image Preview */}
                   {post.image_urls && post.image_urls.length > 0 && (
                       <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                           {post.image_urls.slice(0, 3).map((url: string, idx: number) => (
                               <img key={idx} src={url} className="h-20 w-20 object-cover rounded-lg bg-slate-100" />
                           ))}
                           {post.image_urls.length > 3 && (
                               <div className="h-20 w-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs">
                                   +{post.image_urls.length - 3}
                               </div>
                           )}
                       </div>
                   )}

                   {/* Tags */}
                   {post.tags && post.tags.length > 0 && (
                       <div className="flex gap-2 mt-3 flex-wrap">
                           {post.tags.map((tag: string) => (
                               <span 
                                key={tag} 
                                onClick={(e) => { e.stopPropagation(); onSelectTag(tag); }}
                                className="text-xs text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full hover:bg-pink-100 transition-colors"
                               >
                                   #{tag}
                               </span>
                           ))}
                       </div>
                   )}
                   
                   <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-400">
                      <div className="flex items-center gap-1">
                          <span>By {post.user?.nickname || 'Unknown'}</span>
                          {(post.user?.role === 'admin' || post.user?.nickname === 'carmen_club') && (
                              <span className="bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold ml-1">ADMIN</span>
                          )}
                      </div>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <div className="flex-1"></div>
                      <button 
                        onClick={(e) => onToggleLike(post.id, e)}
                        className={`flex items-center gap-1 transition-colors ${likedPosts.has(post.id) ? 'text-pink-500' : 'hover:text-pink-500'}`}
                      >
                          <Heart size={16} fill={likedPosts.has(post.id) ? "currentColor" : "none"} /> 
                          {post.like_count || 0}
                      </button>
                      <span className="flex items-center gap-1 text-pink-400 ml-4"><MessageCircle size={14} /> {post.replies?.[0]?.count || 0} Replies</span>
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function UserProfile({ user, onBack }: any) {
    const [profile, setProfile] = useState<any>(null);
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        // Fetch public profile
        const { data: p } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (p) {
            setProfile(p);
            setNickname(p.nickname);
        }

        // Fetch my posts
        const { data: posts } = await supabase.from('forum_posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (posts) setMyPosts(posts);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
        if (uploadError) {
            alert('Upload failed: ' + uploadError.message);
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        
        await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id);
        fetchProfile();
        setUploading(false);
    };

    const saveNickname = async () => {
        await supabase.from('users').update({ nickname }).eq('id', user.id);
        setIsEditing(false);
        fetchProfile();
    };

    const deletePost = async (id: string) => {
        if(!confirm('Delete this post?')) return;
        await supabase.from('forum_posts').delete().eq('id', id);
        fetchProfile();
    };

    return (
        <motion.div 
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-6 md:p-10"
        >
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={24} className="text-slate-600" /></button>
                <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8 mb-12">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                        <img 
                            src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.nickname || 'user'}`} 
                            className="w-32 h-32 rounded-full bg-slate-100 object-cover border-4 border-pink-100" 
                        />
                        <label className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full cursor-pointer hover:bg-pink-600 transition-colors shadow-md">
                            <Camera size={16} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                        </label>
                    </div>
                    {uploading && <span className="text-xs text-pink-500 font-bold">Uploading...</span>}
                </div>

                {/* Info Section */}
                <div className="flex-1 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                        <div className="text-slate-700 font-medium">{profile?.email}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nickname</label>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <input 
                                    value={nickname} 
                                    onChange={e => setNickname(e.target.value)} 
                                    className="border border-pink-300 rounded px-3 py-1 outline-none focus:ring-2 focus:ring-pink-100"
                                />
                                <button onClick={saveNickname} className="bg-green-500 text-white px-3 py-1 rounded font-bold text-sm">Save</button>
                                <button onClick={() => setIsEditing(false)} className="text-slate-400 text-sm">Cancel</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-slate-800 font-bold text-xl">{profile?.nickname}</span>
                                <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-pink-500"><Edit2 size={16} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* My Posts Section */}
            <h3 className="font-bold text-slate-800 text-xl mb-4">My Posts</h3>
            <div className="space-y-4">
                {myPosts.length === 0 ? <p className="text-slate-400">You haven't posted anything yet.</p> : (
                    myPosts.map(post => (
                        <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-slate-800">{post.title}</h4>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                        post.status === 'approved' ? 'bg-green-100 text-green-600' : 
                                        post.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                        {post.status?.toUpperCase() || 'PENDING'}
                                    </span>
                                    <span className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button onClick={() => deletePost(post.id)} className="text-slate-400 hover:text-red-500 p-2"><span className="text-sm">Delete</span></button>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}

function CreatePost({ user, onCancel, onSuccess }: any) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [images, setImages] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          setImages([...images, ...Array.from(e.target.files)]);
      }
  };

  const removeImage = (index: number) => {
      setImages(images.filter((_, i) => i !== index));
  };

  const addTag = () => {
      if (currentTag.trim() && !tags.includes(currentTag.trim())) {
          setTags([...tags, currentTag.trim()]);
          setCurrentTag('');
      }
  };

  const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setSubmitting(true);
    let imageUrls: string[] = [];

    // Upload images
    if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            const fileExt = file.name.split('.').pop();
            const filePath = `posts/${user.id}-${Date.now()}-${i}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('forum_images').upload(filePath, file);
            
            if (!uploadError) {
                const { data } = supabase.storage.from('forum_images').getPublicUrl(filePath);
                imageUrls.push(data.publicUrl);
            }
        }
    }

    const { error } = await supabase.from('forum_posts').insert({
      user_id: user.id,
      title,
      content,
      category,
      image_urls: imageUrls,
      tags
    });

    if (error) alert(error.message);
    else onSuccess();
    
    setSubmitting(false);
  };

  return (
    <motion.div 
      key="create"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 md:p-10"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={24} className="text-slate-600" /></button>
        <h2 className="text-2xl font-bold text-slate-800">Create New Post</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">Title</label>
          <input 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-pink-300 focus:bg-white transition-all outline-none font-bold text-lg"
            placeholder="What's on your mind?"
            autoFocus
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">Category</label>
          <div className="flex gap-2">
            {['General', 'Fan Art', 'News', 'Discussion'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${category === cat ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                    <span key={tag} className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-pink-800"><X size={14} /></button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    value={currentTag}
                    onChange={e => setCurrentTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..."
                    className="flex-1 p-2 bg-slate-50 rounded-lg border focus:border-pink-300 outline-none"
                />
                <button type="button" onClick={addTag} className="bg-slate-200 text-slate-600 px-4 rounded-lg font-bold hover:bg-slate-300">Add</button>
            </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">Content</label>
          <textarea 
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full p-4 h-40 bg-slate-50 rounded-xl border-2 border-transparent focus:border-pink-300 focus:bg-white transition-all outline-none resize-none"
            placeholder="Share your thoughts..."
          />
        </div>

        <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Images</label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-2">
                {images.map((file, idx) => (
                    <div key={idx} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    </div>
                ))}
                <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors text-slate-400 hover:text-pink-500">
                    <ImageIcon size={24} />
                    <span className="text-xs font-bold mt-1">Add Image</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </label>
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-pink-500 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-pink-600 hover:shadow-xl transition-all disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function PostDetail({ postId, user, onBack, likedPosts, onToggleLike }: any) {
  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [postId]);

  const fetchDetail = async () => {
    // 1. Fetch Post
    const { data: p } = await supabase.from('forum_posts').select('*').eq('id', postId).single();
    
    if (p) {
        // Fetch User for Post
        const { data: u } = await supabase.from('users').select('nickname, avatar_url, role').eq('id', p.user_id).single();
        setPost({ ...p, user: u });
    }

    // 2. Fetch Replies
    const { data: r } = await supabase.from('forum_replies').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    
    if (r && r.length > 0) {
        // Fetch Users for Replies
        const userIds = [...new Set(r.map((item: any) => item.user_id))];
        const { data: users } = await supabase.from('users').select('id, nickname, avatar_url, role').in('id', userIds);
        
        const repliesWithUser = r.map((item: any) => ({
            ...item,
            user: users?.find((u: any) => u.id === item.user_id)
        }));
        setReplies(repliesWithUser);
    } else {
        setReplies([]);
    }
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    setSubmitting(true);
    
    const { error } = await supabase.from('forum_replies').insert({
      post_id: postId,
      user_id: user.id,
      content: newReply
    });

    if (!error) {
       setNewReply('');
       fetchDetail();
    }
    setSubmitting(false);
  };

  const handleReport = async () => {
    if (!user) {
        alert('Please login to report posts');
        return;
    }
    if (!reportReason.trim()) return;
    
    const { error } = await supabase.from('forum_reports').insert({
        post_id: postId,
        reporter_id: user.id,
        reason: reportReason
    });

    if (error) {
        alert('Error reporting post: ' + error.message);
    } else {
        alert('Post reported successfully. Admins will review it.');
        setReporting(false);
        setReportReason('');
    }
  };

  if (!post) return <div className="p-10 text-center">Loading...</div>;

  return (
    <motion.div 
      key="detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full min-h-[600px]"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-4 sticky top-0 bg-white/95 backdrop-blur z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={20} className="text-slate-600" /></button>
        <h2 className="text-xl font-bold text-slate-800 truncate">{post.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
        {/* Main Post */}
        <div className={`p-6 rounded-2xl border ${post.is_pinned ? 'bg-pink-50/10 border-pink-300 shadow-md' : 'bg-pink-50/30 border-pink-100'} relative`}>
           {post.is_pinned && (
              <div className="absolute top-4 right-4 text-pink-500 transform rotate-45">
                  <Pin size={24} fill="currentColor" />
              </div>
           )}
           <div className="flex items-center gap-3 mb-4">
              <img src={post.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.nickname}`} className="w-10 h-10 rounded-full bg-white" />
              <div>
                <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800">{post.user?.nickname}</p>
                    {(post.user?.role === 'admin' || post.user?.nickname === 'carmen_club') && (
                        <span className="bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                    )}
                </div>
                <p className="text-xs text-slate-400">{new Date(post.created_at).toLocaleString()}</p>
              </div>
              <span className="ml-auto bg-pink-100 text-pink-600 text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
           </div>
           <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-lg">
             {post.content}
           </div>

           {/* Images */}
           {post.image_urls && post.image_urls.length > 0 && (
               <div className="mt-6 space-y-4">
                   {post.image_urls.map((url: string, idx: number) => (
                       <img key={idx} src={url} className="w-full rounded-xl bg-slate-50 border border-slate-100" />
                   ))}
               </div>
           )}

           {/* Tags */}
           {post.tags && post.tags.length > 0 && (
               <div className="flex gap-2 mt-6 flex-wrap">
                   {post.tags.map((tag: string) => (
                       <span key={tag} className="text-sm text-pink-500 bg-pink-50 px-3 py-1 rounded-full font-bold">
                           #{tag}
                       </span>
                   ))}
               </div>
           )}
           
           <div className="mt-6 pt-4 border-t border-pink-100/50 flex justify-between items-center">
               <button 
                 onClick={() => setReporting(!reporting)}
                 className="text-slate-400 hover:text-red-500 text-sm font-bold flex items-center gap-1 transition-colors"
               >
                   <AlertTriangle size={16} /> Report
               </button>

               <button 
                 onClick={(e) => onToggleLike(post.id, e)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${likedPosts.has(post.id) ? 'text-pink-500 bg-pink-50 font-bold' : 'text-slate-400 hover:text-pink-500 hover:bg-white'}`}
               >
                   <Heart size={20} fill={likedPosts.has(post.id) ? "currentColor" : "none"} /> 
                   {post.like_count || 0} Likes
               </button>
           </div>

           {reporting && (
               <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                   <h4 className="font-bold text-slate-700 mb-2">Report this post</h4>
                   <textarea 
                       value={reportReason}
                       onChange={e => setReportReason(e.target.value)}
                       className="w-full p-3 rounded-lg border border-slate-300 focus:border-pink-300 outline-none text-sm mb-3"
                       placeholder="Why are you reporting this post?"
                       rows={3}
                   />
                   <div className="flex justify-end gap-2">
                       <button onClick={() => setReporting(false)} className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-200 rounded-lg">Cancel</button>
                       <button onClick={handleReport} className="px-4 py-2 bg-red-500 text-white font-bold text-sm rounded-lg hover:bg-red-600">Submit Report</button>
                   </div>
               </div>
           )}
        </div>

        {/* Replies */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wider">Replies ({replies.length})</h3>
          {replies.map(reply => (
            <div key={reply.id} className="flex gap-4">
              <img src={reply.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user?.nickname}`} className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0" />
              <div className="bg-slate-50 p-4 rounded-xl rounded-tl-none flex-1">
                 <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 text-sm">{reply.user?.nickname}</span>
                        {(reply.user?.role === 'admin' || reply.user?.nickname === 'carmen_club') && (
                            <span className="bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                        )}
                    </div>
                    <span className="text-xs text-slate-400">{new Date(reply.created_at).toLocaleString()}</span>
                 </div>
                 <p className="text-slate-600">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Box */}
      {user ? (
        <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0">
          <form onSubmit={submitReply} className="flex gap-2">
            <input 
              value={newReply}
              onChange={e => setNewReply(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-300 focus:bg-white transition-all"
            />
            <button 
              type="submit"
              disabled={submitting || !newReply.trim()}
              className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-xl transition-all disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      ) : (
        <div className="p-6 text-center bg-slate-50 border-t border-slate-100">
          <Link to="/login" className="text-pink-500 font-bold hover:underline">Login to reply</Link>
        </div>
      )}
    </motion.div>
  );
}
