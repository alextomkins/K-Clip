import { GameState } from '../types'

const STORAGE_KEY = 'songguess-state'

export function loadGameState(date: string): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const state: GameState = JSON.parse(raw)
    if (state.date !== date) return null
    return state
  } catch {
    return null
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
