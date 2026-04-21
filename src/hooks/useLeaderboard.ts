import { useState, useEffect, useCallback } from 'react'
import { LeaderboardEntry, LeaderboardResponse } from '../types'
import { useAuthContext } from '../contexts/AuthContext'
import { api } from '../lib/api'

export function useLeaderboard() {
  const { user, profile } = useAuthContext()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null)
  const [isHidden, setIsHidden] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState(false)

  const refresh = useCallback((bustCache = false) => {
    setLoading(true)
    const cacheBust = bustCache ? `?_=${Date.now()}` : ''
    const fetchLeaderboard = user
      ? api.get<LeaderboardResponse>(`/api/leaderboard${cacheBust}`)
      : api.getPublic<LeaderboardResponse>(`/api/leaderboard${cacheBust}`)

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
  }, [user, profile])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggleVisibility = useCallback(async () => {
    if (toggling) return
    setToggling(true)
    try {
      await api.put('/api/profile/visibility', { visible: isHidden })
      setIsHidden(!isHidden)
      refresh(true)
    } finally {
      setToggling(false)
    }
  }, [toggling, refresh, isHidden])

  return { entries, currentUser, isHidden, loading, toggling, refresh, toggleVisibility }
}
