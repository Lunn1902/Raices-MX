'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCarrito } from './carrito';

const ENLACES = [
  { href: '/catalogo', texto: 'Catálogo' },
  { href: '/registro-productor', texto: 'Soy productor' },
  { href: '/productor/publicar', texto: 'Publicar pieza' },
  { href: '/promotor', texto: 'Promotor' },
];

export function Encabezado() {
  const { total } = useCarrito();
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-milpa">
          RaicesMX
        </Link>
        <nav className="order-3 flex w-full gap-4 overflow-x-auto text-sm sm:order-2 sm:w-auto">
          {ENLACES.map((e) => (
            <Link key={e.href} href={e.href} className="whitespace-nowrap text-stone-700 hover:text-milpa">
              {e.texto}
            </Link>
          ))}
        </nav>
        <Link href="/comprador/carrito" className="relative order-2 ml-auto sm:order-3" aria-label="Carrito">
          <ShoppingBag className="size-6 text-tinta" />
          {total > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-milpa px-1.5 text-xs text-white">{total}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
