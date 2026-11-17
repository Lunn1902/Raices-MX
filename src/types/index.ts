// Tipos alineados con las tablas de supabase/migrations/001_initial_schema.sql

export type RolUsuario = 'productor' | 'promotor' | 'comprador_b2c' | 'comprador_b2b' | 'admin';
export type EstadoVerificacion = 'pendiente' | 'aprobado' | 'rechazado';

export const CATEGORIAS = ['Textiles', 'Cerámica y barro', 'Palma y madera'] as const;
export type Categoria = (typeof CATEGORIAS)[number];

// usuarios + perfiles_productor aplanados
export interface Productor {
  id: string;
  nombre_completo: string;
  correo: string;
  telefono: string | null;
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
  estado_verificacion: EstadoVerificacion;
  created_at: string;
}

export interface Producto {
  id: string;
  productor_id: string;
  nombre: string;
  descripcion: string | null;
  categoria: Categoria;
  precio_unitario: number;
  stock: number;
  activo: boolean;
  created_at: string;
}

export interface FichaOrigen {
  id: string;
  producto_id: string;
  nombre_productor: string;
  comunidad: string;
  estado: string;
  pueblo_originario: string;
  tecnica: string;
  materiales: string;
  tiempo_elaboracion: string;
  precio_registrado: number;
  fotografias_urls: string[];
  historia_pieza: string | null;
}

export interface SelloOriginalidad {
  id: string;
  ficha_origen_id: string;
  folio_unico: string;
  firma_hmac: string;
  activo: boolean;
  fecha_emision: string;
}

// Fila de la vista vista_catalogo
export interface PiezaCatalogo {
  id: string;
  productor_id: string;
  nombre: string;
  descripcion: string | null;
  categoria: Categoria;
  precio_unitario: number;
  stock: number;
  created_at: string;
  ficha_id: string;
  nombre_productor: string;
  comunidad: string;
  estado: string;
  pueblo_originario: string;
  tecnica: string;
  materiales: string;
  tiempo_elaboracion: string;
  fotografias_urls: string[];
  historia_pieza: string | null;
  folio_unico: string | null;
}

export interface FiltrosCatalogo {
  q?: string;
  categoria?: string;
  estado?: string;
  pueblo?: string;
  tecnica?: string;
  precioMin?: number;
  precioMax?: number;
}

export interface ConteoEstado {
  estado: string;
  productores: number;
  piezas: number;
}

export interface RegistroSello {
  sello: SelloOriginalidad;
  ficha: FichaOrigen;
  producto: Producto;
  productor: Productor;
}

export interface ResultadoVerificacion {
  verificado: boolean;
  etiqueta: 'Origen verificado' | 'Origen no verificado';
  folio: string;
  motivo?: string;
  ficha?: FichaOrigen;
  producto?: Producto;
  productor?: Pick<Productor, 'nombre_completo' | 'nombre_taller' | 'comunidad' | 'estado' | 'pueblo_originario'>;
  fecha_emision?: string;
}

export interface ItemCarrito {
  producto_id: string;
  cantidad: number;
}

export interface PedidoCreado {
  pedido_id: string;
  folio_pedido: string;
  productor_id: string;
  cantidad_total: number;
  subtotal: number;
  monto_productor: number;
  monto_comision: number;
  costo_envio: number;
  total: number;
}

export interface DatosVerificacion {
  estado: EstadoVerificacion;
  observaciones?: string;
  visita_realizada: boolean;
  fecha_visita?: string;
  latitud_visita?: number;
  longitud_visita?: number;
}

export interface EventoBitacora {
  usuario_id: string | null;
  rol: string | null;
  accion: string;
  entidad: string;
  entidad_id: string;
  valor_anterior?: unknown;
  valor_nuevo?: unknown;
  ip_origen?: string | null;
}

// --- Seguimiento, liquidaciones y reputación (RF-10 a RF-15) ---

export type EstadoPedido = 'confirmado' | 'en_proceso' | 'en_camino' | 'entregado' | 'cancelado';

export interface PedidoResumen {
  id: string;
  folio_pedido: string;
  tipo: 'B2C' | 'B2B';
  productor_id: string;
  nombre_productor: string;
  estado: EstadoPedido;
  cantidad_total: number;
  subtotal: number;
  total: number;
  created_at: string;
}

export interface Liquidacion {
  id: string;
  pedido_id: string;
  productor_id: string;
  monto_bruto: number;
  porcentaje_comision: number;
  monto_comision_plataforma: number;
  retencion_isr: number;
  retencion_iva: number;
  monto_neto_productor: number;
  fecha_programada: string;
  liquidado: boolean;
}

export interface ContratoB2B {
  id: string;
  pedido_id: string;
  folio_contrato: string;
  monto_anticipo_30: number;
  monto_saldo_70: number;
  plazo_entrega_dias: number;
  condiciones_calidad: string;
  aceptado_en: string | null;
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  pedido_id: string | null;
  canal: 'sistema' | 'correo' | 'sms' | 'whatsapp';
  tipo: string;
  asunto: string | null;
  mensaje: string;
  estado: 'pendiente' | 'enviada' | 'fallida' | 'leida';
  leido_en: string | null;
  created_at: string;
}

export interface Calificacion {
  id: string;
  pedido_id: string;
  comprador_id: string;
  productor_id: string;
  puntuacion: number;
  comentario: string | null;
  created_at: string;
}

export interface Reporte {
  id: string;
  generado_por: string | null;
  tipo: 'ventas' | 'productores' | 'comisiones' | 'auditoria' | 'inventario';
  formato: 'csv' | 'pdf' | 'xlsx';
  estado: 'pendiente' | 'generado' | 'error';
  periodo_inicio: string | null;
  periodo_fin: string | null;
  url_archivo: string | null;
  created_at: string;
}

export interface Indicadores {
  productores: number;
  aprobados: number;
  pendientes: number;
  piezas: number;
  pedidos: number;
  ventasTotales: number;
  comisiones: number;
  calificacionPromedio: number;
}
