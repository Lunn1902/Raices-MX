'use client';

import Link from "next/link";
import { supabaseNavegador } from "@/lib/supabase/navegador";

export default function OlvidePassword() {
  return (
    <main className="min-h-[80vh] grid place-items-center px-4">
      <div className="w-full max-w-md card">
        <h1 className="titulo mb-2">Recuperar contraseña</h1>
        <p className="text-stone-600 mb-6">Te enviaremos un enlace para restablecer tu acceso</p>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const email = String(form.get("email") || "");
            const supabase = supabaseNavegador();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/reset-password`,
            });
            if (error) {
              alert(error.message);
              return;
            }
            alert("Revisa tu correo para el enlace de recuperación");
          }}
        >
          <div>
            <label className="label" htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" required className="input" autoComplete="email" />
          </div>
          <button className="btn w-full" type="submit">Enviar enlace</button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-secundaria hover:underline">Volver a iniciar sesión</Link>
        </div>
      </div>
    </main>
  );
}
