import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';

export const metadata = { title: 'Panel Productor' };
export const instant = false;

function Aviso({ titulo, mensaje }: { titulo: string; mensaje: string }) {
  return (
    <div className="regla py-10">
      <p className="eyebrow-accent">Panel productor</p>
      <h1 className="titulo mt-3">{titulo}</h1>
      <p className="plomo mt-4 max-w-xl">{mensaje}</p>
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
        mensaje="Esta sección es exclusiva para productores. Tu cuenta no tiene acceso a este espacio."
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
  const verificado = estado === 'aprobado';

  const secciones = [
    {
      numero: '01',
      href: '/productor/publicar',
      titulo: 'Publicar pieza',
      descripcion: 'Crea la ficha de origen y genera el sello QR de tu pieza.',
    },
    {
      numero: '02',
      href: '/productor/piezas',
      titulo: 'Mis piezas',
      descripcion: 'Revisa el estado, las existencias y las ventas de tu catálogo.',
    },
    {
      numero: '03',
      href: '/productor/liquidaciones',
      titulo: 'Liquidaciones',
      descripcion: 'Consulta comisiones, retenciones y pagos de tus ventas.',
    },
  ];

  return (
    <div className="space-y-12">
      <header>
        <p className="eyebrow-accent">Tu espacio de trabajo</p>
        <h1 className="titulo mt-4">Hola, {perfil.nombreCompleto}</h1>
        <p className="plomo mt-4 max-w-2xl">Gestiona tu taller, publica piezas y revisa liquidaciones.</p>
      </header>

      <section aria-label="Resumen del taller" className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="regla pt-8">
          <p className="eyebrow">Estado de verificación</p>
          <span
            className={`mt-4 inline-flex items-center gap-2 border-l-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
              verificado ? 'border-secundaria text-secundaria' : 'border-terciaria text-terciaria'
            }`}
          >
            {verificado && <span className="size-1.5 bg-secundaria" aria-hidden="true" />}
            {etiquetaEstado}
          </span>
        </div>

        <dl className="flex gap-10 sm:gap-14">
          <div>
            <dd className="font-display text-5xl font-semibold leading-none text-terciaria sm:text-6xl">{misPiezas}</dd>
            <dt className="eyebrow mt-3">Piezas publicadas</dt>
          </div>
          <div>
            <dd className="font-display text-5xl font-semibold leading-none text-terciaria sm:text-6xl">{pedidos.length}</dd>
            <dt className="eyebrow mt-3">Pedidos recibidos</dt>
          </div>
        </dl>
      </section>

      <section aria-label="Secciones del panel">
        <p className="eyebrow mb-2">Explora tu panel</p>
        <div>
          {secciones.map((seccion) => (
            <Link
              key={seccion.href}
              href={seccion.href}
              className="regla group flex items-center justify-between gap-6 py-7"
            >
              <div className="flex items-start gap-5 sm:gap-8">
                <span className="eyebrow-accent pt-2">{seccion.numero}</span>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-secundaria transition-colors group-hover:text-terciaria sm:text-3xl">
                    {seccion.titulo}
                  </h2>
                  <p className="plomo mt-2 max-w-xl text-sm sm:text-base">{seccion.descripcion}</p>
                </div>
              </div>
              <ArrowRight
                className="size-6 shrink-0 text-terciaria transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function DashboardProductor() {
  return (
    <Suspense fallback={<div className="regla py-10 plomo">Cargando panel…</div>}>
      <ContenidoProductor />
    </Suspense>
  );
}
