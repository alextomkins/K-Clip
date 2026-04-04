import { auth } from './firebase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

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

export const api = {
  async get<T>(path: string): Promise<T> {
    const headers = await getAuthHeaders()
    const res = await fetch(`${BASE_URL}${path}`, { headers })
    return handleResponse<T>(res)
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders()
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(res)
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    const headers = await getAuthHeaders()
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })
    return handleResponse<T>(res)
  },
}
