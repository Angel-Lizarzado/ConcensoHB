'use client'

// Contador animado con IntersectionObserver — easeOutCubic
// Client Component (requiere DOM APIs)

import { useEffect, useRef, useState } from 'react'

interface StatCounterProps {
  target: number
  duration?: number
  label: string
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export default function StatCounter({ target, duration = 1800, label }: StatCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !started.current) {
          started.current = true
          let startTime: number | null = null

          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const eased = easeOutCubic(progress)
            setCount(Math.floor(eased * target))
            if (progress < 1) {
              requestAnimationFrame(step)
            } else {
              setCount(target)
            }
          }

          requestAnimationFrame(step)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <div ref={ref} className="text-center" style={{ padding: 'var(--space-4) var(--space-6)' }}>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 900,
          color: 'var(--color-gold)',
          display: 'block',
          lineHeight: 1,
          marginBottom: 'var(--space-1)',
        }}
      >
        {count}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--text-xs)',
          fontWeight: 500,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
        }}
      >
        {label}
      </span>
    </div>
  )
}
