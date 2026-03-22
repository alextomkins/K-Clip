import { useState, useRef, useEffect } from 'react'
import { Song } from '../types'
import songs from '../data/songs'

interface SongSearchProps {
  onGuess: (songId: string) => void
  onSkip: () => void
  disabled: boolean
  guessedSongIds: string[]
}

export function SongSearch({ onGuess, onSkip, disabled, guessedSongIds }: SongSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const availableSongs = songs.filter((s) => !guessedSongIds.includes(s.id))

  const filtered = query.trim()
    ? availableSongs.filter((s) => {
        const q = query.toLowerCase()
        return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
      })
    : availableSongs

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.children
      if (items[highlightIndex]) {
        items[highlightIndex].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightIndex])

  function handleSelect(song: Song) {
    onGuess(song.id)
    setQuery('')
    setIsOpen(false)
    setHighlightIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || filtered.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true)
        setHighlightIndex(0)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightIndex >= 0 && highlightIndex < filtered.length) {
          handleSelect(filtered[highlightIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightIndex(-1)
        break
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          placeholder="Search for a song or artist..."
          className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-600 focus:border-green-500 focus:outline-none disabled:opacity-50"
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setHighlightIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay to allow click on list item
            setTimeout(() => setIsOpen(false), 150)
          }}
          onKeyDown={handleKeyDown}
        />

        {/* Dropdown */}
        {isOpen && filtered.length > 0 && (
          <ul
            ref={listRef}
            className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg shadow-lg"
          >
            {filtered.map((song, i) => (
              <li
                key={song.id}
                className={`px-4 py-2 cursor-pointer text-sm ${
                  i === highlightIndex
                    ? 'bg-green-700 text-white'
                    : 'hover:bg-gray-700'
                }`}
                onMouseDown={() => handleSelect(song)}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                <span className="font-medium">{song.title}</span>
                <span className="text-gray-400 ml-2">— {song.artist}</span>
              </li>
            ))}
          </ul>
        )}

        {isOpen && query.trim() && filtered.length === 0 && (
          <div className="absolute z-10 mt-1 w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 text-sm">
            No matches found
          </div>
        )}
      </div>

      {/* Skip button */}
      <button
        onClick={onSkip}
        disabled={disabled}
        className="mt-2 w-full py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Skip →
      </button>
    </div>
  )
}
