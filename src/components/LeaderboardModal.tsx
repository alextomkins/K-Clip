import { LeaderboardEntry } from '../types'
import { useAuthContext } from '../contexts/AuthContext'
import { useLeaderboard } from '../hooks/useLeaderboard'

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const { user } = useAuthContext()
  const { entries, loading, userRank } = useLeaderboard()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-gray-800 rounded-xl w-full max-w-md p-6 relative max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-1 text-center">🏆 Leaderboard</h2>
        <p className="text-gray-500 text-xs text-center mb-4">Minimum 5 games played</p>

        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No qualifying players yet</p>
        ) : (
          <div className="overflow-y-auto -mx-2 px-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-gray-700">
                  <th className="pb-2 text-left w-8">#</th>
                  <th className="pb-2 text-left">Player</th>
                  <th className="pb-2 text-right">Win %</th>
                  <th className="pb-2 text-right">Avg</th>
                  <th className="pb-2 text-right">Streak</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <LeaderboardRow
                    key={entry.uid}
                    entry={entry}
                    isCurrentUser={entry.uid === user?.uid}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {userRank && (
          <p className="text-gray-400 text-xs text-center mt-4 pt-3 border-t border-gray-700">
            Your rank: <span className="font-bold text-white">#{userRank}</span>
          </p>
        )}
      </div>
    </div>
  )
}

function LeaderboardRow({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser: boolean }) {
  const rankDisplay =
    entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `${entry.rank}`

  return (
    <tr className={`border-b border-gray-700/50 ${isCurrentUser ? 'bg-indigo-900/30' : ''}`}>
      <td className="py-2 text-left">{rankDisplay}</td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          {entry.photoURL ? (
            <img
              src={entry.photoURL}
              alt=""
              className="w-6 h-6 rounded-full shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
              {entry.displayName[0] ?? '?'}
            </span>
          )}
          <span className={`truncate ${isCurrentUser ? 'font-semibold text-white' : 'text-gray-300'}`}>
            {entry.displayName}
          </span>
        </div>
      </td>
      <td className="py-2 text-right font-mono text-gray-300">{entry.winPct.toFixed(0)}%</td>
      <td className="py-2 text-right font-mono text-gray-300">{entry.avgGuesses.toFixed(1)}</td>
      <td className="py-2 text-right font-mono text-gray-300">{entry.maxStreak}</td>
    </tr>
  )
}
