import Link from 'next/link';

export default function DashboardCompradorB2B() {
  return (
    <div className="space-y-6">
      <h1 className="titulo">Panel Comprador B2B</h1>
      <p className="text-stone-600">Compra por lote, genera contratos y gestiona pedidos mayoristas.</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/comprador-b2b/lotes" className="card hover:shadow-md transition">
          <h2 className="font-semibold text-secundaria">Lotes</h2>
          <p className="text-sm text-stone-600 mt-1">5 a 50 piezas con descuento</p>
        </Link>
        <Link href="/comprador-b2b/contratos" className="card hover:shadow-md transition">
          <h2 className="font-semibold text-secundaria">Contratos</h2>
          <p className="text-sm text-stone-600 mt-1">Pago escalonado 30/70</p>
        </Link>
        <Link href="/comprador-b2b/pedidos" className="card hover:shadow-md transition">
          <h2 className="font-semibold text-secundaria">Pedidos mayoristas</h2>
          <p className="text-sm text-stone-600 mt-1">Estado y entrega</p>
        </Link>
      </div>
    </div>
  );
}
