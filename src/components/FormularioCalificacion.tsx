'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { enviarJson } from '@/components/Campo';

export default function FormularioCalificacion({
  pedidoId,
  productorId,
  nombreProductor,
  folio,
}: {
  pedidoId: string;
  productorId: string;
  nombreProductor: string;
  folio: string;
}) {
  const router = useRouter();
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (puntuacion === 0) {
      setError('Selecciona una puntuación de 1 a 5 estrellas.');
      return;
    }

    setEnviando(true);
    const r = await enviarJson('/api/v1/calificaciones', 'POST', {
      pedidoId,
      productorId,
      puntuacion,
      comentario: comentario.trim(),
    });
    setEnviando(false);

    if (!r.ok) {
      setError(r.error);
      return;
    }

    setMensaje('¡Gracias! Tu calificación fue registrada.');
    setPuntuacion(0);
    setComentario('');
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="bloque space-y-4">
      <div>
        <p className="eyebrow-accent">{nombreProductor}</p>
        <p className="mt-1 text-xs text-tinta-clara">Pedido <span className="font-mono">{folio}</span></p>
      </div>

      <fieldset>
        <legend className="label">Tu puntuación</legend>
        <div className="flex gap-1" role="group" aria-label="Puntuación de 1 a 5 estrellas">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPuntuacion(n)}
              aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
              aria-pressed={puntuacion === n}
              className="p-1 text-2xl leading-none transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-terciaria"
            >
              <span aria-hidden="true" className={n <= puntuacion ? 'text-terciaria' : 'text-secundaria/30'}>
                {n <= puntuacion ? '★' : '☆'}
              </span>
            </button>
          ))}
        </div>
        {puntuacion > 0 && (
          <p className="mt-1 text-xs text-tinta-clara">{puntuacion} de 5 estrellas</p>
        )}
      </fieldset>

      <label className="block">
        <span className="label">Comentario (opcional)</span>
        <textarea
          className="input"
          rows={3}
          maxLength={500}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Cuéntanos cómo fue tu experiencia con esta pieza"
        />
      </label>

      <button type="submit" className="btn" disabled={enviando}>
        <Send className="size-4" aria-hidden="true" />
        {enviando ? 'Enviando…' : 'Enviar calificación'}
      </button>

      {mensaje && <p className="text-sm text-secundaria" role="status">{mensaje}</p>}
      {error && <p className="text-sm text-terciaria" role="alert">{error}</p>}
    </form>
  );
}
