export default function Cargando({ etiqueta = 'Cargando…' }: { etiqueta?: string }) {
  return (
    <div className="flex items-center gap-3 border-t border-secundaria/20 py-6" role="status" aria-live="polite">
      <span
        className="size-4 animate-spin rounded-full border-2 border-secundaria/20 border-t-terciaria"
        aria-hidden="true"
      />
      <p className="text-tinta-clara">{etiqueta}</p>
    </div>
  );
}
