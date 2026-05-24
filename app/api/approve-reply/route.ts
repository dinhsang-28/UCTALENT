import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { responseId, reviewId } = await req.json()

    if (!responseId || !reviewId) {
      return NextResponse.json({ error: 'responseId and reviewId are required' }, { status: 400 })
    }

    const db = createServerClient()

    const { error: approveErr } = await db
      .from('ai_responses')
      .update({ approved: true })
      .eq('id', responseId)

    if (approveErr) throw approveErr

    const { error: reviewErr } = await db
      .from('reviews')
      .update({ status: 'resolved' })
      .eq('id', reviewId)

    if (reviewErr) throw reviewErr

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('approve-reply error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
