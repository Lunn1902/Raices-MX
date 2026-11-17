import { Suspense } from 'react';
import Link from 'next/link';
import AvisoAcceso from '@/components/AvisoAcceso';
import Cargando from '@/components/Cargando';
import FormularioCalificacion from '@/components/FormularioCalificacion';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';

export default function CalificarComprador() {
  return (
    <Suspense fallback={<Cargando etiqueta="Cargando pedidos…" />}>
      <ContenidoCalificar />
    </Suspense>
  );
}

async function ContenidoCalificar() {
  const perfil = await perfilSesion();
  if (!perfil) {
    return (
      <AvisoAcceso
        titulo="Inicia sesión"
        mensaje="Inicia sesión para calificar tus pedidos."
        href="/login"
        etiqueta="Iniciar sesión"
      />
    );
  }

  const pedidos = await repo().pedidosPorComprador(perfil.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="titulo">Calificar pedidos</h1>
        <p className="mt-1 text-stone-600">
          Comparte tu experiencia con los productores de tus piezas.
        </p>
      </header>

      {pedidos.length === 0 ? (
        <div className="card mx-auto max-w-lg space-y-3 text-center">
          <p className="text-stone-600">Todavía no tienes pedidos que calificar.</p>
          <Link href="/catalogo" className="btn">Explorar el catálogo</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pedidos.map((p) => (
            <FormularioCalificacion
              key={p.id}
              pedidoId={p.id}
              productorId={p.productor_id}
              nombreProductor={p.nombre_productor}
              folio={p.folio_pedido}
            />
          ))}
        </div>
      )}
    </div>
  );
}
