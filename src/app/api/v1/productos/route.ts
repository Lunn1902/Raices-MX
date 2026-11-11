import { ipOrigen, manejar } from '@/lib/http';
import { buscarCatalogo, publicarPieza } from '@/modules/catalogo/servicio';
import { leerFiltros } from '@/modules/catalogo/filtros';

// GET /api/v1/productos?q=&categoria=&estado=&pueblo=&tecnica=&min=&max=  (CU-07)
export async function GET(req: Request) {
  return manejar(() => buscarCatalogo(leerFiltros(new URL(req.url).searchParams)));
}

// POST /api/v1/productos  multipart/form-data con los 9 campos y la foto (CU-04 + CU-05)
export async function POST(req: Request) {
  return manejar(async () => publicarPieza(await req.formData(), ipOrigen(req)), 201);
}
