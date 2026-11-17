import type {
  Calificacion, ConteoEstado, ContratoB2B, DatosVerificacion, EstadoVerificacion, EventoBitacora, FichaOrigen,
  FiltrosCatalogo, Indicadores, ItemCarrito, Liquidacion, Notificacion, PedidoCreado,
  PedidoResumen, PiezaCatalogo, Producto, Productor, RegistroSello, Reporte, SelloOriginalidad,
} from '@/types';

// Contrato de persistencia. Los módulos de dominio solo conocen esta interfaz,
// así da igual si los datos vienen de Supabase o de la semilla en memoria.
export interface Repositorio {
  modo: 'supabase' | 'demo';
  crearProductor(p: Productor): Promise<Productor>;
  listarProductores(estado?: EstadoVerificacion): Promise<Productor[]>;
  obtenerProductor(id: string): Promise<Productor | null>;
  existeCorreo(correo: string): Promise<boolean>;
  registrarVerificacion(productorId: string, promotorId: string, datos: DatosVerificacion): Promise<Productor>;
  subirFoto(ruta: string, foto: File): Promise<string>;
  guardarPieza(p: { producto: Producto; ficha: FichaOrigen; sello: SelloOriginalidad; capturadoPor: string }): Promise<void>;
  catalogo(f: FiltrosCatalogo): Promise<PiezaCatalogo[]>;
  piezasPorId(ids: string[]): Promise<PiezaCatalogo[]>;
  buscarSello(folio: string): Promise<RegistroSello | null>;
  conteoPorEstado(): Promise<ConteoEstado[]>;
  crearPedidosB2C(compradorId: string, direccion: string, items: ItemCarrito[], envioPorPedido: number): Promise<PedidoCreado[]>;
  registrarBitacora(e: EventoBitacora): Promise<void>;

  // Seguimiento, lotes B2B, liquidaciones, reputación y reportes
  pedidosPorComprador(compradorId: string): Promise<PedidoResumen[]>;
  pedidosPorProductor(productorId: string): Promise<PedidoResumen[]>;
  obtenerPedidoResumen(id: string): Promise<PedidoResumen | null>;
  crearPedidoB2B(entrada: {
    compradorId: string; productorId: string; productoId: string; cantidad: number;
    precioUnitario: number; descuento: number; subtotal: number; total: number;
    anticipo30: number; saldo70: number; comision: number; direccion: string; plazoDias: number;
    condiciones: string;
  }): Promise<{ pedido: PedidoResumen; contrato: ContratoB2B }>;
  liquidacionesPorProductor(productorId: string): Promise<Liquidacion[]>;
  todasLiquidaciones(): Promise<Liquidacion[]>;
  notificacionesPorUsuario(usuarioId: string): Promise<Notificacion[]>;
  crearNotificacion(n: { usuarioId: string; tipo: string; asunto?: string; mensaje: string; pedidoId?: string }): Promise<void>;
  marcarNotificacionLeida(id: string, usuarioId: string): Promise<void>;
  calificacionesPorProductor(productorId: string): Promise<Calificacion[]>;
  crearCalificacion(c: { pedidoId: string; compradorId: string; productorId: string; puntuacion: number; comentario?: string }): Promise<void>;
  reportes(): Promise<Reporte[]>;
  crearReporte(r: { generadoPor: string; tipo: Reporte['tipo']; formato: Reporte['formato'] }): Promise<Reporte>;
  indicadores(): Promise<Indicadores>;
}
