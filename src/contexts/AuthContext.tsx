import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { type User } from 'firebase/auth'
import { useAuth } from '../hooks/useAuth'
import { migrateLocalData } from '../lib/migration'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  // Trigger one-time migration when user signs in
  useEffect(() => {
    if (!auth.user) return
    migrateLocalData(auth.user.uid).catch((err) =>
      console.error('Migration failed:', err)
    )
  }, [auth.user])

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
