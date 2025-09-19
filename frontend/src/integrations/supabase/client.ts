// Mirror Diary - Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables for configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://iycmluynjdpgfdgedgi.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Y21sdXluamRwZ2ZkYmdlZGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTU4NDgsImV4cCI6MjA3MjU5MTg0OH0.g0iguVLL7SuVHZ2aTj2T6DqEMF4FDhKi9yzQJG9Jtao";

// Create Supabase client with enhanced configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-my-custom-header': 'mirror-diary-app'
    }
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error);
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};