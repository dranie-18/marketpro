import { createClient } from '@supabase/supabase-js';

// In Astro, we use import.meta.env.PUBLIC_ prefix instead of VITE_
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing env.PUBLIC_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing env.PUBLIC_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);