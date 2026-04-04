import { useState, useEffect, useCallback } from 'react'
import { LeaderboardEntry } from '../types'
import { useAuthContext } from '../contexts/AuthContext'
import { api } from '../lib/api'

export function useLeaderboard() {
  const { user } = useAuthContext()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)

  const userRank = user ? entries.find((e) => e.uid === user.uid)?.rank ?? null : null

  const refresh = useCallback(() => {
    if (!user) return
    setLoading(true)
    api.get<LeaderboardEntry[]>('/api/leaderboard')
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { entries, loading, userRank, refresh }
}
