export interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  view_count: number;
  like_count: number;
  is_pinned?: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    nickname: string;
    avatar_url?: string;
    role?: 'user' | 'admin';
  };
  replies?: { count: number }[]; // For count aggregation
  image_urls?: string[];
  tags?: string[];
}

export interface ForumReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    nickname: string;
    avatar_url?: string;
  };
}
