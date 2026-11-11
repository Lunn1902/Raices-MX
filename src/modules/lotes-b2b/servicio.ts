import { ErrorNegocio } from '@/lib/http';
import { cotizarLoteB2B } from '@/modules/comisiones/calculo';

// CU-09 (siguiente entrega): por ahora solo cotiza; el contrato 30/70 ya tiene su tabla
export function cotizarLote(cantidad: number, precioUnitario: number) {
  if (!(precioUnitario > 0)) throw new ErrorNegocio(422, 'Precio unitario inválido');
  try {
    return cotizarLoteB2B(cantidad, precioUnitario);
  } catch (e) {
    throw new ErrorNegocio(422, (e as Error).message);
  }
}
