import { useState, useRef, useCallback, useEffect } from 'react'

interface UseAudioPlayerOptions {
  /** Path to the audio file */
  src: string
  /** Maximum duration (in seconds) to play */
  clipDuration: number
  /** Volume level 0.0–1.0 (default: 1.0) */
  volume?: number
}

interface UseAudioPlayerReturn {
  isPlaying: boolean
  progress: number
  error: boolean
  play: () => void
  stop: () => void
}

export function useAudioPlayer({ src, clipDuration, volume = 1 }: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animFrameRef = useRef<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(false)

  // Initialize audio element once, update src when it changes.
  // Reset playback state immediately so stale isPlaying/progress from a
  // previous day never bleeds into the newly loaded player
  useEffect(() => {
    cancelAnimationFrame(animFrameRef.current)
    setIsPlaying(false)
    setProgress(0)

    const audio = new Audio(src)
    audio.preload = 'auto'
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
      cancelAnimationFrame(animFrameRef.current)
      setIsPlaying(false)
      setProgress(0)
    }
  }, [src])

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    cancelAnimationFrame(animFrameRef.current)
    setIsPlaying(false)
    setProgress(0)
  }, [])

  // Enforce the clip boundary via timeupdate, which fires even when the app
  // is backgrounded on mobile (unlike rAF). Re-attach whenever clipDuration
  // or the audio element changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (audio.currentTime >= clipDuration) {
        stopPlayback()
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate)
  // src is included so the listener re-attaches to the new Audio instance
  // whenever the source changes.
  }, [clipDuration, stopPlayback, src])

  const updateProgress = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    const current = audio.currentTime
    if (current >= clipDuration) {
      stopPlayback()
      return
    }

    setProgress(current / clipDuration)
    animFrameRef.current = requestAnimationFrame(updateProgress)
  }, [clipDuration, stopPlayback])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    // Always restart from beginning
    audio.currentTime = 0
    setProgress(0)
    setError(false)
    setIsPlaying(true)

    audio.play().then(() => {
      animFrameRef.current = requestAnimationFrame(updateProgress)
    }).catch(() => {
      setIsPlaying(false)
      setError(true)
    })
  }, [updateProgress])

  // Update volume whenever it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Stop when clipDuration changes (new clip unlocked)
  useEffect(() => {
    stopPlayback()
  }, [clipDuration, stopPlayback])

  return { isPlaying, progress, error, play, stop: stopPlayback }
}
