'use client';

import { useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Campo, enviarJson, type ErroresCampos } from '@/components/Campo';
import { NOMBRES_ESTADOS } from '@/lib/estados';
import type { Productor } from '@/types';

const CAMPOS: { name: string; etiqueta: string; ayuda?: string; type?: string }[] = [
  { name: 'nombre_completo', etiqueta: 'Nombre completo' },
  { name: 'identificacion_oficial', etiqueta: 'CURP o clave de elector (INE)', ayuda: '18 caracteres, como aparece en tu documento' },
  { name: 'nombre_taller', etiqueta: 'Nombre del taller' },
  { name: 'comunidad', etiqueta: 'Comunidad' },
  { name: 'pueblo_originario', etiqueta: 'Pueblo originario', ayuda: 'Ej. Nahua, Mixteco, Totonaco' },
  { name: 'tecnica_principal', etiqueta: 'Técnica principal', ayuda: 'Ej. Telar de cintura, barro bruñido' },
  { name: 'telefono', etiqueta: 'Teléfono (10 dígitos)', type: 'tel' },
  { name: 'correo', etiqueta: 'Correo electrónico', type: 'email' },
];

// CU-01: alta del productor; queda pendiente hasta la visita del verificador
export default function RegistroProductor() {
  const [errores, setErrores] = useState<ErroresCampos>({});
  const [mensaje, setMensaje] = useState('');
  const [registrado, setRegistrado] = useState<Productor | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    const r = await enviarJson<Productor>('/api/v1/productores', 'POST', Object.fromEntries(new FormData(e.currentTarget)));
    setEnviando(false);
    if (r.ok) return setRegistrado(r.data);
    setErrores(r.campos);
    setMensaje(r.error);
  }

  if (registrado) {
    return (
      <div className="regla-accent mx-auto max-w-2xl py-12">
        <CheckCircle2 className="size-12 text-terciaria" />
        <h1 className="mt-5 font-display text-4xl font-semibold text-secundaria">Solicitud recibida</h1>
        <p className="plomo mt-4">
          {registrado.nombre_completo}, tu taller <strong className="text-secundaria">{registrado.nombre_taller}</strong> quedó
          en estado <strong className="text-terciaria">pendiente</strong>. Un verificador de RaicesMX visitará{' '}
          {registrado.comunidad} para conocer tu identidad y tu proceso artesanal.
        </p>
        <a href="/catalogo" className="enlace mt-8">Explorar el catálogo <ArrowUpRight className="size-4" /></a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow-accent">Únete a RaicesMX</p>
      <h1 className="titulo mt-3">Registro de artesano</h1>
      <p className="plomo mt-4">
        Cuéntanos quién eres y qué haces. Un verificador visitará tu taller antes de que tus piezas aparezcan en la tienda.
      </p>

      <form onSubmit={enviar} className="mt-10 space-y-10" noValidate>
        <fieldset className="space-y-8">
          <legend className="regla-accent w-full pb-3 font-display text-2xl font-semibold text-secundaria">Sobre ti</legend>
          {CAMPOS.slice(0, 2).map((c) => (
            <Campo key={c.name} etiqueta={c.etiqueta} ayuda={c.ayuda} error={errores[c.name]?.[0]}>
              <input name={c.name} type={c.type ?? 'text'} className="input" required />
            </Campo>
          ))}
        </fieldset>

        <fieldset className="space-y-8">
          <legend className="regla-accent w-full pb-3 font-display text-2xl font-semibold text-secundaria">Tu taller</legend>
          {CAMPOS.slice(2, 6).map((c) => (
            <Campo key={c.name} etiqueta={c.etiqueta} ayuda={c.ayuda} error={errores[c.name]?.[0]}>
              <input name={c.name} type={c.type ?? 'text'} className="input" required />
            </Campo>
          ))}
          <Campo etiqueta="Estado" error={errores.estado?.[0]}>
            <select name="estado" className="input" defaultValue="Puebla">
              {NOMBRES_ESTADOS.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </Campo>
        </fieldset>

        <fieldset className="space-y-8">
          <legend className="regla-accent w-full pb-3 font-display text-2xl font-semibold text-secundaria">Cómo contactarte</legend>
          {CAMPOS.slice(6).map((c) => (
            <Campo key={c.name} etiqueta={c.etiqueta} ayuda={c.ayuda} error={errores[c.name]?.[0]}>
              <input name={c.name} type={c.type ?? 'text'} className="input" required />
            </Campo>
          ))}
        </fieldset>

        {mensaje && <p className="border-l-4 border-terciaria pl-4 text-sm text-terciaria">{mensaje}</p>}

        <button className="btn-accent w-full sm:w-auto" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar solicitud'} <ArrowUpRight className="size-4" />
        </button>
      </form>
    </div>
  );
}
