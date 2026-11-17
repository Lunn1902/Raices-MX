/**
 * @file AccesibilidadPanel.tsx
 * @description Panel lateral izquierdo (drawer) de opciones de accesibilidad.
 * Pestaña lanzadora fija al borde izquierdo (arrastrable al mantener presionado
 * ~0.5 s), overlay que cierra al hacer clic y drawer con cuatro secciones:
 * tamaño de letra, contraste, lectura en voz alta y opciones visuales.
 * Colores adaptados a RaicesMX: secundaria (verde) para textos, fondo (crema),
 * terciaria (coral) como acento en botones activos y foco, borde negro estilo
 * Inklusion.
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { Volume2, VolumeX, Type, Sun, Moon, Droplets, Link2, BookOpen, Pause, Eye } from 'lucide-react'
import { fontSizeOptions, fontLabels, voiceOptions, CLAVE_POS_Y } from '../lib/theme-a11y'
import type { FontSize, Contrast, VoiceType, AccesibilidadExtra } from '../lib/theme-a11y'
import ContrastToggle from './ContrastToggle'
import { desbloquearVoz } from '../lib/speech'

/** Props del panel de accesibilidad. */
interface AccessibilityPanelProps {
  /** Si el panel está abierto. */
  open: boolean
  /** Callback para cerrar el panel. */
  onClose: () => void
  /** Callback para abrir el panel (pestaña pegada al borde). */
  onOpen: () => void
  /** Tamaño de fuente activo. */
  fontSize: FontSize
  /** Callback al seleccionar un tamaño de fuente. */
  onFontSizeChange: (size: FontSize) => void
  /** Contraste activo (light/high). */
  contrast: Contrast
  /** Callback al cambiar contraste. */
  onContrastChange: (c: Contrast) => void
  /** Tipo de voz seleccionado para TalkBack. */
  voiceType: VoiceType
  /** Callback al cambiar tipo de voz. */
  onVoiceTypeChange: (v: VoiceType) => void
  /** Si TalkBack está habilitado. */
  talkBackEnabled: boolean
  /** Callback para alternar TalkBack. */
  onTalkBackToggle: () => void
  /** Toggles extra estilo Inklusion. */
  a11yExtra: AccesibilidadExtra
  /** Callback para alternar un toggle extra. */
  onToggleExtra: (clave: keyof AccesibilidadExtra) => void
}

/** Fila interruptor para un toggle extra de accesibilidad. */
function FilaExtra({
  icono,
  titulo,
  descripcion,
  activo,
  onToggle,
  etiqueta,
}: {
  icono: ReactNode
  titulo: string
  descripcion: string
  activo: boolean
  onToggle: () => void
  etiqueta: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${activo ? 'bg-secundaria/10 text-secundaria' : 'bg-terciaria/10 text-terciaria'}`}>
        {icono}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-secundaria">{titulo}</span>
        <span className="block text-[11px] leading-snug text-secundaria/60">{descripcion}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-label={etiqueta}
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
          activo ? 'bg-secundaria' : 'bg-[#cbb89a]'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
            activo ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

/** Drawer izquierdo de accesibilidad con fuente, contraste, voz y opciones visuales. */
export default function AccessibilityPanel({
  open,
  onClose,
  onOpen,
  fontSize,
  onFontSizeChange,
  contrast,
  onContrastChange,
  voiceType,
  onVoiceTypeChange,
  talkBackEnabled,
  onTalkBackToggle,
  a11yExtra,
  onToggleExtra,
}: AccessibilityPanelProps) {
  // Bloquea el scroll de fondo mientras el panel está abierto; restaura al cerrar.
  useEffect(() => {
    if (!open) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previo }
  }, [open])

  /** Altura de la pestaña lanzadora en % del alto visible (50 = a la mitad). */
  const [posY, setPosY] = useState<number>(50)
  /** Evita guardar el valor por defecto antes de leer lo que ya había guardado. */
  const [posYCargado, setPosYCargado] = useState(false)

  /** Recupera la altura guardada tras la hidratación (evita desajuste SSR). */
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(CLAVE_POS_Y))
      if (Number.isFinite(v) && v >= 5 && v <= 95) setPosY(v)
    } catch { /* sin almacenamiento: se conserva la mitad */ }
    setPosYCargado(true)
  }, [])
  /** True mientras se arrastra tras mantener presionado. */
  const [arrastrando, setArrastrando] = useState(false)
  /** Gesto en curso: tiempos, punto inicial y si ya se volvió arrastre o tap. */
  const gestoRef = useRef<{
    id: number
    y0: number
    timer: number | null
    arrastre: boolean
    suprimirClick: boolean
  } | null>(null)

  /** Guarda la altura elegida en este equipo. */
  useEffect(() => {
    if (!posYCargado) return
    try { localStorage.setItem(CLAVE_POS_Y, String(posY)) } catch { /* sin almacenamiento */ }
  }, [posY, posYCargado])

  /** Mantener ~0.5 s sin soltar ni mover convierte el toque en arrastre. */
  const UMBRAL_MS = 500
  /** Moverse más de esto antes del umbral cancela el arrastre (era scroll o tap). */
  const UMBRAL_PX = 10

  const limpiarGesto = () => {
    const g = gestoRef.current
    if (g?.timer !== null && g?.timer !== undefined) window.clearTimeout(g.timer)
    gestoRef.current = null
  }

  const onPestanaDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (open) return
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* sin captura */ }
    limpiarGesto()
    const y0 = e.clientY
    const timer = window.setTimeout(() => {
      const g = gestoRef.current
      if (!g || g.arrastre) return
      g.arrastre = true
      g.suprimirClick = true
      setArrastrando(true)
    }, UMBRAL_MS)
    gestoRef.current = { id: e.pointerId, y0, timer, arrastre: false, suprimirClick: false }
  }

  const onPestanaMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const g = gestoRef.current
    if (!g || e.pointerId !== g.id) return
    if (g.arrastre) {
      const h = window.innerHeight || 1
      const pct = Math.min(95, Math.max(5, (e.clientY / h) * 100))
      setPosY(pct)
    } else if (Math.abs(e.clientY - g.y0) > UMBRAL_PX) {
      if (g.timer !== null) window.clearTimeout(g.timer)
      g.timer = null
    }
  }

  const onPestanaUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const g = gestoRef.current
    if (!g || e.pointerId !== g.id) return
    if (g.timer !== null) window.clearTimeout(g.timer)
    if (g.arrastre) setArrastrando(false)
    // Si fue arrastre, el click que sigue no debe abrir/cerrar el panel.
    gestoRef.current = g.arrastre ? { ...g, timer: null } : null
    if (!g.arrastre) gestoRef.current = null
  }

  const onPestanaClick = () => {
    const g = gestoRef.current
    if (g?.suprimirClick) {
      gestoRef.current = null
      return
    }
    gestoRef.current = null
    if (open) onClose()
    else onOpen()
  }

  return (
    <>
      {/* Overlay semitransparente — clic cierra el panel */}
      {open && (
        <div
          data-gris
          className="fixed inset-0 z-[1160] bg-black/20 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Contenedor deslizante del drawer: overflow-hidden evita que el contenido
          ancho en A++ o el borde asomen cuando está cerrado. */}
      <div
        data-gris
        className={`panel-accesibilidad-deslizante fixed left-0 top-0 z-[1170] h-full w-[min(320px,100vw)] overflow-hidden transition-transform duration-500 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer lateral IZQUIERDO — borde negro en el canto derecho */}
        <aside
          className="relative flex h-full w-full flex-col border-r-2 border-black bg-fondo-claro shadow-xl"
          aria-label="Panel de accesibilidad"
          role="dialog"
          aria-modal={open}
        >
          {/* Cabecera: icono + título + botón de cierre */}
          <div className="flex min-w-0 items-center justify-between gap-3 border-b border-secundaria/20 px-5 py-4">
            <div className="flex min-w-0 items-center gap-2">
              {/* Misma figura de accesibilidad del botón lanzador */}
              <svg viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 shrink-0 text-secundaria" aria-hidden="true">
                <circle cx="13" cy="13" r="11" />
                <circle cx="13" cy="5.5" r="2" />
                <line x1="13" y1="9" x2="13" y2="15" />
                <line x1="9.5" y1="10" x2="5.5" y2="7.5" />
                <line x1="16.5" y1="10" x2="20.5" y2="7.5" />
                <line x1="13" y1="15" x2="9.5" y2="20.5" />
                <line x1="13" y1="15" x2="16.5" y2="20.5" />
              </svg>
              <h2 className="truncate font-semibold text-secundaria">Accesibilidad</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-secundaria transition-colors hover:bg-terciaria/10 hover:text-terciaria"
              aria-label="Cerrar panel de accesibilidad"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido scrolleable del panel */}
          <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* Sección: Tamaño de letra */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Type size={18} className="text-secundaria" />
                <h3 className="text-sm font-medium text-secundaria">Tamaño de letra</h3>
              </div>
              <div className="flex gap-2">
                {fontSizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => onFontSizeChange(size)}
                    className={`flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                      fontSize === size
                        ? 'bg-terciaria text-white shadow-sm'
                        : 'border-2 border-secundaria/25 text-secundaria hover:border-terciaria/40 hover:text-terciaria'
                    }`}
                    aria-label={`Tamaño de letra ${size === 'normal' ? 'normal' : size === 'large' ? 'grande' : 'muy grande'}`}
                    aria-pressed={fontSize === size}
                  >
                    {fontLabels[size]}
                  </button>
                ))}
              </div>
            </section>

            <div className="h-px bg-secundaria/20" />

            {/* Sección: Contraste */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                {contrast === 'high' ? (
                  <Moon size={18} className="text-secundaria" />
                ) : (
                  <Sun size={18} className="text-secundaria" />
                )}
                <h3 className="text-sm font-medium text-secundaria">Contraste</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secundaria">
                  {contrast === 'high' ? 'Alto contraste' : 'Claro'}
                </span>
                <ContrastToggle contrast={contrast} onChange={onContrastChange} />
              </div>
            </section>

            <div className="h-px bg-secundaria/20" />

            {/* Sección: Lectura en voz alta (TalkBack) */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Volume2 size={18} className="text-secundaria" />
                <h3 className="text-sm font-medium text-secundaria">Lectura en voz alta</h3>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-secundaria/70">
                Al activar esta opción, puedes presionar cualquier texto o botón y se leerá en voz alta.
              </p>
              <button
                onClick={() => { desbloquearVoz(); onTalkBackToggle() }}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  talkBackEnabled
                    ? 'bg-terciaria text-white shadow-sm'
                    : 'border-2 border-secundaria/25 text-secundaria hover:border-terciaria/40 hover:text-terciaria'
                }`}
                aria-label={talkBackEnabled ? 'Desactivar lectura en voz alta' : 'Activar lectura en voz alta'}
                aria-pressed={talkBackEnabled}
              >
                {talkBackEnabled ? (
                  <>
                    <Volume2 size={18} />
                    Activado
                  </>
                ) : (
                  <>
                    <VolumeX size={18} />
                    Desactivado
                  </>
                )}
              </button>

              {/* Selector de voz — solo visible en desktop; en móvil se usa la femenina */}
              {talkBackEnabled && (
                <div className="mt-3 hidden md:block">
                  <p className="mb-2 text-xs text-secundaria/70">Voz</p>
                  <div className="flex gap-2">
                    {voiceOptions.map((v) => (
                      <button
                        key={v}
                        onClick={() => onVoiceTypeChange(v)}
                        className={`flex flex-1 items-center justify-center rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 ${
                          voiceType === v
                            ? 'bg-terciaria text-white shadow-sm'
                            : 'border-2 border-secundaria/25 text-secundaria hover:border-terciaria/40 hover:text-terciaria'
                        }`}
                        aria-pressed={voiceType === v}
                      >
                        {v === 'female' ? 'Femenina' : 'Masculina'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <div className="h-px bg-secundaria/20" />

            {/* Sección: Opciones visuales estilo Inklusion */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Eye size={18} className="text-secundaria" />
                <h3 className="text-sm font-medium text-secundaria">Opciones visuales</h3>
              </div>
              <div className="flex flex-col gap-3">
                <FilaExtra
                  icono={<Droplets size={18} />}
                  titulo="Escala de grises"
                  descripcion="Quita el color del contenido"
                  activo={a11yExtra.grayscale}
                  onToggle={() => onToggleExtra('grayscale')}
                  etiqueta="Activar escala de grises"
                />
                <FilaExtra
                  icono={<Link2 size={18} />}
                  titulo="Subrayar enlaces"
                  descripcion="Marca todos los enlaces con subrayado"
                  activo={a11yExtra.underlineLinks}
                  onToggle={() => onToggleExtra('underlineLinks')}
                  etiqueta="Activar subrayado de enlaces"
                />
                <FilaExtra
                  icono={<BookOpen size={18} />}
                  titulo="Fuente legible"
                  descripcion="Letra sencilla con más espacio"
                  activo={a11yExtra.readableFont}
                  onToggle={() => onToggleExtra('readableFont')}
                  etiqueta="Activar fuente legible"
                />
                <FilaExtra
                  icono={<Pause size={18} />}
                  titulo="Pausar animaciones"
                  descripcion="Detiene movimientos y transiciones"
                  activo={a11yExtra.pauseAnimations}
                  onToggle={() => onToggleExtra('pauseAnimations')}
                  etiqueta="Pausar animaciones"
                />
              </div>
            </section>
          </div>
        </aside>
      </div>

      {/* Pestaña lanzadora fija al borde izquierdo. Mantener presionado ~0.5 s
          permite arrastrarla a cualquier altura; el drawer la tapa al abrir. */}
      <button
        type="button"
        data-gris
        onPointerDown={onPestanaDown}
        onPointerMove={onPestanaMove}
        onPointerUp={onPestanaUp}
        onPointerCancel={onPestanaUp}
        onClick={onPestanaClick}
        aria-label={open ? 'Ocultar panel de accesibilidad' : 'Abrir panel de accesibilidad. Mantén presionado para moverlo de altura'}
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        title="Mantén presionado para moverlo de altura"
        style={{ top: `${posY}%`, touchAction: 'none' }}
        className={`fixed left-0 z-[1150] flex -translate-y-1/2 cursor-grab select-none flex-col items-center rounded-r-2xl border-2 border-l-0 border-black bg-fondo px-2.5 py-4 text-secundaria shadow-xl transition-shadow duration-300 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-terciaria/50 focus:ring-offset-2 active:cursor-grabbing ${arrastrando ? 'scale-105 ring-2 ring-terciaria' : ''}`}
      >
        {/* Misma figura de accesibilidad del encabezado */}
        <svg viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
          <circle cx="13" cy="13" r="11" />
          <circle cx="13" cy="5.5" r="2" />
          <line x1="13" y1="9" x2="13" y2="15" />
          <line x1="9.5" y1="10" x2="5.5" y2="7.5" />
          <line x1="16.5" y1="10" x2="20.5" y2="7.5" />
          <line x1="13" y1="15" x2="9.5" y2="20.5" />
          <line x1="13" y1="15" x2="16.5" y2="20.5" />
        </svg>
      </button>
    </>
  )
}
