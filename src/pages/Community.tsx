import React, { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { ForumPost } from '../types'
import PixelWindow from '../components/pixel/PixelWindow'
import ForumList from '../components/forum/ForumList'
import CreatePost from '../components/forum/CreatePost'
import PostDetail from '../components/forum/PostDetail'
import UserProfile from '../components/forum/UserProfile'
import UserProfileCard from '../components/forum/UserProfileCard'
import HeadlinesSection from '../components/forum/HeadlinesSection'
import InfoSidebar from '../components/forum/InfoSidebar'
import CategoryColumns from '../components/forum/CategoryColumns'
import DollWidget from '../components/forum/DollWidget'

export default function Community() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // View State: 'home' | 'list' | 'create' | 'detail' | 'profile'
  // 'home' is the new BBS index page. 'list' is the full searchable list.
  const [view, setView] = useState<'home' | 'list' | 'create' | 'detail' | 'profile'>('home');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [createCategory, setCreateCategory] = useState<string>('General');

  // ... (fetchPosts and useEffects logic remains mostly same, but maybe optimize fetching)
  // Actually, for 'home' view, the components fetch their own data. 
  // We only need global fetch for 'list' view.

  const fetchPosts = useCallback(async () => {
    setLoading(true);

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

    const userIds = [...new Set(postsData.map((p) => p.user_id))];
    const { data: usersData } = await supabase
      .from('users')
      .select('id, nickname, avatar_url, role')
      .in('id', userIds);

    const { data: replyCounts } = await supabase.from('forum_replies').select('post_id');
    const countsMap: Record<string, number> = {};
    replyCounts?.forEach((r: { post_id: string }) => {
      countsMap[r.post_id] = (countsMap[r.post_id] || 0) + 1;
    });

    const combinedPosts = postsData.map((post) => {
      const u = usersData?.find((x) => x.id === post.user_id);
      return {
        ...post,
        user: u || { nickname: 'Unknown User', avatar_url: null },
        replies: [{ count: countsMap[post.id] || 0 }],
      };
    });

    setPosts(combinedPosts);
    setLoading(false);
  }, [selectedTag]);

  useEffect(() => {
    // 1. Get Auth User
    supabase.auth.getUser().then(async ({ data }) => {
        const authUser = data.user;
        if (authUser) {
            // 2. Fetch Public Profile (for role)
            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();
            
            // 3. Merge profile data into user object for components to use
            if (profile) {
                // Manually inject role into user_metadata for compatibility with existing checks
                authUser.user_metadata = { ...authUser.user_metadata, role: profile.role };
            }
            setUser(authUser);
        } else {
            setUser(null);
            navigate('/login'); // Redirect to login if not authenticated
        }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const authUser = session?.user ?? null;
        if (authUser) {
             const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();
            if (profile) {
                authUser.user_metadata = { ...authUser.user_metadata, role: profile.role };
            }
            setUser(authUser);
        } else {
            setUser(null);
            navigate('/login'); // Redirect on logout or session expiration
        }
    });
    
    if (view === 'list') fetchPosts();

    return () => authListener.subscription.unsubscribe();
  }, [fetchPosts, view, selectedTag]); 

  // Fetch user likes when user changes
  useEffect(() => {
    if (user) {
        supabase.from('forum_post_likes').select('post_id').eq('user_id', user.id)
            .then(({ data }) => {
                if (data) setLikedPosts(new Set(data.map(l => l.post_id)));
            });
    }
  }, [user]);

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

  const handleCreatePost = (category: string = 'General') => {
      setCreateCategory(category);
      setView('create');
  };

  return (
    <div className="min-h-screen py-6 px-4 kirby-pixel pixel-bg relative overflow-hidden">
      {/* Decorative Background Elements */}
      
      <DollWidget />

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 cursor-pointer"
          onClick={() => setView('home')}
        >
          {/* Title Removed as requested */}
        </motion.div>

        <AnimatePresence mode='wait'>
          {view === 'home' ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="space-y-8"
            >
               {/* Top Row: Profile | Headlines | Info */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-3 relative z-20">
                     <UserProfileCard 
                        user={user} 
                        onCreate={() => handleCreatePost()} 
                        onProfile={() => setView('profile')} 
                     />
                  </div>
                  <div className="lg:col-span-6">
                     <HeadlinesSection 
                        user={user} 
                        onSelectPost={(id) => { 
                            if (id === 'create_headline') handleCreatePost('headline');
                            else { setSelectedPostId(id); setView('detail'); }
                        }} 
                     />
                  </div>
                  <div className="lg:col-span-3">
                     <InfoSidebar 
                        user={user}
                        onAddPost={(cat) => handleCreatePost(cat)}
                        onSelectPost={(id) => { setSelectedPostId(id); setView('detail'); }}
                     />
                  </div>
               </div>
               
               {/* Bottom Row: Category Columns */}
               <CategoryColumns 
                  onSelectPost={(id) => { setSelectedPostId(id); setView('detail'); }} 
               />
               
               <div className="text-center pt-8">
                 <button 
                   onClick={() => setView('list')}
                   className="text-[color:var(--k-pink)] font-bold text-lg hover:underline dotgothic16-regular"
                 >
                   VIEW ALL TOPICS &gt;&gt;
                 </button>
               </div>
            </motion.div>
          ) : (
            <motion.div
              key="subpage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-5xl mx-auto"
            >
               <div className="mb-4">
                 <button 
                   onClick={() => setView('home')}
                   className="text-[color:var(--k-ink)] hover:text-[color:var(--k-pink)] flex items-center gap-2 font-bold"
                 >
                   &lt; Back to Home
                 </button>
               </div>

               <PixelWindow className="min-h-[600px] relative" title={
                 view === 'list' ? 'ALL TOPICS' : 
                 view === 'create' ? 'NEW POST' : 
                 view === 'profile' ? 'USER PROFILE' : 'TOPIC VIEW'
               }>
                  {view === 'list' && (
                    <ForumList 
                      posts={posts} 
                      loading={loading} 
                      user={user} 
                      likedPosts={likedPosts}
                      selectedTag={selectedTag}
                      onSelectTag={setSelectedTag}
                      onToggleLike={toggleLike}
                      onCreate={() => handleCreatePost()} 
                      onProfile={() => setView('profile')}
                      onSelect={(id: string) => { setSelectedPostId(id); setView('detail'); }} 
                    />
                  )}
                  {view === 'create' && (
                    <CreatePost 
                      user={user} 
                      initialCategory={createCategory}
                      onCancel={() => setView('home')} 
                      onSuccess={() => setView('home')} 
                    />
                  )}
                  {view === 'detail' && selectedPostId && (
                    <PostDetail 
                      postId={selectedPostId} 
                      user={user} 
                      likedPosts={likedPosts}
                      onToggleLike={toggleLike}
                      onBack={() => { setSelectedPostId(null); setView('home'); }} 
                    />
                  )}
                  {view === 'profile' && user && (
                    <UserProfile 
                      user={user} 
                      onBack={() => setView('home')} 
                    />
                  )}
               </PixelWindow>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
