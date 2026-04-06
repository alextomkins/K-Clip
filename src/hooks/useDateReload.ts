import { useEffect, useMemo } from 'react'
import { getTodayAEST } from '../utils/puzzle'

export function useDateReload(isToday: boolean) {
  const today = useMemo(() => getTodayAEST(), [])

  useEffect(() => {
    if (!isToday) return
    const check = () => {
      if (getTodayAEST() !== today) window.location.reload()
    }
    window.addEventListener('focus', check)
    // Also poll periodically for active-tab midnight rollover
    const id = setInterval(check, 60_000)
    return () => {
      window.removeEventListener('focus', check)
      clearInterval(id)
    }
  }, [today, isToday])
}
