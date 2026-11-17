'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { Calificacion } from '@/types';

function fechaLegible(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-MX', { dateStyle: 'medium' });
}

// Moderación local: oculta o muestra comentarios solo en la sesión del administrador.
// No persiste cambios porque todavía no existe API de moderación.
export default function ModeradorCalificaciones({ calificaciones }: { calificaciones: Calificacion[] }) {
  const [ocultas, setOcultas] = useState<Set<string>>(new Set());

  function alternar(id: string) {
    setOcultas((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }

  return (
    <ul className="space-y-2">
      {calificaciones.map((c) => {
        const oculta = ocultas.has(c.id);
        return (
          <li
            key={c.id}
            className={`flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4 ${
              oculta ? 'border-stone-300 bg-stone-100 opacity-60' : 'border-stone-200 bg-fondo'
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-secundaria" aria-label={`${c.puntuacion} de 5 estrellas`}>
                <span aria-hidden="true">{'★'.repeat(c.puntuacion)}{'☆'.repeat(Math.max(0, 5 - c.puntuacion))}</span>
                <span className="ml-2 font-normal text-stone-500">{fechaLegible(c.created_at)}</span>
              </p>
              <p className="mt-1 text-sm text-stone-600">
                {oculta ? 'Comentario oculto por moderación.' : (c.comentario ?? 'Sin comentario.')}
              </p>
            </div>
            <button
              type="button"
              className="btn-sec px-3 py-1.5 text-xs"
              aria-pressed={oculta}
              onClick={() => alternar(c.id)}
            >
              {oculta ? <Eye className="size-3.5" aria-hidden="true" /> : <EyeOff className="size-3.5" aria-hidden="true" />}
              {oculta ? 'Mostrar' : 'Ocultar'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
