import { StatsRecord, DistributionKey, PuzzleSummary } from '../types'

interface StatsModalProps {
  stats: StatsRecord
  isOpen: boolean
  onClose: () => void
  lastResultKey: DistributionKey | null
  puzzleSummary: PuzzleSummary | null
}

const DIST_KEYS: DistributionKey[] = ['1', '2', '3', '4', '5', '6', 'X']

export function StatsModal({ stats, isOpen, onClose, lastResultKey, puzzleSummary }: StatsModalProps) {
  if (!isOpen) return null

  const winPct = stats.played === 0 ? 0 : Math.round((stats.wins / stats.played) * 100)
  const maxVal = Math.max(...DIST_KEYS.map((k) => stats.guessDistribution[k]), 1)

  const tiles = [
    { label: 'Played', value: stats.played },
    { label: 'Win %', value: winPct },
    { label: 'Streak', value: stats.currentStreak },
    { label: 'Max Streak', value: stats.maxStreak },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-gray-800 rounded-xl w-full max-w-sm p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Statistics</h2>

        {/* Stat tiles */}
        <div className="grid grid-cols-4 gap-2 mb-6 text-center">
          {tiles.map(({ label, value }) => (
            <div key={label}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-gray-400 text-xs leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Guess distribution */}
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Guess Distribution
        </h3>
        <div className="space-y-1.5">
          {DIST_KEYS.map((k) => {
            const val = stats.guessDistribution[k]
            const isHighlighted = k === lastResultKey
            const barWidth = val === 0 ? '1.75rem' : `${Math.max((val / maxVal) * 100, 10)}%`
            return (
              <div key={k} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-center text-gray-400 shrink-0">{k}</span>
                <div className="flex-1">
                  <div
                    className={`h-6 rounded flex items-center justify-end pr-2 text-white text-xs font-bold transition-[width] ${
                      isHighlighted
                        ? k === 'X'
                          ? 'bg-red-600'
                          : 'bg-green-600'
                        : 'bg-gray-600'
                    }`}
                    style={{ width: barWidth }}
                  >
                    {val}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Community average for today */}
        {puzzleSummary && lastResultKey && (
          <div className="mt-5 p-3 bg-gray-700/50 rounded-lg text-sm text-gray-300">
            <p className="font-semibold text-gray-400 text-xs uppercase tracking-wide mb-1">Today's Community</p>
            <p>
              Average: <span className="font-bold text-white">{puzzleSummary.avgGuesses.toFixed(1)}</span> guesses
              {lastResultKey !== 'X' && (
                <>
                  <span className="text-gray-500"> · </span>
                  You: <span className="font-bold text-white">{lastResultKey}</span>
                </>
              )}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {puzzleSummary.totalPlays} player{puzzleSummary.totalPlays !== 1 ? 's' : ''} · {puzzleSummary.winCount} win{puzzleSummary.winCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
