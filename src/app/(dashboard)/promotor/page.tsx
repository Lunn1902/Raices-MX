'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { enviarJson } from '@/components/Campo';
import type { EstadoVerificacion, Productor } from '@/types';

const PESTANAS: EstadoVerificacion[] = ['pendiente', 'aprobado', 'rechazado'];

// CU-01: el promotor revisa en campo los datos del taller y aprueba o rechaza
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
      <h1 className="titulo">Panel del promotor</h1>
      <p className="mb-4 text-stone-600">Verificación de productores en campo · Rosa Elena Téllez (promotora del piloto Puebla)</p>
      <div className="mb-4 flex gap-2">
        {PESTANAS.map((p) => (
          <button key={p} onClick={() => setPestana(p)} className={`rounded-full px-4 py-1.5 text-sm capitalize ${pestana === p ? 'bg-milpa text-white' : 'bg-white text-stone-700'}`}>
            {p}
          </button>
        ))}
      </div>
      {error && <p className="mb-3 text-sm text-red-700">{error}</p>}
      {productores === null ? (
        <p className="text-stone-500">Cargando…</p>
      ) : productores.length === 0 ? (
        <p className="card text-stone-600">No hay productores en estado {pestana}.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {productores.map((p) => (
            <article key={p.id} className="card space-y-2">
              <div>
                <h2 className="font-semibold">{p.nombre_completo}</h2>
                <p className="text-sm text-stone-600">Taller {p.nombre_taller}</p>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                <dt className="text-stone-500">Identificación</dt><dd className="font-mono">{p.identificacion_oficial}</dd>
                <dt className="text-stone-500">Comunidad</dt><dd>{p.comunidad}, {p.estado}</dd>
                <dt className="text-stone-500">Pueblo</dt><dd>{p.pueblo_originario}</dd>
                <dt className="text-stone-500">Técnica</dt><dd>{p.tecnica_principal}</dd>
                <dt className="text-stone-500">Contacto</dt><dd>{p.telefono} · {p.correo}</dd>
              </dl>
              {pestana === 'pendiente' && (
                <>
                  <textarea
                    placeholder="Observaciones de la visita (opcional)"
                    className="input text-sm" rows={2}
                    value={notas[p.id] ?? ''}
                    onChange={(e) => setNotas({ ...notas, [p.id]: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button className="btn flex-1 bg-milpa hover:bg-milpa-oscuro" onClick={() => resolver(p.id, 'aprobado')}>
                      <Check className="size-4" /> Aprobar
                    </button>
                    <button className="btn-sec flex-1 border-red-700 text-red-700 hover:bg-red-50" onClick={() => resolver(p.id, 'rechazado')}>
                      <X className="size-4" /> Rechazar
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
