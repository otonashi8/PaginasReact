import { Star } from 'lucide-react'

interface StarRatingProps {
  count?: number
  className?: string
}

function StarRating({ count = 5, className = '' }: StarRatingProps) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-dorado ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <Star key={index} className="h-4 w-4 fill-current" />
      ))}
    </span>
  )
}

export default StarRating
