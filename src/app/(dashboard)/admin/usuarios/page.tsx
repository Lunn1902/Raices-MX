import { Suspense } from 'react';
import AvisoAcceso from '@/components/AvisoAcceso';
import Badge from '@/components/Badge';
import Cargando from '@/components/Cargando';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';
import type { EstadoVerificacion } from '@/types';

function estatus(estado: EstadoVerificacion) {
  if (estado === 'aprobado') return { texto: 'Aprobado', tono: 'secundaria' as const };
  if (estado === 'pendiente') return { texto: 'Pendiente', tono: 'terciaria' as const };
  return { texto: 'Rechazado', tono: 'terciaria' as const };
}

export default function UsuariosAdmin() {
  return (
    <Suspense fallback={<Cargando etiqueta="Cargando productores…" />}>
      <ContenidoUsuarios />
    </Suspense>
  );
}

async function ContenidoUsuarios() {
  const perfil = await perfilSesion();
  if (!perfil || perfil.rol !== 'admin') {
    return (
      <AvisoAcceso
        titulo="Acceso de administrador"
        mensaje="Esta sección es exclusiva para administradores."
      />
    );
  }

  const [productores, indicadores] = await Promise.all([
    repo().listarProductores(),
    repo().indicadores(),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow-accent">Padrón de la plataforma</p>
        <h1 className="titulo mt-4">Usuarios y productores</h1>
        <p className="plomo mt-4 max-w-2xl">
          Consulta el padrón de productores y su estatus de verificación. Solo lectura.
        </p>
      </header>

      <section aria-label="Resumen de productores" className="grid gap-8 sm:grid-cols-3 sm:gap-12">
        <dl className="regla pt-8">
          <dd className="font-display text-4xl font-semibold leading-none text-terciaria sm:text-5xl">{indicadores.productores}</dd>
          <dt className="eyebrow mt-4">Productores</dt>
        </dl>
        <dl className="regla pt-8">
          <dd className="font-display text-4xl font-semibold leading-none text-terciaria sm:text-5xl">{indicadores.aprobados}</dd>
          <dt className="eyebrow mt-4">Aprobados</dt>
        </dl>
        <dl className="regla pt-8">
          <dd className="font-display text-4xl font-semibold leading-none text-terciaria sm:text-5xl">{indicadores.pendientes}</dd>
          <dt className="eyebrow mt-4">Pendientes</dt>
        </dl>
      </section>

      <section aria-label="Listado de productores">
        <p className="eyebrow mb-2">Directorio</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-secundaria/30">
                <th scope="col" className="eyebrow py-4 pr-4">Productor</th>
                <th scope="col" className="eyebrow px-4 py-4">Correo</th>
                <th scope="col" className="eyebrow px-4 py-4">Comunidad</th>
                <th scope="col" className="eyebrow px-4 py-4">Entidad</th>
                <th scope="col" className="eyebrow px-4 py-4">Estatus</th>
                <th scope="col" className="eyebrow py-4 pl-4">Taller</th>
              </tr>
            </thead>
            <tbody>
              {productores.map((p) => {
                const e = estatus(p.estado_verificacion);
                return (
                  <tr key={p.id} className="border-b border-secundaria/15">
                    <td className="py-5 pr-4 font-medium text-secundaria">{p.nombre_completo}</td>
                    <td className="px-4 py-5 text-tinta-clara">{p.correo}</td>
                    <td className="px-4 py-5">{p.comunidad}</td>
                    <td className="px-4 py-5">{p.estado}</td>
                    <td className="px-4 py-5"><Badge texto={e.texto} tono={e.tono} /></td>
                    <td className="py-5 pl-4">{p.nombre_taller}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {productores.length === 0 && (
            <p className="regla py-8 plomo">No hay productores registrados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
