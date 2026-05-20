'use client'

import { useState, useEffect, useCallback } from 'react'
import { Review } from '@/types'
import FetchSection from '@/components/FetchSection'
import ReviewCard from '@/components/ReviewCard'
import StatsBar from '@/components/StatsBar'
import Toast, { ToastType } from '@/components/Toast'

type FilterTab = 'all' | 'pending' | 'resolved'

export default function Dashboard() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const res = await fetch(`/api/reviews${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReviews(data.reviews || [])
    } catch {
      showToast('Lỗi tải review', 'error')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { loadReviews() }, [loadReviews])

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Pending' },
    { key: 'resolved', label: 'Resolved' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              ORM
            </div>
            <div>
              <h1 className="font-semibold text-sm leading-none">Review Dashboard</h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>AI-Powered ORM · UCTalent Labs</p>
            </div>
          </div>
          <button
            onClick={loadReviews}
            className="btn-ghost text-xs"
          >
            ↻ Làm mới
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Fetch section */}
        <FetchSection
          onFetched={msg => { showToast(msg); loadReviews() }}
          onError={msg => showToast(msg, 'error')}
        />

        {/* Stats */}
        <StatsBar reviews={reviews} />

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-sm'
              }`}
              style={filter !== tab.key ? { color: 'var(--text-secondary)' } : {}}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100'
                }`}>
                  {tab.key === 'pending'
                    ? reviews.filter(r => r.status === 'pending').length
                    : reviews.filter(r => r.status === 'resolved').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="card p-4 h-24 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {filter === 'all' ? 'Chưa có review nào' : `Không có review ${filter}`}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {filter === 'all'
                ? 'Nhập Place ID và nhấn "Fetch Reviews" để bắt đầu'
                : 'Thử chuyển sang tab khác'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review, i) => (
              <div key={review.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <ReviewCard
                  review={review}
                  onStatusChange={loadReviews}
                  onError={msg => showToast(msg, 'error')}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
