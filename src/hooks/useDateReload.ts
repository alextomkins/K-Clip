import { useEffect, useMemo } from 'react'
import { getTodayAEST } from '../utils/puzzle'

export function useDateReload(isToday: boolean) {
  const today = useMemo(() => getTodayAEST(), [])

  useEffect(() => {
    if (!isToday) return
    const onFocus = () => {
      if (getTodayAEST() !== today) window.location.reload()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [today, isToday])
}
