import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { GameState, DailyPuzzle } from '../types'
import { generateShareText, copyToClipboard } from '../utils/share'
import { logShare } from '../lib/analytics'

interface ResultScreenProps {
  gameState: GameState
  puzzle: DailyPuzzle
  justWon: boolean
}

export function ResultScreen({ gameState, puzzle, justWon }: ResultScreenProps) {
  const [copied, setCopied] = useState(false)

  const isWin = gameState.status === 'won'

  useEffect(() => {
    if (!justWon) return
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    })
  }, [justWon])

  async function handleShare() {
    const text = generateShareText(gameState, puzzle)
    const success = await copyToClipboard(text)
    if (success) {
      logShare(puzzle.dayNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="w-full max-w-sm text-center">
      <p className="text-3xl font-bold mb-2">
        {isWin ? '🎉' : '😢'}
      </p>
      <p className="text-xl font-bold mb-1">
        {isWin ? 'You got it!' : 'Better luck tomorrow'}
      </p>
      <p className="text-gray-300 mb-1">
        <span className="font-semibold">{puzzle.song.title}</span>
        <span className="text-gray-400"> — {puzzle.song.artist}</span>
      </p>
      <p className="text-gray-400 text-sm mb-4">
        {isWin
          ? `Guessed in ${gameState.guesses.length}/6`
          : `Used all 6 guesses`}
      </p>

      <button
        onClick={handleShare}
        className="w-full py-3 rounded-lg font-semibold text-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
      >
        {copied ? '✅ Copied!' : '📋 Share Result'}
      </button>
    </div>
  )
}
