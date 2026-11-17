export const instant = false;

import { repo } from '@/lib/repositorio';
import CotizadorLote from './CotizadorLote';

// CU-09: el catálogo se resuelve en el servidor y el cotizador solo recibe datos serializables.
export default async function PaginaLotesB2B() {
  const piezas = await repo().catalogo({});

  return (
    <div className="py-10">
      <header>
        <p className="eyebrow-accent">Pedidos por lote</p>
        <h1 className="titulo mt-3">Comprar por lote</h1>
        <p className="plomo mt-4 max-w-2xl">
          Elige una pieza, define la cantidad y revisa el descuento por volumen antes de confirmar.
          Cada lote genera su contrato con un anticipo del 30% y el saldo a la entrega.
        </p>
        <div className="regla-accent mt-6" />
      </header>

      <CotizadorLote piezas={piezas} />
    </div>
  );
}

