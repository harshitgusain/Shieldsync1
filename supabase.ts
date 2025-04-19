import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Log connection status (without exposing sensitive data)
console.log('Supabase connection status:', supabaseUrl && supabaseAnonKey ? 'Credentials present' : 'Credentials missing');

// Subscribe to realtime updates
supabase
  .channel('security-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'security_threats'
  }, payload => {
    console.log('Security threat change received:', payload);
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'security_alerts'
  }, payload => {
    console.log('Security alert change received:', payload);
  })
  .subscribe();