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
          
          // Add timeout for profile fetch
          const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
          );
          
          try {
            const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
            
            if (error) {
              console.error('Profile fetch error:', error);
              
              // If profile doesn't exist, create it
              if (error.code === 'PGRST116' || error.message === 'Profile fetch timeout') {
                console.log('Profile not found or timeout, creating new profile...');
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: session.user.user_metadata?.full_name || null,
                    role: 'user'
                  })
                  .select()
                  .single();

                if (createError) {
                  console.error('Failed to create profile:', createError);
                  set({ user: null, loading: false });
                } else {
                  console.log('Profile created successfully:', newProfile);
                  set({ user: newProfile, loading: false });
                }
              } else {
                set({ user: null, loading: false });
              }
            } else {
              console.log('Profile loaded:', profile);
              set({ user: profile || null, loading: false });
            }
          } catch (timeoutError) {
            console.error('Profile fetch timed out, creating new profile...');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name || null,
                role: 'user'
              })
              .select()
              .single();

            if (createError) {
              console.error('Failed to create profile after timeout:', createError);
              set({ user: null, loading: false });
            } else {
              console.log('Profile created after timeout:', newProfile);
              set({ user: newProfile, loading: false });
            }
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
