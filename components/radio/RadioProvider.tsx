'use client'

// RadioProvider — Context global del reproductor de radio
// Recibe la config inicial desde el Server Component del layout
// para evitar waterfall de datos

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import RadioPlayer from './RadioPlayer'

// =============================================
// Tipos
// =============================================
export interface RadioConfig {
  id: string
  enabled: boolean
  streamUrl: string
  radioName: string
  djName: string
  djAvatarUrl: string
  currentTrack: string
}

interface RadioState {
  config: RadioConfig | null
  isPlaying: boolean
  isMuted: boolean
  volume: number // 0-100
}

interface RadioActions {
  play: () => void
  pause: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
}

type RadioContextValue = RadioState & RadioActions

// =============================================
// Context
// =============================================
const RadioContext = createContext<RadioContextValue | null>(null)

export function useRadioContext() {
  const ctx = useContext(RadioContext)
  if (!ctx) throw new Error('useRadioContext must be used inside RadioProvider')
  return ctx
}

// =============================================
// Provider
// =============================================
interface RadioProviderProps {
  children: ReactNode
  initialConfig: RadioConfig | null
}

export default function RadioProvider({ children, initialConfig }: RadioProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted]     = useState(false)
  const [volume, setVolumeState]  = useState(80)

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !initialConfig?.streamUrl) return

    // Asignar src SOLO al reproducir — no en mount (no autoplay)
    audio.src = initialConfig.streamUrl
    audio.volume = volume / 100
    audio.muted = isMuted
    audio.play().then(() => setIsPlaying(true)).catch(console.error)
  }, [initialConfig, volume, isMuted])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.src = '' // CRÍTICO: corta el stream de red, no solo el audio local
    setIsPlaying(false)
  }, [])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, v))
    setVolumeState(clamped)
    if (audioRef.current) {
      audioRef.current.volume = clamped / 100
    }
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      if (audioRef.current) audioRef.current.muted = next
      return next
    })
  }, [])

  return (
    <RadioContext.Provider value={{ config: initialConfig, isPlaying, isMuted, volume, play, pause, setVolume, toggleMute }}>
      {children}

      {/* Render condicional — solo si la radio está habilitada en DB */}
      {initialConfig?.enabled && <RadioPlayer />}

      {/* Elemento de audio — oculto, controlado por refs */}
      <audio ref={audioRef} preload="none" aria-hidden="true" />
    </RadioContext.Provider>
  )
}
