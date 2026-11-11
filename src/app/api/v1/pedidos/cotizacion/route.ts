import { manejar } from '@/lib/http';
import { cotizar } from '@/modules/pedidos-b2c/servicio';

// POST /api/v1/pedidos/cotizacion  { items }  desglose 90/10 antes de pagar (CU-08)
export async function POST(req: Request) {
  return manejar(async () => cotizar(await req.json()));
}
