import { useEffect, useState } from 'react'

const query = '(max-width: 820px), (pointer: coarse) and (max-width: 1024px)'
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setIsMobile(media.matches)
    media.addEventListener('change', update)
    update()
    return () => media.removeEventListener('change', update)
  }, [])
  return isMobile
}
