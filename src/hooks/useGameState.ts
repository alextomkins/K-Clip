import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { GameState, Guess, GuessResult, DailyPuzzle, Song, GuessResponse, PuzzleSummary, MAX_GUESSES, CLIP_DURATIONS } from '../types'
import { getTodayAEST, getDailyPuzzle } from '../utils/puzzle'
import { loadGameState, saveGameState, loadAnswerSong, saveAnswerSong } from '../utils/storage'
import { useStats } from './useStats'
import { useDateReload } from './useDateReload'
import { useAuthContext } from '../contexts/AuthContext'
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

  const [answerSong, setAnswerSong] = useState<Song | null>(() => loadAnswerSong(date))
  const [justWon, setJustWon] = useState(false)
  const [puzzleSummary, setPuzzleSummary] = useState<PuzzleSummary | null>(null)
  const [loading, setLoading] = useState(false)

  const stats = useStats(date, gameState)
  useDateReload(isToday)

  // Load game state from API when authenticated, falling back to localStorage
  useEffect(() => {
    // Always immediately show cached/local state to avoid stale data flash
    const local = loadGameState(date) ?? createInitialState(date)
    setGameState(local)
    setAnswerSong(loadAnswerSong(date))
    setJustWon(false)
    setPuzzleSummary(null)

    if (!user) return

    setLoading(true)
    let cancelled = false
    api.get<GameState>(`/api/games/${date}`)
      .then((remote) => {
        if (!cancelled) {
          saveGameState(remote) // cache locally
          setGameState(remote)
        }
      })
      .catch(() => {
        // API unavailable or 404 — local state already set
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [date, user])

  // Fetch puzzle summary for completed games
  useEffect(() => {
    if (gameState.status === 'playing') {
      setPuzzleSummary(null)
      return
    }
    let cancelled = false
    api.getPublic<PuzzleSummary>(`/api/puzzles/${date}/summary`)
      .then((summary) => {
        if (!cancelled && summary.totalPlays > 0) setPuzzleSummary(summary)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [date, gameState.status])

  // Fetch answer from API when game is completed but answer is missing (e.g. pre-migration games)
  useEffect(() => {
    if (gameState.status === 'playing' || answerSong) return
    let cancelled = false
    api.getPublic<{ songId: string; title: string; artist: string }>(`/api/puzzles/${date}/answer`)
      .then((data) => {
        if (cancelled) return
        const song: Song = { id: data.songId, title: data.title, artist: data.artist }
        setAnswerSong(song)
        saveAnswerSong(date, song)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [date, gameState.status, answerSong])

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

  const applyGuess = useCallback((guess: Guess, answer?: Song) => {
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

    // Store answer when revealed by the server
    if (answer) {
      setAnswerSong(answer)
      saveAnswerSong(date, answer)
    }

    if (guess.result === 'correct') setJustWon(true)

    // Log analytics events imperatively
    logGuess(puzzle.dayNumber, gameState.guesses.length + 1, guess.result)
    if (guess.result === 'correct') {
      logGameEnd(puzzle.dayNumber, 'won', gameState.guesses.length + 1)
    } else if (gameState.guesses.length + 1 >= MAX_GUESSES) {
      logGameEnd(puzzle.dayNumber, 'lost', gameState.guesses.length + 1)
    }
  }, [user, date, puzzle.dayNumber, gameState.guesses.length])

  const submitGuess = useCallback(async (songId: string) => {
    const previousGuessIds = gameState.guesses.map((g) => g.songId)
    try {
      const resp = await api.postPublic<GuessResponse>(`/api/puzzles/${date}/guess`, {
        songId,
        previousGuessIds,
      })
      const result: GuessResult = resp.result
      applyGuess({ songId, result }, resp.answer)
    } catch {
      // If the API is unreachable, don't apply the guess — show error via toast
    }
  }, [date, gameState.guesses, applyGuess])

  const skipGuess = useCallback(() => {
    applyGuess({ songId: '', result: 'skipped' })
  }, [applyGuess])

  return {
    puzzle,
    gameState,
    loading,
    currentClipIndex,
    attemptsRemaining,
    submitGuess,
    skipGuess,
    justWon,
    answerSong,
    stats,
    puzzleSummary,
  }
}
