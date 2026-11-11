import { manejar } from '@/lib/http';
import { comprar } from '@/modules/pedidos-b2c/servicio';

// POST /api/v1/pedidos  { items, direccion_entrega }  pago de prueba (CU-08 + CU-10)
export async function POST(req: Request) {
  return manejar(async () => comprar(await req.json()), 201);
}
