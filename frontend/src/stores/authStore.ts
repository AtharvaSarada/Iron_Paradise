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
  signIn: (email: string, password: string) => Promise<User>;
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

    console.log('Auth successful for user:', data.user.id);
    
    // Fetch the existing profile - profile must exist for login to work
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile not found for user:', data.user.id, profileError);
        throw new Error('User profile not found. Please contact support or sign up again.');
      }

      console.log('Login successful, user role:', profile.role);
      return profile;
    } catch (error) {
      console.error('Profile fetch failed during login:', error);
      throw error;
    }
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
    console.log('Auth store initializing...');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // Listen to auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      try {
        if (session?.user) {
          console.log('User authenticated, fetching role from database');
          
          try {
            // Fetch existing profile - must exist for authenticated users
            const { data: profile, error: roleError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (roleError) {
              console.error('Profile not found in auth state change:', roleError);
              // If profile doesn't exist, sign out the user
              await supabase.auth.signOut();
              set({ user: null, loading: false });
              return;
            }

            console.log('User profile loaded in auth state change:', profile);
            set({ user: profile, loading: false });
          } catch (profileError) {
            console.error('Profile fetch failed in auth state change:', profileError);
            // If profile fetch fails, sign out the user
            await supabase.auth.signOut();
            set({ user: null, loading: false });
          }
        } else {
          console.log('No session, setting loading to false');
          set({ user: null, loading: false });
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        set({ user: null, loading: false });
      }
    });

    // Initial check with timeout and better error handling
    console.log('Starting initial session check...');
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Session check timeout - setting loading to false');
      set({ user: null, loading: false });
    }, 5000); // 5 second timeout
    
    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Session fetch error:', error);
          set({ user: null, loading: false });
          return;
        }
        
        console.log('Initial session check result:', session?.user?.id || 'No session');
        
        try {
          if (session?.user) {
            console.log('Fetching initial profile for user:', session.user.id);
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.error('Initial profile fetch error:', profileError);
              // If profile doesn't exist, clear the session
              await supabase.auth.signOut();
              set({ user: null, loading: false });
            } else {
              console.log('Initial profile loaded:', profile);
              set({ user: profile, loading: false });
            }
          } else {
            console.log('No initial session, setting loading to false');
            set({ user: null, loading: false });
          }
        } catch (error) {
          console.error('Initial session processing error:', error);
          set({ user: null, loading: false });
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('Session check failed completely:', error);
        set({ user: null, loading: false });
      });
  },
}));
