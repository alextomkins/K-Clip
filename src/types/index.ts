export interface Song {
  id: string
  title: string
  artist: string
  audioFile: string
}

export type GuessResult = 'correct' | 'partial' | 'incorrect' | 'skipped'

export const RESULT_EMOJI: Record<GuessResult, string> = {
  correct: '🟩',
  partial: '🟧',
  incorrect: '🟥',
  skipped: '🟥',
}

export interface Guess {
  songId: string
  result: GuessResult
}

export interface GameState {
  date: string
  guesses: Guess[]
  status: 'playing' | 'won' | 'lost'
}

export interface DailyPuzzle {
  date: string
  song: Song
  dayNumber: number
}

export const CLIP_DURATIONS = [1, 2, 5, 10, 20, 30] as const
export const MAX_GUESSES = 6
