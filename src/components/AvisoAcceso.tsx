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
    <div className="mx-auto max-w-lg py-10 text-center">
      <h1 className="titulo">{titulo}</h1>
      <div className="regla-accent mt-6" />
      <p className="plomo mt-6">{mensaje}</p>
      <Link href={href} className="btn mt-8">{etiqueta}</Link>
    </div>
  );
}
