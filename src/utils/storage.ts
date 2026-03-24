import { GameState } from '../types'

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
