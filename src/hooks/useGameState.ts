import { useState, useCallback, useMemo, useEffect } from 'react'
import { GameState, Guess, GuessResult, DailyPuzzle, MAX_GUESSES, CLIP_DURATIONS } from '../types'
import { getTodayAEST, getDailyPuzzle } from '../utils/puzzle'
import { loadGameState, saveGameState } from '../utils/storage'
import songs from '../data/songs'

function createInitialState(date: string): GameState {
  return { date, guesses: [], status: 'playing' }
}

export function useGameState(date: string) {
  const today = useMemo(() => getTodayAEST(), [])
  const isToday = date === today
  const puzzle: DailyPuzzle = useMemo(() => getDailyPuzzle(date), [date])

  const [gameState, setGameState] = useState<GameState>(() => {
    return loadGameState(date) ?? createInitialState(date)
  })

  // Reset state when the selected date changes
  useEffect(() => {
    setGameState(loadGameState(date) ?? createInitialState(date))
  }, [date])

  // Reload if the real date changes while the tab is open — only when viewing today's puzzle
  useEffect(() => {
    if (!isToday) return
    const onFocus = () => {
      if (getTodayAEST() !== today) window.location.reload()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [today, isToday])

  const currentClipIndex =
    gameState.status === 'won'
      ? Math.min(gameState.guesses.length - 1, CLIP_DURATIONS.length - 1)
      : Math.min(gameState.guesses.length, CLIP_DURATIONS.length - 1)
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
