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
    
    // Try to find profile by email first, then by ID
    try {
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', data.user.email)
        .single();

      // If not found by email, try by ID
      if (profileError) {
        console.log('Profile not found by email, trying by ID...');
        const { data: profileById, error: idError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (!idError && profileById) {
          profile = profileById;
          profileError = null;
        }
      }

      // If still no profile found, create one for existing auth users
      if (profileError) {
        console.log('No profile found, creating one for existing user...');
        const newProfile = {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || null,
          role: 'user' as 'admin' | 'member' | 'user'
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('Failed to create profile:', createError);
          throw new Error('Unable to create user profile. Please contact support.');
        }

        profile = createdProfile;
      }

      console.log('Login successful, user role:', profile.role);
      set({ user: profile, loading: false });
      return profile;
    } catch (error) {
      console.error('Profile handling failed during login:', error);
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
      
      if (event === 'SIGNED_OUT' || !session?.user) {
        console.log('User signed out or no session');
        set({ user: null, loading: false });
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, fetching profile...');
        
        try {
          // Try to find profile by email first, then by ID
          let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', session.user.email)
            .single();

          // If not found by email, try by ID
          if (profileError) {
            const { data: profileById, error: idError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (!idError && profileById) {
              profile = profileById;
            }
          }

          if (profile) {
            console.log('Profile found in auth state change:', profile);
            set({ user: profile, loading: false });
          } else {
            console.log('No profile found in auth state change');
            set({ user: null, loading: false });
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          set({ user: null, loading: false });
        }
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
            
            // Try to find profile by email first, then by ID
            let { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', session.user.email)
              .single();

            // If not found by email, try by ID
            if (profileError) {
              const { data: profileById, error: idError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (!idError && profileById) {
                profile = profileById;
                profileError = null;
              }
            }

            if (profileError) {
              console.error('Initial profile fetch error:', profileError);
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
