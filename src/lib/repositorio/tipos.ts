import type {
  ConteoEstado, EstadoVerificacion, EventoBitacora, FichaOrigen, FiltrosCatalogo, ItemCarrito,
  PedidoCreado, PiezaCatalogo, Producto, Productor, RegistroSello, SelloOriginalidad,
} from '@/types';

// Contrato de persistencia. Los módulos de dominio solo conocen esta interfaz,
// así da igual si los datos vienen de Supabase o de la semilla en memoria.
export interface Repositorio {
  modo: 'supabase' | 'demo';
  crearProductor(p: Productor): Promise<Productor>;
  listarProductores(estado?: EstadoVerificacion): Promise<Productor[]>;
  obtenerProductor(id: string): Promise<Productor | null>;
  existeCorreo(correo: string): Promise<boolean>;
  registrarVerificacion(productorId: string, promotorId: string, estado: EstadoVerificacion, observaciones?: string): Promise<Productor>;
  subirFoto(ruta: string, foto: File): Promise<string>;
  guardarPieza(p: { producto: Producto; ficha: FichaOrigen; sello: SelloOriginalidad; capturadoPor: string }): Promise<void>;
  catalogo(f: FiltrosCatalogo): Promise<PiezaCatalogo[]>;
  piezasPorId(ids: string[]): Promise<PiezaCatalogo[]>;
  buscarSello(folio: string): Promise<RegistroSello | null>;
  conteoPorEstado(): Promise<ConteoEstado[]>;
  crearPedidosB2C(compradorId: string, direccion: string, items: ItemCarrito[], envioPorPedido: number): Promise<PedidoCreado[]>;
  registrarBitacora(e: EventoBitacora): Promise<void>;
}
