import { connection } from 'next/server';
import { manejar } from '@/lib/http';
import { repo } from '@/lib/repositorio';

// GET /api/v1/calificaciones/:productorId  historial público de reputación del productor
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productorId: string }> },
) {
  await connection();
  const { productorId } = await params;
  return manejar(async () => ({ calificaciones: await repo().calificacionesPorProductor(productorId) }));
}
