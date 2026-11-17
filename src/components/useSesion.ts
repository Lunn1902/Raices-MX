'use client';

import { useEffect, useState } from 'react';

export interface PerfilCliente {
  id: string;
  authId: string;
  correo: string;
  nombreCompleto: string;
  rol: 'productor' | 'promotor' | 'comprador_b2c' | 'comprador_b2b' | 'admin';
}

type Estado =
  | { cargando: true; perfil: null }
  | { cargando: false; perfil: PerfilCliente | null };

// Lee el perfil del usuario autenticado desde /api/v1/perfil (usa service role en servidor).
// Se usa en el cliente para decidir si se puede agregar al carrito o hay que pedir cuenta.
export function useSesion(): Estado {
  const [estado, setEstado] = useState<Estado>({ cargando: true, perfil: null });

  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      try {
        const res = await fetch('/api/v1/perfil');
        const data = res.ok ? await res.json() : null;
        if (vivo) setEstado({ cargando: false, perfil: data?.perfil ?? null });
      } catch {
        if (vivo) setEstado({ cargando: false, perfil: null });
      }
    };
    cargar();
    return () => { vivo = false; };
  }, []);

  return estado;
}
