import { GameState, Song, StatsRecord } from '../types'

function storageKey(date: string): string {
  return `kclip-state-${date}`
}

export function loadGameState(date: string): GameState | null {
  try {
    const raw = localStorage.getItem(storageKey(date))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      typeof parsed !== 'object' || parsed === null ||
      typeof parsed.date !== 'string' ||
      !Array.isArray(parsed.guesses) ||
      !['playing', 'won', 'lost'].includes(parsed.status)
    ) return null
    if (parsed.date !== date) return null
    return parsed as GameState
  } catch {
    return null
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(storageKey(state.date), JSON.stringify(state))
}

const STATS_KEY = 'kclip-stats'

function defaultStats(): StatsRecord {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, 'X': 0 },
    lastPlayedDate: null,
    lastWonDate: null,
  }
}

export function loadStats(): StatsRecord {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return defaultStats()
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return defaultStats()
    return { ...defaultStats(), ...parsed }
  } catch {
    return defaultStats()
  }
}

export function saveStats(stats: StatsRecord): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

function answerKey(date: string): string {
  return `kclip-answer-${date}`
}

export function loadAnswerSong(date: string): Song | null {
  try {
    const raw = localStorage.getItem(answerKey(date))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.id !== 'string' || typeof parsed?.title !== 'string' || typeof parsed?.artist !== 'string') return null
    return parsed as Song
  } catch {
    return null
  }
}

export function saveAnswerSong(date: string, song: Song): void {
  localStorage.setItem(answerKey(date), JSON.stringify(song))
}
