import { GameState, StatsRecord } from '../types'
import { loadStats } from '../utils/storage'
import { api } from '../lib/api'

function getMigrationFlag(uid: string): string {
  return `kclip-migrated-${uid}`
}

function collectLocalGameStates(): GameState[] {
  const games: GameState[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith('kclip-state-')) continue
    try {
      const parsed = JSON.parse(localStorage.getItem(key)!)
      if (
        parsed &&
        typeof parsed.date === 'string' &&
        Array.isArray(parsed.guesses) &&
        ['playing', 'won', 'lost'].includes(parsed.status)
      ) {
        games.push(parsed as GameState)
      }
    } catch {
      // skip malformed entries
    }
  }
  return games
}

export async function migrateLocalData(uid: string): Promise<boolean> {
  const flag = getMigrationFlag(uid)
  if (localStorage.getItem(flag)) return false

  const games = collectLocalGameStates()
  const stats: StatsRecord = loadStats()
  const hasData = games.length > 0 || stats.played > 0

  if (!hasData) {
    localStorage.setItem(flag, 'true')
    return false
  }

  await api.post('/api/migrate', {
    games,
    stats: stats.played > 0 ? stats : null,
  })

  localStorage.setItem(flag, 'true')
  return true
}
