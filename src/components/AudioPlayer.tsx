import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { CLIP_DURATIONS } from '../types'

interface AudioPlayerProps {
  audioSrc: string
  clipIndex: number
  disabled: boolean
}

export function AudioPlayer({ audioSrc, clipIndex, disabled }: AudioPlayerProps) {
  const clipDuration = CLIP_DURATIONS[clipIndex]
  const { isPlaying, progress, play, stop } = useAudioPlayer({
    src: audioSrc,
    clipDuration,
  })

  return (
    <div className="w-full max-w-sm">
      {/* Progress bar */}
      <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
        {/* Full bar segments showing unlocked clips */}
        <div className="absolute inset-0 flex">
          {CLIP_DURATIONS.map((dur, i) => {
            const segmentWidth = (dur / CLIP_DURATIONS[CLIP_DURATIONS.length - 1]) * 100
            const prevWidth = i === 0 ? 0 : (CLIP_DURATIONS[i - 1] / CLIP_DURATIONS[CLIP_DURATIONS.length - 1]) * 100
            return (
              <div
                key={dur}
                className="absolute top-0 bottom-0"
                style={{ left: `${prevWidth}%`, width: `${segmentWidth - prevWidth}%` }}
              >
                {i <= clipIndex && (
                  <div className="h-full bg-gray-600 border-r border-gray-500" />
                )}
              </div>
            )
          })}
        </div>
        {/* Playback progress */}
        <div
          className="absolute top-0 left-0 h-full bg-green-500 transition-none rounded-full"
          style={{ width: `${(progress * clipDuration / CLIP_DURATIONS[CLIP_DURATIONS.length - 1]) * 100}%` }}
        />
      </div>

      {/* Clip duration label */}
      <p className="text-center text-gray-400 text-sm mb-3">
        {clipDuration}s clip {clipIndex < CLIP_DURATIONS.length - 1 ? `(${CLIP_DURATIONS[CLIP_DURATIONS.length - 1]}s max)` : '(full)'}
      </p>

      {/* Play / Stop button */}
      <button
        onClick={isPlaying ? stop : play}
        disabled={disabled}
        className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors ${
          disabled
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : isPlaying
            ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
            : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
        }`}
      >
        {isPlaying ? '⏹ Stop' : '▶ Play'}
      </button>
    </div>
  )
}
