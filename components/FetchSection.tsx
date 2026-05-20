'use client'

import { useState } from 'react'

interface FetchSectionProps {
  onFetched: (message: string) => void
  onError: (message: string) => void
}

export default function FetchSection({ onFetched, onError }: FetchSectionProps) {
  const [placeId, setPlaceId] = useState('')
  const [loading, setLoading] = useState(false)
  const [useSample, setUseSample] = useState(false)

  async function handleFetch() {
    const id = placeId.trim()
    if (!id) { onError('Vui lòng nhập Place ID'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/fetch-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: id, useSample }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const src = data.source === 'google' ? '📍 Google Maps' : '🧪 Dữ liệu mẫu'
      onFetched(`${src}: Đã lấy ${data.count} review. ${data.message || ''}`)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-sm">📍</div>
        <div>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Lấy Review từ Google Maps</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nhập Place ID để fetch review</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={placeId}
          onChange={e => setPlaceId(e.target.value)}
          placeholder="ChIJxxxxxxxxxxxxxxxx"
          onKeyDown={e => e.key === 'Enter' && handleFetch()}
          className="flex-1"
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          className="btn-primary whitespace-nowrap"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang lấy...
            </>
          ) : (
            'Fetch Reviews'
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <input
          type="checkbox"
          id="useSample"
          checked={useSample}
          onChange={e => setUseSample(e.target.checked)}
          className="w-3.5 h-3.5 accent-blue-600"
        />
        <label htmlFor="useSample" className="text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          Dùng dữ liệu mẫu (nếu không có Google API key)
        </label>
      </div>

      <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
        💡 Tìm Place ID tại:{' '}
        <a
          href="https://developers.google.com/maps/documentation/places/web-service/place-id"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
          style={{ color: 'var(--accent)' }}
        >
          Google Place ID Finder
        </a>
        . Hoặc tick &quot;Dùng dữ liệu mẫu&quot; để test ngay.
      </div>
    </div>
  )
}
