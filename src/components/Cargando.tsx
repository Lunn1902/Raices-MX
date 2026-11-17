export default function Cargando({ etiqueta = 'Cargando…' }: { etiqueta?: string }) {
  return (
    <div className="card flex items-center gap-3" role="status" aria-live="polite">
      <span
        className="size-4 animate-spin rounded-full border-2 border-stone-300 border-t-secundaria"
        aria-hidden="true"
      />
      <p className="text-stone-600">{etiqueta}</p>
    </div>
  );
}
