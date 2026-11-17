import Link from 'next/link';

export default function DashboardComprador() {
  return (
    <div className="space-y-6">
      <h1 className="titulo">Panel Comprador B2C</h1>
      <p className="text-stone-600">Explora el catálogo, guarda favoritos y revisa tus pedidos.</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/catalogo" className="card hover:shadow-md transition">
          <h2 className="font-semibold text-secundaria">Catálogo</h2>
          <p className="text-sm text-stone-600 mt-1">Filtros y mapa de procedencia</p>
        </Link>
        <Link href="/comprador/carrito" className="card hover:shadow-md transition">
          <h2 className="font-semibold text-secundaria">Carrito</h2>
          <p className="text-sm text-stone-600 mt-1">Compra con reparto 90/10</p>
        </Link>
        <Link href="/comprador/pedidos" className="card hover:shadow-md transition">
          <h2 className="font-semibold text-secundaria">Mis pedidos</h2>
          <p className="text-sm text-stone-600 mt-1">Estado y entrega</p>
        </Link>
      </div>
    </div>
  );
}
