import Link from 'next/link';
import { Suspense } from 'react';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';

export const metadata = { title: 'Panel Productor' };
export const instant = false;

function Aviso({ titulo, mensaje, alerta }: { titulo: string; mensaje: string; alerta?: boolean }) {
  return (
    <div className="card">
      <h1 className="titulo mb-4">{titulo}</h1>
      <p className={alerta ? 'text-terciaria' : 'text-stone-600'}>{mensaje}</p>
    </div>
  );
}

async function ContenidoProductor() {
  const perfil = await perfilSesion();

  if (!perfil) {
    return <Aviso titulo="Panel Productor" mensaje="Inicia sesión para ver la información de tu taller." />;
  }

  if (perfil.rol !== 'productor') {
    return (
      <Aviso
        titulo="Panel Productor"
        mensaje={`Esta sección es exclusiva para productores. Tu rol actual es ${perfil.rol}.`}
      />
    );
  }

  let productor, piezas, pedidos;
  try {
    [productor, piezas, pedidos] = await Promise.all([
      repo().obtenerProductor(perfil.id),
      repo().catalogo({}),
      repo().pedidosPorProductor(perfil.id),
    ]);
  } catch {
    return (
      <Aviso
        titulo="Panel Productor"
        mensaje="No pudimos cargar la información de tu taller. Intenta recargar la página más tarde."
        alerta
      />
    );
  }

  const misPiezas = piezas.filter((p) => p.productor_id === perfil.id).length;
  const estado = productor?.estado_verificacion;
  const etiquetaEstado = !productor
    ? 'Perfil no registrado'
    : estado === 'aprobado'
      ? 'Verificado'
      : estado === 'rechazado'
        ? 'Rechazado'
        : 'Pendiente de verificación';
  const claseEstado = estado === 'aprobado'
    ? 'bg-green-100 text-secundaria'
    : 'bg-terciaria/10 text-terciaria';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="titulo">Hola, {perfil.nombreCompleto}</h1>
        <p className="mt-1 text-stone-600">Gestiona tu taller, publica piezas y revisa liquidaciones.</p>
      </div>

      <section className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label">Estado de verificación</p>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${claseEstado}`}>
            {etiquetaEstado}
          </span>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-2xl font-bold text-secundaria">{misPiezas}</p>
            <p className="text-sm text-stone-600">Piezas publicadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secundaria">{pedidos.length}</p>
            <p className="text-sm text-stone-600">Pedidos recibidos</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/productor/publicar" className="card hover:shadow-md transition">
          <h2 className="font-semibold text-secundaria">Publicar pieza</h2>
          <p className="mt-1 text-sm text-stone-600">Crea ficha de origen y sello QR</p>
        </Link>
        <Link href="/productor/piezas" className="card hover:shadow-md transition">
          <h2 className="font-semibold text-secundaria">Mis piezas</h2>
          <p className="mt-1 text-sm text-stone-600">Revisa estado, stock y ventas</p>
        </Link>
        <Link href="/productor/liquidaciones" className="card hover:shadow-md transition">
          <h2 className="font-semibold text-secundaria">Liquidaciones</h2>
          <p className="mt-1 text-sm text-stone-600">Comisiones 90/10 y retenciones</p>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardProductor() {
  return (
    <Suspense fallback={<div className="card text-stone-600">Cargando panel…</div>}>
      <ContenidoProductor />
    </Suspense>
  );
}
