'use client'

// RadioPlayer — Reproductor fijo en la parte inferior de la pantalla
// Fiel al mockup HTML: 68px altura, borde dorado superior, ON AIR animado

import Image from 'next/image'
import { useRadioContext } from './RadioProvider'
import { habboAvatarHead } from '@/lib/habbo'

export default function RadioPlayer() {
  const { config, isPlaying, isMuted, volume, play, pause, setVolume, toggleMute } = useRadioContext()

  if (!config) return null

  const handlePlayPause = () => {
    if (isPlaying) pause()
    else play()
  }

  return (
    <div
      role="region"
      aria-label="Radio en vivo del Concilio"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: 'linear-gradient(90deg, #0a0907 0%, #111008 40%, #0e0d0b 100%)',
        borderTop: '1px solid var(--color-border-gold)',
        boxShadow: '0 -8px 32px oklch(0 0 0 / 0.7)',
        padding: '0 var(--space-6)',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
      }}
    >
      {/* Línea dorada superior decorativa */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, var(--color-gold), var(--color-gold-bright), var(--color-gold), transparent)',
          opacity: 0.5,
        }}
      />

      {/* ON AIR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }} aria-live="polite">
        <span
          aria-hidden="true"
          style={{
            width: 7,
            height: 7,
            background: 'var(--color-onair)',
            borderRadius: '50%',
            boxShadow: '0 0 8px var(--color-onair)',
            animation: isPlaying ? 'pulse-red 1.4s ease-in-out infinite' : 'none',
            opacity: isPlaying ? 1 : 0.4,
          }}
        />
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-onair)',
        }}>
          On Air
        </span>
      </div>

      {/* Divider */}
      <div aria-hidden="true" style={{ width: 1, height: 36, background: 'var(--color-border)', flexShrink: 0 }} />

      {/* Avatar DJ */}
      {config.djAvatarUrl && (
        <div
          aria-hidden="true"
          style={{
            position: 'relative',
            flexShrink: 0,
            width: 48,
            height: 56,
            overflow: 'hidden',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: '1px solid var(--color-border-gold)',
            borderBottom: 'none',
            background: 'var(--color-surface-offset)',
            alignSelf: 'flex-end',
          }}
        >
          <Image
            src={config.djAvatarUrl.startsWith('http') ? config.djAvatarUrl : habboAvatarHead(config.djAvatarUrl)}
            alt={`Avatar de ${config.djName}`}
            fill
            style={{ objectFit: 'cover', objectPosition: 'top center', imageRendering: 'pixelated' }}
            unoptimized // avatares externos de Habbo
          />
        </div>
      )}

      {/* Info del track */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-gold)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {config.djName}
        </span>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontStyle: 'italic',
          color: 'var(--color-text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {config.currentTrack}
        </span>
      </div>

      {/* Wave visualizer */}
      <div
        aria-hidden="true"
        style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, height: 24 }}
      >
        {[
          { delay: '0s',    height: 8  },
          { delay: '0.1s',  height: 16 },
          { delay: '0.2s',  height: 22 },
          { delay: '0.3s',  height: 14 },
          { delay: '0.15s', height: 20 },
          { delay: '0.25s', height: 10 },
        ].map((bar, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: bar.height,
              background: 'var(--color-gold)',
              borderRadius: 2,
              opacity: isPlaying ? 0.7 : 0.25,
              transform: isPlaying ? undefined : 'scaleY(0.3)',
              animation: isPlaying ? `wave-bar 1s ease-in-out ${bar.delay} infinite` : 'none',
            }}
          />
        ))}
      </div>

      {/* Divider */}
      <div aria-hidden="true" style={{ width: 1, height: 36, background: 'var(--color-border)', flexShrink: 0 }} />

      {/* Play / Pause */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexShrink: 0 }}>
        <button
          onClick={handlePlayPause}
          aria-label={isPlaying ? 'Pausar radio' : 'Reproducir radio'}
          title={isPlaying ? 'Pausa' : 'Play'}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid var(--color-border-gold)',
            background: 'var(--color-surface-offset)',
            color: 'var(--color-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all var(--transition)',
          }}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
      </div>

      {/* Volumen */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          title={isMuted ? 'Activar sonido' : 'Silenciar'}
          style={{ color: 'var(--color-text-muted)', cursor: 'pointer', flexShrink: 0, transition: 'color var(--transition)', background: 'none', border: 'none' }}
        >
          {isMuted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Control de volumen"
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            width: 80,
            height: 3,
            background: 'var(--color-surface-offset)',
            borderRadius: 'var(--radius-full)',
            outline: 'none',
            cursor: 'pointer',
            border: 'none',
          }}
        />
      </div>

      {/* Nombre de la radio */}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-text-faint)',
          flexShrink: 0,
          display: 'none',
        }}
        className="radio-brand-label"
      >
        {config.radioName}
      </span>
    </div>
  )
}
