import { DailyPuzzle, AEST_OFFSET_MS } from '../types'

/** Epoch date for day numbering (2026-03-22 AEST = Day 1) */
const EPOCH = Date.UTC(2026, 2, 21)
const MS_PER_DAY = 86_400_000

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

/** Build a DailyPuzzle (without answer) from a date string */
export function getDailyPuzzle(dateStr: string): DailyPuzzle {
  return {
    date: dateStr,
    dayNumber: getDayNumber(dateStr),
  }
}
