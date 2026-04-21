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

interface ProfileData {
  displayName: string
  photoURL: string | null
}

export function ProfileModal({ isOpen, onClose, showToast }: ProfileModalProps) {
  const { user, refreshProfile } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!isOpen || !user) return
    setLoading(true)
    api.get<ProfileData>('/api/profile')
      .then((data) => {
        setDisplayName(data.displayName)
        setPhotoURL(data.photoURL ?? '')
      })
      .catch(() => {
        // Fall back to Firebase auth claims
        setDisplayName(user.displayName ?? '')
        setPhotoURL(user.photoURL ?? '')
      })
      .finally(() => setLoading(false))
  }, [isOpen, user])

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/api/profile', {
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || '',
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
  const previewUrl = photoURL.trim()
  const showImg = previewUrl && !imgError

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar preview */}
          <div className="flex justify-center">
            {showImg ? (
              <img
                src={previewUrl}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
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
          </div>

          {/* Photo URL */}
          <div>
            <label htmlFor="profile-photo" className="block text-sm text-gray-400 mb-1">
              Photo URL
            </label>
            <input
              id="profile-photo"
              type="url"
              value={photoURL}
              onChange={(e) => { setPhotoURL(e.target.value); setImgError(false) }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              placeholder="https://example.com/photo.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to use your initial as avatar</p>
          </div>

          <button
            type="submit"
            disabled={saving || !displayName.trim()}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}
    </Modal>
  )
}
