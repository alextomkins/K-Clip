interface HowToPlayProps {
  isOpen: boolean
  onClose: () => void
}

export function HowToPlay({ isOpen, onClose }: HowToPlayProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
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

        <h2 className="text-xl font-bold mb-4 text-center">How to Play</h2>

        <ul className="text-sm text-gray-300 space-y-2 mb-6 list-disc list-inside">
          <li>Listen to the clip and guess the song.</li>
          <li>You have <span className="text-white font-semibold">6 guesses</span> per day.</li>
          <li>Each wrong guess unlocks a <span className="text-white font-semibold">longer clip</span>.</li>
          <li>Everyone gets the <span className="text-white font-semibold">same song</span> each day.</li>
          <li>You can replay the current clip as many times as you like.</li>
        </ul>

        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Colour Legend
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">🟩</span>
            <span className="text-gray-300">Correct song</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">🟧</span>
            <span className="text-gray-300">Right artist, wrong song</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">🟥</span>
            <span className="text-gray-300">Wrong guess or skipped</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">⬜</span>
            <span className="text-gray-300">Unused guess</span>
          </div>
        </div>
      </div>
    </div>
  )
}
