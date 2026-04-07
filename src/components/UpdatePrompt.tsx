import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-800 border border-gray-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
      <span>🆕 A new version is available!</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="bg-green-600 hover:bg-green-500 text-white font-semibold px-3 py-1 rounded-full transition-colors"
      >
        Update
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="text-gray-400 hover:text-white"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
