import { logEvent } from 'firebase/analytics'
import { analyticsPromise } from './firebase'

async function log(event: string, params?: Record<string, string | number>) {
  const analytics = await analyticsPromise
  if (analytics) logEvent(analytics, event, params)
}

export function logGameStart(dayNumber: number, date: string) {
  log('game_start', { day_number: dayNumber, puzzle_date: date })
}

export function logGuess(
  dayNumber: number,
  guessNumber: number,
  result: string,
) {
  log('guess', { day_number: dayNumber, guess_number: guessNumber, result })
}

export function logGameEnd(
  dayNumber: number,
  outcome: 'won' | 'lost',
  guessCount: number,
) {
  log('game_end', {
    day_number: dayNumber,
    outcome,
    guess_count: guessCount,
  })
}

export function logShare(dayNumber: number) {
  log('share_result', { day_number: dayNumber })
}
