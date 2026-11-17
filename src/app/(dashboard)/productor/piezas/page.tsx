export const instant = false;

import Link from 'next/link';
import { QrCode } from 'lucide-react';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';
import { formatoMXN } from '@/modules/comisiones/calculo';

export const metadata = { title: 'Mis piezas' };

function Aviso({ titulo, mensaje, alerta }: { titulo: string; mensaje: string; alerta?: boolean }) {
  return (
    <div className="card">
      <h1 className="titulo mb-4">{titulo}</h1>
      <p className={alerta ? 'text-terciaria' : 'text-stone-600'}>{mensaje}</p>
    </div>
  );
}

export default async function MisPiezas() {
  const perfil = await perfilSesion();

  if (!perfil) {
    return <Aviso titulo="Mis piezas" mensaje="Inicia sesión para ver tus piezas publicadas." />;
  }

  if (perfil.rol !== 'productor') {
    return (
      <Aviso
        titulo="Mis piezas"
        mensaje={`Esta sección es exclusiva para productores. Tu rol actual es ${perfil.rol}.`}
      />
    );
  }

  let piezas;
  try {
    const catalogo = await repo().catalogo({});
    piezas = catalogo.filter((p) => p.productor_id === perfil.id);
  } catch {
    return (
      <Aviso
        titulo="Mis piezas"
        mensaje="No pudimos cargar tus piezas. Intenta recargar la página más tarde."
        alerta
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="titulo">Mis piezas</h1>
        <p className="mt-1 text-stone-600">Piezas publicadas y aprobadas en el catálogo.</p>
      </div>

      {piezas.length === 0 ? (
        <div className="card text-center">
          <p className="text-stone-600">Todavía no tienes piezas publicadas en el catálogo.</p>
          <Link href="/productor/publicar" className="btn mt-4">
            Publicar mi primera pieza
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <th scope="col" className="py-2 text-left font-semibold text-stone-700">Pieza</th>
                <th scope="col" className="py-2 text-left font-semibold text-stone-700">Categoría</th>
                <th scope="col" className="py-2 text-right font-semibold text-stone-700">Precio</th>
                <th scope="col" className="py-2 text-right font-semibold text-stone-700">Stock</th>
                <th scope="col" className="py-2 text-left font-semibold text-stone-700">Sello QR</th>
              </tr>
            </thead>
            <tbody>
              {piezas.map((pieza) => (
                <tr key={pieza.id} className="border-b border-stone-200 last:border-0">
                  <td className="py-2 text-left font-medium text-secundaria">{pieza.nombre}</td>
                  <td className="py-2 text-left text-stone-600">{pieza.categoria}</td>
                  <td className="py-2 text-right">{formatoMXN(pieza.precio_unitario)}</td>
                  <td className="py-2 text-right">{pieza.stock}</td>
                  <td className="py-2 text-left">
                    {pieza.folio_unico ? (
                      <Link
                        href={`/verificar/${pieza.folio_unico}`}
                        className="inline-flex items-center gap-1 font-mono text-xs text-secundaria hover:underline"
                      >
                        <QrCode className="size-4 shrink-0" aria-hidden="true" />
                        {pieza.folio_unico}
                      </Link>
                    ) : (
                      <span className="text-terciaria">Sin sello</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

