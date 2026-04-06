import { auth } from './firebase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

type ErrorHandler = (message: string) => void
let onApiError: ErrorHandler | null = null

export function setApiErrorHandler(handler: ErrorHandler) {
  onApiError = handler
}

function notifyError(message: string) {
  onApiError?.(message)
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  const token = await user.getIdToken()
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// Pending writes to retry when back online
interface PendingWrite {
  method: 'PUT' | 'POST'
  path: string
  body: unknown
}

const pendingWrites: PendingWrite[] = []

function queueWrite(method: 'PUT' | 'POST', path: string, body: unknown) {
  // Deduplicate — replace existing entry for same method+path
  const idx = pendingWrites.findIndex((w) => w.method === method && w.path === path)
  if (idx >= 0) pendingWrites[idx] = { method, path, body }
  else pendingWrites.push({ method, path, body })
}

async function flushPendingWrites() {
  while (pendingWrites.length > 0) {
    const write = pendingWrites[0]
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}${write.path}`, {
        method: write.method,
        headers,
        body: JSON.stringify(write.body),
      })
      if (res.ok || res.status === 409) {
        // Success or conflict (already processed) — remove from queue
        pendingWrites.shift()
      } else {
        break // Server error — stop flushing, try again later
      }
    } catch {
      break // Still offline
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushPendingWrites()
  })
}

function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError && (err as TypeError).message === 'Failed to fetch'
}

export const api = {
  async get<T>(path: string): Promise<T> {
    const headers = await getAuthHeaders()
    const res = await fetch(`${BASE_URL}${path}`, { headers })
    return handleResponse<T>(res)
  },

  async getPublic<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`)
    return handleResponse<T>(res)
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders()
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
      return handleResponse<T>(res)
    } catch (err) {
      if (isNetworkError(err) && body !== undefined) {
        queueWrite('POST', path, body)
        notifyError('You\'re offline — changes will sync when reconnected')
      }
      throw err
    }
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    const headers = await getAuthHeaders()
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      })
      return handleResponse<T>(res)
    } catch (err) {
      if (isNetworkError(err)) {
        queueWrite('PUT', path, body)
        notifyError('You\'re offline — changes will sync when reconnected')
      }
      throw err
    }
  },

  async delete(path: string): Promise<void> {
    const headers = await getAuthHeaders()
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers,
    })
    await handleResponse<void>(res)
  },
}
