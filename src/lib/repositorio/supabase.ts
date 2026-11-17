import { ErrorNegocio } from '@/lib/http';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { normalizar } from '@/modules/catalogo/filtros';
import type {
  Calificacion, FichaOrigen, Liquidacion, Notificacion, PedidoResumen, PiezaCatalogo,
  Producto, Productor, Reporte, SelloOriginalidad,
} from '@/types';
import type { Repositorio } from './tipos';

const sb = () => supabaseServidor();

const PRODUCTOR_SELECT =
  'usuario_id, nombre_taller, identificacion_oficial, comunidad, estado, direccion, referencias_direccion, latitud, longitud, pueblo_originario, tecnica_principal, estado_verificacion, created_at, usuarios(nombre_completo, correo, telefono)';

interface FilaProductor {
  usuario_id: string;
  nombre_taller: string;
  identificacion_oficial: string;
  comunidad: string;
  estado: string;
  direccion: string;
  referencias_direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  pueblo_originario: string;
  tecnica_principal: string;
  estado_verificacion: Productor['estado_verificacion'];
  created_at: string;
  usuarios: { nombre_completo: string; correo: string; telefono: string | null } | null;
}

const aProductor = ({ usuario_id, usuarios, ...r }: FilaProductor): Productor => ({
  ...r,
  id: usuario_id,
  nombre_completo: usuarios?.nombre_completo ?? '',
  correo: usuarios?.correo ?? '',
  telefono: usuarios?.telefono ?? null,
});

// numeric de Postgres puede llegar como string según el driver; se normaliza aquí
const aPieza = (r: PiezaCatalogo): PiezaCatalogo => ({ ...r, precio_unitario: Number(r.precio_unitario) });

// la columna busqueda solo sirve para filtrar, por eso no se pide
const COLUMNAS_CATALOGO =
  'id, productor_id, nombre, descripcion, categoria, precio_unitario, stock, created_at, ficha_id, nombre_productor, comunidad, estado, pueblo_originario, tecnica, materiales, tiempo_elaboracion, fotografias_urls, historia_pieza, folio_unico';

function fallo(error: { message: string; code?: string } | null, contexto: string): asserts error is null {
  if (error) throw new Error(`${contexto}: ${error.message}`);
}

// Quita caracteres que rompen la sintaxis de filtros de PostgREST
const limpiarTexto = (q: string) => q.replace(/[,()%*\\]/g, ' ').trim();

export const repositorioSupabase: Repositorio = {
  modo: 'supabase',

  async crearProductor(p) {
    const { error: e1 } = await sb().from('usuarios').insert({
      id: p.id, correo: p.correo, nombre_completo: p.nombre_completo, telefono: p.telefono, rol: 'productor',
    });
    fallo(e1, 'Registro de usuario');
    const { error: e2 } = await sb().from('perfiles_productor').insert({
      usuario_id: p.id, nombre_taller: p.nombre_taller, identificacion_oficial: p.identificacion_oficial,
      comunidad: p.comunidad, estado: p.estado, direccion: p.direccion,
      referencias_direccion: p.referencias_direccion ?? null, pueblo_originario: p.pueblo_originario,
      tecnica_principal: p.tecnica_principal, estado_verificacion: 'pendiente',
    });
    if (e2) {
      // compensación: sin perfil no debe quedar un usuario huérfano
      await sb().from('usuarios').delete().eq('id', p.id);
      fallo(e2, 'Registro de perfil');
    }
    return p;
  },

  async listarProductores(estado) {
    let q = sb().from('perfiles_productor').select(PRODUCTOR_SELECT).order('created_at', { ascending: false });
    if (estado) q = q.eq('estado_verificacion', estado);
    const { data, error } = await q.returns<FilaProductor[]>();
    fallo(error, 'Listado de productores');
    return (data ?? []).map(aProductor);
  },

  async obtenerProductor(id) {
    const { data, error } = await sb().from('perfiles_productor').select(PRODUCTOR_SELECT).eq('usuario_id', id).returns<FilaProductor[]>().maybeSingle();
    fallo(error, 'Consulta de productor');
    return data ? aProductor(data) : null;
  },

  async existeCorreo(correo) {
    const { count, error } = await sb().from('usuarios').select('id', { count: 'exact', head: true }).ilike('correo', correo);
    fallo(error, 'Consulta de correo');
    return (count ?? 0) > 0;
  },

  async registrarVerificacion(productorId, promotorId, datos) {
    const { error: e1 } = await sb().from('verificaciones_productor').insert({
      productor_id: productorId, promotor_id: promotorId, estado: datos.estado,
      observaciones: datos.observaciones ?? null,
      visita_realizada: datos.visita_realizada,
      fecha_visita: datos.visita_realizada ? datos.fecha_visita ?? new Date().toISOString() : null,
      latitud_visita: datos.latitud_visita ?? null,
      longitud_visita: datos.longitud_visita ?? null,
    });
    fallo(e1, 'Registro de verificación');
    const { error: e2 } = await sb().from('perfiles_productor').update({ estado_verificacion: datos.estado }).eq('usuario_id', productorId);
    fallo(e2, 'Actualización de verificación');
    const p = await this.obtenerProductor(productorId);
    if (!p) throw new ErrorNegocio(404, 'Productor no encontrado');
    return p;
  },

  async subirFoto(ruta, foto) {
    const { error } = await sb().storage.from('fotos-piezas').upload(ruta, foto, { contentType: foto.type });
    fallo(error, 'Subida de fotografía');
    return sb().storage.from('fotos-piezas').getPublicUrl(ruta).data.publicUrl;
  },

  async guardarPieza({ producto, ficha, sello, capturadoPor }) {
    const { error: e1 } = await sb().from('productos').insert({
      id: producto.id, productor_id: producto.productor_id, nombre: producto.nombre, descripcion: producto.descripcion,
      categoria: producto.categoria, precio_unitario: producto.precio_unitario, stock: producto.stock,
    });
    fallo(e1, 'Alta de producto');
    try {
      const { error: e2 } = await sb().from('fichas_origen').insert({ ...ficha, capturado_por: capturadoPor });
      fallo(e2, 'Alta de ficha de origen');
      const { error: e3 } = await sb().from('sellos_originalidad').insert({
        id: sello.id, ficha_origen_id: sello.ficha_origen_id, folio_unico: sello.folio_unico,
        firma_hmac: sello.firma_hmac, qr_png_url: `/api/v1/sello-qr/${sello.folio_unico}/png`,
      });
      fallo(e3, 'Emisión de sello');
    } catch (e) {
      // el borrado del producto arrastra ficha y sello por ON DELETE CASCADE
      await sb().from('productos').delete().eq('id', producto.id);
      throw e;
    }
  },

  async catalogo(f) {
    let q = sb().from('vista_catalogo').select(COLUMNAS_CATALOGO).order('created_at', { ascending: false });
    if (f.categoria) q = q.eq('categoria', f.categoria);
    if (f.estado) q = q.eq('estado', f.estado);
    if (f.pueblo) q = q.ilike('pueblo_originario', f.pueblo);
    if (f.tecnica) q = q.ilike('tecnica', f.tecnica);
    if (f.precioMin !== undefined) q = q.gte('precio_unitario', f.precioMin);
    if (f.precioMax !== undefined) q = q.lte('precio_unitario', f.precioMax);
    // la columna busqueda ya viene sin acentos y en minúsculas (migración 002)
    const texto = f.q ? normalizar(limpiarTexto(f.q)) : '';
    if (texto) q = q.ilike('busqueda', `%${texto}%`);
    const { data, error } = await q.returns<PiezaCatalogo[]>();
    fallo(error, 'Catálogo');
    return (data ?? []).map(aPieza);
  },

  async piezasPorId(ids) {
    const { data, error } = await sb().from('vista_catalogo').select(COLUMNAS_CATALOGO).in('id', ids).returns<PiezaCatalogo[]>();
    fallo(error, 'Piezas del carrito');
    return (data ?? []).map(aPieza);
  },

  async buscarSello(folio) {
    const { data, error } = await sb()
      .from('sellos_originalidad')
      .select('id, ficha_origen_id, folio_unico, firma_hmac, activo, fecha_emision, fichas_origen(*, productos(*))')
      .eq('folio_unico', folio)
      .maybeSingle();
    fallo(error, 'Consulta de sello');
    if (!data) return null;
    const { fichas_origen, ...sello } = data as unknown as SelloOriginalidad & {
      fichas_origen: FichaOrigen & { productos: Producto };
    };
    const { productos: producto, ...ficha } = fichas_origen;
    const productor = await this.obtenerProductor(producto.productor_id);
    if (!productor) return null;
    return {
      sello,
      ficha: { ...ficha, precio_registrado: Number(ficha.precio_registrado) },
      producto: { ...producto, precio_unitario: Number(producto.precio_unitario) },
      productor,
    };
  },

  async conteoPorEstado() {
    const { data, error } = await sb().from('vista_mapa_procedencia').select('*').order('piezas', { ascending: false });
    fallo(error, 'Mapa de procedencia');
    return data ?? [];
  },

  async crearPedidosB2C(compradorId, direccion, items, envio) {
    const { data, error } = await sb().rpc('crear_pedidos_b2c', {
      p_comprador_id: compradorId, p_direccion: direccion, p_items: items, p_costo_envio: envio,
    });
    if (error?.message.includes('STOCK_INSUFICIENTE')) throw new ErrorNegocio(409, 'STOCK_INSUFICIENTE');
    fallo(error, 'No se pudo completar la compra');
    return data;
  },

  async registrarBitacora(e) {
    const { error } = await sb().from('bitacora_auditoria').insert({
      usuario_id: e.usuario_id, rol: e.rol, accion: e.accion, entidad: e.entidad, entidad_id: e.entidad_id,
      ip_origen: e.ip_origen ?? null, valor_anterior: e.valor_anterior ?? null, valor_nuevo: e.valor_nuevo ?? null,
    });
    fallo(error, 'Bitácora');
  },

  async pedidosPorComprador(compradorId) {
    const { data, error } = await sb()
      .from('pedidos')
      .select('id, folio_pedido, tipo, productor_id, estado, cantidad_total, subtotal, total, created_at, productor:perfiles_productor(usuario_id, nombre_taller, usuarios(nombre_completo))')
      .eq('comprador_id', compradorId)
      .order('created_at', { ascending: false });
    fallo(error, 'Pedidos del comprador');
    return (data ?? []).map((r: any) => ({
      id: r.id, folio_pedido: r.folio_pedido, tipo: r.tipo, productor_id: r.productor_id,
      estado: r.estado, cantidad_total: r.cantidad_total, subtotal: Number(r.subtotal),
      total: Number(r.total), created_at: r.created_at,
      nombre_productor: r.productor?.nombre_taller ?? r.productor?.usuarios?.nombre_completo ?? 'Productor',
    }));
  },

  async pedidosPorProductor(productorId) {
    const { data, error } = await sb()
      .from('pedidos')
      .select('id, folio_pedido, tipo, productor_id, estado, cantidad_total, subtotal, total, created_at, productor:perfiles_productor(usuario_id, nombre_taller, usuarios(nombre_completo))')
      .eq('productor_id', productorId)
      .order('created_at', { ascending: false });
    fallo(error, 'Pedidos del productor');
    return (data ?? []).map((r: any) => ({
      id: r.id, folio_pedido: r.folio_pedido, tipo: r.tipo, productor_id: r.productor_id,
      estado: r.estado, cantidad_total: r.cantidad_total, subtotal: Number(r.subtotal),
      total: Number(r.total), created_at: r.created_at,
      nombre_productor: r.productor?.nombre_taller ?? r.productor?.usuarios?.nombre_completo ?? 'Productor',
    }));
  },

  async crearPedidoB2B(entrada) {
    const folio = `PED-B2B-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const folioContrato = `CONT-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const { data: pedido, error: e1 } = await sb().from('pedidos').insert({
      folio_pedido: folio, tipo: 'B2B', comprador_id: entrada.compradorId, productor_id: entrada.productorId,
      estado: 'confirmado', direccion_entrega: entrada.direccion, cantidad_total: entrada.cantidad,
      porcentaje_descuento: entrada.descuento, subtotal: entrada.subtotal,
      monto_descuento: entrada.subtotal - entrada.total, total: entrada.total,
      monto_productor: entrada.total - entrada.comision, monto_comision: entrada.comision,
    }).select().single();
    fallo(e1, 'No se pudo registrar el pedido por lote');
    const { error: e2 } = await sb().from('detalles_pedido').insert({
      pedido_id: pedido.id, producto_id: entrada.productoId, cantidad: entrada.cantidad,
      precio_unitario: entrada.precioUnitario, subtotal: entrada.subtotal,
    });
    fallo(e2, 'No se pudo registrar el detalle del pedido');
    const { error: e3 } = await sb().from('pagos').insert([
      { pedido_id: pedido.id, tipo_cobro: 'anticipo_30_b2b', metodo: 'spei', monto: entrada.anticipo30, estado: 'pendiente' },
      { pedido_id: pedido.id, tipo_cobro: 'saldo_70_b2b', metodo: 'spei', monto: entrada.saldo70, estado: 'pendiente' },
    ]);
    fallo(e3, 'Registro de pagos');
    const { data: contrato, error: e4 } = await sb().from('contratos_b2b').insert({
      pedido_id: pedido.id, folio_contrato: folioContrato, monto_anticipo_30: entrada.anticipo30,
      monto_saldo_70: entrada.saldo70, plazo_entrega_dias: entrada.plazoDias, condiciones_calidad: entrada.condiciones,
    }).select().single();
    fallo(e4, 'No se pudo generar el contrato');
    const { data: liq, error: e5 } = await sb().from('liquidaciones').insert({
      pedido_id: pedido.id, productor_id: entrada.productorId, monto_bruto: entrada.total,
      porcentaje_comision: 5.00, monto_comision_plataforma: entrada.comision,
      retencion_isr: 0, retencion_iva: 0, monto_neto_productor: entrada.total - entrada.comision,
      fecha_programada: new Date(Date.now() + entrada.plazoDias * 86400000).toISOString().slice(0, 10),
    }).select().single();
    fallo(e5, 'Alta de liquidación');
    void liq;
    const resumen = await this.obtenerPedidoResumen(pedido.id);
    return { pedido: resumen!, contrato };
  },

  async obtenerPedidoResumen(id: string) {
    const { data, error } = await sb()
      .from('pedidos')
      .select('id, folio_pedido, tipo, productor_id, estado, cantidad_total, subtotal, total, created_at, productor:perfiles_productor(usuario_id, nombre_taller, usuarios(nombre_completo))')
      .eq('id', id).maybeSingle();
    fallo(error, 'Consulta de pedido');
    if (!data) return null;
    const r = data as any;
    return {
      id: r.id, folio_pedido: r.folio_pedido, tipo: r.tipo, productor_id: r.productor_id,
      estado: r.estado, cantidad_total: r.cantidad_total, subtotal: Number(r.subtotal),
      total: Number(r.total), created_at: r.created_at,
      nombre_productor: r.productor?.nombre_taller ?? r.productor?.usuarios?.nombre_completo ?? 'Productor',
    };
  },

  async liquidacionesPorProductor(productorId) {
    const { data, error } = await sb().from('liquidaciones').select('*').eq('productor_id', productorId).order('created_at', { ascending: false });
    fallo(error, 'Liquidaciones');
    return (data ?? []).map(normalizarLiquidacion);
  },

  async todasLiquidaciones() {
    const { data, error } = await sb().from('liquidaciones').select('*').order('created_at', { ascending: false });
    fallo(error, 'Liquidaciones');
    return (data ?? []).map(normalizarLiquidacion);
  },

  async notificacionesPorUsuario(usuarioId) {
    const { data, error } = await sb().from('notificaciones').select('*').eq('usuario_id', usuarioId).order('created_at', { ascending: false }).limit(50);
    fallo(error, 'Notificaciones');
    return (data ?? []) as unknown as Notificacion[];
  },

  async crearNotificacion(n) {
    const { error } = await sb().from('notificaciones').insert({
      usuario_id: n.usuarioId, tipo: n.tipo, asunto: n.asunto ?? null, mensaje: n.mensaje,
      pedido_id: n.pedidoId ?? null, canal: 'sistema', estado: 'enviada', enviado_en: new Date().toISOString(),
    });
    fallo(error, 'Crear notificación');
  },

  async marcarNotificacionLeida(id, usuarioId) {
    const { error } = await sb().from('notificaciones').update({ estado: 'leida', leido_en: new Date().toISOString() }).eq('id', id).eq('usuario_id', usuarioId);
    fallo(error, 'Marcar notificación');
  },

  async calificacionesPorProductor(productorId) {
    const { data, error } = await sb().from('calificaciones').select('*').eq('productor_id', productorId).order('created_at', { ascending: false });
    fallo(error, 'Calificaciones');
    return (data ?? []) as unknown as Calificacion[];
  },

  async crearCalificacion(c) {
    const { error } = await sb().from('calificaciones').insert({
      pedido_id: c.pedidoId, comprador_id: c.compradorId, productor_id: c.productorId,
      puntuacion: c.puntuacion, comentario: c.comentario ?? null,
    });
    fallo(error, 'Crear calificación');
    const { error: e2 } = await sb().rpc('recalcular_promedio_productor', { p_productor_id: c.productorId });
    if (e2) console.warn('No se pudo recalcular promedio:', e2.message);
  },

  async reportes() {
    const { data, error } = await sb().from('reportes').select('*').order('created_at', { ascending: false }).limit(50);
    fallo(error, 'Reportes');
    return (data ?? []) as unknown as Reporte[];
  },

  async crearReporte(r) {
    const { data, error } = await sb().from('reportes').insert({
      generado_por: r.generadoPor, tipo: r.tipo, formato: r.formato, estado: 'generado', generado_en: new Date().toISOString(),
    }).select().single();
    fallo(error, 'Crear reporte');
    return data as Reporte;
  },

  async indicadores() {
    const [prod, piezas, pedidos, cal] = await Promise.all([
      sb().from('perfiles_productor').select('estado_verificacion'),
      sb().from('productos').select('id', { count: 'exact', head: true }),
      sb().from('pedidos').select('total, monto_comision'),
      sb().from('calificaciones').select('puntuacion'),
    ]);
    const estados = (prod.data ?? []) as { estado_verificacion: string }[];
    const ped = (pedidos.data ?? []) as { total: string; monto_comision: string }[];
    const califs = (cal.data ?? []) as { puntuacion: number }[];
    return {
      productores: estados.length,
      aprobados: estados.filter((e) => e.estado_verificacion === 'aprobado').length,
      pendientes: estados.filter((e) => e.estado_verificacion === 'pendiente').length,
      piezas: piezas.count ?? 0,
      pedidos: ped.length,
      ventasTotales: ped.reduce((a, p) => a + Number(p.total), 0),
      comisiones: ped.reduce((a, p) => a + Number(p.monto_comision), 0),
      calificacionPromedio: califs.length ? califs.reduce((a, c) => a + c.puntuacion, 0) / califs.length : 0,
    };
  },
};

function normalizarLiquidacion(r: any): Liquidacion {
  return {
    id: r.id, pedido_id: r.pedido_id, productor_id: r.productor_id,
    monto_bruto: Number(r.monto_bruto), porcentaje_comision: Number(r.porcentaje_comision),
    monto_comision_plataforma: Number(r.monto_comision_plataforma), retencion_isr: Number(r.retencion_isr),
    retencion_iva: Number(r.retencion_iva), monto_neto_productor: Number(r.monto_neto_productor),
    fecha_programada: r.fecha_programada, liquidado: r.liquidado,
  };
}
