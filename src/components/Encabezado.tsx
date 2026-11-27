'use client';

import Link from 'next/link';
import { ArrowUpRight, LogOut, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabaseNavegador } from '@/lib/supabase/navegador';
import { useCarrito } from './carrito';

type Rol = 'productor' | 'promotor' | 'comprador_b2c' | 'comprador_b2b' | 'admin' | null;

export function Encabezado() {
  const { total } = useCarrito();
  const [rol, setRol] = useState<Rol>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const supabase = supabaseNavegador();
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setRol(null); setEmail(''); return; }
      setEmail(user.email ?? '');
      const res = await fetch('/api/v1/perfil');
      if (res.ok) {
        const { perfil } = await res.json();
        setRol((perfil?.rol as Rol) ?? null);
      } else {
        setRol(null);
      }
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { void init(); });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const enlacesPorRol: Record<string, { href: string; texto: string }[]> = {
    productor: [
      { href: '/productor', texto: 'Mi taller' },
      { href: '/productor/publicar', texto: 'Publicar pieza' },
    ],
    promotor: [
      { href: '/promotor', texto: 'Verificación' },
    ],
    comprador_b2c: [
      { href: '/comprador/pedidos', texto: 'Mis pedidos' },
    ],
    comprador_b2b: [
      { href: '/comprador-b2b', texto: 'Mis pedidos' },
      { href: '/comprador-b2b/lotes', texto: 'Pedir por lote' },
    ],
    admin: [
      { href: '/admin', texto: 'Administración' },
    ],
  };

  const enlaces = [
    { href: '/catalogo', texto: 'Explorar piezas' },
    { href: '/registro-productor', texto: 'Soy artesano' },
    ...(rol ? enlacesPorRol[rol] ?? [] : []),
  ];

  const handleLogout = async () => {
    await supabaseNavegador().auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-20 border-b border-secundaria/15 bg-fondo/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4 sm:px-8">
        <Link href="/" className="inline-flex min-h-11 items-center font-display text-2xl font-semibold tracking-tight text-secundaria">
          Raices<span className="text-terciaria">MX</span>
        </Link>

        <nav aria-label="Navegación principal" className="order-3 flex w-full flex-wrap items-center gap-x-6 gap-y-2 text-sm sm:order-2 sm:w-auto">
          {enlaces.map((e) => (
            <Link key={`${e.href}-${e.texto}`} href={e.href} className="inline-flex min-h-11 items-center text-secundaria transition-colors hover:text-terciaria">
              {e.texto}
            </Link>
          ))}
        </nav>

        <div className="order-2 ml-auto flex items-center gap-5 sm:order-3">
          <Link href="/comprador/carrito" className="relative inline-flex items-center gap-1.5 text-secundaria transition-colors hover:text-terciaria" aria-label="Ver carrito">
            <ShoppingBag className="size-5" />
            {total > 0 && (
              <span className="absolute -right-2.5 -top-2 flex size-4 items-center justify-center rounded-full bg-terciaria text-[10px] font-bold text-white">
                {total}
              </span>
            )}
          </Link>

          {rol ? (
            <div className="flex items-center gap-4">
              <span className="hidden max-w-[150px] truncate text-xs text-tinta-clara lg:inline" title={email}>{email}</span>
              <button onClick={handleLogout} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-secundaria transition-colors hover:text-terciaria">
                <LogOut className="size-4" /> Salir
              </button>
            </div>
          ) : (
            <Link href="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-secundaria transition-colors hover:text-terciaria">
              Entrar <ArrowUpRight className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
