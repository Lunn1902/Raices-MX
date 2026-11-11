'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Download, ShieldCheck } from 'lucide-react';
import { Campo, leerRespuesta, type ErroresCampos } from '@/components/Campo';
import { NOMBRES_ESTADOS } from '@/lib/estados';
import { formatoMXN, montoProductorB2C } from '@/modules/comisiones/calculo';
import { CATEGORIAS, type Productor } from '@/types';

interface Publicada {
  producto: { nombre: string };
  sello: { folio: string; url: string; qr: string };
  monto_productor: number;
}

// CU-04 + CU-05: ficha de origen con los 9 campos obligatorios y emisión del sello QR
export default function PublicarPieza() {
  const [productores, setProductores] = useState<Productor[]>([]);
  const [productor, setProductor] = useState<Productor | null>(null);
  const [precio, setPrecio] = useState('');
  const [errores, setErrores] = useState<ErroresCampos>({});
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [publicada, setPublicada] = useState<Publicada | null>(null);

  useEffect(() => {
    fetch('/api/v1/productores?estado=aprobado')
      .then((r) => r.json())
      .then((lista: Productor[]) => {
        setProductores(lista);
        setProductor(lista[0] ?? null);
      });
  }, []);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    const r = await leerRespuesta<Publicada>(await fetch('/api/v1/productos', { method: 'POST', body: new FormData(e.currentTarget) }));
    setEnviando(false);
    if (r.ok) return setPublicada(r.data);
    setErrores(r.campos);
    setMensaje(r.error);
  }

  if (publicada) {
    const { sello } = publicada;
    return (
      <div className="card mx-auto max-w-md space-y-3 text-center">
        <ShieldCheck className="mx-auto size-10 text-milpa" />
        <h1 className="text-xl font-bold">Sello de originalidad emitido</h1>
        <p className="text-stone-700">{publicada.producto.nombre}</p>
        <p className="font-mono text-lg">{sello.folio}</p>
        {/* eslint-disable-next-line @next/next/no-img-element -- QR generado en el servidor como data URL */}
        <img src={sello.qr} alt={`Código QR del folio ${sello.folio}`} className="mx-auto size-56" />
        <p className="text-sm text-stone-600">Recibirás {formatoMXN(publicada.monto_productor)} por cada venta (90%).</p>
        <div className="flex flex-col gap-2">
          <a href={`/api/v1/sello-qr/${sello.folio}/png`} className="btn">
            <Download className="size-4" /> Descargar QR (PNG)
          </a>
          <Link href={sello.url.replace(/^https?:\/\/[^/]+/, '')} className="btn-sec">
            Probar verificación pública
          </Link>
          <button className="text-sm text-barro hover:underline" onClick={() => location.reload()}>
            Publicar otra pieza
          </button>
        </div>
      </div>
    );
  }

  const err = (campo: string) => errores[campo]?.[0];
  const precioNum = Number(precio);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="titulo">Publicar pieza</h1>
      <p className="mb-4 text-stone-600">Los 9 datos de la ficha de origen son obligatorios y quedan firmados en el sello QR.</p>

      {/* key fuerza a reiniciar los valores precargados al cambiar de productor */}
      <form key={productor?.id ?? 'sin'} onSubmit={enviar} className="space-y-4" noValidate>
        <section className="card space-y-3">
          <Campo etiqueta="Publicar como" error={err('productor_id')} ayuda="Solo aparecen productores verificados por un promotor">
            <select name="productor_id" className="input" value={productor?.id ?? ''} onChange={(e) => setProductor(productores.find((p) => p.id === e.target.value) ?? null)}>
              {productores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre_completo} — {p.nombre_taller}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Nombre de la pieza" error={err('nombre')}>
            <input name="nombre" className="input" />
          </Campo>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Categoría" error={err('categoria')}>
              <select name="categoria" className="input">
                {CATEGORIAS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Piezas disponibles" error={err('stock')}>
              <input name="stock" type="number" min={1} defaultValue={1} className="input" />
            </Campo>
          </div>
          <Campo etiqueta="Descripción (opcional)">
            <textarea name="descripcion" rows={2} className="input" />
          </Campo>
        </section>

        <section className="card space-y-3">
          <h2 className="font-semibold">Ficha de origen</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="1. Nombre del productor" error={err('nombre_productor')}>
              <input name="nombre_productor" defaultValue={productor?.nombre_completo} className="input" />
            </Campo>
            <Campo etiqueta="2. Comunidad" error={err('comunidad')}>
              <input name="comunidad" defaultValue={productor?.comunidad} className="input" />
            </Campo>
            <Campo etiqueta="3. Estado" error={err('estado')}>
              <select name="estado" defaultValue={productor?.estado ?? 'Puebla'} className="input">
                {NOMBRES_ESTADOS.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="4. Pueblo originario" error={err('pueblo_originario')}>
              <input name="pueblo_originario" defaultValue={productor?.pueblo_originario} className="input" />
            </Campo>
            <Campo etiqueta="5. Técnica artesanal" error={err('tecnica')}>
              <input name="tecnica" defaultValue={productor?.tecnica_principal} className="input" />
            </Campo>
            <Campo etiqueta="6. Materiales utilizados" error={err('materiales')}>
              <input name="materiales" placeholder="Ej. Algodón, tintes naturales" className="input" />
            </Campo>
            <Campo etiqueta="7. Tiempo de elaboración" error={err('tiempo_elaboracion')}>
              <input name="tiempo_elaboracion" placeholder="Ej. 3 semanas" className="input" />
            </Campo>
            <Campo etiqueta="8. Precio en MXN" error={err('precio')}>
              <input name="precio" type="number" min={1} step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} className="input" />
            </Campo>
          </div>
          {precioNum > 0 && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-milpa">
              Recibirás <b>{formatoMXN(montoProductorB2C(precioNum))}</b> por pieza (90%). RaicesMX retiene {formatoMXN(precioNum - montoProductorB2C(precioNum))} (10%).
            </p>
          )}
          <Campo etiqueta="9. Fotografía de la pieza" error={err('foto')} ayuda="JPG, PNG o WEBP de máximo 5 MB">
            <input name="foto" type="file" accept="image/jpeg,image/png,image/webp" className="input file:mr-3 file:rounded file:border-0 file:bg-maiz file:px-3 file:py-1" />
          </Campo>
          <Campo etiqueta="Historia de la pieza (opcional)">
            <textarea name="historia_pieza" rows={3} className="input" />
          </Campo>
        </section>

        {mensaje && <p className="text-sm text-red-700">{mensaje}</p>}
        <button className="btn w-full" disabled={enviando || !productor}>
          {enviando ? 'Generando sello…' : 'Publicar y generar sello QR'}
        </button>
      </form>
    </div>
  );
}
