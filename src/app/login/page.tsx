'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { supabaseNavegador } from '@/lib/supabase/navegador';

export default function LoginPage() {
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
      {/* Panel de marca: bloque verde, sin tarjeta */}
      <section className="flex flex-col justify-between bg-secundaria px-8 py-12 text-white sm:px-12 sm:py-16">
        <div>
          <p className="eyebrow text-terciaria-suave">Bienvenido de nuevo</p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Tu trabajo merece <span className="text-terciaria-suave">ser visto</span>.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/80">
            Entra a tu espacio para publicar piezas, revisar pedidos o verificar el origen de una obra.
          </p>
        </div>
        <div className="mt-12 border-t border-white/20 pt-6">
          <p className="font-display text-2xl font-semibold">Raices<span className="text-terciaria">MX</span></p>
          <p className="mt-2 text-sm text-white/70">Comercio justo con origen verificable.</p>
        </div>
      </section>

      {/* Formulario sobre el fondo crema */}
      <section className="flex flex-col justify-center py-4">
        <p className="eyebrow-accent">Accede a tu cuenta</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-secundaria">Inicia sesión</h2>

        <form
          className="mt-8 space-y-8"
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
            <label className="label" htmlFor="rol">¿Cómo quieres entrar?</label>
            <select id="rol" name="rol" required className="input" defaultValue="">
              <option value="" disabled>Elige una opción</option>
              <option value="productor">Soy artesano o productor</option>
              <option value="promotor">Soy verificador</option>
              <option value="comprador_b2c">Quiero comprar para mí</option>
              <option value="comprador_b2b">Compro para mi tienda o negocio</option>
              <option value="administrador">Soy del equipo RaicesMX</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" required className="input" autoComplete="email" placeholder="tu@correo.com" />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" required className="input" autoComplete="current-password" placeholder="Tu contraseña" />
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-2">
            <button className="btn-accent" type="submit">Entrar <ArrowUpRight className="size-4" /></button>
            <Link href="/olvide-password" className="enlace text-sm">Olvidé mi contraseña</Link>
          </div>
        </form>

        <div className="regla mt-12 pt-6 text-sm text-tinta-clara">
          <p>¿Aún no tienes cuenta?</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/registro-productor" className="enlace">Soy artesano</Link>
            <Link href="/registro-comprador-b2c" className="enlace">Quiero comprar</Link>
            <Link href="/registro-comprador-b2b" className="enlace">Tengo una tienda</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
