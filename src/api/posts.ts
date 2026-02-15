import { supabase } from '@/lib/supabase';
import { ForumPost } from '@/types';

export const getPosts = async (tag?: string | null) => {
  let query = supabase
    .from('forum_posts')
    .select('*')
    .eq('status', 'approved')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(0, 19);

  if (tag) {
    query = query.contains('tags', [tag]);
  }

  const { data: postsData, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return postsData as ForumPost[];
};

export const getPost = async (id: string) => {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data as ForumPost;
};
