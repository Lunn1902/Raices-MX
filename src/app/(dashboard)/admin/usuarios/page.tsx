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
    <div className="space-y-6">
      <header>
        <h1 className="titulo">Usuarios y productores</h1>
        <p className="mt-1 text-stone-600">
          Consulta el padrón de productores y su estatus de verificación. Solo lectura.
        </p>
      </header>

      <section aria-label="Resumen de productores" className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-stone-600">Productores</p>
          <p className="mt-1 text-2xl font-semibold text-secundaria">{indicadores.productores}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone-600">Aprobados</p>
          <p className="mt-1 text-2xl font-semibold text-secundaria">{indicadores.aprobados}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone-600">Pendientes</p>
          <p className="mt-1 text-2xl font-semibold text-terciaria">{indicadores.pendientes}</p>
        </div>
      </section>

      <section className="card overflow-x-auto" aria-label="Listado de productores">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-600">
              <th scope="col" className="p-4 font-medium">Productor</th>
              <th scope="col" className="p-4 font-medium">Correo</th>
              <th scope="col" className="p-4 font-medium">Comunidad</th>
              <th scope="col" className="p-4 font-medium">Entidad</th>
              <th scope="col" className="p-4 font-medium">Estatus</th>
              <th scope="col" className="p-4 font-medium">Taller</th>
            </tr>
          </thead>
          <tbody>
            {productores.map((p) => {
              const e = estatus(p.estado_verificacion);
              return (
                <tr key={p.id} className="border-b border-stone-200 last:border-0">
                  <td className="p-4 font-medium">{p.nombre_completo}</td>
                  <td className="p-4 text-stone-600">{p.correo}</td>
                  <td className="p-4">{p.comunidad}</td>
                  <td className="p-4">{p.estado}</td>
                  <td className="p-4"><Badge texto={e.texto} tono={e.tono} /></td>
                  <td className="p-4">{p.nombre_taller}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {productores.length === 0 && (
          <p className="border-t border-stone-200 p-4 text-stone-600">No hay productores registrados.</p>
        )}
      </section>
    </div>
  );
}
