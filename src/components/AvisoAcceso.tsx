import Link from 'next/link';

// Aviso mostrado cuando no hay sesión o el rol no corresponde a la sección.
export default function AvisoAcceso({
  titulo = 'Acceso restringido',
  mensaje,
  href = '/',
  etiqueta = 'Volver al inicio',
}: {
  titulo?: string;
  mensaje: string;
  href?: string;
  etiqueta?: string;
}) {
  return (
    <div className="card mx-auto max-w-lg space-y-3 text-center">
      <h1 className="titulo">{titulo}</h1>
      <p className="text-stone-600">{mensaje}</p>
      <Link href={href} className="btn">{etiqueta}</Link>
    </div>
  );
}
