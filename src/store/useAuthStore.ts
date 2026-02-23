import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  checkUser: () => Promise<void>;
  initialize: () => () => void; // Returns unsubscribe function
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAdmin: false,
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  
  initialize: () => {
    // Initial check
    get().checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email);
      
      if (session?.user) {
        try {
          // Fetch user profile to get role with timeout
          const profilePromise = supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
          );
          
          const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as any;
          
          // Merge profile data into user object
          if (profile) {
            session.user.user_metadata = { 
              ...session.user.user_metadata, 
              role: profile.role 
            };
            console.log('User profile loaded, role:', profile.role);
          } else {
            console.warn('No profile found for user');
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          // Continue without profile data
        }
        
        set({ user: session.user });
        
        // Check admin status
        try {
          const adminPromise = supabase.rpc('is_admin');
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Admin check timeout')), 3000)
          );
          
          const { data } = await Promise.race([adminPromise, timeoutPromise]) as any;
          set({ isAdmin: !!data });
          console.log('Admin status:', !!data);
        } catch (error) {
          console.error('Error checking admin status:', error);
          set({ isAdmin: false });
        }
      } else {
        set({ user: null, isAdmin: false });
      }
    });

    return () => subscription.unsubscribe();
  },

  checkUser: async () => {
    try {
      console.log('Checking auth status...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        set({ user: null, isAdmin: false });
        return;
      }
      
      if (session?.user) {
        console.log('Session found for user:', session.user.email);
        
        try {
          // Fetch user profile to get role with timeout
          const profilePromise = supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
          );
          
          const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as any;
          
          // Merge profile data into user object
          if (profile) {
            session.user.user_metadata = { 
              ...session.user.user_metadata, 
              role: profile.role 
            };
            console.log('User profile loaded, role:', profile.role);
          } else {
            console.warn('No profile found for user');
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          // Continue without profile data
        }
        
        set({ user: session.user });
        
        try {
          const adminPromise = supabase.rpc('is_admin');
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Admin check timeout')), 3000)
          );
          
          const { data } = await Promise.race([adminPromise, timeoutPromise]) as any;
          set({ isAdmin: !!data });
          console.log('Admin status:', !!data);
        } catch (rpcError) {
          console.error('RPC Error (is_admin):', rpcError);
          set({ isAdmin: false });
        }
      } else {
        console.warn('No session found in storage.');
        set({ user: null, isAdmin: false });
      }
    } catch (authError) {
      console.error('Auth Check Error:', authError);
      set({ user: null, isAdmin: false });
    }
  },
  logout: async () => {
    console.log('Logging out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, isAdmin: false });
      // Use a small delay to ensure state updates before redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  },
}));
