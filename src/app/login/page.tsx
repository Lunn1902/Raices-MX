'use client';

import Link from "next/link";
import { supabaseNavegador } from "@/lib/supabase/navegador";

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] grid place-items-center px-4">
      <div className="w-full max-w-md card">
        <h1 className="titulo mb-2">Iniciar sesión</h1>
        <p className="text-stone-600 mb-6">Accede a tu panel según tu rol</p>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const email = String(form.get("email") || "");
            const password = String(form.get("password") || "");
            const rol = String(form.get("rol") || "");
            const supabase = supabaseNavegador();
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
              alert(error.message);
              return;
            }
            // Redirección por rol
            const map: Record<string, string> = {
              productor: '/productor',
              promotor: '/promotor',
              comprador_b2c: '/comprador',
              comprador_b2b: '/comprador-b2b',
              administrador: '/admin',
            };
            window.location.href = map[rol] ?? '/';
          }}
        >
          <div>
            <label className="label" htmlFor="rol">Rol</label>
            <select id="rol" name="rol" required className="input">
              <option value="">Selecciona tu rol</option>
              <option value="productor">Productor</option>
              <option value="promotor">Promotor / Verificador</option>
              <option value="comprador_b2c">Comprador B2C</option>
              <option value="comprador_b2b">Comprador B2B</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" required className="input" autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" required className="input" autoComplete="current-password" />
          </div>

          <div className="flex gap-3 pt-2">
            <button className="btn flex-1" type="submit">Entrar</button>
            <Link href="/registro-productor" className="btn-sec flex-1 text-center">Registrar</Link>
          </div>
        </form>

        <div className="mt-6 text-sm text-stone-600 space-y-1">
          <p>¿Olvidaste tu contraseña? Pronto habilitaremos recuperación.</p>
          <p>Soporte: equipo10@raicesmx.mx</p>
        </div>
      </div>
    </main>
  );
}

