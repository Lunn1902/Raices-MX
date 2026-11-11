import { ipOrigen, manejar } from '@/lib/http';
import { verificarProductor } from '@/modules/usuarios/servicio';

// PATCH /api/v1/productores/:id/verificacion  { estado: 'aprobado' | 'rechazado', observaciones? }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return manejar(async () => verificarProductor(id, await req.json(), ipOrigen(req)));
}
