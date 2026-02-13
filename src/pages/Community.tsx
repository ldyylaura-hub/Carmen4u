import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { MessageSquare, Heart, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    nickname: string;
    avatar_url: string;
  };
}

export default function Community() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check auth status
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchComments();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user:users (
          nickname,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments((data as unknown as Comment[]) || []);
    }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('comments')
      .insert([
        { 
          content: newComment,
          user_id: user.id
        }
      ]);

    if (error) {
      alert('Error posting comment: ' + error.message);
    } else {
      setNewComment('');
      fetchComments(); // Refresh list
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-800">
            Fan Community
          </h1>
          <p className="text-slate-500">Share your love for Carmen.</p>
        </motion.div>

        {/* Comment Input */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-pink-100 shadow-lg mb-12">
          {user ? (
            <form onSubmit={handleSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a message..."
                className="w-full bg-pink-50/50 border border-pink-100 rounded-xl p-4 text-slate-800 focus:outline-none focus:border-pink-300 focus:bg-white transition-colors h-32 resize-none placeholder-slate-400"
              />
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-slate-500">Logged in as <span className="font-semibold text-pink-500">{user.email}</span></span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                >
                  <Send size={18} /> Post
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <MessageSquare className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Join the conversation</h3>
              <p className="text-slate-500 mb-6">Login to post comments and interact with other fans.</p>
              <div className="flex justify-center gap-4">
                <Link to="/login" className="px-8 py-2.5 rounded-full bg-pink-500 text-white font-bold hover:bg-pink-600 transition-all shadow-md hover:shadow-lg">
                  Login
                </Link>
                <Link to="/register" className="px-8 py-2.5 rounded-full border-2 border-pink-100 text-pink-500 font-bold hover:border-pink-200 hover:bg-pink-50 transition-all">
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {loading ? (
             <div className="text-center py-10">
               <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-pink-400 mx-auto"></div>
             </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              No comments yet. Be the first to post!
            </div>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl border border-pink-50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <img 
                    src={comment.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.nickname || 'anon'}`} 
                    alt="Avatar" 
                    className="w-12 h-12 rounded-full bg-pink-50 border-2 border-white shadow-sm"
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 text-lg">{comment.user?.nickname || 'Anonymous Fan'}</h4>
                      <span className="text-xs text-slate-400 font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    
                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                      <button className="flex items-center gap-1.5 hover:text-pink-500 transition-colors group">
                        <Heart size={16} className="group-hover:fill-pink-500" /> Like
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
