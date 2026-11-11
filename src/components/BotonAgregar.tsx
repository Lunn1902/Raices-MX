'use client';

import { Check, Plus } from 'lucide-react';
import { useCarrito } from './carrito';

export function BotonAgregar({ productoId, stock }: { productoId: string; stock: number }) {
  const { items, agregar } = useCarrito();
  const enCarrito = items.find((i) => i.producto_id === productoId)?.cantidad ?? 0;
  const agotado = enCarrito >= stock;
  return (
    <button className="btn w-full text-sm" disabled={agotado} onClick={() => agregar(productoId, stock)}>
      {enCarrito > 0 ? <Check className="size-4" /> : <Plus className="size-4" />}
      {agotado ? 'Sin más existencias' : enCarrito > 0 ? `En carrito (${enCarrito})` : 'Agregar al carrito'}
    </button>
  );
}
