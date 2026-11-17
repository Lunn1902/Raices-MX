import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const ACCESOS = [
  {
    titulo: 'Cotizar un lote',
    descripcion: 'Lotes de 5 a 50 piezas con descuento por volumen.',
    href: '/comprador-b2b/lotes',
  },
  {
    titulo: 'Contratos de pedido por lote',
    descripcion: 'Anticipo del 30% y saldo del 70% a la entrega.',
    href: '/comprador-b2b/contratos',
  },
  {
    titulo: 'Pedidos por lote',
    descripcion: 'Estado y entrega de tus pedidos de mayoreo.',
    href: '/comprador-b2b/pedidos',
  },
];

export default function DashboardCompradorB2B() {
  return (
    <div className="py-10">
      <header>
        <p className="eyebrow-accent">Comercio por lote</p>
        <h1 className="titulo mt-3">Tiendas y negocios</h1>
        <p className="plomo mt-4 max-w-2xl">
          Compra por lote, genera contratos y gestiona tus pedidos de mayoreo.
        </p>
        <div className="regla-accent mt-6" />
      </header>

      <nav aria-label="Accesos de pedidos por lote" className="mt-2">
        <ul>
          {ACCESOS.map((acceso) => (
            <li key={acceso.href} className="border-b border-secundaria/20">
              <Link
                href={acceso.href}
                className="group flex items-center justify-between gap-6 py-6 transition-colors hover:text-terciaria"
              >
                <span className="min-w-0">
                  <span className="block font-display text-2xl font-semibold tracking-tight text-secundaria transition-colors group-hover:text-terciaria sm:text-3xl">
                    {acceso.titulo}
                  </span>
                  <span className="mt-1 block text-sm text-tinta-clara">
                    {acceso.descripcion}
                  </span>
                </span>
                <ArrowUpRight
                  className="size-6 shrink-0 text-terciaria transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
