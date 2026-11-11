import { USUARIOS_DEMO } from '@/lib/config';
import { ErrorNegocio } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { esquemaRegistroProductor, esquemaVerificacion } from '@/lib/validadores';
import { auditar } from '@/modules/auditoria/bitacora';
import type { EstadoVerificacion, Productor } from '@/types';

// CU-01: el productor nace "pendiente" y no puede publicar hasta que un promotor lo apruebe
export async function registrarProductor(entrada: unknown, ip: string | null): Promise<Productor> {
  const datos = esquemaRegistroProductor.parse(entrada);
  if (await repo().existeCorreo(datos.correo)) {
    throw new ErrorNegocio(409, 'Ya existe una cuenta con ese correo');
  }
  const productor = await repo().crearProductor({
    ...datos,
    id: crypto.randomUUID(),
    estado_verificacion: 'pendiente',
    created_at: new Date().toISOString(),
  });
  await auditar({
    usuario_id: productor.id, rol: 'productor', accion: 'registrar_productor', entidad: 'perfiles_productor',
    entidad_id: productor.id, valor_nuevo: { comunidad: datos.comunidad, estado: datos.estado }, ip_origen: ip,
  });
  return productor;
}

export const listarProductores = (estado?: EstadoVerificacion) => repo().listarProductores(estado);

export async function verificarProductor(id: string, entrada: unknown, ip: string | null) {
  const { estado, observaciones } = esquemaVerificacion.parse(entrada);
  const actual = await repo().obtenerProductor(id);
  if (!actual) throw new ErrorNegocio(404, 'Productor no encontrado');

  const promotorId = USUARIOS_DEMO.promotor;
  const productor = await repo().registrarVerificacion(id, promotorId, estado, observaciones);
  await auditar({
    usuario_id: promotorId, rol: 'promotor', accion: 'verificar_productor', entidad: 'perfiles_productor',
    entidad_id: id, valor_anterior: { estado_verificacion: actual.estado_verificacion },
    valor_nuevo: { estado_verificacion: estado, observaciones }, ip_origen: ip,
  });
  return productor;
}
