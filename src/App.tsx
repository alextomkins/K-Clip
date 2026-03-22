import { useGameState } from './hooks/useGameState'
import { AudioPlayer } from './components/AudioPlayer'
import { SongSearch } from './components/SongSearch'
import { GuessHistory } from './components/GuessHistory'
import { ResultScreen } from './components/ResultScreen'
import { CLIP_DURATIONS } from './types'
import joppingAudio from './assets/jopping.mp3'

function App() {
  const {
    puzzle,
    gameState,
    currentClipIndex,
    attemptsRemaining,
    submitGuess,
    skipGuess,
  } = useGameState()

  const isPlaying = gameState.status === 'playing'
  const guessedSongIds = gameState.guesses
    .filter((g) => g.result !== 'skipped')
    .map((g) => g.songId)

  console.log('[DEBUG] Today\'s song:', puzzle.song.title, '—', puzzle.song.artist)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mt-8 mb-2">🎵 K-Clip</h1>
      <p className="text-gray-400 text-sm mb-6">Day #{puzzle.dayNumber}</p>

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
          audioSrc={joppingAudio}
          clipIndex={currentClipIndex}
          disabled={!isPlaying}
        />
      </div>

      {/* Guess input or Result screen */}
      {isPlaying ? (
        <div className="w-full flex flex-col items-center gap-3 mb-4">
          <p className="text-gray-400 text-sm">
            {attemptsRemaining} guess{attemptsRemaining !== 1 ? 'es' : ''} remaining
          </p>
          <SongSearch
            onGuess={submitGuess}
            onSkip={skipGuess}
            disabled={false}
            guessedSongIds={guessedSongIds}
          />
        </div>
      ) : (
        <div className="mb-4 w-full flex justify-center">
          <ResultScreen gameState={gameState} puzzle={puzzle} />
        </div>
      )}

      {/* Guess history */}
      <div className="mt-2 w-full flex justify-center">
        <GuessHistory guesses={gameState.guesses} />
      </div>
    </div>
  )
}

export default App
