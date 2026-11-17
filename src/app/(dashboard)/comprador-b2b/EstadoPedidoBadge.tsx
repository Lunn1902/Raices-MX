import type { EstadoPedido } from '@/types';

const ESTILOS: Record<EstadoPedido, { etiqueta: string; clases: string }> = {
  confirmado: { etiqueta: 'Confirmado', clases: 'border-secundaria/40 text-secundaria' },
  en_proceso: { etiqueta: 'En proceso', clases: 'border-secundaria/40 text-secundaria' },
  en_camino: { etiqueta: 'En camino', clases: 'border-secundaria/40 text-secundaria' },
  entregado: { etiqueta: 'Entregado', clases: 'border-terciaria text-terciaria' },
  cancelado: { etiqueta: 'Cancelado', clases: 'border-terciaria text-terciaria' },
};

export default function EstadoPedidoBadge({ estado }: { estado: EstadoPedido }) {
  const { etiqueta, clases } = ESTILOS[estado] ?? ESTILOS.confirmado;

  return (
    <span
      className={`inline-flex items-center border-b-2 px-1 pb-0.5 text-xs font-semibold uppercase tracking-[0.14em] ${clases}`}
    >
      {etiqueta}
    </span>
  );
}
