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
  const { user, profile, refreshProfile } = useAuthContext()
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

  const previewInitial = displayName.trim()[0]?.toUpperCase() ?? '?'
  const photoURL = profile?.photoURL ?? user?.photoURL

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

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
    </Modal>
  )
}
