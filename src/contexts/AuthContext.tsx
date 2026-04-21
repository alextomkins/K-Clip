import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { type User } from 'firebase/auth'
import { useAuth } from '../hooks/useAuth'
import { migrateLocalData } from '../lib/migration'
import { api } from '../lib/api'

interface ProfileData {
  displayName: string
  photoURL: string | null
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  profile: ProfileData | null
  refreshProfile: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)

  const refreshProfile = useCallback(async () => {
    if (!auth.user) return
    try {
      const data = await api.get<ProfileData>('/api/profile')
      setProfile(data)
    } catch {
      // Fall back to Firebase auth claims
      setProfile({
        displayName: auth.user.displayName ?? auth.user.email ?? 'Anonymous',
        photoURL: auth.user.photoURL,
      })
    }
  }, [auth.user])

  // Trigger one-time migration when user signs in, then load profile
  useEffect(() => {
    if (!auth.user) {
      setProfile(null)
      return
    }
    migrateLocalData(auth.user.uid)
      .catch((err) => console.error('Migration failed:', err))
      .finally(() => refreshProfile())
  }, [auth.user, refreshProfile])

  const value: AuthContextValue = {
    ...auth,
    profile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
