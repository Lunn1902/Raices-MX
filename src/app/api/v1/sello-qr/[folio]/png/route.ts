import { NextResponse } from 'next/server';
import { qrPng } from '@/modules/sello-qr/servicio';

// GET /api/v1/sello-qr/:folio/png  descarga del QR para imprimir la etiqueta (RF-05)
export async function GET(_req: Request, { params }: { params: Promise<{ folio: string }> }) {
  const { folio } = await params;
  const png = await qrPng(decodeURIComponent(folio));
  if (!png) return NextResponse.json({ error: 'Folio no encontrado' }, { status: 404 });
  return new NextResponse(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="sello-${folio}.png"`,
    },
  });
}
