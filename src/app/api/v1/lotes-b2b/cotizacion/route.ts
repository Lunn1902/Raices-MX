import { manejar } from '@/lib/http';
import { cotizarLote } from '@/modules/lotes-b2b/servicio';

// GET /api/v1/lotes-b2b/cotizacion?cantidad=30&precio=1500  (base para CU-09)
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  return manejar(async () => cotizarLote(Number(p.get('cantidad')), Number(p.get('precio'))));
}
