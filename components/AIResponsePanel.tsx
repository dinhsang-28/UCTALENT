'use client'

import { useState } from 'react'
import { AIResponse } from '@/types'

interface AIResponsePanelProps {
  reviewId: string
  existingResponses?: AIResponse[]
  onApproved: () => void
  onError: (msg: string) => void
}

const TONE_META = {
  standard:   { label: 'Chuyên nghiệp', emoji: '💼', color: 'border-slate-200 bg-slate-50' },
  friendly:   { label: 'Thân thiện',    emoji: '😊', color: 'border-emerald-200 bg-emerald-50' },
  apologetic: { label: 'Xin lỗi',       emoji: '🙏', color: 'border-amber-200 bg-amber-50' },
}

export default function AIResponsePanel({
  reviewId,
  existingResponses,
  onApproved,
  onError,
}: AIResponsePanelProps) {
  const [responses, setResponses] = useState<AIResponse[]>(existingResponses || [])
  const [generating, setGenerating] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [approving, setApproving] = useState(false)

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResponses(data.responses)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Lỗi tạo câu trả lời')
    } finally {
      setGenerating(false)
    }
  }

  async function handleApprove() {
    if (!selected) return
    setApproving(true)
    try {
      const res = await fetch('/api/approve-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId: selected, reviewId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onApproved()
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Lỗi duyệt câu trả lời')
    } finally {
      setApproving(false)
    }
  }

  if (responses.length === 0) {
    return (
      <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary w-full justify-center text-sm py-2"
        >
          {generating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI đang viết câu trả lời...
            </>
          ) : (
            <>✨ Generate AI Responses</>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="pt-3 border-t animate-fade-in" style={{ borderColor: 'var(--border)' }}>
      <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
        Chọn 1 trong 3 câu trả lời để duyệt:
      </p>

      <div className="space-y-2">
        {responses.map(r => {
          const meta = TONE_META[r.tone as keyof typeof TONE_META]
          const isSelected = selected === r.id
          return (
            <button
              key={r.id}
              onClick={() => setSelected(isSelected ? null : r.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                isSelected
                  ? 'border-blue-400 bg-blue-50'
                  : `${meta.color} border-transparent hover:border-current/30`
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span>{meta.emoji}</span>
                <span className="font-medium text-xs">{meta.label}</span>
                {isSelected && (
                  <span className="ml-auto text-blue-600 text-xs">✓ Đã chọn</span>
                )}
              </div>
              <p style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>{r.content}</p>
            </button>
          )
        })}
      </div>

      {selected && (
        <button
          onClick={handleApprove}
          disabled={approving}
          className="btn-primary w-full justify-center mt-3"
        >
          {approving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang duyệt...
            </>
          ) : (
            '✓ Approve & Đánh dấu Resolved'
          )}
        </button>
      )}
    </div>
  )
}
