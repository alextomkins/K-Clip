import { useState, useCallback, useEffect, useRef } from 'react'

interface Toast {
  id: number
  message: string
}

let nextId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const show = useCallback((message: string, durationMs = 4000) => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, message }])
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      timers.current.delete(id)
    }, durationMs)
    timers.current.set(id, timer)
  }, [])

  useEffect(() => {
    const map = timers.current
    return () => {
      map.forEach(clearTimeout)
    }
  }, [])

  return { toasts, show }
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-red-900/90 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in"
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
