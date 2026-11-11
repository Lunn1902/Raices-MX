import Link from 'next/link';
import { BadgeCheck, Map, PackagePlus, QrCode, ShoppingCart, UserPlus } from 'lucide-react';

const CASOS = [
  { cu: 'CU-01', titulo: 'Registro y verificación de productores', href: '/registro-productor', extra: { href: '/promotor', texto: 'Panel del promotor' }, Icono: UserPlus },
  { cu: 'CU-04', titulo: 'Publicar pieza con ficha de origen y sello QR', href: '/productor/publicar', Icono: PackagePlus },
  { cu: 'CU-06', titulo: 'Verificar el origen de una pieza por QR', href: '/verificar/RMX-PUE-2026-A15D09', Icono: QrCode },
  { cu: 'CU-07', titulo: 'Catálogo con filtros y mapa de procedencia', href: '/catalogo', Icono: Map },
  { cu: 'CU-08', titulo: 'Compra con desglose transparente 90/10', href: '/comprador/carrito', Icono: ShoppingCart },
];

export default function Inicio() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-barro px-6 py-10 text-white">
        <p className="mb-2 flex items-center gap-2 text-sm opacity-90">
          <BadgeCheck className="size-4" /> Origen verificable con sello criptográfico
        </p>
        <h1 className="max-w-2xl text-3xl font-bold sm:text-4xl">Compra directo a quien hace la pieza.</h1>
        <p className="mt-3 max-w-xl opacity-90">
          El 90% de cada venta llega al productor originario. Cada pieza trae su ficha de origen y un QR que cualquiera puede comprobar.
        </p>
        <Link href="/catalogo" className="mt-6 inline-flex rounded-lg bg-white px-5 py-2.5 font-semibold text-barro hover:bg-maiz">
          Explorar el catálogo
        </Link>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Casos de uso de la versión 1</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CASOS.map(({ cu, titulo, href, extra, Icono }) => (
            <div key={cu} className="card flex flex-col gap-2">
              <Icono className="size-6 text-barro" />
              <p className="text-xs font-semibold text-stone-500">{cu}</p>
              <Link href={href} className="font-semibold hover:text-barro">
                {titulo}
              </Link>
              {extra && (
                <Link href={extra.href} className="text-sm text-barro hover:underline">
                  {extra.texto} →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
