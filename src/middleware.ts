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

  // Las cuentas del equipo (administrador y promotor) solo las crea un administrador.
  const registrosDelEquipo = ['/registro-admin', '/registro-promotor'];
  if (registrosDelEquipo.includes(pathname)) {
    if (!user) {
      const url = new URL('/login', req.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    const { data: perfil } = await perfilSupabase()
      .from('usuarios')
      .select('rol')
      .eq('auth_id', user.id)
      .maybeSingle();
    if (perfil?.rol !== 'admin') return NextResponse.redirect(new URL('/', req.url));
  }

  // Rutas públicas. '/registro' cubre registro-productor, registro-promotor,
  // registro-admin, registro-comprador-b2c/b2b (todas empiezan con '/registro').
  const publicPrefixes = ['/login', '/registro', '/catalogo', '/verificar', '/api'];
  const isPublic =
    pathname === '/' ||
    publicPrefixes.some(p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '-'));

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
  const rutasPorRol: Record<string, string[]> = {
    productor: ['/productor'],
    promotor: ['/promotor'],
    comprador_b2c: ['/comprador'],
    comprador_b2b: ['/comprador-b2b'],
    // El administrador también puede verificar artesanos
    admin: ['/admin', '/promotor'],
  };
  const prefijos = [...new Set(Object.values(rutasPorRol).flat())];
  const seccion = prefijos.find(p => pathname === p || pathname.startsWith(p + '/'));

  if (user && seccion) {
    const { data: perfil } = await perfilSupabase()
      .from('usuarios')
      .select('rol')
      .eq('auth_id', user.id)
      .maybeSingle();

    const rol = perfil?.rol;
    const permitidas = rol ? rutasPorRol[rol] ?? [] : [];
    const dentro = permitidas.some(p => p === seccion);
    if (!dentro && permitidas.length > 0) {
      return NextResponse.redirect(new URL(permitidas[0], req.url));
    }
  }

  return res;
}

export const config = {
  // Excluir archivos estáticos: si el middleware intercepta /img/*.jpg,
  // next/image recibe HTML en vez del binario y falla con 500.
  matcher: ['/((?!_next/|img/|piezas/|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)'],
};

