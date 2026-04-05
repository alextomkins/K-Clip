import { useState, useEffect, useCallback } from 'react'
import { LeaderboardEntry, LeaderboardResponse } from '../types'
import { useAuthContext } from '../contexts/AuthContext'
import { api } from '../lib/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export function useLeaderboard() {
  const { user } = useAuthContext()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null)
  const [isHidden, setIsHidden] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState(false)

  const refresh = useCallback(() => {
    setLoading(true)
    const fetchLeaderboard = user
      ? api.get<LeaderboardResponse>('/api/leaderboard')
      : fetch(`${BASE_URL}/api/leaderboard`).then((r) => {
          if (!r.ok) throw new Error(`API ${r.status}`)
          return r.json() as Promise<LeaderboardResponse>
        })

    fetchLeaderboard
      .then((res) => {
        setEntries(res.entries)
        setCurrentUser(res.currentUser)
        setIsHidden(res.currentUserHidden)
      })
      .catch(() => {
        setEntries([])
        setCurrentUser(null)
      })
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggleVisibility = useCallback(async () => {
    if (toggling) return
    setToggling(true)
    try {
      await api.put('/api/profile/visibility', { visible: isHidden })
      setIsHidden(!isHidden)
      refresh()
    } finally {
      setToggling(false)
    }
  }, [isHidden, toggling, refresh])

  return { entries, currentUser, isHidden, loading, toggling, refresh, toggleVisibility }
}
