import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function DashboardAdmin() {
  const secciones = [
    {
      numero: '01',
      href: '/admin/usuarios',
      titulo: 'Usuarios',
      descripcion: 'Consulta el padrón de productores y su estatus de verificación.',
    },
    {
      numero: '02',
      href: '/admin/reportes',
      titulo: 'Reportes',
      descripcion: 'Indicadores del piloto e historial de reportes generados.',
    },
    {
      numero: '03',
      href: '/admin/calificaciones',
      titulo: 'Calificaciones',
      descripcion: 'Revisa la reputación de los talleres y modera comentarios.',
    },
    {
      numero: '04',
      href: '/admin/notificaciones',
      titulo: 'Notificaciones',
      descripcion: 'Avisos del sistema para tu cuenta de administrador.',
    },
    {
      numero: '05',
      href: '/promotor',
      titulo: 'Verificación de artesanos',
      descripcion: 'Aprueba o rechaza los registros pendientes tras visitar el domicilio del artesano.',
    },
  ];

  return (
    <div className="space-y-12">
      <header>
        <p className="eyebrow-accent">Panel de control</p>
        <h1 className="titulo mt-4">Panel Administrador</h1>
        <p className="plomo mt-4 max-w-2xl">Modera la plataforma, revisa indicadores y gestiona usuarios.</p>
      </header>

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
