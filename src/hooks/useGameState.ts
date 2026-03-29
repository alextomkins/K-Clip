import { useState, useCallback, useMemo, useEffect } from 'react'
import { GameState, Guess, GuessResult, DailyPuzzle, MAX_GUESSES, CLIP_DURATIONS } from '../types'
import { getTodayAEST, getDailyPuzzle } from '../utils/puzzle'
import { loadGameState, saveGameState } from '../utils/storage'
import { useStats } from './useStats'
import { useDateReload } from './useDateReload'
import { songLookup } from '../data/songs'

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

  const [justWon, setJustWon] = useState(false)

  const stats = useStats(date, gameState)
  useDateReload(isToday)

  // Reset state when the selected date changes
  useEffect(() => {
    setGameState(loadGameState(date) ?? createInitialState(date))
    setJustWon(false)
  }, [date])

  const currentClipIndex =
    gameState.status === 'won'
      ? Math.min(gameState.guesses.length - 1, CLIP_DURATIONS.length - 1)
      : Math.min(gameState.guesses.length, CLIP_DURATIONS.length - 1)
  const attemptsRemaining = MAX_GUESSES - gameState.guesses.length

  const applyGuess = useCallback((guess: Guess) => {
    setGameState((prev) => {
      if (prev.status !== 'playing') return prev
      const newGuesses = [...prev.guesses, guess]
      const isLastGuess = newGuesses.length >= MAX_GUESSES
      const newState: GameState = {
        ...prev,
        guesses: newGuesses,
        status: guess.result === 'correct' ? 'won' : isLastGuess ? 'lost' : 'playing',
      }
      saveGameState(newState)
      return newState
    })
    if (guess.result === 'correct') setJustWon(true)
  }, [])

  const submitGuess = useCallback((songId: string) => {
    const isCorrect = songId === puzzle.song.id
    let result: GuessResult = 'incorrect'
    if (isCorrect) {
      result = 'correct'
    } else {
      const guessedSong = songLookup.get(songId)
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
    justWon,
    stats,
  }
}
