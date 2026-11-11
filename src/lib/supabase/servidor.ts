import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';

let cliente: SupabaseClient | null = null;

// Cliente con service role: solo se usa dentro de los Route Handlers y Server Components
export function supabaseServidor(): SupabaseClient {
  cliente ??= createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cliente;
}
