// Reglas de reparto (RF-09, RF-10, RF-11, RF-12). Funciones puras: las usa el servidor
// para cobrar y el cliente solo para mostrar la vista previa.

export const COMISION_B2C = 0.1;
export const COMISION_B2B = 0.05;
export const ENVIO_B2C_POR_PEDIDO = 150;

// Se trabaja en centavos para evitar errores de punto flotante (0.1 + 0.2)
const aCentavos = (monto: number) => Math.round(monto * 100);
const aPesos = (centavos: number) => centavos / 100;

export interface DesgloseB2C {
  subtotal: number;
  montoProductor: number;
  comisionPlataforma: number;
  costoEnvio: number;
  total: number;
}

export function calcularDesgloseB2C(subtotal: number, costoEnvio = 0): DesgloseB2C {
  if (subtotal < 0 || costoEnvio < 0) throw new Error('Los montos no pueden ser negativos');
  const sub = aCentavos(subtotal);
  const comision = Math.round(sub * COMISION_B2C);
  const envio = aCentavos(costoEnvio);
  return {
    subtotal: aPesos(sub),
    comisionPlataforma: aPesos(comision),
    // el productor recibe la diferencia, así ambos montos siempre suman el subtotal
    montoProductor: aPesos(sub - comision),
    costoEnvio: aPesos(envio),
    total: aPesos(sub + envio),
  };
}

export function montoProductorB2C(precio: number): number {
  return calcularDesgloseB2C(precio).montoProductor;
}

// CU-09: lotes de 5 a 50 piezas con descuento escalonado y pago 30/70
export const LOTE_MIN = 5;
export const LOTE_MAX = 50;

export function descuentoPorVolumen(cantidad: number): number {
  if (!Number.isInteger(cantidad) || cantidad < LOTE_MIN || cantidad > LOTE_MAX) {
    throw new Error(`El lote debe ser de ${LOTE_MIN} a ${LOTE_MAX} piezas`);
  }
  if (cantidad <= 10) return 0.05;
  if (cantidad <= 25) return 0.1;
  return 0.15;
}

export interface CotizacionLote {
  cantidad: number;
  precioBase: number;
  porcentajeDescuento: number;
  montoDescuento: number;
  total: number;
  anticipo30: number;
  saldo70: number;
  comisionPlataforma: number;
  montoProductor: number;
}

export function cotizarLoteB2B(cantidad: number, precioUnitario: number): CotizacionLote {
  const pct = descuentoPorVolumen(cantidad);
  const base = aCentavos(precioUnitario) * cantidad;
  const descuento = Math.round(base * pct);
  const total = base - descuento;
  const anticipo = Math.round(total * 0.3);
  const comision = Math.round(total * COMISION_B2B);
  return {
    cantidad,
    precioBase: aPesos(base),
    porcentajeDescuento: pct * 100,
    montoDescuento: aPesos(descuento),
    total: aPesos(total),
    anticipo30: aPesos(anticipo),
    saldo70: aPesos(total - anticipo),
    comisionPlataforma: aPesos(comision),
    montoProductor: aPesos(total - comision),
  };
}

export const formatoMXN = (monto: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto);
