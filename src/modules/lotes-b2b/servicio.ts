import { ErrorNegocio } from '@/lib/http';
import {
  cotizarLoteB2B as calcularCotizacionB2B,
  LOTE_MAX,
  LOTE_MIN,
  type CotizacionLote,
} from '@/modules/comisiones/calculo';

// CU-09: cotización de lotes B2B (5 a 50 piezas, pago 30/70). Envoltura HTTP-safe:
// las reglas de negocio se traducen a ErrorNegocio para que manejar() responda 422.
export function cotizarLoteB2B(cantidad: number, precioUnitario: number): CotizacionLote {
  if (!(precioUnitario > 0)) throw new ErrorNegocio(422, 'Precio unitario inválido');
  if (!Number.isInteger(cantidad) || cantidad < LOTE_MIN || cantidad > LOTE_MAX) {
    throw new ErrorNegocio(422, `El lote debe ser de ${LOTE_MIN} a ${LOTE_MAX} piezas`);
  }
  return calcularCotizacionB2B(cantidad, precioUnitario);
}

// Alias conservado para la ruta de cotización existente.
export function cotizarLote(cantidad: number, precioUnitario: number): CotizacionLote {
  return cotizarLoteB2B(cantidad, precioUnitario);
}
