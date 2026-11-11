import { USUARIOS_DEMO } from '@/lib/config';
import { ErrorNegocio } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { esquemaCarrito, esquemaCompra } from '@/lib/validadores';
import { calcularDesgloseB2C, ENVIO_B2C_POR_PEDIDO, type DesgloseB2C } from '@/modules/comisiones/calculo';
import type { ItemCarrito } from '@/types';

// Junta cantidades repetidas del mismo producto para que la función SQL reciba una línea por pieza
const consolidar = (items: ItemCarrito[]) =>
  [...Map.groupBy(items, (i) => i.producto_id)].map(([producto_id, xs]) => ({
    producto_id,
    cantidad: xs.reduce((a, x) => a + x.cantidad, 0),
  }));

export interface Cotizacion {
  pedidos: (DesgloseB2C & { productor_id: string; nombre_productor: string; piezas: { nombre: string; cantidad: number; precio: number }[] })[];
  totales: DesgloseB2C;
}

// CU-08: el desglose siempre se calcula con precios de la base, nunca con lo que mande el cliente
export async function cotizar(entrada: unknown): Promise<Cotizacion> {
  const items = consolidar(esquemaCarrito.parse(entrada).items);
  const piezas = await repo().piezasPorId(items.map((i) => i.producto_id));

  const lineas = items.map((i) => {
    const pieza = piezas.find((p) => p.id === i.producto_id);
    if (!pieza) throw new ErrorNegocio(409, 'Una de las piezas ya no está disponible');
    if (pieza.stock < i.cantidad) throw new ErrorNegocio(409, `Solo quedan ${pieza.stock} de "${pieza.nombre}"`);
    return { pieza, cantidad: i.cantidad };
  });

  // un pedido por productor, cada uno con su envío
  const pedidos = [...Map.groupBy(lineas, (l) => l.pieza.productor_id)].map(([productorId, grupo]) => ({
    ...calcularDesgloseB2C(grupo.reduce((a, l) => a + l.pieza.precio_unitario * l.cantidad, 0), ENVIO_B2C_POR_PEDIDO),
    productor_id: productorId,
    nombre_productor: grupo[0].pieza.nombre_productor,
    piezas: grupo.map((l) => ({ nombre: l.pieza.nombre, cantidad: l.cantidad, precio: l.pieza.precio_unitario })),
  }));

  const suma = (k: keyof DesgloseB2C) => Math.round(pedidos.reduce((a, p) => a + p[k] * 100, 0)) / 100;
  return {
    pedidos,
    totales: {
      subtotal: suma('subtotal'),
      montoProductor: suma('montoProductor'),
      comisionPlataforma: suma('comisionPlataforma'),
      costoEnvio: suma('costoEnvio'),
      total: suma('total'),
    },
  };
}

export async function comprar(entrada: unknown) {
  const datos = esquemaCompra.parse(entrada);
  const cotizacion = await cotizar(datos);
  try {
    const pedidos = await repo().crearPedidosB2C(
      USUARIOS_DEMO.comprador,
      datos.direccion_entrega,
      consolidar(datos.items),
      ENVIO_B2C_POR_PEDIDO,
    );
    return { pedidos, totales: cotizacion.totales };
  } catch (e) {
    if (e instanceof ErrorNegocio && e.message === 'STOCK_INSUFICIENTE') {
      throw new ErrorNegocio(409, 'Otra persona compró la última pieza antes que tú. Revisa tu carrito.');
    }
    throw e;
  }
}
