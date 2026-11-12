import type { Metadata, Viewport } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import { Encabezado } from '@/components/Encabezado';
import { modoDemo } from '@/lib/config';
import './globals.css';

const texto = Source_Sans_3({ variable: '--font-texto', subsets: ['latin'] });
const display = Fraunces({ variable: '--font-fraunces', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'RaicesMX', template: '%s · RaicesMX' },
  description: 'Comercio directo y verificable con productores originarios de México.',
};

export const viewport: Viewport = { themeColor: '#2f6b3b', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es-MX" className={`${texto.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Encabezado />
        {modoDemo() && (
          <p className="border-b border-green-200 bg-green-50 px-4 py-1.5 text-center text-xs text-green-900">
            Modo demo: datos semilla en memoria. Configura Supabase en <code>.env.local</code> para usar la base real.
          </p>
        )}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-stone-200 px-4 py-4 text-center text-xs text-stone-500">
          RaicesMX · Equipo 10 · FCC BUAP · Otoño 2026
        </footer>
      </body>
    </html>
  );
}
