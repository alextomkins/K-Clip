import { Guess, Song, RESULT_EMOJI } from '../types'

interface GuessHistoryProps {
  guesses: Guess[]
  songs: Song[]
}

function getSongLabel(songId: string, songs: Song[]): string {
  const song = songs.find((s) => s.id === songId)
  return song ? `${song.title} — ${song.artist}` : songId
}

export function GuessHistory({ guesses, songs }: GuessHistoryProps) {
  if (guesses.length === 0) return null

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-sm text-gray-400 mb-2">Your guesses:</h2>
      <div className="space-y-1">
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
                <span>{getSongLabel(g.songId, songs)}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
