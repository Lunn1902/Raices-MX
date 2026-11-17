import { NextResponse } from 'next/server';
import { ErrorNegocio, manejar } from '@/lib/http';
import { supabaseServidor } from '@/lib/supabase/servidor';

const ROLES = ['comprador_b2c', 'comprador_b2b'] as const;

// POST /api/v1/registro-comprador — crea la cuenta de acceso y el perfil de comprador
export async function POST(req: Request) {
  return manejar(async () => {
    const { email, password, nombre_completo, rol } = await req.json();

    if (!email || !password || !nombre_completo || !ROLES.includes(rol)) {
      throw new ErrorNegocio(422, 'Faltan datos para crear la cuenta');
    }
    if (String(password).length < 6) {
      throw new ErrorNegocio(422, 'La contraseña debe tener al menos 6 caracteres');
    }

    const sb = supabaseServidor();

    // 1) Cuenta de acceso confirmada (sin depender del correo de verificación)
    const { data: auth, error: authError } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { rol, nombre_completo },
    });
    if (authError || !auth.user) {
      throw new ErrorNegocio(409, 'Ya existe una cuenta con ese correo');
    }

    // 2) Perfil enlazado por auth_id
    const { error: perfilError } = await sb.from('usuarios').insert({
      auth_id: auth.user.id,
      correo: email,
      nombre_completo,
      rol,
      correo_confirmado: true,
    });
    if (perfilError) {
      // compensación: sin perfil no debe quedar una cuenta huérfana
      await sb.auth.admin.deleteUser(auth.user.id);
      throw new ErrorNegocio(500, 'No se pudo crear el perfil. Intenta de nuevo.');
    }

    return { ok: true, correo: email, rol };
  }, 201);
}
