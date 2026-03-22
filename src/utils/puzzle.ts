import { DailyPuzzle } from '../types'
import songs from '../data/songs'

/** Epoch date for day numbering (2026-03-22 UTC = Day 1) */
const EPOCH = Date.UTC(2026, 2, 21)
const MS_PER_DAY = 86_400_000

/** Get today's date string in UTC (YYYY-MM-DD) */
export function getTodayUTC(): string {
  const now = new Date()
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

/** Deterministic puzzle selection: maps a date to a song */
export function getDailyPuzzle(dateStr: string): DailyPuzzle {
  const dayNumber = getDayNumber(dateStr)
  const songIndex = ((dayNumber % songs.length) + songs.length) % songs.length
  return {
    date: dateStr,
    song: songs[songIndex],
    dayNumber,
  }
}
