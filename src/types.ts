export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export type MediaCategory = 'concept' | 'poster' | 'mv' | 'fancam' | 'cut' | 'activity' | 'fan_art' | 'bingping';

export interface Album {
  id: string;
  title: string;
  category: MediaCategory;
  description?: string;
  cover_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  idol_id?: string;
  album_id?: string;
  user_id?: string;
  type: 'photo' | 'video' | 'audio';
  title: string;
  url: string;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
  status: 'approved' | 'pending' | 'rejected';
  display_order: number;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  idol_id?: string;
  album_id?: string;
  event_date: string;
  title: string;
  description?: string;
  image_url?: string; // Legacy or fallback
  cover_url?: string; // New specific cover
  category?: string;
  display_order: number;
  created_at: string;
}

export interface HomeContent {
  key: string;
  value: string;
  updated_at: string;
}

export interface Charm {
  id: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}
