import { Guess, RESULT_EMOJI } from '../types'
import { songLookup } from '../data/songs'

interface GuessHistoryProps {
  guesses: Guess[]
  loading?: boolean
}

function getSongLabel(songId: string): string {
  const song = songLookup.get(songId)
  return song ? `${song.title} — ${song.artist}` : songId
}

export function GuessHistory({ guesses, loading }: GuessHistoryProps) {
  if (guesses.length === 0 && !loading) return null

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-sm text-gray-400 mb-2">Your guesses:</h2>
      {loading && guesses.length === 0 ? (
        <div className="space-y-1">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="px-3 py-2 rounded bg-gray-700/40 animate-pulse h-9" />
          ))}
        </div>
      ) : (
        <div className={`space-y-1 transition-opacity duration-150 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          {guesses.map((g, i) => (
            <div
              key={i}
              className={`px-3 py-2 rounded text-sm flex items-center gap-2 ${
                g.result === 'correct'
                  ? 'bg-green-800'
                  : g.result === 'partial'
                  ? 'bg-orange-700/60'
                  : g.result === 'skipped'
                  ? 'bg-gray-700 text-gray-400 italic'
                  : 'bg-red-900/50'
              }`}
            >
              <span className="text-xs opacity-60">{i + 1}.</span>
              {g.result === 'skipped' ? (
                <span>Skipped</span>
              ) : (
                <>
                  <span>{RESULT_EMOJI[g.result]}</span>
                  <span>{getSongLabel(g.songId)}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
