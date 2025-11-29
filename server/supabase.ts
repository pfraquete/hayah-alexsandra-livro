import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getSupabaseUser(accessToken: string) {
  const { data, error } = await supabase.auth.getUser(accessToken);
  
  if (error) {
    console.error('[Supabase] Error getting user:', error);
    return null;
  }
  
  return data.user;
}
