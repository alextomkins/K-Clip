import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react'
import { type User } from 'firebase/auth'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { migrateLocalData } from '../lib/migration'
import { api } from '../lib/api'
import { type ProfileData } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  profile: ProfileData | null
  refreshProfile: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const { profile, refreshProfile, clearProfile } = useProfile(auth.user)
  const migratedRef = useRef<string | null>(null)
  const skipAutoFetchRef = useRef(false)

  // Wraps signUpWithEmail to suppress the auto-fetch race and push the
  // chosen display name to the backend before the first profile load.
  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    skipAutoFetchRef.current = true
    try {
      await auth.signUpWithEmail(email, password, displayName)
      await api.put('/api/profile', { displayName })
      await refreshProfile()
    } finally {
      skipAutoFetchRef.current = false
    }
  }, [auth, refreshProfile])

  // Trigger one-time migration when user signs in, then load profile
  useEffect(() => {
    if (!auth.user) {
      clearProfile()
      migratedRef.current = null
      return
    }

    // Sign-up flow handles profile fetch itself to avoid the race
    if (skipAutoFetchRef.current) return

    let cancelled = false
    const uid = auth.user.uid

    // Only migrate once per user session
    const migrate = migratedRef.current === uid
      ? Promise.resolve()
      : migrateLocalData(uid).catch((err) => console.error('Migration failed:', err))

    migrate.then(() => {
      migratedRef.current = uid
      if (!cancelled) refreshProfile()
    })

    return () => { cancelled = true }
  }, [auth.user, refreshProfile, clearProfile])

  const value: AuthContextValue = {
    ...auth,
    signUpWithEmail,
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
