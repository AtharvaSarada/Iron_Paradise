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
    
    // For your admin account, hardcode the admin role temporarily
    if (data.user.email === 'atharva@test.com') {
      const adminUser = {
        id: data.user.id,
        email: data.user.email!,
        full_name: data.user.user_metadata?.full_name || 'Admin User',
        role: 'admin' as 'admin' | 'member' | 'user'
      };
      
      console.log('Admin login detected, using hardcoded admin role');
      set({ user: adminUser, loading: false });
      return adminUser;
    }
    
    // For other users, try to fetch profile or create with default role
    try {
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', data.user.email)
        .single();

      if (profileError) {
        // Create profile if it doesn't exist
        console.log('Creating new profile for user...');
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

        profile = createdProfile || newProfile;
      }

      console.log('Login successful, user role:', profile.role);
      set({ user: profile, loading: false });
      return profile;
    } catch (error) {
      console.error('Profile handling failed, using fallback:', error);
      // Fallback user object
      const fallbackUser = {
        id: data.user.id,
        email: data.user.email!,
        full_name: data.user.user_metadata?.full_name || null,
        role: 'user' as 'admin' | 'member' | 'user'
      };
      set({ user: fallbackUser, loading: false });
      return fallbackUser;
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
    
    // Simplified auth state change handler
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT' || !session?.user) {
        console.log('User signed out or no session');
        set({ user: null, loading: false });
        return;
      }

      // Don't handle SIGNED_IN here to avoid conflicts with signIn function
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Only handle token refresh, not initial sign in
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          set({ user: currentUser, loading: false });
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
