import { connection } from 'next/server';
import { manejar } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';

// GET /api/v1/perfil — perfil del usuario autenticado (para el encabezado, el carrito y la publicación).
// Devuelve 200 con perfil:null cuando no hay sesión, para no ensuciar la consola.
// Si la cuenta es de productor, agrega su perfil de productor (estado de verificación incluido).
export async function GET() {
  await connection();
  return manejar(async () => {
    const perfil = await perfilSesion();
    const productor = perfil?.rol === 'productor' ? await repo().obtenerProductor(perfil.id) : null;
    return { perfil, productor };
  });
}
