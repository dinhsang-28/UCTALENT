import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { seedSampleData } from '@/lib/sample-data'

export async function POST(req: NextRequest) {
  try {
    const { placeId, useSample } = await req.json()

    if (!placeId) {
      return NextResponse.json({ error: 'placeId is required' }, { status: 400 })
    }

    if (useSample || !process.env.GOOGLE_PLACES_API_KEY) {
      const data = await seedSampleData(placeId)
      return NextResponse.json({
        success: true,
        count: data.length,
        source: 'sample',
        message: `Đã tạo ${data.length} review mẫu`,
      })
    }

    // Fetch from Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,name,formatted_address,rating&language=vi&key=${process.env.GOOGLE_PLACES_API_KEY}`

    const res = await fetch(url)
    if (!res.ok) throw new Error('Google Places API error')

    const data = await res.json()

    if (data.status !== 'OK') {
      // Fallback to sample if API fails
      const sampleData = await seedSampleData(placeId)
      return NextResponse.json({
        success: true,
        count: sampleData.length,
        source: 'sample',
        message: `Google Places API trả về: ${data.status}. Đã dùng dữ liệu mẫu.`,
      })
    }

    const reviews = (data.result?.reviews || []).slice(0, 5)

    if (reviews.length === 0) {
      const sampleData = await seedSampleData(placeId)
      return NextResponse.json({
        success: true,
        count: sampleData.length,
        source: 'sample',
        message: 'Không tìm thấy review thực. Đã dùng dữ liệu mẫu.',
      })
    }

    const db = createServerClient()
    const toInsert = reviews.map((r: { author_name: string; rating: number; text: string; time: number }) => ({
      place_id: placeId,
      author_name: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.time,
      status: 'pending',
    }))

    const { error } = await db.from('reviews').insert(toInsert)
    if (error) throw error

    return NextResponse.json({
      success: true,
      count: toInsert.length,
      source: 'google',
      place: {
        name: data.result?.name,
        address: data.result?.formatted_address,
        rating: data.result?.rating,
      },
      message: `Đã lấy ${toInsert.length} review từ Google Maps`,
    })
  } catch (err) {
    console.error('fetch-reviews error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
