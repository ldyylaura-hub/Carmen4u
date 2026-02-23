import React from 'react';
import { supabase } from '../../lib/supabase';
import { ForumPost } from '../../types';
import { MessageSquare, Image, Coffee } from 'lucide-react';
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';
import { CategoryColumnSkeleton } from '../common/Skeleton';

interface CategoryColumnProps {
  category: string;
  title: string;
  icon: React.ElementType;
  color: string;
  onSelectPost: (id: string) => void;
}

const CategoryColumn = ({ category, title, icon: Icon, color, onSelectPost }: CategoryColumnProps) => {
  const { data: posts, loading } = useSupabaseQuery({
    queryFn: async () => {
      return await supabase
        .from('forum_posts')
        .select('id, title, created_at, user_id, status')
        .eq('category', category)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(8);
    },
    dependencies: [category],
  });

  if (loading) {
    return <CategoryColumnSkeleton />;
  }

  const postList = (posts || []) as ForumPost[];

  return (
    <div className="flex flex-col h-full bg-white border-2 border-[color:var(--k-ink)] rounded-lg shadow-[6px_6px_0_var(--k-pink-border)] overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b-2 border-[color:var(--k-ink)] bg-white"
        style={{ borderTop: `4px solid ${color}` }}
      >
        <div className="flex items-center gap-2">
          <Icon size={18} style={{ color }} />
          <h3 className="dotgothic16-regular font-extrabold text-lg">{title}</h3>
        </div>
        <button 
          className="text-xs font-bold hover:underline opacity-60"
          onClick={() => { /* Navigate to category */ }}
        >
          MORE
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white p-0 h-[600px] overflow-y-auto">
        {!postList || postList.length === 0 ? (
          <div className="p-8 text-center text-xs opacity-40 italic">No posts yet</div>
        ) : (
          <ul className="divide-y-2 divide-dashed divide-gray-100">
            {postList.map(post => (
              <li 
                key={post.id} 
                className="p-3 hover:bg-[rgba(0,0,0,0.02)] cursor-pointer transition-colors flex items-center gap-2 group"
                onClick={() => onSelectPost(post.id)}
              >
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full group-hover:bg-[color:var(--k-pink)] transition-colors" />
                <span className="text-sm font-medium line-clamp-1 flex-1 group-hover:text-[color:var(--k-pink)]">
                  {post.title}
                </span>
                <span className="text-[10px] font-mono opacity-40 whitespace-nowrap">
                  {new Date(post.created_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default function CategoryColumns({ onSelectPost }: { onSelectPost: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CategoryColumn 
        category="General" 
        title="General" 
        icon={MessageSquare} 
        color="#70a1ff" 
        onSelectPost={onSelectPost}
      />
      <CategoryColumn 
        category="Fan Art" 
        title="Fan Art" 
        icon={Image} 
        color="#ff7f50" 
        onSelectPost={onSelectPost}
      />
      <CategoryColumn 
        category="Off-topic" 
        title="Off-topic" 
        icon={Coffee} 
        color="#2ed573" 
        onSelectPost={onSelectPost}
      />
    </div>
  );
}
