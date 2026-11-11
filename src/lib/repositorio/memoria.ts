import { secretoHmac } from '@/lib/config';
import { ErrorNegocio } from '@/lib/http';
import { filtrarPiezas } from '@/modules/catalogo/filtros';
import { calcularDesgloseB2C } from '@/modules/comisiones/calculo';
import { agregarPorEstado } from '@/modules/mapa/agregacion';
import { firmar } from '@/modules/sello-qr/firma';
import type { EventoBitacora, FichaOrigen, PedidoCreado, PiezaCatalogo, Producto, Productor, SelloOriginalidad } from '@/types';
import { PIEZAS, PRODUCTORES } from './semilla';
import type { Repositorio } from './tipos';

// Modo demo: los datos viven en memoria del proceso y se reinician al reiniciar el servidor

interface Estado {
  productores: Productor[];
  productos: Producto[];
  fichas: FichaOrigen[];
  sellos: SelloOriginalidad[];
  pedidos: PedidoCreado[];
  bitacora: (EventoBitacora & { id: number; fecha: string })[];
}

function crearEstado(): Estado {
  const secreto = secretoHmac();
  return {
    productores: structuredClone(PRODUCTORES),
    productos: PIEZAS.map((p) => structuredClone(p.producto)),
    fichas: PIEZAS.map((p) => structuredClone(p.ficha)),
    // las firmas de la semilla se calculan al arrancar con el secreto configurado
    sellos: PIEZAS.map((p) => ({
      id: p.sello_id,
      ficha_origen_id: p.ficha.id,
      folio_unico: p.folio,
      firma_hmac: firmar(
        {
          folio: p.folio, productoId: p.producto.id, productorId: p.producto.productor_id,
          comunidad: p.ficha.comunidad, puebloOriginario: p.ficha.pueblo_originario, tecnica: p.ficha.tecnica,
        },
        secreto,
      ),
      activo: true,
      fecha_emision: p.producto.created_at,
    })),
    pedidos: [],
    bitacora: [],
  };
}

// globalThis evita que el estado se pierda con el recargado en caliente de Next
const g = globalThis as unknown as { __raicesmxDemo?: Estado };
const db = () => (g.__raicesmxDemo ??= crearEstado());

function vistaCatalogo(): PiezaCatalogo[] {
  const { productos, fichas, sellos, productores } = db();
  return productos.flatMap((p) => {
    const ficha = fichas.find((f) => f.producto_id === p.id);
    const productor = productores.find((x) => x.id === p.productor_id);
    if (!ficha || !p.activo || p.stock <= 0 || productor?.estado_verificacion !== 'aprobado') return [];
    const sello = sellos.find((s) => s.ficha_origen_id === ficha.id && s.activo);
    return [{
      id: p.id, productor_id: p.productor_id, nombre: p.nombre, descripcion: p.descripcion, categoria: p.categoria,
      precio_unitario: p.precio_unitario, stock: p.stock, created_at: p.created_at, ficha_id: ficha.id,
      nombre_productor: ficha.nombre_productor, comunidad: ficha.comunidad, estado: ficha.estado,
      pueblo_originario: ficha.pueblo_originario, tecnica: ficha.tecnica, materiales: ficha.materiales,
      tiempo_elaboracion: ficha.tiempo_elaboracion, fotografias_urls: ficha.fotografias_urls,
      historia_pieza: ficha.historia_pieza, folio_unico: sello?.folio_unico ?? null,
    }];
  });
}

export const repositorioMemoria: Repositorio = {
  modo: 'demo',

  async crearProductor(p) {
    db().productores.push(p);
    return p;
  },

  async listarProductores(estado) {
    return db().productores.filter((p) => !estado || p.estado_verificacion === estado);
  },

  async obtenerProductor(id) {
    return db().productores.find((p) => p.id === id) ?? null;
  },

  async existeCorreo(correo) {
    return db().productores.some((p) => p.correo.toLowerCase() === correo.toLowerCase());
  },

  async registrarVerificacion(productorId, _promotorId, estado) {
    const p = db().productores.find((x) => x.id === productorId);
    if (!p) throw new ErrorNegocio(404, 'Productor no encontrado');
    p.estado_verificacion = estado;
    return p;
  },

  async subirFoto(_ruta, foto) {
    const base64 = Buffer.from(await foto.arrayBuffer()).toString('base64');
    return `data:${foto.type};base64,${base64}`;
  },

  async guardarPieza({ producto, ficha, sello }) {
    const s = db();
    s.productos.push(producto);
    s.fichas.push(ficha);
    s.sellos.push(sello);
  },

  async catalogo(f) {
    return filtrarPiezas(vistaCatalogo(), f).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async piezasPorId(ids) {
    return vistaCatalogo().filter((p) => ids.includes(p.id));
  },

  async buscarSello(folio) {
    const s = db();
    const sello = s.sellos.find((x) => x.folio_unico === folio);
    const ficha = sello && s.fichas.find((f) => f.id === sello.ficha_origen_id);
    const producto = ficha && s.productos.find((p) => p.id === ficha.producto_id);
    const productor = producto && s.productores.find((p) => p.id === producto.productor_id);
    if (!sello || !ficha || !producto || !productor) return null;
    return { sello, ficha, producto, productor };
  },

  async conteoPorEstado() {
    return agregarPorEstado(db().productores, vistaCatalogo());
  },

  // Equivalente a crear_pedidos_b2c(): Node atiende una petición a la vez sobre este
  // estado, así que validar todo antes de descontar cumple el mismo papel que FOR UPDATE.
  async crearPedidosB2C(compradorId, direccion, items, envio) {
    const s = db();
    const lineas = items.map((i) => {
      const producto = s.productos.find((p) => p.id === i.producto_id);
      if (!producto || !producto.activo || producto.stock < i.cantidad) throw new ErrorNegocio(409, 'STOCK_INSUFICIENTE');
      return { producto, cantidad: i.cantidad };
    });

    const porProductor = Map.groupBy(lineas, (l) => l.producto.productor_id);
    const creados: PedidoCreado[] = [];
    for (const [productorId, grupo] of porProductor) {
      const subtotal = grupo.reduce((acc, l) => acc + l.producto.precio_unitario * l.cantidad, 0);
      const d = calcularDesgloseB2C(subtotal, envio);
      grupo.forEach((l) => (l.producto.stock -= l.cantidad));
      const pedidoId = crypto.randomUUID();
      const pedido: PedidoCreado = {
        pedido_id: pedidoId,
        folio_pedido: `PED-${new Date().getFullYear()}-${pedidoId.slice(0, 8).toUpperCase()}`,
        productor_id: productorId,
        cantidad_total: grupo.reduce((acc, l) => acc + l.cantidad, 0),
        subtotal: d.subtotal,
        monto_productor: d.montoProductor,
        monto_comision: d.comisionPlataforma,
        costo_envio: d.costoEnvio,
        total: d.total,
      };
      s.pedidos.push(pedido);
      await this.registrarBitacora({
        usuario_id: compradorId, rol: 'comprador_b2c', accion: 'crear_pedido_b2c', entidad: 'pedidos',
        entidad_id: pedidoId, valor_nuevo: { folio: pedido.folio_pedido, direccion, subtotal: d.subtotal },
      });
      creados.push(pedido);
    }
    return creados;
  },

  async registrarBitacora(e) {
    const b = db().bitacora;
    // solo se agrega, nunca se modifica (RNF-13)
    b.push(Object.freeze({ ...e, id: b.length + 1, fecha: new Date().toISOString() }));
  },
};
