/**
 * @file ContrastToggle.tsx
 * @description Toggle visual para alternar entre contraste claro y alto contraste.
 * Renderiza un `<label>` con un `<input type="checkbox">` oculto (`sr-only`)
 * y un `<span>` circular con iconos de Sol/Luna y efecto neumórfico.
 */
import type { Contrast } from '../lib/theme-a11y'

/** Props del toggle de contraste. */
interface Props {
  /** Contraste actual: 'light' muestra sol, 'high' muestra luna. */
  contrast: Contrast
  /** Callback al cambiar; recibe el nuevo valor. */
  onChange: (c: Contrast) => void
}

/** Icono de luna (SVG inline) para modo alto contraste. */
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.43 5.43 0 0 1-5.43-5.43c0-2.39 1.56-4.42 3.72-5.15A8.77 8.77 0 0 0 12 3Z" />
  </svg>
)

/** Icono de sol (SVG inline) para modo claro. */
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1ZM4.93 4.93a1 1 0 0 1 1.41 0l.7.7a1 1 0 0 1-1.41 1.42l-.7-.7a1 1 0 0 1 0-1.42Zm14.14 0a1 1 0 0 1 0 1.42l-.7.7a1 1 0 1 1-1.42-1.42l.7-.7a1 1 0 0 1 1.42 0ZM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-9 3a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2H3Zm17 0a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2h-1ZM5.64 16.95a1 1 0 0 1 1.41 0l.7.7a1 1 0 0 1-1.42 1.42l-.7-.7a1 1 0 0 1 0-1.42Zm12.72 0a1 1 0 0 1 0 1.42l-.7.7a1 1 0 1 1-1.42-1.42l.7-.7a1 1 0 0 1 1.42 0ZM12 19a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1Z" />
  </svg>
)

/**
 * Toggle circular de contraste claro/alto contraste con iconos animados y efecto neumórfico.
 */
export default function ContrastToggle({ contrast, onChange }: Props) {
  const high = contrast === 'high'

  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={high}
        onChange={() => onChange(high ? 'light' : 'high')}
        className="peer sr-only"
        aria-label="Alternar alto contraste"
      />
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300
          ${high
            ? 'bg-gradient-to-br from-[#000000] to-[#1a1a1a] text-[#ffcc00] shadow-[inset_2px_2px_0_#333,inset_-2px_-2px_0_#000]'
            : 'bg-gradient-to-br from-[#fef9e7] to-[#fdebd0] text-[#f39c12] shadow-[inset_2px_2px_0_#fff,inset_-2px_-2px_0_#d4c5a0]'
          }
          before:absolute before:inset-0 before:rounded-full before:transition-all before:duration-300
          ${high
            ? 'before:shadow-[11px_11px_22px_#000,-11px_-11px_22px_#333]'
            : 'before:shadow-[11px_11px_22px_#d4c5a0,-11px_-11px_22px_#fff]'
          }
        `}
      >
        <span className="relative z-10 h-7 w-7">
          {high ? <MoonIcon /> : <SunIcon />}
        </span>
      </span>
    </label>
  )
}
