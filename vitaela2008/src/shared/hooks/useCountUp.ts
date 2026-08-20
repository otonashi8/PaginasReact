import { useEffect } from 'react'

export function useCountUp() {
  useEffect(() => {
    const stats = Array.from(document.querySelectorAll<HTMLElement>('.stat-num'))
    if (!stats.length) return

    const statsObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const target = parseInt(el.getAttribute('data-count') ?? '0', 10)
            let current = 0
            const duration = 1400
            const steps = 50
            const increment = target / steps
            const stepTime = duration / steps
            const timer = window.setInterval(() => {
              current += increment
              if (current >= target) {
                el.textContent = target.toLocaleString('es-PE')
                window.clearInterval(timer)
              } else {
                el.textContent = Math.floor(current).toLocaleString('es-PE')
              }
            }, stepTime)
            obs.unobserve(el)
          }
        })
      },
      { threshold: 0.4 },
    )

    stats.forEach((el) => statsObserver.observe(el))
    return () => statsObserver.disconnect()
  }, [])
}
