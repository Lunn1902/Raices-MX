import { z } from 'zod';
import { connection } from 'next/server';
import { ErrorNegocio, manejar } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';
import type { Reporte } from '@/types';

const esquemaReporte = z.object({
  tipo: z.enum(['ventas', 'productores', 'comisiones', 'auditoria', 'inventario']),
  formato: z.enum(['csv', 'pdf', 'xlsx']),
});

async function exigirAdmin() {
  const perfil = await perfilSesion();
  if (!perfil) throw new ErrorNegocio(401, 'Inicia sesión para ver reportes');
  if (perfil.rol !== 'admin') throw new ErrorNegocio(403, 'Solo los administradores pueden ver reportes');
  return perfil;
}

// GET /api/v1/admin/reportes  solicitudes de exportación registradas
export async function GET() {
  await connection();
  return manejar(async () => {
    await exigirAdmin();
    return { reportes: await repo().reportes() };
  });
}

// POST /api/v1/admin/reportes  { tipo, formato }  nueva solicitud de reporte
export async function POST(req: Request) {
  return manejar(async () => {
    const perfil = await exigirAdmin();
    const datos = esquemaReporte.parse(await req.json());
    const reporte = await repo().crearReporte({
      generadoPor: perfil.id,
      tipo: datos.tipo as Reporte['tipo'],
      formato: datos.formato as Reporte['formato'],
    });
    return { reporte };
  }, 201);
}
