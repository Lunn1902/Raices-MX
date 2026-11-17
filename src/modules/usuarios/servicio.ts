import { USUARIOS_DEMO } from '@/lib/config';
import { ErrorNegocio } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { esquemaRegistroProductor, esquemaVerificacion } from '@/lib/validadores';
import { auditar } from '@/modules/auditoria/bitacora';
import type { EstadoVerificacion, Productor } from '@/types';

// CU-01: el productor nace "pendiente" y no puede publicar hasta que un verificador lo apruebe.
// Se crea su cuenta de acceso (Supabase Auth) en el mismo paso para que pueda entrar luego.
export async function registrarProductor(entrada: unknown, ip: string | null): Promise<Productor> {
  const datos = esquemaRegistroProductor.parse(entrada);
  if (await repo().existeCorreo(datos.correo)) {
    throw new ErrorNegocio(409, 'Ya existe una cuenta con ese correo');
  }

  // 1) Cuenta de acceso con la contraseña que eligió
  const sb = supabaseServidor();
  const { data: auth, error: authError } = await sb.auth.admin.createUser({
    email: datos.correo,
    password: datos.password,
    email_confirm: true,
    user_metadata: { rol: 'productor', nombre_completo: datos.nombre_completo },
  });
  if (authError || !auth.user) {
    throw new ErrorNegocio(409, 'No se pudo crear tu cuenta de acceso. Es posible que ese correo ya esté registrado.');
  }

  // 2) Perfil de productor enlazado por auth_id, con el mismo id del usuario de Auth
  const productor = await repo().crearProductor({
    ...datos,
    id: auth.user.id,
    latitud: null,
    longitud: null,
    referencias_direccion: datos.referencias_direccion ?? null,
    estado_verificacion: 'pendiente',
    created_at: new Date().toISOString(),
  });
  const { error: linkError } = await sb.from('usuarios').update({ auth_id: auth.user.id }).eq('id', auth.user.id);
  if (linkError) console.warn('No se pudo enlazar auth_id:', linkError.message);
  await auditar({
    usuario_id: productor.id, rol: 'productor', accion: 'registrar_productor', entidad: 'perfiles_productor',
    entidad_id: productor.id, valor_nuevo: { comunidad: datos.comunidad, estado: datos.estado }, ip_origen: ip,
  });
  return productor;
}

export const listarProductores = (estado?: EstadoVerificacion) => repo().listarProductores(estado);

export async function verificarProductor(id: string, entrada: unknown, ip: string | null) {
  const datos = esquemaVerificacion.parse(entrada);
  const actual = await repo().obtenerProductor(id);
  if (!actual) throw new ErrorNegocio(404, 'Productor no encontrado');

  const promotorId = USUARIOS_DEMO.promotor;
  const productor = await repo().registrarVerificacion(id, promotorId, datos);
  await auditar({
    usuario_id: promotorId, rol: 'promotor', accion: 'verificar_productor', entidad: 'perfiles_productor',
    entidad_id: id, valor_anterior: { estado_verificacion: actual.estado_verificacion },
    valor_nuevo: {
      estado_verificacion: datos.estado,
      visita_realizada: datos.visita_realizada,
      observaciones: datos.observaciones,
    },
    ip_origen: ip,
  });
  return productor;
}
