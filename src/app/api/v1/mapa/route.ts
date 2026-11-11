import { connection } from 'next/server';
import { manejar } from '@/lib/http';
import { repo } from '@/lib/repositorio';

// GET /api/v1/mapa  productores y piezas por estado (CU-07, RF-08)
export async function GET() {
  // los conteos cambian con cada publicación, no se prerenderiza en el build
  await connection();
  return manejar(() => repo().conteoPorEstado());
}
