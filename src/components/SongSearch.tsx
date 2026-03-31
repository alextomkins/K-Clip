import { useState, useRef, useEffect, useMemo } from 'react'
import { Song } from '../types'

interface SongSearchProps {
  songs: Song[]
  onGuess: (songId: string) => void
  onSkip: () => void
  guessedSongIds: string[]
}

export function SongSearch({ songs, onGuess, onSkip, guessedSongIds }: SongSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const availableSongs = useMemo(
    () => songs.filter((s) => !guessedSongIds.includes(s.id)),
    [songs, guessedSongIds]
  )

  const filtered = useMemo(
    () => query.trim() && !selectedSong
      ? availableSongs.filter((s) => {
          const q = query.toLowerCase()
          return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
        })
      : availableSongs,
    [query, selectedSong, availableSongs]
  )

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
    setSelectedSong(song)
    setQuery(`${song.title} — ${song.artist}`)
    setIsOpen(false)
    setHighlightIndex(-1)
    inputRef.current?.blur()
  }

  function handleSubmit() {
    if (!selectedSong) return
    onGuess(selectedSong.id)
    setSelectedSong(null)
    setQuery('')
    setHighlightIndex(-1)
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    setSelectedSong(null)
    setIsOpen(true)
    setHighlightIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && selectedSong) {
      e.preventDefault()
      handleSubmit()
      return
    }

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
        setSelectedSong(null)
        setQuery('')
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
          placeholder="Search for a song or artist..."
          className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border focus:outline-none transition-colors ${
            selectedSong
              ? 'border-green-500 text-green-300'
              : 'border-gray-600 focus:border-green-500'
          }`}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => { if (!selectedSong) setIsOpen(true) }}
          onBlur={() => setIsOpen(false)}
          onKeyDown={handleKeyDown}
        />

        {/* Dropdown */}
        {isOpen && !selectedSong && filtered.length > 0 && (
          <ul
            ref={listRef}
            onMouseDown={(e) => e.preventDefault()}
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

        {isOpen && !selectedSong && query.trim() && filtered.length === 0 && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className="absolute z-10 mt-1 w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 text-sm"
          >
            No matches found
          </div>
        )}
      </div>

      {/* Submit + Skip buttons */}
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!selectedSong}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors bg-green-600 hover:bg-green-500 active:bg-green-700 text-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Submit Guess
        </button>
        <button
          onClick={onSkip}
          className="py-2 px-4 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-gray-300 transition-colors"
        >
          Skip →
        </button>
      </div>
    </div>
  )
}
