import type { FiltrosCatalogo, PiezaCatalogo } from '@/types';

// Normaliza para que "ceramica" encuentre "Cerámica" y "nahuatl" encuentre "Náhuatl"
export const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const coincide = (valor: string, filtro?: string) => !filtro || normalizar(valor) === normalizar(filtro);

// Todos los filtros se combinan con AND (RF-07)
export function filtrarPiezas(piezas: PiezaCatalogo[], f: FiltrosCatalogo): PiezaCatalogo[] {
  const q = f.q ? normalizar(f.q) : '';
  return piezas.filter((p) => {
    if (q) {
      const texto = normalizar(
        [p.nombre, p.descripcion, p.categoria, p.tecnica, p.materiales, p.comunidad, p.nombre_productor, p.pueblo_originario].join(' '),
      );
      if (!texto.includes(q)) return false;
    }
    return (
      coincide(p.categoria, f.categoria) &&
      coincide(p.estado, f.estado) &&
      coincide(p.pueblo_originario, f.pueblo) &&
      coincide(p.tecnica, f.tecnica) &&
      (f.precioMin === undefined || p.precio_unitario >= f.precioMin) &&
      (f.precioMax === undefined || p.precio_unitario <= f.precioMax)
    );
  });
}

export function leerFiltros(params: URLSearchParams | Record<string, string | string[] | undefined>): FiltrosCatalogo {
  const get = (k: string) => {
    const v = params instanceof URLSearchParams ? params.get(k) : params[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s && s.trim() ? s.trim() : undefined;
  };
  const num = (k: string) => {
    const v = get(k);
    const n = v === undefined ? NaN : Number(v);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  return {
    q: get('q'),
    categoria: get('categoria'),
    estado: get('estado'),
    pueblo: get('pueblo'),
    tecnica: get('tecnica'),
    precioMin: num('min'),
    precioMax: num('max'),
  };
}
