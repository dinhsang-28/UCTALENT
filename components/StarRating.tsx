'use client'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md'
}

export default function StarRating({ rating, size = 'sm' }: StarRatingProps) {
  const sz = size === 'sm' ? 'text-sm' : 'text-base'
  return (
    <span className={`inline-flex gap-0.5 ${sz}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? 'star-fill' : 'star-empty'}>★</span>
      ))}
    </span>
  )
}
