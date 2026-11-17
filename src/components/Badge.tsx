// Etiqueta de estado reutilizable. Tono secundaria = estado normal; terciaria = alerta/pendiente.
export default function Badge({ texto, tono = 'neutro' }: { texto: string; tono?: 'secundaria' | 'terciaria' | 'neutro' }) {
  const clases = {
    secundaria: 'bg-secundaria/10 text-secundaria',
    terciaria: 'bg-terciaria/10 text-terciaria',
    neutro: 'bg-stone-100 text-stone-700',
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${clases[tono]}`}>
      {texto}
    </span>
  );
}
