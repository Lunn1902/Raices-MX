'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
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

// CU-01: alta del productor; queda pendiente hasta la visita del promotor
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
      <div className="card mx-auto max-w-lg text-center">
        <CheckCircle2 className="mx-auto mb-2 size-12 text-milpa" />
        <h1 className="text-xl font-bold">Solicitud recibida</h1>
        <p className="mt-2 text-stone-700">
          {registrado.nombre_completo}, tu taller <b>{registrado.nombre_taller}</b> quedó en estado <b>pendiente</b>.
          Un promotor de RaicesMX visitará {registrado.comunidad} para verificar tu identidad y proceso artesanal.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="titulo">Registro de productor</h1>
      <p className="mb-4 text-stone-600">Podrás publicar tus piezas cuando un promotor apruebe tu registro.</p>
      <form onSubmit={enviar} className="card space-y-3" noValidate>
        {CAMPOS.map((c) => (
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
        {mensaje && <p className="text-sm text-red-700">{mensaje}</p>}
        <button className="btn w-full" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </form>
    </div>
  );
}
