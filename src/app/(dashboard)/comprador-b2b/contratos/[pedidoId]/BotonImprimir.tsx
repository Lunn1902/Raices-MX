'use client';

import { Download } from 'lucide-react';

export default function BotonImprimir() {
  return (
    <button type="button" onClick={() => window.print()} className="btn print:hidden">
      <Download className="size-4" />
      Descargar contrato (PDF)
    </button>
  );
}
