import { describe, expect, it } from 'vitest';
import { construirPayload, firmar, generarFolio, PATRON_FOLIO, urlVerificacion, verificarFirma, type DatosFirma } from '@/modules/sello-qr/firma';

const SECRETO = 'secreto-de-prueba';
const datos: DatosFirma = {
  folio: 'RMX-PUE-2026-9A4F2C',
  productoId: '00000000-0000-4000-8000-000000000103',
  productorId: '00000000-0000-4000-8000-000000000012',
  comunidad: 'Acatlán de Osorio',
  puebloOriginario: 'Mixteco',
  tecnica: 'Barro bruñido',
};

describe('folio único', () => {
  it('sigue el formato RMX-EST-AÑO-HEX6', () => {
    const folio = generarFolio('PUE', 2026);
    expect(folio).toMatch(PATRON_FOLIO);
    expect(folio.startsWith('RMX-PUE-2026-')).toBe(true);
  });

  it('no se repite entre emisiones', () => {
    const folios = new Set(Array.from({ length: 500 }, () => generarFolio('PUE')));
    expect(folios.size).toBe(500);
  });
});

describe('firma HMAC-SHA256 del sello', () => {
  it('arma el payload en el orden acordado', () => {
    expect(construirPayload(datos)).toBe(
      'RMX-PUE-2026-9A4F2C|00000000-0000-4000-8000-000000000103|00000000-0000-4000-8000-000000000012|Acatlán de Osorio|Mixteco|Barro bruñido',
    );
  });

  it('genera 64 caracteres hexadecimales y es determinista', () => {
    const firma = firmar(datos, SECRETO);
    expect(firma).toMatch(/^[0-9a-f]{64}$/);
    expect(firmar(datos, SECRETO)).toBe(firma);
  });

  it('valida una firma íntegra', () => {
    expect(verificarFirma(datos, firmar(datos, SECRETO), SECRETO)).toBe(true);
  });

  it.each([
    ['folio', { folio: 'RMX-PUE-2026-9A4F2D' }],
    ['comunidad', { comunidad: 'Tehuacán' }],
    ['pueblo originario', { puebloOriginario: 'Nahua' }],
    ['técnica', { tecnica: 'Barro vidriado' }],
    ['productor', { productorId: '00000000-0000-4000-8000-000000000099' }],
  ])('detecta la alteración de %s', (_campo, cambio) => {
    const firma = firmar(datos, SECRETO);
    expect(verificarFirma({ ...datos, ...cambio }, firma, SECRETO)).toBe(false);
  });

  it('rechaza una firma hecha con otro secreto', () => {
    expect(verificarFirma(datos, firmar(datos, 'otro-secreto'), SECRETO)).toBe(false);
  });

  it('rechaza firmas mal formadas sin lanzar error', () => {
    expect(verificarFirma(datos, 'abc', SECRETO)).toBe(false);
    expect(verificarFirma(datos, 'z'.repeat(64), SECRETO)).toBe(false);
  });

  it('codifica la URL pública de verificación', () => {
    const firma = firmar(datos, SECRETO);
    expect(urlVerificacion('https://raicesmx.mx/', datos.folio, firma)).toBe(`https://raicesmx.mx/verificar/RMX-PUE-2026-9A4F2C?sig=${firma}`);
  });
});
