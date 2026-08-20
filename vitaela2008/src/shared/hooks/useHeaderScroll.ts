import { useEffect, useState } from 'react'

export function useHeaderScroll() {
  const [headerScrolled, setHeaderScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 30)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return headerScrolled
}
