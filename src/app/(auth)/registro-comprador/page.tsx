'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabaseNavegador } from '@/lib/supabase/navegador';

export default function RegistroComprador({ rol, titulo }: { rol: 'comprador_b2c' | 'comprador_b2b', titulo: string }) {
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

    const supabase = supabaseNavegador();
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nombre_completo: nombre, rol } } });
    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      await fetch('/api/v1/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_id: data.user.id, correo: email, nombre_completo: nombre, rol, correo_confirmado: true })
      });
    }
    setMsg('Registro creado. Revisa tu correo para confirmar.');
    setLoading(false);
  }

  return (
    <main className="min-h-[80vh] grid place-items-center px-4">
      <div className="w-full max-w-md card">
        <h1 className="titulo mb-2">{titulo}</h1>
        <p className="text-stone-600 mb-6">Crea tu cuenta para comprar piezas verificadas</p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label" htmlFor="nombre_completo">Nombre completo</label>
            <input id="nombre_completo" name="nombre_completo" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" required className="input" />
          </div>
          {msg && <p className="text-sm text-secundaria">{msg}</p>}
          <button className="btn w-full" disabled={loading} type="submit">{loading ? 'Creando...' : 'Crear cuenta'}</button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-secundaria hover:underline">Ya tengo cuenta</Link>
        </div>
      </div>
    </main>
  );
}
