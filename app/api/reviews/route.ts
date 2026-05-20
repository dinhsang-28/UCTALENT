import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'pending' | 'resolved' | null (all)
    const placeId = searchParams.get('place_id')

    const db = createServerClient()
    let query = db
      .from('reviews')
      .select('*, ai_responses(*)')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (placeId) query = query.eq('place_id', placeId)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ reviews: data })
  } catch (err) {
    console.error('reviews error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
