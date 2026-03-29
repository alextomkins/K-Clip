import { useState, useEffect, useMemo } from 'react'
import { GameState, StatsRecord, DistributionKey } from '../types'
import { getTodayAEST, getDayNumber } from '../utils/puzzle'
import { loadStats, saveStats } from '../utils/storage'

export function useStats(date: string, gameState: GameState) {
  const today = useMemo(() => getTodayAEST(), [])
  const isToday = date === today

  const [stats, setStats] = useState<StatsRecord>(() => {
    const loaded = loadStats()
    if (loaded.lastPlayedDate !== null) {
      const days = getDayNumber(today) - getDayNumber(loaded.lastPlayedDate)
      if (days > 1) {
        const reset = { ...loaded, currentStreak: 0 }
        saveStats(reset)
        return reset
      }
    }
    return loaded
  })

  useEffect(() => {
    if (!isToday) return
    if (gameState.status === 'playing') return

    setStats((prev) => {
      if (prev.lastPlayedDate === today) return prev

      const isWin = gameState.status === 'won'
      const guessCount = gameState.guesses.length
      const distKey: DistributionKey = isWin
        ? (String(guessCount) as '1' | '2' | '3' | '4' | '5' | '6')
        : 'X'

      const daysBetween = prev.lastPlayedDate
        ? getDayNumber(today) - getDayNumber(prev.lastPlayedDate)
        : null

      let newStreak: number
      if (!isWin) {
        newStreak = 0
      } else if (daysBetween === null || daysBetween > 1) {
        newStreak = 1
      } else {
        newStreak = prev.currentStreak + 1
      }

      const newStats: StatsRecord = {
        played: prev.played + 1,
        wins: prev.wins + (isWin ? 1 : 0),
        currentStreak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        guessDistribution: {
          ...prev.guessDistribution,
          [distKey]: prev.guessDistribution[distKey] + 1,
        },
        lastPlayedDate: today,
        lastWonDate: isWin ? today : prev.lastWonDate,
      }
      saveStats(newStats)
      return newStats
    })
  }, [gameState, isToday, today])

  return stats
}
