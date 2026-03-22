import { GameState } from '../types'

const STORAGE_KEY = 'songguess-state'

export function loadGameState(date: string): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
