'use client'

import { Review } from '@/types'

interface StatsBarProps {
  reviews: Review[]
}

export default function StatsBar({ reviews }: StatsBarProps) {
  const total = reviews.length
  const pending = reviews.filter(r => r.status === 'pending').length
  const resolved = reviews.filter(r => r.status === 'resolved').length
  const avgRating =
    total > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
      : '—'

  const stats = [
    { label: 'Tổng review', value: total, color: 'text-slate-700' },
    { label: 'Pending', value: pending, color: 'text-amber-600' },
    { label: 'Resolved', value: resolved, color: 'text-emerald-600' },
    { label: 'Rating TB', value: total > 0 ? `★ ${avgRating}` : '—', color: 'text-blue-600' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="card px-4 py-3 text-center">
          <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
