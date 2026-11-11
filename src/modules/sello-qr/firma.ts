import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// CU-05: el folio y su firma solo se generan en el servidor. Este archivo nunca
// debe importarse desde un componente cliente porque necesita QR_HMAC_SECRET.

export interface DatosFirma {
  folio: string;
  productoId: string;
  productorId: string;
  comunidad: string;
  puebloOriginario: string;
  tecnica: string;
}

export const PATRON_FOLIO = /^RMX-[A-Z]{3}-\d{4}-[0-9A-F]{6}$/;

export function generarFolio(claveEstado: string, anio = new Date().getFullYear()): string {
  const hex = randomBytes(3).toString('hex').toUpperCase();
  return `RMX-${claveEstado.toUpperCase()}-${anio}-${hex}`;
}

// El orden de los campos es parte del contrato: si cambia, todas las firmas emitidas dejan de validar
export function construirPayload(d: DatosFirma): string {
  return [d.folio, d.productoId, d.productorId, d.comunidad, d.puebloOriginario, d.tecnica].join('|');
}

export function firmar(d: DatosFirma, secreto: string): string {
  return createHmac('sha256', secreto).update(construirPayload(d), 'utf8').digest('hex');
}

// Comparación en tiempo constante para no filtrar información por diferencias de tiempo
export function firmasIguales(a: string, b: string): boolean {
  if (!/^[0-9a-f]{64}$/.test(a) || !/^[0-9a-f]{64}$/.test(b)) return false;
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

export function verificarFirma(d: DatosFirma, firma: string, secreto: string): boolean {
  return firmasIguales(firmar(d, secreto), firma);
}

export function urlVerificacion(baseUrl: string, folio: string, firma: string): string {
  return `${baseUrl.replace(/\/$/, '')}/verificar/${encodeURIComponent(folio)}?sig=${firma}`;
}
