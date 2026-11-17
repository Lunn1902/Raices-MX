import { connection } from 'next/server';
import { manejar } from '@/lib/http';
import { perfilSesion } from '@/lib/supabase/sesion';

// GET /api/v1/perfil — perfil del usuario autenticado (para el encabezado y el carrito).
// Devuelve 200 con perfil:null cuando no hay sesión, para no ensuciar la consola.
export async function GET() {
  await connection();
  return manejar(async () => ({ perfil: await perfilSesion() }));
}
