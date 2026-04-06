import { useState, useEffect } from 'react'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { CLIP_DURATIONS } from '../types'
import { getAudioUrl } from '../lib/storage'

interface AudioPlayerProps {
  audioFile: string
  clipIndex: number
}

export function AudioPlayer({ audioFile, clipIndex }: AudioPlayerProps) {
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  useEffect(() => {
    setAudioSrc(null)
    getAudioUrl(audioFile).then(setAudioSrc)
  }, [audioFile])

  const maxDuration = CLIP_DURATIONS[CLIP_DURATIONS.length - 1]
  const clipDuration = CLIP_DURATIONS[clipIndex]
  const { isPlaying, progress, error, play, stop } = useAudioPlayer({
    src: audioSrc ?? '',
    clipDuration,
    volume: 0.7,
  })

  if (!audioSrc) {
    return (
      <div className="w-full max-w-sm">
        {/* Skeleton progress bar */}
        <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
          <div className="absolute inset-y-0 left-0 w-full bg-gray-600 animate-pulse rounded-full" />
        </div>

        {/* Skeleton label — same height as real label */}
        <div className="flex justify-center mb-3">
          <div className="h-5 w-24 bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Error slot — always present to reserve space */}
        <div className="h-5 mb-3" />

        {/* Skeleton button with spinner */}
        <div className="w-full py-3 rounded-lg bg-gray-700 flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-gray-400 font-semibold text-lg">Loading…</span>
        </div>
      </div>
    )
  }

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

      {/* Error slot — always present to reserve space */}
      <div className="h-5 mb-3">
        {error && <p className="text-center text-red-400 text-sm">Failed to load audio</p>}
      </div>

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
