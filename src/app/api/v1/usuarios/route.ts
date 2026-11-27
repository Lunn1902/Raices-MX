import { ErrorNegocio, manejar } from '@/lib/http';
import { perfilSesion } from '@/lib/supabase/sesion';
import { supabaseServidor } from '@/lib/supabase/servidor';

const ROLES = ['promotor', 'admin'] as const;

// POST /api/v1/usuarios — alta de cuentas del equipo (promotor o administrador).
// Solo un administrador con sesión iniciada puede crearlas.
export async function POST(req: Request) {
  return manejar(async () => {
    const sesion = await perfilSesion();
    if (!sesion) throw new ErrorNegocio(401, 'Inicia sesión como administrador');
    if (sesion.rol !== 'admin') throw new ErrorNegocio(403, 'Solo un administrador puede crear cuentas del equipo');

    const { email, password, nombre_completo, rol } = await req.json();
    if (!email || !password || !nombre_completo || !ROLES.includes(rol)) {
      throw new ErrorNegocio(422, 'Faltan datos para crear la cuenta');
    }
    if (String(password).length < 6) {
      throw new ErrorNegocio(422, 'La contraseña debe tener al menos 6 caracteres');
    }

    const sb = supabaseServidor();
    const { data: auth, error: authError } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { rol, nombre_completo },
    });
    if (authError || !auth.user) throw new ErrorNegocio(409, 'Ya existe una cuenta con ese correo');

    const { error } = await sb.from('usuarios').insert({
      auth_id: auth.user.id,
      correo: email,
      nombre_completo,
      rol,
      correo_confirmado: true,
    });
    if (error) {
      await sb.auth.admin.deleteUser(auth.user.id);
      throw new ErrorNegocio(500, 'No se pudo crear el perfil. Intenta de nuevo.');
    }
    return { ok: true, correo: email, rol };
  }, 201);
}
