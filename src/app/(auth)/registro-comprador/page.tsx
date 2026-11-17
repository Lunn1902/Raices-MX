'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { supabaseNavegador } from '@/lib/supabase/navegador';

export default function RegistroComprador({ rol, titulo, descripcion }: {
  rol: 'comprador_b2c' | 'comprador_b2b';
  titulo: string;
  descripcion: string;
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    const nombre = String(form.get('nombre_completo') || '');

    const res = await fetch('/api/v1/registro-comprador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nombre_completo: nombre, rol }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setMsg(data.error ?? 'No se pudo crear la cuenta');
      setLoading(false);
      return;
    }

    // Ingresa automáticamente con la contraseña recién creada
    const supabase = supabaseNavegador();
    await supabase.auth.signInWithPassword({ email, password });
    setMsg('Listo. Tu cuenta está activa, ya puedes agregar piezas al carrito.');
    setLoading(false);
    window.location.href = rol === 'comprador_b2b' ? '/comprador-b2b' : '/comprador';
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="eyebrow-accent">Crea tu cuenta</p>
      <h1 className="titulo mt-3">{titulo}</h1>
      <p className="plomo mt-4">{descripcion}</p>

      <form className="mt-10 space-y-8" onSubmit={onSubmit}>
        <div>
          <label className="label" htmlFor="nombre_completo">Nombre completo o nombre de tu negocio</label>
          <input id="nombre_completo" name="nombre_completo" required className="input" placeholder="Cómo quieres que te llamemos" />
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
