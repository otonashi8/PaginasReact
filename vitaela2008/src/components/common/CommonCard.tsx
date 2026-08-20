import type { ReactNode } from 'react'
import { Card } from '../ui/card'

interface CommonCardProps {
  children: ReactNode
  className?: string
}

/** Wraps shadcn's `Card` with the site's white/bordered card look, undoing shadcn's own
 * radius, ring, gap and padding defaults so callers fully control spacing via `className`. */
function CommonCard({ children, className = '' }: CommonCardProps) {
  return <Card className={`gap-0 rounded-[28px] border border-[rgba(125,36,56,0.08)] bg-blanco py-0 ring-0 ${className}`}>{children}</Card>
}

export default CommonCard
