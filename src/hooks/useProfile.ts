import { useState, useCallback } from 'react'
import { type User } from 'firebase/auth'
import { api } from '../lib/api'
import { type ProfileData } from '../types'

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<ProfileData | null>(null)

  const refreshProfile = useCallback(async () => {
    if (!user) return
    try {
      const data = await api.get<ProfileData>('/api/profile')
      setProfile(data)
    } catch {
      setProfile({
        displayName: user.displayName ?? user.email ?? 'Anonymous',
        photoURL: user.photoURL,
      })
    }
  }, [user])

  const clearProfile = useCallback(() => setProfile(null), [])

  return { profile, refreshProfile, clearProfile }
}
