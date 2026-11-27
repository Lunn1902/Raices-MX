'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function RegistroSimple({ rol, titulo, descripcion }: {
  rol: 'promotor' | 'admin';
  titulo: string;
  descripcion: string;
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    const nombre = String(form.get('nombre_completo') || '');

    // La cuenta la crea el servidor, que exige sesión de administrador
    const r = await fetch('/api/v1/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nombre_completo: nombre, rol }),
    });
    const cuerpo = await r.json().catch(() => ({}));
    setMsg(r.ok ? `Cuenta creada: ${email}` : cuerpo.error ?? 'No se pudo crear la cuenta');
    if (r.ok) formEl.reset();
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="eyebrow-accent">Crea tu cuenta</p>
      <h1 className="titulo mt-3">{titulo}</h1>
      <p className="plomo mt-4">{descripcion}</p>

      <form className="mt-10 space-y-8" onSubmit={onSubmit}>
        <div>
          <label className="label" htmlFor="nombre_completo">Nombre completo</label>
          <input id="nombre_completo" name="nombre_completo" required className="input" placeholder="Tu nombre" />
        </div>
        <div>
          <label className="label" htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" required className="input" placeholder="tu@correo.com" />
        </div>
        <div>
          <label className="label" htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" required className="input" placeholder="Al menos 6 caracteres" />
        </div>
        {msg && <p className="border-l-4 border-terciaria pl-4 text-sm text-terciaria">{msg}</p>}
        <button className="btn-accent w-full sm:w-auto" disabled={loading} type="submit">
          {loading ? 'Creando…' : 'Crear cuenta'} <ArrowUpRight className="size-4" />
        </button>
      </form>

      <div className="regla mt-12 pt-6 text-sm text-tinta-clara">
        ¿Ya tienes cuenta? <Link href="/login" className="enlace ml-2">Entrar</Link>
      </div>
    </div>
  );
}
