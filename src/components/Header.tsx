import { useState, useEffect, useRef } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { avatarColor } from '../utils/avatar'
import { SignInModal } from './SignInModal'
import { ProfileModal } from './ProfileModal'

interface HeaderProps {
  onShowHowToPlay: () => void
  onShowStats: () => void
  onShowLeaderboard: () => void
  showToast: (msg: string, variant?: 'error' | 'success') => void
}

export function Header({ onShowHowToPlay, onShowStats, onShowLeaderboard, showToast }: HeaderProps) {
  const { user, profile, loading: authLoading, signOut } = useAuthContext()
  const displayName = profile?.displayName
  const photoURL = profile?.photoURL
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [userMenuOpen])

  return (
    <div className="flex items-center gap-2 mt-8 mb-2">
      <h1 className="text-3xl font-bold">🎵 K-Clip</h1>
      <button
        onClick={onShowHowToPlay}
        className="text-gray-400 hover:text-white text-xl leading-none"
        aria-label="How to play"
      >
        ℹ️
      </button>
      <button
        onClick={onShowStats}
        className="text-gray-400 hover:text-white text-xl leading-none"
        aria-label="View statistics"
      >
        📊
      </button>
      <button
        onClick={onShowLeaderboard}
        className="text-gray-400 hover:text-white text-xl leading-none"
        aria-label="View leaderboard"
      >
        🏆
      </button>
      {!authLoading && !user && (
        <button
          onClick={() => setSignInOpen(true)}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
          aria-label="Sign in"
        >
          Sign in
        </button>
      )}
      {user && profile && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center leading-none"
              aria-label="User menu"
            >
              {photoURL ? (
                <img
                  src={photoURL}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className={`w-7 h-7 rounded-full ${avatarColor(displayName)} flex items-center justify-center text-xs font-bold`}>
                  {displayName?.[0] ?? '?'}
                </span>
              )}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 py-1">
                <p className="px-3 py-1.5 text-xs text-gray-400 truncate">{displayName}</p>
                <hr className="border-gray-700" />
                <button
                  onClick={() => { setUserMenuOpen(false); setProfileOpen(true) }}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Edit profile
                </button>
                <button
                  onClick={() => { setUserMenuOpen(false); signOut() }}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Sign out
                </button>
                <button
                  onClick={async () => {
                    setUserMenuOpen(false)
                    if (!window.confirm('Delete your account and all cloud data? This cannot be undone.')) return
                    try {
                      await api.delete('/api/account')
                      await signOut()
                      showToast('Account deleted', 'success')
                    } catch {
                      showToast('Failed to delete account')
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
                >
                  Delete account
                </button>
              </div>
            )}
          </div>
      )}
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} showToast={showToast} />
    </div>
  )
}
