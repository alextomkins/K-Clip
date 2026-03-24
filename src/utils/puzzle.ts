import { DailyPuzzle } from '../types'
import songs from '../data/songs'

/** Epoch date for day numbering (2026-03-22 AEST = Day 1) */
const EPOCH = Date.UTC(2026, 2, 21)
const MS_PER_DAY = 86_400_000
const AEST_OFFSET_MS = 10 * 60 * 60 * 1000

/**
 * Simple seeded PRNG (mulberry32).
 * Returns a function that produces deterministic floats in [0, 1).
 */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

/** Pre-compute a deterministic shuffled order of song indices */
const shuffledIndices: number[] = (() => {
  const indices = songs.map((_, i) => i)
  const rng = mulberry32(20260322) // fixed seed
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
})()

/** Get today's date string in AEST (YYYY-MM-DD) */
export function getTodayAEST(): string {
  const now = new Date(Date.now() + AEST_OFFSET_MS)
  return now.toISOString().split('T')[0]
}

/** Calculate the day number since epoch for a given date string */
export function getDayNumber(dateStr: string): number {
  const date = Date.UTC(
    parseInt(dateStr.slice(0, 4)),
    parseInt(dateStr.slice(5, 7)) - 1,
    parseInt(dateStr.slice(8, 10))
  )
  return Math.floor((date - EPOCH) / MS_PER_DAY)
}

/** Convert a day number back to its AEST date string (YYYY-MM-DD) */
export function getDateForDay(dayNumber: number): string {
  return new Date(EPOCH + dayNumber * MS_PER_DAY).toISOString().split('T')[0]
}

/** Deterministic puzzle selection: maps a date to a shuffled song */
export function getDailyPuzzle(dateStr: string): DailyPuzzle {
  const dayNumber = getDayNumber(dateStr)
  const idx = ((dayNumber % shuffledIndices.length) + shuffledIndices.length) % shuffledIndices.length
  const songIndex = shuffledIndices[idx]
  return {
    date: dateStr,
    song: songs[songIndex],
    dayNumber,
  }
}
