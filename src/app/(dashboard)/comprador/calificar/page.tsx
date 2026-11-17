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
    <div className="py-10">
      <header>
        <p className="eyebrow-accent">Tu opinión</p>
        <h1 className="titulo mt-3">Calificar pedidos</h1>
        <p className="plomo mt-4 max-w-2xl">
          Comparte tu experiencia con los productores de tus piezas.
        </p>
        <div className="regla-accent mt-6" />
      </header>

      {pedidos.length === 0 ? (
        <div className="mx-auto max-w-lg py-14 text-center">
          <p className="plomo">Todavía no tienes pedidos que calificar.</p>
          <Link href="/catalogo" className="btn mt-6">Explorar el catálogo</Link>
        </div>
      ) : (
        <div className="grid gap-8 pt-2 md:grid-cols-2">
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
