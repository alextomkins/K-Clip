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

export type DistributionKey = '1' | '2' | '3' | '4' | '5' | '6' | 'X'

export interface StatsRecord {
  played: number
  wins: number
  currentStreak: number
  maxStreak: number
  guessDistribution: Record<DistributionKey, number>
  lastPlayedDate: string | null
  lastWonDate: string | null
}
