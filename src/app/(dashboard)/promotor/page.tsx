'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, Check, MapPin, X } from 'lucide-react';
import { enviarJson } from '@/components/Campo';
import type { EstadoVerificacion, Productor } from '@/types';

const PESTANAS: EstadoVerificacion[] = ['pendiente', 'aprobado', 'rechazado'];

type Visita = { realizada: boolean; nota: string; latitud: string; longitud: string };

// CU-01: el verificador revisa en campo los datos del taller, acude al domicilio
// y solo puede aprobar si registró la visita personal.
export default function PanelPromotor() {
  const [pestana, setPestana] = useState<EstadoVerificacion>('pendiente');
  const [productores, setProductores] = useState<Productor[] | null>(null);
  const [visitas, setVisitas] = useState<Record<string, Visita>>({});
  const [error, setError] = useState('');

  const cargar = useCallback(async (estado: EstadoVerificacion) => {
    const res = await fetch(`/api/v1/productores?estado=${estado}`);
    setProductores(res.ok ? await res.json() : []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial y al cambiar de pestaña
    cargar(pestana);
  }, [pestana, cargar]);

  const visita = (id: string): Visita => visitas[id] ?? { realizada: false, nota: '', latitud: '', longitud: '' };

  function actualizar(id: string, cambios: Partial<Visita>) {
    setVisitas((v) => ({ ...v, [id]: { ...visita(id), ...cambios } }));
  }

  async function resolver(id: string, estado: 'aprobado' | 'rechazado') {
    const v = visita(id);
    const r = await enviarJson(`/api/v1/productores/${id}/verificacion`, 'PATCH', {
      estado,
      observaciones: v.nota || undefined,
      visita_realizada: estado === 'aprobado' ? v.realizada : false,
      fecha_visita: v.realizada ? new Date().toISOString() : undefined,
      latitud_visita: v.latitud ? Number(v.latitud) : undefined,
      longitud_visita: v.longitud ? Number(v.longitud) : undefined,
    });
    if (!r.ok) return setError(r.error);
    setError('');
    actualizar(id, { realizada: false });
    cargar(pestana);
  }

  return (
    <div>
      <p className="eyebrow-accent">Verificación en campo</p>
      <h1 className="titulo mt-3">Panel del verificador</h1>
      <p className="plomo mt-4">
        Acude personalmente al domicilio del artesano, comprueba que el taller existe y registra tu visita antes de
        aprobarlo.
      </p>

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
          {productores.map((p) => {
            const v = visita(p.id);
            return (
              <article key={p.id} className="regla py-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-secundaria">{p.nombre_completo}</h2>
                    <p className="mt-1 text-sm text-tinta-clara">Taller {p.nombre_taller}</p>
                  </div>
                  <span className="border-b-2 border-terciaria pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-terciaria">
                    {p.estado_verificacion}
                  </span>
                </div>

                <dl className="mt-5 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
                  <dt className="text-tinta-clara">Identificación</dt><dd className="font-mono">{p.identificacion_oficial}</dd>
                  <dt className="text-tinta-clara">Comunidad</dt><dd>{p.comunidad}, {p.estado}</dd>
                  <dt className="text-tinta-clara">Pueblo</dt><dd>{p.pueblo_originario}</dd>
                  <dt className="text-tinta-clara">Técnica</dt><dd>{p.tecnica_principal}</dd>
                  <dt className="text-tinta-clara">Contacto</dt><dd>{p.telefono} · {p.correo}</dd>
                </dl>

                {/* Dirección: el motivo de la visita */}
                <div className="mt-5 border-l-4 border-terciaria bg-secundaria/5 px-4 py-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-terciaria">
                    <MapPin className="size-4" /> Dirección a visitar
                  </p>
                  <p className="mt-1 font-medium text-secundaria">{p.direccion || 'Sin dirección registrada'}</p>
                  {p.referencias_direccion && (
                    <p className="mt-1 text-sm text-tinta-clara">Referencias: {p.referencias_direccion}</p>
                  )}
                  {p.latitud != null && p.longitud != null && (
                    <p className="mt-1 font-mono text-xs text-tinta-clara">Ubicación: {p.latitud}, {p.longitud}</p>
                  )}
                </div>

                {pestana === 'pendiente' && (
                  <div className="mt-6 space-y-5">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        className="size-5 accent-[var(--color-terciaria)]"
                        checked={v.realizada}
                        onChange={(e) => actualizar(p.id, { realizada: e.target.checked })}
                      />
                      <span className="text-sm font-semibold text-secundaria">
                        Ya acudí personalmente a esta dirección y confirmé que el artesano y su taller son reales
                      </span>
                    </label>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="label">Latitud de la visita (opcional)</span>
                        <input
                          className="input"
                          inputMode="decimal"
                          placeholder="19.0000000"
                          value={v.latitud}
                          onChange={(e) => actualizar(p.id, { latitud: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="label">Longitud de la visita (opcional)</span>
                        <input
                          className="input"
                          inputMode="decimal"
                          placeholder="-98.0000000"
                          value={v.longitud}
                          onChange={(e) => actualizar(p.id, { longitud: e.target.value })}
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="label">Observaciones de la visita (opcional)</span>
                      <input
                        type="text"
                        className="input"
                        placeholder="Qué viste en el taller, quién te atendió…"
                        value={v.nota}
                        onChange={(e) => actualizar(p.id, { nota: e.target.value })}
                      />
                    </label>

                    <div className="flex flex-wrap gap-3">
                      <button
                        className="btn-accent disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={!v.realizada}
                        onClick={() => resolver(p.id, 'aprobado')}
                        title={!v.realizada ? 'Marca la casilla de la visita para poder aprobar' : undefined}
                      >
                        <Check className="size-4" /> Aprobar <ArrowUpRight className="size-4" />
                      </button>
                      <button className="btn-sec" onClick={() => resolver(p.id, 'rechazado')}>
                        <X className="size-4" /> Rechazar
                      </button>
                      {!v.realizada && (
                        <span className="self-center text-xs text-tinta-clara">
                          Debes confirmar la visita para poder aprobar
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
