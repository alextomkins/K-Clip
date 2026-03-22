import { useState, useRef, useCallback, useEffect } from 'react'

interface UseAudioPlayerOptions {
  /** Path to the audio file */
  src: string
  /** Maximum duration (in seconds) to play */
  clipDuration: number
}

interface UseAudioPlayerReturn {
  isPlaying: boolean
  progress: number
  play: () => void
  stop: () => void
}

export function useAudioPlayer({ src, clipDuration }: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animFrameRef = useRef<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Initialize audio element once, update src when it changes
  useEffect(() => {
    const audio = new Audio(src)
    audio.preload = 'auto'
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
      cancelAnimationFrame(animFrameRef.current)
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
    setIsPlaying(true)

    audio.play().then(() => {
      animFrameRef.current = requestAnimationFrame(updateProgress)
    }).catch(() => {
      setIsPlaying(false)
    })
  }, [updateProgress])

  // Stop when clipDuration changes (new clip unlocked)
  useEffect(() => {
    stopPlayback()
  }, [clipDuration, stopPlayback])

  return { isPlaying, progress, play, stop: stopPlayback }
}
