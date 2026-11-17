/**
 * @file ProveedorAccesibilidad.tsx
 * @description
 * Proveedor global de accesibilidad de RaicesMX. Envuelve toda la app,
 * persiste las preferencias en localStorage (`raicesmx_a11y_*`), aplica los
 * atributos `data-*` en `<html>` que consume globals.css y renderiza el panel
 * flotante. En móvil (<= 767 px) fuerza la voz femenina para TalkBack.
 */
'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import AccesibilidadPanel from './AccesibilidadPanel'
import { useTalkBack } from '@/hooks/useTalkBack'
import {
  a11yExtraInit,
  contrastOptions,
  fontSizeOptions,
  voiceOptions,
  CLAVE_FONT_SIZE,
  CLAVE_CONTRAST,
  CLAVE_VOICE,
  CLAVE_EXTRA,
} from '@/lib/theme-a11y'
import type { AccesibilidadExtra, Contrast, FontSize, VoiceType } from '@/lib/theme-a11y'

/** Type guards para validar lo que viene de localStorage. */
function esFontSize(v: unknown): v is FontSize {
  return typeof v === 'string' && (fontSizeOptions as readonly string[]).includes(v)
}
function esContrast(v: unknown): v is Contrast {
  return typeof v === 'string' && (contrastOptions as readonly string[]).includes(v)
}
function esVoice(v: unknown): v is VoiceType {
  return typeof v === 'string' && (voiceOptions as readonly string[]).includes(v)
}

/** Atributos `data-*` que se limpian al desmontar el proveedor. */
const ATRIBUTOS = [
  'data-font-size',
  'data-contrast',
  'data-grayscale',
  'data-underline-links',
  'data-readable-font',
  'data-pause-animations',
] as const

export function ProveedorAccesibilidad({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>('normal')
  const [contrast, setContrast] = useState<Contrast>('light')
  const [voiceType, setVoiceType] = useState<VoiceType>('female')
  const [talkBack, setTalkBack] = useState(false)
  const [a11yExtra, setA11yExtra] = useState<AccesibilidadExtra>(a11yExtraInit)
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [esMovil, setEsMovil] = useState(false)
  const [hidratado, setHidratado] = useState(false)

  /** Cargar preferencias guardadas tras la hidratación (evita desajuste SSR). */
  useEffect(() => {
    try {
      const fs = localStorage.getItem(CLAVE_FONT_SIZE)
      if (esFontSize(fs)) setFontSize(fs)
      const c = localStorage.getItem(CLAVE_CONTRAST)
      if (esContrast(c)) setContrast(c)
      const v = localStorage.getItem(CLAVE_VOICE)
      if (esVoice(v)) setVoiceType(v)
      const extra = localStorage.getItem(CLAVE_EXTRA)
      if (extra) {
        const p = JSON.parse(extra) as Partial<AccesibilidadExtra>
        setA11yExtra({
          grayscale: p.grayscale === true,
          underlineLinks: p.underlineLinks === true,
          readableFont: p.readableFont === true,
          pauseAnimations: p.pauseAnimations === true,
        })
      }
    } catch { /* sin almacenamiento o JSON inválido: se conservan los defaults */ }
    setHidratado(true)
  }, [])

  /** Persistir cada cambio (solo después de leer lo guardado). */
  useEffect(() => {
    if (!hidratado) return
    try {
      localStorage.setItem(CLAVE_FONT_SIZE, fontSize)
      localStorage.setItem(CLAVE_CONTRAST, contrast)
      localStorage.setItem(CLAVE_VOICE, voiceType)
      localStorage.setItem(CLAVE_EXTRA, JSON.stringify(a11yExtra))
    } catch { /* sin almacenamiento */ }
  }, [hidratado, fontSize, contrast, voiceType, a11yExtra])

  /** Reflejar el estado en el <html> para que el CSS global reaccione. */
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-font-size', fontSize)
    root.setAttribute('data-contrast', contrast)
    root.setAttribute('data-grayscale', a11yExtra.grayscale ? 'on' : 'off')
    root.setAttribute('data-underline-links', a11yExtra.underlineLinks ? 'on' : 'off')
    root.setAttribute('data-readable-font', a11yExtra.readableFont ? 'on' : 'off')
    root.setAttribute('data-pause-animations', a11yExtra.pauseAnimations ? 'on' : 'off')
    return () => {
      for (const a of ATRIBUTOS) root.removeAttribute(a)
    }
  }, [fontSize, contrast, a11yExtra])

  /** En móvil se fuerza la voz femenina (la selección de voz se oculta). */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const actualizar = () => setEsMovil(mq.matches)
    actualizar()
    mq.addEventListener('change', actualizar)
    return () => mq.removeEventListener('change', actualizar)
  }, [])

  const vozEfectiva: VoiceType = esMovil ? 'female' : voiceType
  useTalkBack(talkBack, vozEfectiva)

  /** Alterna uno de los toggles visuales estilo Inklusion. */
  const alternarExtra = useCallback((clave: keyof AccesibilidadExtra) => {
    setA11yExtra((prev) => ({ ...prev, [clave]: !prev[clave] }))
  }, [])

  return (
    <>
      {children}
      <AccesibilidadPanel
        open={panelAbierto}
        onClose={() => setPanelAbierto(false)}
        onOpen={() => setPanelAbierto(true)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        contrast={contrast}
        onContrastChange={setContrast}
        voiceType={voiceType}
        onVoiceTypeChange={setVoiceType}
        talkBackEnabled={talkBack}
        onTalkBackToggle={() => setTalkBack((prev) => !prev)}
        a11yExtra={a11yExtra}
        onToggleExtra={alternarExtra}
      />
    </>
  )
}

export default ProveedorAccesibilidad
