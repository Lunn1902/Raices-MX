// Etiqueta de estado reutilizable. Tono secundaria = estado normal; terciaria = alerta/pendiente.
export default function Badge({ texto, tono = 'neutro' }: { texto: string; tono?: 'secundaria' | 'terciaria' | 'neutro' }) {
  const clases = {
    secundaria: 'border-secundaria/40 text-secundaria',
    terciaria: 'border-terciaria/60 text-terciaria',
    neutro: 'border-secundaria/25 text-tinta-clara',
  };

  return (
    <span className={`inline-flex items-center border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${clases[tono]}`}>
      {texto}
    </span>
  );
}
