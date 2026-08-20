import { useEffect } from 'react'

export function useScrollReveal(dependency?: unknown) {
  useEffect(() => {
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (!reveals.length) return

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )

    reveals.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [dependency])
}
