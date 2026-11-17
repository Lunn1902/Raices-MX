/**
 * @file useTalkBack.ts
 * @description
 * Hook de accesibilidad TalkBack que verbaliza contenido al hacer clic,
 * usando Web Speech API (`speechSynthesis`). Soporta activar/desactivar,
 * selección de voz femenina/masculina y lectura de `aria-label`/`alt`/`title`
 * antes que `textContent`. Se integra con `lib/speech` (`findVoice`).
 */
import { useEffect, useRef, useCallback } from 'react'
import type { VoiceType } from '../lib/theme-a11y'
import { findVoice } from '../lib/speech'

/**
 * Hook que provee funcionalidad TalkBack (texto a voz) con control de habilitación y voz.
 * @param enabled - Si es `false`, no verbaliza y cancela cualquier utterance en curso.
 * @param voiceType - Preferencia de voz (`'female' | 'male'`) usada por `findVoice`.
 * @returns Objeto con `speak` y `speakElement`.
 */
export function useTalkBack(enabled: boolean, voiceType: VoiceType) {
  /** Referencia al utterance actual (para control futuro). */
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  /** Verbaliza un texto arbitrario con la voz configurada. */
  const speak = useCallback(
    (text: string) => {
      if (!enabled || !window.speechSynthesis) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-MX'
      utterance.rate = 0.9
      utterance.pitch = 1
      const voice = findVoice(voiceType)
      if (voice) utterance.voice = voice
      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [enabled, voiceType],
  )

  /** Verbaliza el contenido accesible de un elemento del DOM. */
  const speakElement = useCallback(
    (el: EventTarget | null) => {
      if (!enabled || !el || !(el instanceof Element)) return

      const ariaLabel =
        el.getAttribute('aria-label') ||
        el.getAttribute('alt') ||
        el.getAttribute('title')

      if (ariaLabel) {
        speak(ariaLabel)
        return
      }

      const text = el.textContent?.trim()
      if (text) speak(text)
    },
    [enabled, speak],
  )

  /** Listener global de `click` para TalkBack automático. */
  useEffect(() => {
    if (!enabled) {
      window.speechSynthesis?.cancel()
      return
    }

    const handler = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (!target) return

      const interactive = target.closest('button, a, input, select, textarea, [role="button"]')
      if (interactive) {
        const label =
          interactive.getAttribute('aria-label') ||
          interactive.getAttribute('title') ||
          interactive.textContent?.trim()
        if (label) speak(label)
      } else {
        speakElement(target)
      }
    }

    document.addEventListener('click', handler)
    return () => {
      document.removeEventListener('click', handler)
      window.speechSynthesis?.cancel()
    }
  }, [enabled, speak, speakElement])

  return { speak, speakElement }
}
