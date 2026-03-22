import { GameState, DailyPuzzle, MAX_GUESSES, RESULT_EMOJI } from '../types'

export function generateShareText(gameState: GameState, puzzle: DailyPuzzle): string {
  const guessLine = gameState.guesses
    .map((g) => RESULT_EMOJI[g.result])
    .join('')
  const padded = guessLine + '⬜'.repeat(MAX_GUESSES - gameState.guesses.length)

  const score = gameState.status === 'won' ? `${gameState.guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`

  return [
    `🎵 K-Clip #${puzzle.dayNumber}`,
    padded,
    `Guessed in ${score}`,
    '',
    'alextomkins.github.io/K-Clip/ 🎵',
  ].join('\n')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
