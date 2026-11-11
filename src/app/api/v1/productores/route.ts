import { ipOrigen, manejar } from '@/lib/http';
import { listarProductores, registrarProductor } from '@/modules/usuarios/servicio';
import type { EstadoVerificacion } from '@/types';

const ESTADOS: EstadoVerificacion[] = ['pendiente', 'aprobado', 'rechazado'];

// GET /api/v1/productores?estado=pendiente
export async function GET(req: Request) {
  const estado = new URL(req.url).searchParams.get('estado') as EstadoVerificacion | null;
  return manejar(() => listarProductores(estado && ESTADOS.includes(estado) ? estado : undefined));
}

// POST /api/v1/productores  (CU-01 registro)
export async function POST(req: Request) {
  return manejar(async () => registrarProductor(await req.json(), ipOrigen(req)), 201);
}
