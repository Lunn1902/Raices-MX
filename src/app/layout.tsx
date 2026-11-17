import type { Metadata, Viewport } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import { Encabezado } from '@/components/Encabezado';
import './globals.css';

const texto = Source_Sans_3({ variable: '--font-texto', subsets: ['latin'] });
const display = Fraunces({ variable: '--font-fraunces', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'RaicesMX · Piezas con origen', template: '%s · RaicesMX' },
  description: 'Compra piezas hechas a mano directamente a quien las crea. Cada pieza trae su ficha de origen y un sello que cualquiera puede verificar.',
};

export const viewport: Viewport = { themeColor: '#1B4532', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es-MX" className={`${texto.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Encabezado />
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">{children}</main>
        <footer className="regla mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-display text-xl font-semibold text-secundaria">Raices<span className="text-terciaria">MX</span></p>
              <p className="mt-1 max-w-xs text-sm text-tinta-clara">
                Piezas con origen. Comercio justo con talleres de pueblos originarios de México.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-secundaria">
              <a href="/catalogo" className="hover:text-terciaria">Explorar piezas</a>
              <a href="/registro-productor" className="hover:text-terciaria">Soy artesano</a>
              <a href="/promotor" className="hover:text-terciaria">Verificación</a>
              <a href="/login" className="hover:text-terciaria">Entrar</a>
            </div>
          </div>
          <p className="mt-8 text-xs text-tinta-clara">Hecho con respeto en Puebla · Equipo 10 · FCC BUAP · Otoño 2026</p>
        </footer>
      </body>
    </html>
  );
}
