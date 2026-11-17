'use client';

import Link from 'next/link';
import { ShoppingBag, LogIn, LogOut, User } from 'lucide-react';
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
      // El perfil se pide al servidor: el cliente anon no puede leer usuarios por RLS
      const res = await fetch('/api/v1/perfil');
      if (res.ok) {
        const { perfil } = await res.json();
        setRol((perfil?.rol as Rol) ?? null);
      } else {
        setRol(null);
      }
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      await init();
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const enlacesPorRol: Record<string, { href: string; texto: string }[]> = {
    productor: [
      { href: '/productor', texto: 'Mi panel' },
      { href: '/productor/publicar', texto: 'Publicar' },
    ],
    promotor: [
      { href: '/promotor', texto: 'Verificación' },
    ],
    comprador_b2c: [
      { href: '/comprador', texto: 'Mi panel' },
      { href: '/catalogo', texto: 'Catálogo' },
    ],
    comprador_b2b: [
      { href: '/comprador-b2b', texto: 'Mi panel' },
      { href: '/catalogo', texto: 'Catálogo' },
    ],
    admin: [
      { href: '/admin', texto: 'Admin' },
    ],
  };

  const enlacesBase = [
    { href: '/catalogo', texto: 'Catálogo' },
    { href: '/registro-productor', texto: 'Soy productor' },
  ];

  const enlaces = rol ? [...enlacesBase, ...(enlacesPorRol[rol] ?? [])] : enlacesBase;

  const handleLogout = async () => {
    await supabaseNavegador().auth.signOut();
  };

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-secundaria">
          RaicesMX
        </Link>
        <nav className="order-3 flex w-full gap-4 overflow-x-auto text-sm sm:order-2 sm:w-auto">
          {enlaces.map((e) => (
            <Link key={`${e.href}-${e.texto}`} href={e.href} className="whitespace-nowrap text-stone-700 hover:text-secundaria">
              {e.texto}
            </Link>
          ))}
        </nav>
        <div className="order-2 ml-auto sm:order-3 flex items-center gap-3">
          <Link href="/comprador/carrito" className="relative" aria-label="Carrito">
            <ShoppingBag className="size-6 text-tinta" />
            {total > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-secundaria px-1.5 text-xs text-white">{total}</span>
            )}
          </Link>
          {rol ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-stone-600">{email}</span>
              <button onClick={handleLogout} className="btn-sec flex items-center gap-1 text-xs">
                <LogOut className="size-4" /> Salir
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-sec flex items-center gap-1 text-xs">
              <LogIn className="size-4" /> Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

