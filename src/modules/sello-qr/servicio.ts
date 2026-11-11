import QRCode from 'qrcode';
import { config, secretoHmac } from '@/lib/config';
import { repo } from '@/lib/repositorio';
import type { ResultadoVerificacion } from '@/types';
import { PATRON_FOLIO, firmasIguales, urlVerificacion, verificarFirma } from './firma';

const noVerificado = (folio: string, motivo: string): ResultadoVerificacion => ({
  verificado: false, etiqueta: 'Origen no verificado', folio, motivo,
});

// CU-06: se recalcula la firma con los datos actuales de la ficha. Si alguien alteró la
// ficha en la base, el folio en la URL o la firma del QR, la verificación falla.
export async function verificarFolio(folio: string, sig?: string | null): Promise<ResultadoVerificacion> {
  const f = folio.trim().toUpperCase();
  if (!PATRON_FOLIO.test(f)) return noVerificado(f, 'El folio no tiene un formato válido');

  const registro = await repo().buscarSello(f);
  if (!registro) return noVerificado(f, 'El folio no existe en RaicesMX');

  const { sello, ficha, producto, productor } = registro;
  if (!sello.activo) return noVerificado(f, 'El sello fue revocado');

  const integra = verificarFirma(
    {
      folio: sello.folio_unico, productoId: producto.id, productorId: producto.productor_id,
      comunidad: ficha.comunidad, puebloOriginario: ficha.pueblo_originario, tecnica: ficha.tecnica,
    },
    sello.firma_hmac,
    secretoHmac(),
  );
  if (!integra) return noVerificado(f, 'La firma del sello no coincide con la ficha registrada');
  if (sig && !firmasIguales(sig.toLowerCase(), sello.firma_hmac)) {
    return noVerificado(f, 'La firma del código QR fue alterada');
  }

  return {
    verificado: true,
    etiqueta: 'Origen verificado',
    folio: f,
    ficha,
    producto,
    productor: {
      nombre_completo: productor.nombre_completo, nombre_taller: productor.nombre_taller,
      comunidad: productor.comunidad, estado: productor.estado, pueblo_originario: productor.pueblo_originario,
    },
    fecha_emision: sello.fecha_emision,
  };
}

const opcionesQr = { errorCorrectionLevel: 'M' as const, margin: 2, width: 512 };

export const enlaceSello = (folio: string, firma: string) => urlVerificacion(config.baseUrl, folio, firma);

export const qrDataUrl = (folio: string, firma: string) => QRCode.toDataURL(enlaceSello(folio, firma), opcionesQr);

export async function qrPng(folio: string): Promise<Buffer | null> {
  const registro = await repo().buscarSello(folio.toUpperCase());
  if (!registro) return null;
  return QRCode.toBuffer(enlaceSello(registro.sello.folio_unico, registro.sello.firma_hmac), opcionesQr);
}
