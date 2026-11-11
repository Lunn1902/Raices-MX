import { createBrowserClient } from '@supabase/ssr';

// Solo para la sesión de Supabase Auth (CU-02). Los datos siempre se piden a /api/v1.
export const supabaseNavegador = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
