'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileDown } from 'lucide-react';
import { enviarJson } from '@/components/Campo';
import type { Reporte } from '@/types';

const TIPOS: { valor: Reporte['tipo']; etiqueta: string }[] = [
  { valor: 'ventas', etiqueta: 'Ventas' },
  { valor: 'productores', etiqueta: 'Productores' },
  { valor: 'comisiones', etiqueta: 'Comisiones' },
  { valor: 'auditoria', etiqueta: 'Auditoría' },
  { valor: 'inventario', etiqueta: 'Inventario' },
];

const FORMATOS: Reporte['formato'][] = ['csv', 'pdf', 'xlsx'];

export default function GeneradorReportes() {
  const router = useRouter();
  const [tipo, setTipo] = useState<Reporte['tipo']>('ventas');
  const [formato, setFormato] = useState<Reporte['formato']>('csv');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function generar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setMensaje('');
    setError('');

    const r = await enviarJson<Reporte>('/api/v1/admin/reportes', 'POST', { tipo, formato });
    setEnviando(false);

    if (!r.ok) {
      setError(r.error);
      return;
    }

    const etiquetaTipo = TIPOS.find((t) => t.valor === tipo)?.etiqueta ?? tipo;
    setMensaje(`Reporte de ${etiquetaTipo.toLowerCase()} en ${formato.toUpperCase()} solicitado correctamente.`);
    router.refresh();
  }

  return (
    <section className="bloque mb-6" aria-labelledby="generador-reportes-titulo">
      <h2 id="generador-reportes-titulo" className="subtitulo">
        Generar reporte
      </h2>
      <p className="plomo mt-2">
        Solicita un reporte del piloto. El archivo quedará registrado en el historial.
      </p>

      <form onSubmit={generar} className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Tipo de reporte</span>
          <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value as Reporte['tipo'])}>
            {TIPOS.map((t) => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Formato</span>
          <select className="input" value={formato} onChange={(e) => setFormato(e.target.value as Reporte['formato'])}>
            {FORMATOS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
          </select>
        </label>

        <div className="sm:col-span-2">
          <button type="submit" className="btn" disabled={enviando}>
            <FileDown className="size-4" aria-hidden="true" />
            {enviando ? 'Generando…' : 'Generar reporte'}
          </button>
        </div>
      </form>

      {mensaje && <p className="mt-4 text-sm text-secundaria" role="status">{mensaje}</p>}
      {error && <p className="mt-4 text-sm text-terciaria" role="alert">{error}</p>}
    </section>
  );
}
