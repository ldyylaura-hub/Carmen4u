export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  created_at: string;
}
