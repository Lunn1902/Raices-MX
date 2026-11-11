'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { ItemCarrito } from '@/types';

// El carrito vive en localStorage; los precios reales se piden al servidor al cotizar
const CLAVE = 'raicesmx-carrito';
const EVENTO = 'carrito-actualizado';
const VACIO = '[]';

function leerCrudo() {
  try {
    return localStorage.getItem(CLAVE) ?? VACIO;
  } catch {
    return VACIO;
  }
}

function guardar(items: ItemCarrito[]) {
  localStorage.setItem(CLAVE, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENTO));
}

function suscribir(cb: () => void) {
  window.addEventListener(EVENTO, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENTO, cb);
    window.removeEventListener('storage', cb);
  };
}

export function useCarrito() {
  const crudo = useSyncExternalStore(suscribir, leerCrudo, () => VACIO);
  const items: ItemCarrito[] = JSON.parse(crudo);

  const agregar = useCallback((producto_id: string, max: number) => {
    const actuales: ItemCarrito[] = JSON.parse(leerCrudo());
    const item = actuales.find((i) => i.producto_id === producto_id);
    if (item) item.cantidad = Math.min(item.cantidad + 1, max);
    else actuales.push({ producto_id, cantidad: 1 });
    guardar(actuales);
  }, []);

  const cambiar = useCallback((producto_id: string, cantidad: number) => {
    const actuales: ItemCarrito[] = JSON.parse(leerCrudo());
    guardar(
      cantidad <= 0
        ? actuales.filter((i) => i.producto_id !== producto_id)
        : actuales.map((i) => (i.producto_id === producto_id ? { ...i, cantidad } : i)),
    );
  }, []);

  const vaciar = useCallback(() => guardar([]), []);

  return { items, total: items.reduce((a, i) => a + i.cantidad, 0), agregar, cambiar, vaciar };
}
