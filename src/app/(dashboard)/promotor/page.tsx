'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { enviarJson } from '@/components/Campo';
import type { EstadoVerificacion, Productor } from '@/types';

const PESTANAS: EstadoVerificacion[] = ['pendiente', 'aprobado', 'rechazado'];

// CU-01: el verificador revisa en campo los datos del taller y aprueba o rechaza
export default function PanelPromotor() {
  const [pestana, setPestana] = useState<EstadoVerificacion>('pendiente');
  const [productores, setProductores] = useState<Productor[] | null>(null);
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const cargar = useCallback(async (estado: EstadoVerificacion) => {
    const res = await fetch(`/api/v1/productores?estado=${estado}`);
    setProductores(res.ok ? await res.json() : []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial y al cambiar de pestaña
    cargar(pestana);
  }, [pestana, cargar]);

  async function resolver(id: string, estado: 'aprobado' | 'rechazado') {
    const r = await enviarJson(`/api/v1/productores/${id}/verificacion`, 'PATCH', { estado, observaciones: notas[id] || undefined });
    if (!r.ok) return setError(r.error);
    setError('');
    cargar(pestana);
  }

  return (
    <div>
      <p className="eyebrow-accent">Verificación en campo</p>
      <h1 className="titulo mt-3">Panel del verificador</h1>
      <p className="plomo mt-4">Revisa la identidad y el taller de cada artesano antes de que sus piezas aparezcan en la tienda.</p>

      <div className="regla mt-10 flex flex-wrap gap-6 pt-6">
        {PESTANAS.map((p) => (
          <button
            key={p}
            onClick={() => setPestana(p)}
            className={`border-b-2 pb-2 text-sm font-semibold uppercase tracking-[0.12em] capitalize transition-colors ${
              pestana === p ? 'border-terciaria text-terciaria' : 'border-transparent text-secundaria hover:text-terciaria'
            }`}
          >
            {p} {p === 'pendiente' && productores && <span className="ml-1">({productores.length})</span>}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 border-l-4 border-terciaria pl-4 text-sm text-terciaria">{error}</p>}

      {productores === null ? (
        <p className="mt-8 text-tinta-clara">Cargando…</p>
      ) : productores.length === 0 ? (
        <p className="regla mt-6 py-10 text-tinta-clara">No hay artesanos en estado {pestana}.</p>
      ) : (
        <div className="mt-6">
          {productores.map((p) => (
            <article key={p.id} className="regla grid gap-4 py-8 sm:grid-cols-[1fr_auto] sm:gap-10">
              <div>
                <h2 className="font-display text-2xl font-semibold text-secundaria">{p.nombre_completo}</h2>
                <p className="mt-1 text-sm text-tinta-clara">Taller {p.nombre_taller}</p>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                  <dt className="text-tinta-clara">Identificación</dt><dd className="font-mono">{p.identificacion_oficial}</dd>
                  <dt className="text-tinta-clara">Comunidad</dt><dd>{p.comunidad}, {p.estado}</dd>
                  <dt className="text-tinta-clara">Pueblo</dt><dd>{p.pueblo_originario}</dd>
                  <dt className="text-tinta-clara">Técnica</dt><dd>{p.tecnica_principal}</dd>
                  <dt className="text-tinta-clara">Contacto</dt><dd>{p.telefono} · {p.correo}</dd>
                </dl>
                {pestana === 'pendiente' && (
                  <input
                    type="text"
                    placeholder="Observaciones de la visita (opcional)"
                    className="input mt-5 max-w-md"
                    value={notas[p.id] ?? ''}
                    onChange={(e) => setNotas({ ...notas, [p.id]: e.target.value })}
                  />
                )}
              </div>
              {pestana === 'pendiente' && (
                <div className="flex flex-col gap-3 self-center sm:w-40">
                  <button className="btn-accent" onClick={() => resolver(p.id, 'aprobado')}>
                    <Check className="size-4" /> Aprobar <ArrowUpRight className="size-4" />
                  </button>
                  <button className="btn-sec" onClick={() => resolver(p.id, 'rechazado')}>
                    <X className="size-4" /> Rechazar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
