import { z } from 'zod';
import { ErrorNegocio, manejar } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';
import { cotizarLoteB2B } from '@/modules/lotes-b2b/servicio';

const esquemaLote = z.object({
  productoId: z.string().min(1),
  productorId: z.string().min(1),
  cantidad: z.number().int().min(5).max(50),
  precioUnitario: z.number().positive(),
  direccion: z.string().min(1),
  plazoDias: z.number().int().positive().optional(),
  condiciones: z.string().optional(),
});

// POST /api/v1/lotes-b2b  (CU-09) lote de 5 a 50 piezas con contrato 30/70
export async function POST(req: Request) {
  return manejar(async () => {
    const perfil = await perfilSesion();
    if (!perfil) throw new ErrorNegocio(401, 'Inicia sesión para pedir un lote');
    if (perfil.rol !== 'comprador_b2b') {
      throw new ErrorNegocio(403, 'Solo los compradores B2B pueden pedir lotes');
    }

    const datos = esquemaLote.parse(await req.json());
    const cotizacion = cotizarLoteB2B(datos.cantidad, datos.precioUnitario);
    const { pedido, contrato } = await repo().crearPedidoB2B({
      compradorId: perfil.id,
      productorId: datos.productorId,
      productoId: datos.productoId,
      cantidad: datos.cantidad,
      precioUnitario: datos.precioUnitario,
      descuento: cotizacion.porcentajeDescuento,
      subtotal: cotizacion.precioBase,
      total: cotizacion.total,
      anticipo30: cotizacion.anticipo30,
      saldo70: cotizacion.saldo70,
      comision: cotizacion.comisionPlataforma,
      direccion: datos.direccion,
      plazoDias: datos.plazoDias ?? 30,
      condiciones:
        datos.condiciones ??
        'Piezas artesanales con acabado y estándares de calidad acordados entre las partes.',
    });
    return { pedido, contrato, cotizacion };
  }, 201);
}
