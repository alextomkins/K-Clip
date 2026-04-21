import { useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
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
  const { user, profile, loading: authLoading } = useAuthContext()
  const displayName = profile?.displayName
  const photoURL = profile?.photoURL
  const [signInOpen, setSignInOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

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
          👤 Sign in
        </button>
      )}
      {user && profile && (
        <button
          onClick={() => setProfileOpen(true)}
          className="flex items-center leading-none"
          aria-label="Profile"
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
      )}
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} showToast={showToast} />
    </div>
  )
}
