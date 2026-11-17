import Link from 'next/link';

export default function DashboardAdmin() {
  return (
    <div className="space-y-6">
      <h1 className="titulo">Panel Administrador</h1>
      <p className="text-stone-600">Modera la plataforma, revisa indicadores y gestiona usuarios.</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/usuarios" className="card hover:shadow-md transition">
          <h2 className="font-semibold text-secundaria">Usuarios</h2>
          <p className="text-sm text-stone-600 mt-1">Gestiona cuentas y roles</p>
        </Link>
        <Link href="/admin/reportes" className="card hover:shadow-md transition">
          <h2 className="font-semibold text-secundaria">Reportes</h2>
          <p className="text-sm text-stone-600 mt-1">Indicadores del piloto</p>
        </Link>
        <Link href="/admin/calificaciones" className="card hover:shadow-md transition">
          <h2 className="font-semibold text-secundaria">Calificaciones</h2>
          <p className="text-sm text-stone-600 mt-1">Modera reputación</p>
        </Link>
      </div>
    </div>
  );
}
