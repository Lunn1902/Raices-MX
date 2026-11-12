import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, MapPin, PackagePlus, QrCode, ShieldCheck, ShoppingCart, UserPlus, Wallet } from 'lucide-react';

type Caso = {
  cu: string;
  titulo: string;
  resumen: string;
  href: string;
  Icono: typeof UserPlus;
  foto?: string;
  posicion?: string;
  ancho: string;
  extra?: { href: string; texto: string };
};

const CASOS: Caso[] = [
  {
    cu: 'CU-01',
    titulo: 'Registro y verificación de productores',
    resumen: 'El promotor valida identidad y taller antes de que la pieza salga a la venta.',
    href: '/registro-productor',
    Icono: UserPlus,
    foto: '/img/cu-01-telar.jpg',
    ancho: 'md:col-span-3',
    extra: { href: '/promotor', texto: 'Panel del promotor' },
  },
  {
    cu: 'CU-04',
    titulo: 'Publicar pieza con ficha de origen y sello QR',
    resumen: 'Nueve datos obligatorios, una fotografía y un folio firmado con HMAC.',
    href: '/productor/publicar',
    Icono: PackagePlus,
    foto: '/img/cu-04-piezas.jpg',
    ancho: 'md:col-span-3',
  },
  {
    cu: 'CU-06',
    titulo: 'Verificar el origen de una pieza por QR',
    resumen: 'Sin cuenta: se recalcula la firma y se muestra la ficha completa.',
    href: '/verificar/RMX-PUE-2026-A15D09',
    Icono: QrCode,
    ancho: 'md:col-span-2',
  },
  {
    cu: 'CU-07',
    titulo: 'Catálogo con filtros y mapa de procedencia',
    resumen: 'Búsqueda por pueblo, técnica, estado y precio, más el mapa del país.',
    href: '/catalogo',
    Icono: MapPin,
    foto: '/img/cu-07-catalogo.jpg',
    posicion: 'object-[50%_30%]',
    ancho: 'md:col-span-2',
  },
  {
    cu: 'CU-08',
    titulo: 'Compra con desglose transparente 90/10',
    resumen: 'El cliente ve cuánto gana la plataforma y cuánto llega al taller.',
    href: '/comprador/carrito',
    Icono: ShoppingCart,
    foto: '/img/cu-08-compra-mercado.jpg',
    posicion: 'object-[50%_60%]',
    ancho: 'md:col-span-2',
  },
];

export default function Inicio() {
  return (
    <div className="space-y-14 pb-6">
      {/* Hero a todo lo ancho: rompe el contenedor de 6xl del layout */}
      <section className="relative left-1/2 -mt-6 w-screen -translate-x-1/2 overflow-hidden bg-milpa-oscuro text-white">
        <Image
          src="/img/hero-campo.jpg"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_55%] sm:object-[50%_58%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06130b]/93 via-[#0b2115]/70 to-[#0b2115]/15" />
        <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 py-20 sm:py-24 lg:min-h-[600px] lg:py-28">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
            <BadgeCheck className="size-4 text-[#b9dcae]" /> Origen verificable con sello criptográfico
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl lg:text-7xl">
            Compra directo a quien <span className="text-[#b9dcae]">hace la pieza</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            El 90% de cada venta llega al productor originario. Cada pieza trae su ficha de origen y un QR que
            cualquiera puede comprobar.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-milpa-oscuro transition hover:bg-alabastro"
            >
              Explorar el catálogo <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/verificar/RMX-PUE-2026-A15D09"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <ShieldCheck className="size-4" /> Verificar un sello
            </Link>
          </div>
          <dl className="mt-12 grid max-w-2xl grid-cols-1 gap-5 border-t border-white/15 pt-6 text-sm sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <Wallet className="mt-0.5 size-5 shrink-0 text-[#b9dcae]" />
              <div>
                <dt className="font-semibold">90% al productor</dt>
                <dd className="text-white/65">Comisión transparente del 10%</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#b9dcae]" />
              <div>
                <dt className="font-semibold">Sello HMAC-SHA256</dt>
                <dd className="text-white/65">Cualquiera puede verificarlo</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-[#b9dcae]" />
              <div>
                <dt className="font-semibold">Puebla y Oaxaca</dt>
                <dd className="text-white/65">Talleres de pueblos originarios</dd>
              </div>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-milpa">Versión 1</p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-tinta sm:text-4xl">
              Compras al por mayor y al por menor en un solo lugar
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-stone-600">
            Del registro del artesano a la compra verificable: cada tarjeta abre la pantalla donde vive ese paso.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-6">
          {CASOS.map(({ cu, titulo, resumen, href, Icono, foto, posicion, ancho, extra }) => (
            <article
              key={cu}
              className={`group relative flex min-h-[15rem] flex-col justify-between overflow-hidden rounded-2xl bg-milpa-oscuro p-5 text-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${ancho}`}
            >
              {foto ? (
                <Image
                  src={foto}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className={`object-cover opacity-90 transition duration-700 group-hover:scale-105 ${posicion ?? 'object-center'}`}
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,#3f7d4b_0%,transparent_55%)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08170d]/95 via-[#0f2416]/55 to-transparent" />
              {/* Icono de agua para las tarjetas sin fotografía */}
              {!foto && (
                <Icono
                  aria-hidden
                  strokeWidth={0.8}
                  className="pointer-events-none absolute -right-8 -top-8 size-44 text-white/10"
                />
              )}

              <div className="relative flex items-start justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
                  <Icono className="size-5" />
                </span>
                <ArrowUpRight className="size-5 text-white/60 transition group-hover:text-white" />
              </div>

              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">{cu}</p>
                <h3 className="mt-1 font-display text-xl font-semibold leading-snug sm:text-2xl">{titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">{resumen}</p>
                {extra && (
                  <Link
                    href={extra.href}
                    className="relative z-20 mt-3 inline-block text-sm font-semibold text-[#c6e4bd] underline-offset-4 hover:underline"
                  >
                    {extra.texto} →
                  </Link>
                )}
              </div>

              {/* Enlace estirado: toda la tarjeta es clicable sin anidar <a> */}
              <Link href={href} aria-label={`${cu}: ${titulo}`} className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-inset" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
