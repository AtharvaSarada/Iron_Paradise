import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase config check:', {
  url: supabaseUrl,
  keyExists: !!supabaseKey,
  keyLength: supabaseKey?.length,
  fullUrl: `${supabaseUrl}/auth/v1/session`
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseKey ? '[REDACTED]' : 'MISSING'
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

console.log('Supabase client created successfully');

// Test the connection
(async () => {
  try {
    const { data, error } = await supabase.from('packages').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection test successful:', data);
    }
  } catch (err) {
    console.error('Supabase connection test error:', err);
  }
})();
