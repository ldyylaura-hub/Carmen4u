import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  checkUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  checkUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({ user });
      
      if (user) {
        try {
          const { data } = await supabase.rpc('is_admin');
          set({ isAdmin: !!data });
        } catch (rpcError) {
          console.error('RPC Error (is_admin):', rpcError);
          set({ isAdmin: false });
        }
      } else {
        set({ isAdmin: false });
      }
    } catch (authError) {
      console.error('Auth Check Error:', authError);
      set({ user: null, isAdmin: false });
    }
  },
  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, isAdmin: false });
      window.location.href = '/';
    }
  },
}));
