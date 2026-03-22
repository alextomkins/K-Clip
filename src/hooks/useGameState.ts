import { useState, useCallback, useMemo } from 'react'
import { GameState, Guess, GuessResult, DailyPuzzle, MAX_GUESSES, CLIP_DURATIONS } from '../types'
import { getTodayUTC, getDailyPuzzle } from '../utils/puzzle'
import { loadGameState, saveGameState } from '../utils/storage'
import songs from '../data/songs'

function createInitialState(date: string): GameState {
  return { date, guesses: [], status: 'playing' }
}

export function useGameState() {
  const today = useMemo(() => getTodayUTC(), [])
  const puzzle: DailyPuzzle = useMemo(() => getDailyPuzzle(today), [today])

  const [gameState, setGameState] = useState<GameState>(() => {
    return loadGameState(today) ?? createInitialState(today)
  })

  const currentClipIndex = Math.min(gameState.guesses.length, CLIP_DURATIONS.length - 1)
  const currentClipDuration = CLIP_DURATIONS[currentClipIndex]
  const attemptsRemaining = MAX_GUESSES - gameState.guesses.length

  const submitGuess = useCallback((songId: string) => {
    if (gameState.status !== 'playing') return

    const isCorrect = songId === puzzle.song.id
    let result: GuessResult = 'incorrect'
    if (isCorrect) {
      result = 'correct'
    } else {
      const guessedSong = songs.find((s) => s.id === songId)
      if (guessedSong && guessedSong.artist === puzzle.song.artist) {
        result = 'partial'
      }
    }
    const guess: Guess = { songId, result }

    const newGuesses = [...gameState.guesses, guess]
    const isLastGuess = newGuesses.length >= MAX_GUESSES

    const newState: GameState = {
      ...gameState,
      guesses: newGuesses,
      status: isCorrect ? 'won' : isLastGuess ? 'lost' : 'playing',
    }

    setGameState(newState)
    saveGameState(newState)
  }, [gameState, puzzle.song.id])

  const skipGuess = useCallback(() => {
    if (gameState.status !== 'playing') return

    const guess: Guess = { songId: '', result: 'skipped' }
    const newGuesses = [...gameState.guesses, guess]
    const isLastGuess = newGuesses.length >= MAX_GUESSES

    const newState: GameState = {
      ...gameState,
      guesses: newGuesses,
      status: isLastGuess ? 'lost' : 'playing',
    }

    setGameState(newState)
    saveGameState(newState)
  }, [gameState])

  return {
    puzzle,
    gameState,
    currentClipIndex,
    currentClipDuration,
    attemptsRemaining,
    submitGuess,
    skipGuess,
  }
}
