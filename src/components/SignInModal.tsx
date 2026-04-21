import { useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { Modal } from './Modal'
import { useAuthContext } from '../contexts/AuthContext'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

type Mode = 'sign-in' | 'sign-up' | 'reset'

function firebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-email': return 'Invalid email address.'
      case 'auth/user-disabled': return 'This account has been disabled.'
      case 'auth/user-not-found': return 'No account found with this email.'
      case 'auth/wrong-password': return 'Incorrect password.'
      case 'auth/invalid-credential': return 'Incorrect email or password.'
      case 'auth/email-already-in-use': return 'An account with this email already exists.'
      case 'auth/weak-password': return 'Password must be at least 6 characters.'
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.'
      case 'auth/popup-closed-by-user': return 'Sign-in popup was closed.'
      default: return error.message
    }
  }
  return 'An unexpected error occurred.'
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuthContext()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setEmail('')
    setPassword('')
    setError('')
    setInfo('')
    setSubmitting(false)
  }

  function handleClose() {
    reset()
    setMode('sign-in')
    onClose()
  }

  async function handleGoogle() {
    setError('')
    try {
      await signInWithGoogle()
      handleClose()
    } catch (err) {
      const msg = firebaseErrorMessage(err)
      if (msg !== 'Sign-in popup was closed.') setError(msg)
    }
  }

  async function handleEmailSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      if (mode === 'reset') {
        await resetPassword(email)
        setInfo('Password reset email sent. Check your inbox.')
        setSubmitting(false)
        return
      }
      if (mode === 'sign-up') {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      handleClose()
    } catch (err) {
      setError(firebaseErrorMessage(err))
      setSubmitting(false)
    }
  }

  const title = mode === 'reset' ? 'Reset Password' : mode === 'sign-up' ? 'Create Account' : 'Sign In'

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      {mode !== 'reset' && (
        <>
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <hr className="flex-1 border-gray-600" />
            <span className="text-xs text-gray-400 uppercase">or</span>
            <hr className="flex-1 border-gray-600" />
          </div>
        </>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
        />
        {mode !== 'reset' && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
          />
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {info && <p className="text-green-400 text-sm">{info}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {submitting ? '...' : mode === 'reset' ? 'Send Reset Email' : mode === 'sign-up' ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-400 space-y-1">
        {mode === 'sign-in' && (
          <>
            <p>
              Don't have an account?{' '}
              <button onClick={() => { reset(); setMode('sign-up') }} className="text-green-400 hover:underline">Sign up</button>
            </p>
            <p>
              <button onClick={() => { reset(); setMode('reset') }} className="text-green-400 hover:underline">Forgot password?</button>
            </p>
          </>
        )}
        {mode === 'sign-up' && (
          <p>
            Already have an account?{' '}
            <button onClick={() => { reset(); setMode('sign-in') }} className="text-green-400 hover:underline">Sign in</button>
          </p>
        )}
        {mode === 'reset' && (
          <p>
            <button onClick={() => { reset(); setMode('sign-in') }} className="text-green-400 hover:underline">Back to sign in</button>
          </p>
        )}
      </div>
    </Modal>
  )
}
