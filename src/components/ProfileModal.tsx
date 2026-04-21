import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { useAuthContext } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { avatarColor } from '../utils/avatar'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  showToast: (msg: string, variant?: 'error' | 'success') => void
}

export function ProfileModal({ isOpen, onClose, showToast }: ProfileModalProps) {
  const { user, profile, refreshProfile, resetPassword, signOut } = useAuthContext()
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [validationError, setValidationError] = useState('')

  // Initialise form fields from cached profile when the modal opens
  useEffect(() => {
    if (!isOpen || !user) return
    setDisplayName(profile?.displayName ?? user.displayName ?? '')
    setValidationError('')
  }, [isOpen, user, profile])

  function validate(): boolean {
    const trimmed = displayName.trim()
    if (trimmed.length === 0 || trimmed.length > 30) {
      setValidationError('Display name must be 1-30 characters.')
      return false
    }
    setValidationError('')
    return true
  }

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await api.put('/api/profile', {
        displayName: displayName.trim(),
      })
      await refreshProfile()
      showToast('Profile updated', 'success')
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleResetPassword() {
    if (!user?.email) return
    try {
      await resetPassword(user.email)
      showToast('Password reset email sent', 'success')
    } catch {
      showToast('Failed to send reset email')
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Delete your account and all cloud data? This cannot be undone.')) return
    try {
      await api.delete('/api/account')
      await signOut()
      showToast('Account deleted', 'success')
      onClose()
    } catch {
      showToast('Failed to delete account')
    }
  }

  const previewInitial = displayName.trim()[0] ?? '?'
  const photoURL = profile?.photoURL ?? user?.photoURL
  const isPasswordUser = user?.providerData.some((p) => p.providerId === 'password')

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Profile</h2>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Avatar preview */}
        <div className="flex justify-center">
          {photoURL ? (
            <img
              src={photoURL}
              alt=""
              className="w-16 h-16 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className={`w-16 h-16 rounded-full ${avatarColor(displayName)} flex items-center justify-center text-2xl font-bold`}>
              {previewInitial}
            </span>
          )}
        </div>

        {/* Email (read-only) */}
        {user?.email && (
          <p className="text-sm text-gray-400 text-center">{user.email}</p>
        )}

        {/* Display Name */}
        <div>
          <label htmlFor="profile-name" className="block text-sm text-gray-400 mb-1">
            Display Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={30}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
            placeholder="Your display name"
          />
          <p className="text-xs text-gray-500 mt-1">{displayName.trim().length}/30</p>
          {validationError && <p className="text-red-400 text-xs mt-1">{validationError}</p>}
        </div>

        <button
          type="submit"
          disabled={saving || !displayName.trim()}
          className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>

      <hr className="border-gray-700 my-4" />

      <div className="space-y-2">
        {isPasswordUser && (
          <button
            onClick={handleResetPassword}
            className="w-full text-center text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset password
          </button>
        )}
        <button
          onClick={() => { signOut(); onClose() }}
          className="w-full text-center text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Sign out
        </button>
        <button
          onClick={handleDeleteAccount}
          className="w-full text-center text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Delete account
        </button>
      </div>
    </Modal>
  )
}
