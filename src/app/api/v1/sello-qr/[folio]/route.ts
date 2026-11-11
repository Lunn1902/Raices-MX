import { manejar } from '@/lib/http';
import { verificarFolio } from '@/modules/sello-qr/servicio';

// GET /api/v1/sello-qr/:folio?sig=  (CU-06, público y sin sesión)
export async function GET(req: Request, { params }: { params: Promise<{ folio: string }> }) {
  const { folio } = await params;
  return manejar(() => verificarFolio(decodeURIComponent(folio), new URL(req.url).searchParams.get('sig')));
}
