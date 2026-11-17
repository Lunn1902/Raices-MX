'use client';

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { supabaseNavegador } from "@/lib/supabase/navegador";

export default function OlvidePassword() {
  return (
    <div className="mx-auto max-w-xl">
      <p className="eyebrow-accent">Recupera tu acceso</p>
      <h1 className="titulo mt-3">Olvidé mi contraseña</h1>
      <p className="plomo mt-4">
        Escribe el correo con el que te registraste y te enviaremos un enlace para poner una contraseña nueva.
      </p>

      <form
        className="mt-10 space-y-8"
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
          <input id="email" name="email" type="email" required className="input" autoComplete="email" placeholder="tu@correo.com" />
        </div>
        <button className="btn-accent" type="submit">Enviar enlace <ArrowUpRight className="size-4" /></button>
      </form>

      <div className="regla mt-12 pt-6 text-sm text-tinta-clara">
        <Link href="/login" className="enlace">Volver a iniciar sesión</Link>
      </div>
    </div>
  );
}
