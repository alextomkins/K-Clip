import { LeaderboardEntry } from '../types'
import { useAuthContext } from '../contexts/AuthContext'
import { useLeaderboard } from '../hooks/useLeaderboard'

const MIN_GAMES = 5

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const { user } = useAuthContext()
  const { entries, currentUser, isHidden, loading, toggling, toggleVisibility } = useLeaderboard()

  if (!isOpen) return null

  // Is the current user already shown in the top entries?
  const currentUserInTop = currentUser
    ? entries.some((e) => e.uid === currentUser.uid)
    : false

  // Should we show the current user as a separate row below?
  const showCurrentUserBelow = currentUser && !currentUserInTop

  // Is the current user unqualified (not enough games)?
  const isUnqualified = currentUser ? currentUser.played < MIN_GAMES : false

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
        <p className="text-gray-500 text-xs text-center mb-4">Minimum {MIN_GAMES} games played</p>

        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading...</p>
        ) : entries.length === 0 && !showCurrentUserBelow ? (
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
                  <th className="pb-2 text-right">Played</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <LeaderboardRow
                    key={entry.uid}
                    entry={entry}
                    isCurrentUser={entry.uid === user?.uid}
                    dimmed={false}
                    hidden={false}
                  />
                ))}

                {showCurrentUserBelow && (
                  <>
                    {/* Separator row */}
                    <tr>
                      <td colSpan={6} className="py-2 text-center text-gray-600 text-xs tracking-widest">
                        ···
                      </td>
                    </tr>
                    <LeaderboardRow
                      entry={currentUser}
                      isCurrentUser
                      dimmed={isUnqualified}
                      hidden={isHidden}
                    />
                  </>
                )}
              </tbody>
            </table>

            {showCurrentUserBelow && isUnqualified && (
              <p className="text-gray-500 text-xs text-center mt-2">
                Play {MIN_GAMES - currentUser.played} more game{MIN_GAMES - currentUser.played !== 1 ? 's' : ''} to qualify
              </p>
            )}
          </div>
        )}

        {user && (
          <div className="mt-4 pt-3 border-t border-gray-700 flex items-center justify-center">
            <button
              onClick={toggleVisibility}
              disabled={toggling}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <span className={`inline-block w-8 h-5 rounded-full relative transition-colors ${isHidden ? 'bg-gray-600' : 'bg-indigo-500'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isHidden ? 'left-0.5' : 'left-3.5'}`} />
              </span>
              <span>{isHidden ? 'Hidden from leaderboard' : 'Visible on leaderboard'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function LeaderboardRow({
  entry,
  isCurrentUser,
  dimmed,
  hidden,
}: {
  entry: LeaderboardEntry
  isCurrentUser: boolean
  dimmed: boolean
  hidden: boolean
}) {
  const rankDisplay = dimmed
    ? '—'
    : entry.rank === 1
      ? '🥇'
      : entry.rank === 2
        ? '🥈'
        : entry.rank === 3
          ? '🥉'
          : `${entry.rank}`

  return (
    <tr
      className={`border-b border-gray-700/50 ${
        isCurrentUser ? 'bg-indigo-900/30' : ''
      } ${dimmed ? 'opacity-50' : ''}`}
    >
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
          {hidden && (
            <span className="text-xs text-gray-500 ml-1 shrink-0">👻</span>
          )}
        </div>
      </td>
      <td className="py-2 text-right font-mono text-gray-300">{entry.winPct.toFixed(0)}%</td>
      <td className="py-2 text-right font-mono text-gray-300">{entry.avgGuesses.toFixed(1)}</td>
      <td className="py-2 text-right font-mono text-gray-300">{entry.maxStreak}</td>
      <td className="py-2 text-right font-mono text-gray-300">{entry.played}</td>
    </tr>
  )
}
