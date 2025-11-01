import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client that bypasses RLS for public reads
 * Uses the service role key which has elevated permissions
 * This should ONLY be used for public-facing routes that need to read data
 * without requiring authentication
 */
export function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Use service role key for public reads to bypass RLS
  // Fallback to anon key if service role key is not available (e.g., in client-side components if this were used there)
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Key for public client');
  }

  return createClient(supabaseUrl, supabaseKey);
}

