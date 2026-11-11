import { z } from 'zod';
import { secretoHmac } from '@/lib/config';
import { claveEstado } from '@/lib/estados';
import { ErrorNegocio } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { errorFoto, esquemaFichaOrigen } from '@/lib/validadores';
import { auditar } from '@/modules/auditoria/bitacora';
import { montoProductorB2C } from '@/modules/comisiones/calculo';
import { firmar, generarFolio } from '@/modules/sello-qr/firma';
import { enlaceSello, qrDataUrl } from '@/modules/sello-qr/servicio';
import type { FichaOrigen, FiltrosCatalogo, Producto, SelloOriginalidad } from '@/types';

const EXTENSION: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// CU-04 + CU-05: valida los 9 campos, guarda producto + ficha y emite el sello firmado
export async function publicarPieza(form: FormData, ip: string | null) {
  const foto = form.get('foto');
  const problemaFoto = errorFoto(foto);
  const r = esquemaFichaOrigen.safeParse(Object.fromEntries([...form.entries()].filter(([k]) => k !== 'foto')));
  // se reportan juntos los campos faltantes y la foto para que el productor corrija todo de una vez
  if (!r.success || problemaFoto) {
    const campos = r.success ? {} : z.flattenError(r.error).fieldErrors;
    throw new ErrorNegocio(422, 'Faltan datos obligatorios de la ficha de origen', problemaFoto ? { ...campos, foto: [problemaFoto] } : campos);
  }
  const datos = r.data;

  const productor = await repo().obtenerProductor(datos.productor_id);
  if (!productor) throw new ErrorNegocio(404, 'Productor no encontrado');
  if (productor.estado_verificacion !== 'aprobado') {
    throw new ErrorNegocio(403, 'El productor debe estar verificado por un promotor para publicar');
  }

  // los ids se generan aquí porque forman parte del payload que se firma
  const productoId = crypto.randomUUID();
  const fichaId = crypto.randomUUID();
  const folio = generarFolio(claveEstado(datos.estado)!);
  const archivo = foto as File;
  const fotoUrl = await repo().subirFoto(`${datos.productor_id}/${productoId}.${EXTENSION[archivo.type]}`, archivo);

  const ahora = new Date().toISOString();
  const producto: Producto = {
    id: productoId, productor_id: productor.id, nombre: datos.nombre, descripcion: datos.descripcion || null,
    categoria: datos.categoria, precio_unitario: datos.precio, stock: datos.stock, activo: true, created_at: ahora,
  };
  const ficha: FichaOrigen = {
    id: fichaId, producto_id: productoId, nombre_productor: datos.nombre_productor, comunidad: datos.comunidad,
    estado: datos.estado, pueblo_originario: datos.pueblo_originario, tecnica: datos.tecnica,
    materiales: datos.materiales, tiempo_elaboracion: datos.tiempo_elaboracion, precio_registrado: datos.precio,
    fotografias_urls: [fotoUrl], historia_pieza: datos.historia_pieza || null,
  };
  const firma = firmar(
    {
      folio, productoId, productorId: productor.id, comunidad: ficha.comunidad,
      puebloOriginario: ficha.pueblo_originario, tecnica: ficha.tecnica,
    },
    secretoHmac(),
  );
  const sello: SelloOriginalidad = {
    id: crypto.randomUUID(), ficha_origen_id: fichaId, folio_unico: folio, firma_hmac: firma, activo: true, fecha_emision: ahora,
  };

  await repo().guardarPieza({ producto, ficha, sello, capturadoPor: productor.id });
  await auditar({
    usuario_id: productor.id, rol: 'productor', accion: 'publicar_pieza', entidad: 'sellos_originalidad',
    entidad_id: folio, valor_nuevo: { producto_id: productoId, precio: datos.precio }, ip_origen: ip,
  });

  return {
    producto,
    ficha,
    sello: { folio, firma_hmac: firma, url: enlaceSello(folio, firma), qr: await qrDataUrl(folio, firma) },
    monto_productor: montoProductorB2C(datos.precio),
  };
}

export const buscarCatalogo = (f: FiltrosCatalogo) => repo().catalogo(f);

// Opciones para los selects de filtros a partir de lo publicado
export async function opcionesFiltros() {
  const todas = await repo().catalogo({});
  const unicos = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, 'es'));
  return {
    estados: unicos(todas.map((p) => p.estado)),
    pueblos: unicos(todas.map((p) => p.pueblo_originario)),
    tecnicas: unicos(todas.map((p) => p.tecnica)),
  };
}
