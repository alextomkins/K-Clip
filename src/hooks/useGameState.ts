import { useState, useCallback, useMemo, useEffect } from 'react'
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

  // Reload if the date changes while the tab is open
  useEffect(() => {
    const onFocus = () => {
      if (getTodayUTC() !== today) window.location.reload()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [today])

  const currentClipIndex = Math.min(gameState.guesses.length, CLIP_DURATIONS.length - 1)
  const attemptsRemaining = MAX_GUESSES - gameState.guesses.length

  const applyGuess = useCallback((guess: Guess) => {
    if (gameState.status !== 'playing') return
    const newGuesses = [...gameState.guesses, guess]
    const isLastGuess = newGuesses.length >= MAX_GUESSES
    const newState: GameState = {
      ...gameState,
      guesses: newGuesses,
      status: guess.result === 'correct' ? 'won' : isLastGuess ? 'lost' : 'playing',
    }
    setGameState(newState)
    saveGameState(newState)
  }, [gameState])

  const submitGuess = useCallback((songId: string) => {
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
    applyGuess({ songId, result })
  }, [puzzle.song.id, puzzle.song.artist, applyGuess])

  const skipGuess = useCallback(() => {
    applyGuess({ songId: '', result: 'skipped' })
  }, [applyGuess])

  return {
    puzzle,
    gameState,
    currentClipIndex,
    attemptsRemaining,
    submitGuess,
    skipGuess,
  }
}
