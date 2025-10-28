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
    console.log('Starting sign in process...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Auth sign in error:', error);
      throw error;
    }

    console.log('Auth successful, fetching profile for user:', data.user.id);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // If profile doesn't exist, create a basic one
      if (profileError.code === 'PGRST116') {
        console.log('Profile not found, creating basic profile...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || null,
            role: 'user'
          })
          .select()
          .single();

        if (createError) {
          console.error('Failed to create profile:', createError);
          throw createError;
        }

        console.log('Profile created successfully:', newProfile);
        set({ user: newProfile });
        return;
      }
      throw profileError;
    }

    console.log('Profile fetched successfully:', profile);
    set({ user: profile });
  },

  signUp: async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

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
