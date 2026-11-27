import { ErrorNegocio, ipOrigen, manejar } from '@/lib/http';
import { perfilSesion } from '@/lib/supabase/sesion';
import { buscarCatalogo, publicarPieza } from '@/modules/catalogo/servicio';
import { leerFiltros } from '@/modules/catalogo/filtros';

// GET /api/v1/productos?q=&categoria=&estado=&pueblo=&tecnica=&min=&max=  (CU-07)
export async function GET(req: Request) {
  return manejar(() => buscarCatalogo(leerFiltros(new URL(req.url).searchParams)));
}

// POST /api/v1/productos  multipart/form-data con los 9 campos y la foto (CU-04 + CU-05)
// Solo publica el productor con sesión iniciada y siempre a su propio nombre:
// el productor_id que mande el navegador se ignora y se toma el de la sesión.
export async function POST(req: Request) {
  return manejar(async () => {
    const perfil = await perfilSesion();
    if (!perfil) throw new ErrorNegocio(401, 'Inicia sesión como productor para publicar');
    if (perfil.rol !== 'productor') throw new ErrorNegocio(403, 'Solo una cuenta de productor puede publicar piezas');

    const form = await req.formData().catch(() => {
      throw new ErrorNegocio(422, 'Faltan datos obligatorios de la ficha de origen');
    });
    form.set('productor_id', perfil.id);
    return publicarPieza(form, ipOrigen(req));
  }, 201);
}
