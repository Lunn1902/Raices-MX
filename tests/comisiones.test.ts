import { describe, expect, it } from 'vitest';
import { calcularDesgloseB2C, cotizarLoteB2B, descuentoPorVolumen, montoProductorB2C } from '@/modules/comisiones/calculo';

describe('desglose B2C 90/10 (CU-08)', () => {
  it('cumple el ejemplo oficial de una pieza de $800', () => {
    expect(calcularDesgloseB2C(800, 150)).toEqual({
      subtotal: 800,
      montoProductor: 720,
      comisionPlataforma: 80,
      costoEnvio: 150,
      total: 950,
    });
  });

  it('el envío no entra en la comisión', () => {
    const sinEnvio = calcularDesgloseB2C(1500);
    const conEnvio = calcularDesgloseB2C(1500, 300);
    expect(conEnvio.comisionPlataforma).toBe(sinEnvio.comisionPlataforma);
    expect(conEnvio.total).toBe(1800);
  });

  it('productor + comisión siempre suman el subtotal, aun con centavos', () => {
    for (const precio of [0.01, 0.05, 99.99, 333.33, 1234.57, 2800]) {
      const d = calcularDesgloseB2C(precio);
      expect(Math.round((d.montoProductor + d.comisionPlataforma) * 100)).toBe(Math.round(precio * 100));
    }
  });

  it('redondea a centavos', () => {
    expect(calcularDesgloseB2C(333.33).comisionPlataforma).toBe(33.33);
    expect(montoProductorB2C(333.33)).toBe(300);
  });

  it('rechaza montos negativos', () => {
    expect(() => calcularDesgloseB2C(-1)).toThrow();
  });
});

describe('lotes B2B (base de CU-09)', () => {
  it.each([
    [5, 0.05], [10, 0.05], [11, 0.1], [25, 0.1], [26, 0.15], [50, 0.15],
  ])('%i piezas tienen %f de descuento', (cantidad, pct) => {
    expect(descuentoPorVolumen(cantidad)).toBe(pct);
  });

  it('fuera de 5 a 50 piezas no hay lote', () => {
    expect(() => descuentoPorVolumen(4)).toThrow();
    expect(() => descuentoPorVolumen(51)).toThrow();
  });

  it('cumple el ejemplo oficial de 30 piezas de $1,500', () => {
    const c = cotizarLoteB2B(30, 1500);
    expect(c.precioBase).toBe(45000);
    expect(c.montoDescuento).toBe(6750);
    expect(c.total).toBe(38250);
    expect(c.anticipo30).toBe(11475);
    expect(c.saldo70).toBe(26775);
    expect(c.comisionPlataforma).toBe(1912.5);
    expect(c.montoProductor).toBe(36337.5);
  });
});
