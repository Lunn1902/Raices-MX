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
