export const instant = false;

import { repo } from '@/lib/repositorio';
import CotizadorLote from './CotizadorLote';

// CU-09: el catálogo se resuelve en el servidor y el cotizador solo recibe datos serializables.
export default async function PaginaLotesB2B() {
  const piezas = await repo().catalogo({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="titulo">Comprar por lote</h1>
        <p className="mt-2 text-stone-600">
          Elige una pieza, define la cantidad y revisa el descuento por volumen antes de confirmar.
          Cada lote genera su contrato con pago escalonado 30/70.
        </p>
      </div>
      <CotizadorLote piezas={piezas} />
    </div>
  );
}

