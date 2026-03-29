import { useState, useEffect } from 'react'
import { AEST_OFFSET_MS } from '../types'

function getTimeUntilMidnightAEST(): number {
  const nowAEST = Date.now() + AEST_OFFSET_MS
  const msPerDay = 24 * 60 * 60 * 1000
  const midnightAEST = Math.ceil(nowAEST / msPerDay) * msPerDay
  return midnightAEST - nowAEST
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

export function useCountdown(): string {
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(getTimeUntilMidnightAEST())
  )

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(formatCountdown(getTimeUntilMidnightAEST()))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return countdown
}
