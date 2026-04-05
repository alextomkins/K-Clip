import { useState, useEffect, useCallback, useRef } from 'react'
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
  const isHiddenRef = useRef(isHidden)
  isHiddenRef.current = isHidden

  const refresh = useCallback((bustCache = false) => {
    setLoading(true)
    const cacheBust = bustCache ? `?_=${Date.now()}` : ''
    const fetchLeaderboard = user
      ? api.get<LeaderboardResponse>(`/api/leaderboard${cacheBust}`)
      : fetch(`${BASE_URL}/api/leaderboard${cacheBust}`).then((r) => {
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
      const wasHidden = isHiddenRef.current
      await api.put('/api/profile/visibility', { visible: wasHidden })
      setIsHidden(!wasHidden)
      refresh(true)
    } finally {
      setToggling(false)
    }
  }, [toggling, refresh])

  return { entries, currentUser, isHidden, loading, toggling, refresh, toggleVisibility }
}
