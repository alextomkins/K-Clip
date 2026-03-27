import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { CLIP_DURATIONS } from '../types'

interface AudioPlayerProps {
  audioSrc: string
  clipIndex: number
}

export function AudioPlayer({ audioSrc, clipIndex }: AudioPlayerProps) {
  const maxDuration = CLIP_DURATIONS[CLIP_DURATIONS.length - 1]
  const clipDuration = CLIP_DURATIONS[clipIndex]
  const { isPlaying, progress, error, play, stop } = useAudioPlayer({
    src: audioSrc,
    clipDuration,
    volume: 0.7,
  })

  return (
    <div className="w-full max-w-sm">
      {/* Progress bar */}
      <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div className="absolute inset-y-0 left-0 bg-gray-600" style={{ width: `${(clipDuration / maxDuration) * 100}%` }} />
        <div className="absolute inset-y-0 left-0 bg-green-500 rounded-full transition-none" style={{ width: `${(progress * clipDuration / maxDuration) * 100}%` }} />
      </div>

      {/* Clip duration label */}
      <p className="text-center text-gray-400 text-sm mb-3">
        {clipDuration}s clip {clipIndex < CLIP_DURATIONS.length - 1 ? `(${maxDuration}s max)` : '(full)'}
      </p>

      {error && (
        <p className="text-center text-red-400 text-sm mb-3">Failed to load audio</p>
      )}

      {/* Play / Stop button */}
      <button
        onClick={isPlaying ? stop : play}
        className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors ${
          isPlaying
            ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
            : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
        }`}
      >
        {isPlaying ? '⏹ Stop' : '▶ Play'}
      </button>
    </div>
  )
}
