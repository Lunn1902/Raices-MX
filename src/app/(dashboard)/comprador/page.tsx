import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const ACCESOS = [
  {
    titulo: 'Explorar piezas',
    descripcion: 'Descubre el catálogo y la procedencia de cada pieza.',
    href: '/catalogo',
  },
  {
    titulo: 'Mi carrito',
    descripcion: 'Revisa tu selección y confirma tu compra.',
    href: '/comprador/carrito',
  },
  {
    titulo: 'Mis pedidos',
    descripcion: 'Consulta el estado y la entrega de tus compras.',
    href: '/comprador/pedidos',
  },
  {
    titulo: 'Mis notificaciones',
    descripcion: 'Mantente al tanto de tus pedidos y entregas.',
    href: '/comprador/notificaciones',
  },
  {
    titulo: 'Calificar un pedido',
    descripcion: 'Comparte tu experiencia con quienes hicieron tus piezas.',
    href: '/comprador/calificar',
  },
];

export default function DashboardComprador() {
  return (
    <div className="py-10">
      <header>
        <p className="eyebrow-accent">Tu espacio</p>
        <h1 className="titulo mt-3">Mis compras</h1>
        <p className="plomo mt-4 max-w-2xl">
          Todo lo que necesitas para seguir el origen de tus piezas, en un solo lugar.
        </p>
        <div className="regla-accent mt-6" />
      </header>

      <nav aria-label="Accesos de comprador" className="mt-2">
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
