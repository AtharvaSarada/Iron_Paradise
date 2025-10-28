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
    console.log('Auth store initializing...');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // Listen to auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      try {
        if (session?.user) {
          console.log('Fetching profile for user:', session.user.id);
          
          // Try direct fetch without timeout first
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log('Profile fetch result:', { profile, error });

          if (error) {
            console.error('Profile fetch error details:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            });
            
            // If it's an RLS error or permission issue, try with different approach
            if (error.code === 'PGRST301' || error.message.includes('RLS')) {
              console.log('RLS policy issue detected, trying alternative approach...');
              
              // Try fetching with a more permissive query
              const { data: profiles, error: listError } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', session.user.email);
                
              console.log('Alternative fetch result:', { profiles, listError });
              
              if (profiles && profiles.length > 0) {
                console.log('Profile found via email lookup:', profiles[0]);
                set({ user: profiles[0], loading: false });
              } else {
                console.error('No profile found even with email lookup');
                set({ user: null, loading: false });
              }
            } else {
              set({ user: null, loading: false });
            }
          } else {
            console.log('Profile loaded successfully:', profile);
            set({ user: profile, loading: false });
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
              set({ user: null, loading: false });
            } else {
              console.log('Initial profile loaded:', profile);
              set({ user: profile || null, loading: false });
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
