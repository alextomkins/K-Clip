export interface Song {
  id: string
  title: string
  artist: string
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
  dayNumber: number
}

export interface GuessResponse {
  result: 'correct' | 'partial' | 'incorrect'
  answer?: Song
}

export const CLIP_DURATIONS = [1, 2, 5, 10, 20, 30] as const
export const MAX_GUESSES = 6
export const AEST_OFFSET_MS = 10 * 60 * 60 * 1000

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

export interface PuzzleSummary {
  totalPlays: number
  totalGuesses: number
  avgGuesses: number
  winCount: number
  distribution: Record<string, number>
}

export interface LeaderboardEntry {
  uid: string
  displayName: string
  photoURL: string | null
  played: number
  wins: number
  winPct: number
  currentStreak: number
  maxStreak: number
  avgGuesses: number
  rank: number
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  currentUser: LeaderboardEntry | null
  currentUserHidden: boolean
}
