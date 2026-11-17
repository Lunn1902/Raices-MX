/**
 * @file theme-a11y.ts
 * @description
 * Constantes y tipos de accesibilidad para RaicesMX. Centraliza las opciones
 * de tamaño de letra, contraste y voz (TalkBack), además de los toggles
 * visuales estilo Inklusion y las claves de localStorage (`raicesmx_a11y_*`).
 *
 * Las preferencias se reflejan como atributos `data-*` en `<html>` y son
 * consumidas por `src/app/globals.css`.
 */

/** Opciones válidas de tamaño de fuente (persistidas en localStorage). */
export const fontSizeOptions = ['normal', 'large', 'xlarge'] as const

/** Tipo derivado de `fontSizeOptions`. */
export type FontSize = (typeof fontSizeOptions)[number]

/** Valor CSS aplicado al root (el CSS real usa `data-font-size`). */
export const fontSizeValues: Record<FontSize, string> = {
  normal: '100%',
  large: '150%',
  xlarge: '200%',
}

/** Etiquetas cortas del selector de tamaño de fuente. */
export const fontLabels: Record<FontSize, string> = {
  normal: 'A',
  large: 'A+',
  xlarge: 'A++',
}

/** Modos de contraste: claro (institucional) y alto contraste. */
export const contrastOptions = ['light', 'high'] as const

/** Tipo derivado de `contrastOptions`. */
export type Contrast = (typeof contrastOptions)[number]

/** Tipos de voz para síntesis de voz (Web Speech API). */
export const voiceOptions = ['female', 'male'] as const

/** Tipo derivado de `voiceOptions`. */
export type VoiceType = (typeof voiceOptions)[number] // 'female' | 'male'

/** Toggles extra de accesibilidad estilo Inklusion. */
export interface AccesibilidadExtra {
  /** Escala de grises de todo el contenido (raíces fijas incluidas). */
  grayscale: boolean
  /** Subraya todos los enlaces. */
  underlineLinks: boolean
  /** Fuente sans genérica con más aire (legibilidad). */
  readableFont: boolean
  /** Pausa animaciones CSS y transiciones. */
  pauseAnimations: boolean
}

/** Valores iniciales (todo apagado). */
export const a11yExtraInit: AccesibilidadExtra = {
  grayscale: false,
  underlineLinks: false,
  readableFont: false,
  pauseAnimations: false,
}

/** Claves de localStorage — todas con el prefijo `raicesmx_a11y_`. */
export const CLAVE_FONT_SIZE = 'raicesmx_a11y_fontSize'
export const CLAVE_CONTRAST = 'raicesmx_a11y_contrast'
export const CLAVE_VOICE = 'raicesmx_a11y_voice'
export const CLAVE_EXTRA = 'raicesmx_a11y_extra'
export const CLAVE_POS_Y = 'raicesmx_a11y_posY'
