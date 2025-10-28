import { create } from 'zustand';
import { supabase } from '@/config/supabase';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'member' | 'user';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    set({ user: profile });
  },

  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Check if email confirmation is required
    if (data.user && !data.user.email_confirmed_at) {
      // Email confirmation required - user will need to check email
      throw new Error('Please check your email and click the confirmation link to complete registration.');
    }

    // Profile will be created automatically by the database trigger
    // No need to manually create it here
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },

  initialize: () => {
    // Listen to auth state changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Profile fetch error:', error);
            set({ user: null, loading: false });
          } else {
            set({ user: profile || null, loading: false });
          }
        } else {
          set({ user: null, loading: false });
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        set({ user: null, loading: false });
      }
    });

    // Initial check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Initial profile fetch error:', error);
            set({ user: null, loading: false });
          } else {
            set({ user: profile || null, loading: false });
          }
        } else {
          set({ loading: false });
        }
      } catch (error) {
        console.error('Initial session error:', error);
        set({ loading: false });
      }
    });
  },
}));
