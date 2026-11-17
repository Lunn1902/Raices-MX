'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { enviarJson } from '@/components/Campo';
import type { Notificacion } from '@/types';

function esLeida(n: Notificacion) {
  return n.estado === 'leida' || n.leido_en !== null;
}

function fechaLegible(fecha: string) {
  return new Date(fecha).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ListaNotificaciones({ notificaciones }: { notificaciones: Notificacion[] }) {
  const router = useRouter();
  const [marcadasLocalmente, setMarcadasLocalmente] = useState<Set<string>>(new Set());
  const [procesando, setProcesando] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Se deriva de las props (tras router.refresh) más los cambios locales recientes,
  // para evitar estados duplicados y efectos que provoquen renders en cascada.
  const leidas = new Set(notificaciones.filter(esLeida).map((n) => n.id));
  marcadasLocalmente.forEach((id) => leidas.add(id));

  const pendientes = notificaciones.filter((n) => !leidas.has(n.id)).map((n) => n.id);

  async function marcar(ids: string[]) {
    if (ids.length === 0) return;
    setProcesando(ids.length === 1 ? ids[0] : 'todas');
    setError('');

    const resultados = await Promise.all(
      ids.map(async (id) => ({
        id,
        r: await enviarJson<Notificacion>(`/api/v1/notificaciones/${id}`, 'PATCH', {}),
      }))
    );

    setMarcadasLocalmente((prev) => {
      const siguiente = new Set(prev);
      resultados.forEach(({ id, r }) => { if (r.ok) siguiente.add(id); });
      return siguiente;
    });
    setProcesando(null);

    if (resultados.some(({ r }) => !r.ok)) {
      setError('No se pudieron marcar todas las notificaciones como leídas.');
    }
    router.refresh();
  }

  if (notificaciones.length === 0) {
    return (
      <div className="bloque">
        <p className="text-tinta-clara">No tienes notificaciones por ahora.</p>
      </div>
    );
  }

  return (
    <div className="bloque">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-tinta-clara">
          {pendientes.length === 0
            ? 'Todas tus notificaciones están leídas.'
            : `${pendientes.length} notificación${pendientes.length === 1 ? '' : 'es'} pendiente${pendientes.length === 1 ? '' : 's'}.`}
        </p>
        <button
          type="button"
          className="btn-sec text-sm"
          disabled={pendientes.length === 0 || procesando !== null}
          onClick={() => marcar(pendientes)}
        >
          <CheckCheck className="size-4" aria-hidden="true" />
          {procesando === 'todas' ? 'Marcando…' : 'Marcar todas como leídas'}
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-terciaria" role="alert">{error}</p>}

      <ul className="divide-y divide-secundaria/20">
        {notificaciones.map((n) => {
          const leida = leidas.has(n.id);
          return (
            <li key={n.id} className={`flex flex-wrap items-start justify-between gap-4 py-4 ${leida ? 'opacity-70' : ''}`}>
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <Bell className={`mt-0.5 size-5 shrink-0 ${leida ? 'text-secundaria-suave' : 'text-terciaria'}`} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="font-medium text-secundaria">{n.asunto ?? n.tipo}</p>
                  <p className="mt-1 text-sm text-tinta-clara">{n.mensaje}</p>
                  <p className="mt-1 text-xs text-tinta-clara">
                    Canal {n.canal} · {fechaLegible(n.created_at)}
                  </p>
                </div>
              </div>
              {!leida && (
                <button
                  type="button"
                  className="btn-sec px-3 py-1.5 text-xs"
                  disabled={procesando !== null}
                  aria-label={`Marcar como leída: ${n.asunto ?? n.tipo}`}
                  onClick={() => marcar([n.id])}
                >
                  <Check className="size-3.5" aria-hidden="true" />
                  {procesando === n.id ? 'Marcando…' : 'Marcar como leída'}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
