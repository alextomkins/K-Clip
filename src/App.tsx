import { useState, useMemo } from 'react'
import { useGameState } from './hooks/useGameState'
import { useCountdown } from './hooks/useCountdown'
import { AudioPlayer } from './components/AudioPlayer'
import { SongSearch } from './components/SongSearch'
import { GuessHistory } from './components/GuessHistory'
import { ResultScreen } from './components/ResultScreen'
import { HowToPlay } from './components/HowToPlay'
import { StatsModal } from './components/StatsModal'
import { CLIP_DURATIONS, DistributionKey } from './types'
import { getTodayAEST, getDayNumber, getDateForDay } from './utils/puzzle'
import songs from './data/songs'

function App() {
  const todayDayNumber = useMemo(() => getDayNumber(getTodayAEST()), [])

  const [selectedDay, setSelectedDay] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('day')
    if (raw === null) return todayDayNumber
    const n = parseInt(raw, 10)
    return Number.isFinite(n) && n >= 1 && n <= todayDayNumber ? n : todayDayNumber
  })

  const selectedDate = useMemo(() => getDateForDay(selectedDay), [selectedDay])

  const {
    puzzle,
    gameState,
    currentClipIndex,
    attemptsRemaining,
    submitGuess,
    skipGuess,
    justWon,
    stats,
  } = useGameState(selectedDate)

  const [howToPlayOpen, setHowToPlayOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const countdown = useCountdown()

  const lastResultKey: DistributionKey | null =
    selectedDay === todayDayNumber && gameState.status !== 'playing'
      ? gameState.status === 'won'
        ? (String(gameState.guesses.length) as DistributionKey)
        : 'X'
      : null

  function navigate(day: number) {
    setSelectedDay(day)
    const search = day === todayDayNumber ? '' : `?day=${day}`
    history.replaceState(null, '', window.location.pathname + search)
  }

  const isPlaying = gameState.status === 'playing'
  const guessedSongIds = gameState.guesses
    .filter((g) => g.result !== 'skipped')
    .map((g) => g.songId)

  const audioSrc = `${import.meta.env.BASE_URL}audio/${puzzle.song.audioFile}`

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="flex items-center gap-2 mt-8 mb-2">
        <h1 className="text-3xl font-bold">🎵 K-Clip</h1>
        <button
          onClick={() => setHowToPlayOpen(true)}
          className="text-gray-400 hover:text-white text-xl leading-none"
          aria-label="How to play"
        >
          ℹ️
        </button>
        <button
          onClick={() => setStatsOpen(true)}
          className="text-gray-400 hover:text-white text-xl leading-none"
          aria-label="View statistics"
        >
          📊
        </button>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate(selectedDay - 1)}
          disabled={selectedDay <= 1}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xl w-6 text-center"
          aria-label="Previous puzzle"
        >
          ‹
        </button>
        <p className="text-gray-400 text-sm">Day #{puzzle.dayNumber}</p>
        <button
          onClick={() => navigate(selectedDay + 1)}
          disabled={selectedDay >= todayDayNumber}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xl w-6 text-center"
          aria-label="Next puzzle"
        >
          ›
        </button>
      </div>
      {selectedDay < todayDayNumber && (
        <p className="text-amber-400 text-xs mb-3">📅 Viewing archive puzzle ({selectedDate})</p>
      )}

      <HowToPlay isOpen={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />
      <StatsModal
        stats={stats}
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        lastResultKey={lastResultKey}
      />

      {/* Clip progress */}
      <div className="flex gap-2 mb-6">
        {CLIP_DURATIONS.map((dur, i) => (
          <div
            key={dur}
            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono ${
              i <= currentClipIndex
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-500'
            }`}
          >
            {dur}s
          </div>
        ))}
      </div>

      {/* Audio Player */}
      <div className="mb-6 w-full flex justify-center">
        <AudioPlayer
          audioSrc={audioSrc}
          clipIndex={isPlaying ? currentClipIndex : CLIP_DURATIONS.length - 1}
        />
      </div>

      {/* Guess input or Result screen */}
      {isPlaying ? (
        <div className="w-full flex flex-col items-center gap-3 mb-4">
          <p className="text-gray-400 text-sm">
            {attemptsRemaining} guess{attemptsRemaining !== 1 ? 'es' : ''} remaining
          </p>
          <SongSearch
            songs={songs}
            onGuess={submitGuess}
            onSkip={skipGuess}
            guessedSongIds={guessedSongIds}
          />
        </div>
      ) : (
        <div className="mb-4 w-full flex justify-center">
          <ResultScreen gameState={gameState} puzzle={puzzle} justWon={justWon} />
        </div>
      )}

      {/* Guess history */}
      <div className="mt-2 w-full flex justify-center">
        <GuessHistory guesses={gameState.guesses} />
      </div>

      <footer className="mt-auto pt-8 mb-4 text-gray-500 text-xs text-center space-y-1">
        <p>Next song in <span className="font-mono">{countdown}</span></p>
        <p>v{__APP_VERSION__}</p>
      </footer>
    </div>
  )
}

export default App
