import type { ReactNode } from 'react';

export function Campo({ etiqueta, error, ayuda, children }: { etiqueta: string; error?: string; ayuda?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{etiqueta}</span>
      {children}
      {ayuda && !error && <span className="mt-1 block text-xs text-stone-500">{ayuda}</span>}
      {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

// Formato de error de la API: { error, campos?: { campo: [mensajes] } }
export type ErroresCampos = Record<string, string[] | undefined>;

export async function enviarJson<T>(url: string, metodo: string, cuerpo: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string; campos: ErroresCampos }> {
  const res = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
  return leerRespuesta<T>(res);
}

export async function leerRespuesta<T>(res: Response): Promise<{ ok: true; data: T } | { ok: false; error: string; campos: ErroresCampos }> {
  const json = await res.json().catch(() => ({}));
  if (res.ok) return { ok: true, data: json as T };
  return { ok: false, error: json.error ?? 'No se pudo completar la operación', campos: json.campos ?? json.detalles ?? {} };
}
