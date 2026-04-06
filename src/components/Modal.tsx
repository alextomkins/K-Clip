import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  maxWidth?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, maxWidth = 'max-w-sm', children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-gray-800 rounded-xl w-full ${maxWidth} p-6 relative max-h-[80vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
