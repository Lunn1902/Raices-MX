/**
 * @file speech.ts
 * @description
 * Utilidades de voz para RaicesMX: selección de voz en español (`es-MX`) y
 * desbloqueo de la síntesis de voz dentro de un gesto del usuario.
 * Se usa desde `useTalkBack` y desde el panel de accesibilidad.
 */
import type { VoiceType } from './theme-a11y'

/** Nombres típicos de voces femeninas (en minúsculas, para comparar). */
const femaleNames = ['maria', 'sofia', 'paulina', 'helena', 'lucia', 'valentina', 'camila', 'isabella', 'gabriela', 'alejandra', 'fernanda', 'ximena', 'renata', 'victoria', 'diana', 'julia', 'monica', 'ana', 'carmen', 'rosa', 'laura', 'martha', 'silvia', 'patricia', 'claudia', 'veronica', 'beatriz', 'elena', 'adriana', 'teresa']

/** Nombres típicos de voces masculinas. */
const maleNames = ['miguel', 'jorge', 'raul', 'pablo', 'carlos', 'juan', 'david', 'jose', 'antonio', 'luis', 'javier', 'alejandro', 'manuel', 'fernando', 'pedro', 'diego', 'ricardo', 'daniel', 'rodrigo', 'andres', 'matias', 'gabriel', 'sergio', 'oscar', 'angel']

/** `true` si el `lang` de la voz empieza con `es`. */
function isSpanishVoice(v: SpeechSynthesisVoice): boolean {
  return v.lang.toLowerCase().startsWith('es')
}

/**
 * Busca una voz en español del género solicitado.
 * Estrategia: filtrar `es*`, buscar por nombre femenino/masculino, fallback
 * Microsoft neutro y, finalmente, la primera voz en español disponible.
 *
 * @param type - `'female'` o `'male'`.
 * @returns La voz encontrada o `null` si no hay ninguna voz `es*`.
 */
export function findVoice(type: VoiceType): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? []
  const spanish = voices.filter(isSpanishVoice)
  if (!spanish.length) return null

  const isFemale = (name: string) => femaleNames.some((fn) => name.includes(fn))
  const isMale = (name: string) => maleNames.some((mn) => name.includes(mn))
  const lower = (s: string) => s.toLowerCase()

  if (type === 'female') {
    for (const v of spanish) {
      if (isFemale(lower(v.name))) return v
    }
    const ms = spanish.find((v) => lower(v.name).includes('microsoft') && !isMale(lower(v.name)))
    if (ms) return ms
  } else {
    for (const v of spanish) {
      if (isMale(lower(v.name))) return v
    }
    const ms = spanish.find((v) => lower(v.name).includes('microsoft') && !isFemale(lower(v.name)))
    if (ms) return ms
  }

  return spanish[0] ?? null
}

/**
 * Desbloquea la síntesis de voz dentro de un gesto del usuario (por ejemplo,
 * el clic que activa TalkBack). Algunos navegadores silencian el primer
 * `speak` si no hubo interacción previa: se emite un utterance mudo.
 */
export function desbloquearVoz(): void {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    u.lang = 'es-MX'
    synth.speak(u)
  } catch {
    /* sin voz: la app sigue funcionando */
  }
}
