import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Consulta de perfil con service role: el cliente anon no puede leer usuarios por RLS
function perfilSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // Rutas públicas
  const publicPaths = ['/login', '/registro-productor', '/registro', '/catalogo', '/verificar', '/api', '/'];
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (!user && !isPublic) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Redirección post login por rol
  if (user && pathname === '/login') {
    const { data: perfil } = await perfilSupabase()
      .from('usuarios')
      .select('rol')
      .eq('auth_id', user.id)
      .maybeSingle();

    const rol = perfil?.rol;
    const map: Record<string, string> = {
      productor: '/productor',
      promotor: '/promotor',
      comprador_b2c: '/comprador',
      comprador_b2b: '/comprador-b2b',
      admin: '/admin',
    };
    const destino = rol ? map[rol] ?? '/' : '/';
    return NextResponse.redirect(new URL(destino, req.url));
  }

  // Protección de secciones por rol
  const rutasPorRol: Record<string, string> = {
    productor: '/productor',
    promotor: '/promotor',
    comprador_b2c: '/comprador',
    comprador_b2b: '/comprador-b2b',
    admin: '/admin',
  };
  const prefijos = Object.values(rutasPorRol);
  const seccion = prefijos.find(p => pathname === p || pathname.startsWith(p + '/'));

  if (user && seccion) {
    const { data: perfil } = await perfilSupabase()
      .from('usuarios')
      .select('rol')
      .eq('auth_id', user.id)
      .maybeSingle();

    const rol = perfil?.rol;
    const permitida = rol ? rutasPorRol[rol] : null;
    if (permitida && seccion !== permitida) {
      return NextResponse.redirect(new URL(permitida, req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

