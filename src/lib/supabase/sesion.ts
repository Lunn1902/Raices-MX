import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { RolUsuario } from '@/types';

export interface PerfilSesion {
  id: string;          // id de la tabla usuarios
  authId: string;      // id de auth.users
  correo: string;
  nombreCompleto: string;
  rol: RolUsuario;
}

// Cliente SSR para Server Components / Route Handlers: lee la sesión de las cookies
export async function clienteConSesion() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // los Server Components no pueden escribir cookies; el middleware ya refresca la sesión
          }
        },
      },
    }
  );
}

// Devuelve el perfil del usuario autenticado o null. Único punto de acceso a la identidad.
export async function perfilSesion(): Promise<PerfilSesion | null> {
  const supabase = await clienteConSesion();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );
  const { data } = await sb.from('usuarios').select('id, correo, nombre_completo, rol').eq('auth_id', user.id).maybeSingle();
  if (!data) return null;

  return {
    id: data.id,
    authId: user.id,
    correo: data.correo,
    nombreCompleto: data.nombre_completo,
    rol: data.rol as RolUsuario,
  };
}
