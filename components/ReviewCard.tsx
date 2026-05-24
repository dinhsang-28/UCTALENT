'use client'

import { useState } from 'react'
import { Review } from '@/types'
import StarRating from './StarRating'
import AIResponsePanel from './AIResponsePanel'

interface ReviewCardProps {
  review: Review
  onStatusChange: () => void
  onError: (msg: string) => void
}

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`
  return `${Math.floor(diff / 2592000)} tháng trước`
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

export default function ReviewCard({ review, onStatusChange, onError }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const avatarColor = AVATAR_COLORS[review.author_name.charCodeAt(0) % AVATAR_COLORS.length]
  const approvedResponse = review.ai_responses?.find(r => r.approved)

  return (
    <div
      className={`card p-4 transition-all animate-slide-up ${
        review.status === 'resolved' ? 'opacity-70' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor}`}>
          {getInitials(review.author_name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{review.author_name}</span>
            <StarRating rating={review.rating} />
            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
              {timeAgo(review.time)}
            </span>
          </div>

          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {review.text}
          </p>
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-2 mt-3">
        {review.status === 'pending' ? (
          <span className="badge-pending">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-dot" />
            Pending
          </span>
        ) : (
          <span className="badge-resolved">
            <span></span>
            Resolved
          </span>
        )}

        {review.status === 'pending' && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn-ghost ml-auto text-xs py-1 px-2"
          >
            {expanded ? ' Ẩn bớt' : 'Trả lời bằng AI'}
          </button>
        )}
      </div>

      {/* Approved response display */}
      {review.status === 'resolved' && approvedResponse && (
        <div className="mt-3 p-3 rounded-lg border text-sm" style={{ background: 'var(--success-bg)', borderColor: '#86efac' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--success)' }}>Câu trả lời đã duyệt</p>
          <p style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>{approvedResponse.content}</p>
        </div>
      )}

      {/* AI Panel */}
      {expanded && review.status === 'pending' && (
        <AIResponsePanel
          reviewId={review.id}
          existingResponses={review.ai_responses}
          onApproved={() => { setExpanded(false); onStatusChange() }}
          onError={onError}
        />
      )}
    </div>
  )
}
