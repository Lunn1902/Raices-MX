import { ErrorNegocio } from '@/lib/http';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { normalizar } from '@/modules/catalogo/filtros';
import type { FichaOrigen, PiezaCatalogo, Producto, Productor, SelloOriginalidad } from '@/types';
import type { Repositorio } from './tipos';

const sb = () => supabaseServidor();

const PRODUCTOR_SELECT =
  'usuario_id, nombre_taller, identificacion_oficial, comunidad, estado, pueblo_originario, tecnica_principal, estado_verificacion, created_at, usuarios(nombre_completo, correo, telefono)';

interface FilaProductor {
  usuario_id: string;
  nombre_taller: string;
  identificacion_oficial: string;
  comunidad: string;
  estado: string;
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
      comunidad: p.comunidad, estado: p.estado, pueblo_originario: p.pueblo_originario,
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

  async registrarVerificacion(productorId, promotorId, estado, observaciones) {
    const { error: e1 } = await sb().from('verificaciones_productor').insert({
      productor_id: productorId, promotor_id: promotorId, estado, observaciones: observaciones ?? null,
    });
    fallo(e1, 'Registro de verificación');
    const { error: e2 } = await sb().from('perfiles_productor').update({ estado_verificacion: estado }).eq('usuario_id', productorId);
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
    fallo(error, 'Compra B2C');
    return data;
  },

  async registrarBitacora(e) {
    const { error } = await sb().from('bitacora_auditoria').insert({
      usuario_id: e.usuario_id, rol: e.rol, accion: e.accion, entidad: e.entidad, entidad_id: e.entidad_id,
      ip_origen: e.ip_origen ?? null, valor_anterior: e.valor_anterior ?? null, valor_nuevo: e.valor_nuevo ?? null,
    });
    fallo(error, 'Bitácora');
  },
};
