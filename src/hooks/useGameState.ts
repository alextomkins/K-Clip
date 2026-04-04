import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { GameState, Guess, GuessResult, DailyPuzzle, PuzzleSummary, MAX_GUESSES, CLIP_DURATIONS } from '../types'
import { getTodayAEST, getDailyPuzzle } from '../utils/puzzle'
import { loadGameState, saveGameState } from '../utils/storage'
import { useStats } from './useStats'
import { useDateReload } from './useDateReload'
import { useAuthContext } from '../contexts/AuthContext'
import { songLookup } from '../data/songs'
import { logGameStart, logGuess, logGameEnd } from '../lib/analytics'
import { api } from '../lib/api'

function createInitialState(date: string): GameState {
  return { date, guesses: [], status: 'playing' }
}

export function useGameState(date: string) {
  const { user } = useAuthContext()
  const today = useMemo(() => getTodayAEST(), [])
  const isToday = date === today
  const puzzle: DailyPuzzle = useMemo(() => getDailyPuzzle(date), [date])

  const [gameState, setGameState] = useState<GameState>(() => {
    return loadGameState(date) ?? createInitialState(date)
  })

  const [justWon, setJustWon] = useState(false)
  const [puzzleSummary, setPuzzleSummary] = useState<PuzzleSummary | null>(null)

  const stats = useStats(date, gameState)
  useDateReload(isToday)

  // Load game state from API when authenticated, falling back to localStorage
  useEffect(() => {
    if (!user) {
      setGameState(loadGameState(date) ?? createInitialState(date))
      setJustWon(false)
      return
    }

    let cancelled = false
    api.get<GameState>(`/api/games/${date}`)
      .then((remote) => {
        if (!cancelled) {
          saveGameState(remote) // cache locally
          setGameState(remote)
        }
      })
      .catch(() => {
        // API unavailable or 404 — use local state
        if (!cancelled) {
          setGameState(loadGameState(date) ?? createInitialState(date))
        }
      })
    setJustWon(false)
    setPuzzleSummary(null)

    return () => { cancelled = true }
  }, [date, user])

  // Fetch puzzle summary for completed games when authenticated
  useEffect(() => {
    if (!user || gameState.status === 'playing') {
      setPuzzleSummary(null)
      return
    }
    let cancelled = false
    api.get<PuzzleSummary>(`/api/puzzles/${date}/summary`)
      .then((summary) => {
        if (!cancelled && summary.totalPlays > 0) setPuzzleSummary(summary)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [user, date, gameState.status])

  // Log game_start when a fresh puzzle is opened
  const loggedStart = useRef<string | null>(null)
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.guesses.length === 0 && loggedStart.current !== date) {
      loggedStart.current = date
      logGameStart(puzzle.dayNumber, date)
    }
  }, [date, gameState.status, gameState.guesses.length, puzzle.dayNumber])

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

      // Sync to API when authenticated
      if (user) {
        api.put(`/api/games/${newState.date}`, newState).catch(() => {})

        // Submit final result for aggregation when game ends
        if (newState.status === 'won' || newState.status === 'lost') {
          api.post<PuzzleSummary>(`/api/games/${newState.date}/complete`, {
            displayName: user.displayName ?? 'Anonymous',
            guessCount: newState.guesses.length,
            status: newState.status,
          })
            .then((summary) => { if (summary.totalPlays > 0) setPuzzleSummary(summary) })
            .catch(() => {})
        }
      }

      return newState
    })
    if (guess.result === 'correct') setJustWon(true)
  }, [user])

  // Log guess and game_end events
  const prevGuessCount = useRef(gameState.guesses.length)
  useEffect(() => {
    const count = gameState.guesses.length
    if (count > prevGuessCount.current) {
      const latest = gameState.guesses[count - 1]
      logGuess(puzzle.dayNumber, count, latest.result)
      if (gameState.status === 'won' || gameState.status === 'lost') {
        logGameEnd(puzzle.dayNumber, gameState.status, count)
      }
    }
    prevGuessCount.current = count
  }, [gameState.guesses, gameState.status, puzzle.dayNumber])

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
    puzzleSummary,
  }
}
