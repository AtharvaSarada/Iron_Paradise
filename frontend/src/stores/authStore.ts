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
    
    // For your admin account, ensure profile exists in database
    if (data.user.email === 'atharva@test.com') {
      console.log('Admin login detected, ensuring profile exists...');
      
      try {
        // First try to get existing profile
        let { data: profile, error: getError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'atharva@test.com')
          .single();

        if (getError || !profile) {
          console.log('Creating admin profile in database...');
          // Create the admin profile in the database
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || 'Admin User',
              role: 'admin'
            }])
            .select()
            .single();

          if (createError) {
            console.error('Failed to create admin profile:', createError);
            // Use hardcoded admin user as fallback
            profile = {
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || 'Admin User',
              role: 'admin'
            };
          } else {
            profile = newProfile;
          }
        }

        console.log('Admin profile ready:', profile);
        set({ user: profile, loading: false });
        return profile;
      } catch (error) {
        console.error('Admin profile handling failed:', error);
        // Fallback to hardcoded admin
        const adminUser = {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || 'Admin User',
          role: 'admin' as 'admin' | 'member' | 'user'
        };
        set({ user: adminUser, loading: false });
        return adminUser;
      }
    }
    
    // For regular users, ensure profile exists in database
    console.log('Regular user login, ensuring profile exists...');
    
    try {
      // First try to get existing profile
      let { data: profile, error: getError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', data.user.email)
        .single();

      if (getError || !profile) {
        console.log('Creating user profile in database...');
        // Create the user profile in the database
        const newProfileData = {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || null,
          role: 'user'
        };

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfileData])
          .select()
          .single();

        if (createError) {
          console.error('Failed to create user profile:', createError);
          // Use hardcoded user as fallback
          profile = {
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || null,
            role: 'user'
          };
        } else {
          profile = newProfile;
        }
      }

      console.log('User profile ready:', profile);
      set({ user: profile, loading: false });
      return profile;
    } catch (error) {
      console.error('User profile handling failed:', error);
      // Fallback to hardcoded user
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
