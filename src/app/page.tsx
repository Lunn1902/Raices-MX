import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, MapPin, QrCode, ShieldCheck, Wallet } from 'lucide-react';

export default function Inicio() {
  return (
    <div className="-mt-10 sm:-mt-14">
      {/* ================= HERO ================= */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-secundaria-oscuro text-white">
        <Image
          src="/img/hero-campo.jpg"
          alt="Campo de maíz en Puebla al atardecer"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_55%] brightness-[0.45] saturate-[0.7] sm:object-[50%_58%]"
        />
        {/* Fondo casi negro-verde: el crema, el blanco y el coral contrastan al máximo */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(4,14,9,0.67) 0%, rgba(6,20,12,0.60) 50%, rgba(9,28,18,0.49) 100%)' }}
        />
        {/* Halo coral tenue: calienta el fondo y hace que el acento destaque */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 78% 30%, rgba(238,65,41,0.18) 0%, transparent 45%)' }}
        />

        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
          <p className="eyebrow flex items-center gap-2 text-terciaria-suave">
            <span className="inline-block size-2 bg-terciaria" /> Comercio justo con origen verificable
          </p>

          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-8xl">
            Lo que haces con tus manos, <span className="text-terciaria-suave">llegue lejos</span>.
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            Compra piezas hechas a mano directamente a quien las crea. Sin intermediarios, con su historia y un
            sello que cualquiera puede comprobar.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/catalogo" className="btn-accent">
              Explorar piezas <ArrowUpRight className="size-4" />
            </Link>
            <Link href="/registro-productor" className="inline-flex min-h-11 items-center gap-2 border border-white/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/10">
              Soy artesano
            </Link>
          </div>

          {/* Cifras: el coral marca los numeros */}
          <dl className="mt-16 grid max-w-3xl grid-cols-1 gap-8 border-t border-white/20 pt-8 sm:grid-cols-3">
            <div>
              <dt className="sr-only">Reparto al productor</dt>
              <dd>
                <span className="block font-display text-5xl font-semibold text-terciaria">90%</span>
                <span className="mt-1 block text-sm text-white/75">de cada venta llega al taller</span>
              </dd>
            </div>
            <div>
              <dt className="sr-only">Talleres participantes</dt>
              <dd>
                <span className="block font-display text-5xl font-semibold text-terciaria">7</span>
                <span className="mt-1 block text-sm text-white/75">talleres de pueblos originarios</span>
              </dd>
            </div>
            <div>
              <dt className="sr-only">Sello de origen</dt>
              <dd>
                <span className="block font-display text-5xl font-semibold text-terciaria">100%</span>
                <span className="mt-1 block text-sm text-white/75">de las piezas con sello verificable</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ================= MANIFIESTO ================= */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="eyebrow-accent">Nuestra promesa</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <h2 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-secundaria sm:text-5xl lg:text-6xl">
            Cada pieza cuenta quién la hizo, dónde nació y <span className="text-terciaria">cuánto recibió su autor</span>.
          </h2>
          <div className="space-y-6 self-end">
            <p className="plomo">
              Aquí no hay intermediarios que se queden con la mayor parte. El artesano pone su precio, nosotros
              cobramos una comisión pequeña y transparente, y tú recibes una pieza con identidad.
            </p>
            <Link href="/catalogo" className="enlace">
              Ver las piezas disponibles <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CÓMO FUNCIONA (sin tarjetas) ================= */}
      <section className="regla mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow-accent">Así funciona</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-secundaria sm:text-5xl">
              Cuatro pasos, sin enredos.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-tinta-clara">
            Del taller a tu puerta, con la misma claridad en cada etapa.
          </p>
        </div>

        <ol className="mt-12">
          {[
            {
              num: '01',
              titulo: 'El artesano se da a conocer',
              texto: 'Un promotor visita el taller, revisa la identidad y confirma que la pieza es realmente hecha ahí.',
              href: '/registro-productor',
              cta: 'Registrarme como artesano',
            },
            {
              num: '02',
              titulo: 'La pieza recibe su sello',
              texto: 'Cada pieza se publica con su ficha de origen y un código QR que certifica quién la hizo y con qué técnica.',
              href: '/productor/publicar',
              cta: 'Publicar una pieza',
            },
            {
              num: '03',
              titulo: 'Tú la encuentras y la compras',
              texto: 'Explora por estado, pueblo o técnica. En el carrito ves exactamente cuánto recibe el artesano.',
              href: '/catalogo',
              cta: 'Explorar el catálogo',
            },
            {
              num: '04',
              titulo: 'Compruebas su origen',
              texto: 'Escanea el QR o abre el enlace. Sin crear cuenta: la firma digital te dice si es auténtica.',
              href: '/verificar/RMX-PUE-2026-A15D09',
              cta: 'Probar la verificación',
            },
          ].map((paso) => (
            <li key={paso.num} className="regla group grid gap-4 py-8 sm:grid-cols-[100px_1fr_auto] sm:items-start sm:gap-8">
              <span className="font-display text-6xl font-semibold leading-none text-terciaria sm:text-7xl">
                {paso.num}
              </span>
              <div>
                <h3 className="font-display text-2xl font-semibold text-secundaria sm:text-3xl">{paso.titulo}</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-tinta-clara sm:text-base">{paso.texto}</p>
              </div>
              <Link href={paso.href} className="enlace mt-2 self-start whitespace-nowrap text-sm">
                {paso.cta} <ArrowRight className="size-4" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ================= GALERÍA EDITORIAL ================= */}
      <section className="regla mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="eyebrow-accent">Del campo a tus manos</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-secundaria sm:text-5xl">
          Piezas con nombre y apellido.
        </h2>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <Link href="/catalogo" className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-secundaria/10">
              <Image
                src="/img/cu-01-telar.jpg"
                alt="Telar de cintura en un taller artesanal"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute bottom-0 left-0 bg-terciaria px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white">
                Textiles
              </span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold text-secundaria group-hover:text-terciaria">
              Telares que cuentan historias
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-tinta-clara">
              Huipiles, tapetes y piñatas tejidos a mano con técnicas que pasan de generación en generación.
            </p>
          </Link>

          <Link href="/catalogo" className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-secundaria/10">
              <Image
                src="/img/cu-04-piezas.jpg"
                alt="Piezas de cerámica artesanal"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute bottom-0 left-0 bg-terciaria px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white">
                Cerámica
              </span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold text-secundaria group-hover:text-terciaria">
              Barro modelado a mano
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-tinta-clara">
              Ollas, jarrones y figuras policromadas, cocidas con leña y pulidas con piedra de río.
            </p>
          </Link>
        </div>
      </section>

      {/* ================= CIERRE ================= */}
      <section className="bg-secundaria text-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="eyebrow text-terciaria-suave">Empieza hoy</p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Una pieza, un taller, una historia que sigue viva.
              </h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/catalogo" className="btn-accent">
                Explorar piezas <ArrowUpRight className="size-4" />
              </Link>
              <Link href="/verificar/RMX-PUE-2026-A15D09" className="inline-flex min-h-11 items-center gap-2 border border-white/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-white/10">
                <ShieldCheck className="size-4" /> Verificar un sello
              </Link>
            </div>
          </div>
          <div className="mt-14 grid gap-6 border-t border-white/20 pt-8 text-sm text-white/75 sm:grid-cols-3">
            <p className="flex items-center gap-3"><Wallet className="size-5 shrink-0 text-terciaria" /> 90% directo al artesano</p>
            <p className="flex items-center gap-3"><QrCode className="size-5 shrink-0 text-terciaria" /> Sello verificable sin cuenta</p>
            <p className="flex items-center gap-3"><MapPin className="size-5 shrink-0 text-terciaria" /> Puebla y Oaxaca</p>
          </div>
        </div>
      </section>
    </div>
  );
}
