import type { EstadoPedido } from '@/types';

const ESTILOS: Record<EstadoPedido, { etiqueta: string; clases: string }> = {
  confirmado: { etiqueta: 'Confirmado', clases: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  en_proceso: { etiqueta: 'En proceso', clases: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  en_camino: { etiqueta: 'En camino', clases: 'bg-sky-50 text-sky-700 ring-sky-600/20' },
  entregado: { etiqueta: 'Entregado', clases: 'bg-secundaria/10 text-secundaria ring-secundaria/20' },
  cancelado: { etiqueta: 'Cancelado', clases: 'bg-terciaria/10 text-terciaria ring-terciaria/20' },
};

export default function EstadoPedidoBadge({ estado }: { estado: EstadoPedido }) {
  const { etiqueta, clases } = ESTILOS[estado] ?? ESTILOS.confirmado;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${clases}`}
    >
      {etiqueta}
    </span>
  );
}
