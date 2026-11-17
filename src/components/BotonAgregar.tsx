'use client';

import Link from 'next/link';
import { Check, Plus, UserPlus } from 'lucide-react';
import { useCarrito } from './carrito';
import { useSesion } from './useSesion';

export function BotonAgregar({ productoId, stock }: { productoId: string; stock: number }) {
  const { items, agregar } = useCarrito();
  const { cargando, perfil } = useSesion();
  const enCarrito = items.find((i) => i.producto_id === productoId)?.cantidad ?? 0;
  const agotado = enCarrito >= stock;

  const esComprador = perfil?.rol === 'comprador_b2c' || perfil?.rol === 'comprador_b2b';

  // Sin sesión: invitar a crear cuenta / entrar antes de agregar
  if (!cargando && !perfil) {
    return (
      <div className="space-y-2">
        <Link href="/registro-comprador-b2c" className="btn-accent w-full">
          <UserPlus className="size-4" /> Crear cuenta para comprar
        </Link>
        <Link href="/login" className="block text-center text-xs text-secundaria hover:text-terciaria">
          ¿Ya tienes cuenta? Entra aquí
        </Link>
      </div>
    );
  }

  // Con sesión de otro rol (productor/verificador/admin): no puede comprar
  if (!cargando && perfil && !esComprador) {
    return (
      <p className="text-center text-xs text-tinta-clara">
        Inicia sesión con una cuenta de comprador para agregar piezas
      </p>
    );
  }

  return (
    <button
      className={`${enCarrito > 0 ? 'btn-sec' : 'btn'} w-full`}
      disabled={cargando || agotado}
      onClick={() => agregar(productoId, stock)}
    >
      {enCarrito > 0 ? <Check className="size-4" /> : <Plus className="size-4" />}
      {cargando
        ? 'Cargando…'
        : agotado
          ? 'Sin más existencias'
          : enCarrito > 0
            ? `En carrito (${enCarrito})`
            : 'Agregar al carrito'}
    </button>
  );
}
