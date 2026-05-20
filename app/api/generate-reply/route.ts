import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const TONE_LABELS = {
  standard: 'Chuyên nghiệp, lịch sự, trung lập',
  friendly: 'Thân thiện, ấm áp, gần gũi',
  apologetic: 'Xin lỗi chân thành, cam kết cải thiện',
}

function buildPrompt(reviewText: string, rating: number): string {
  const sentiment = rating >= 4 ? 'tích cực' : rating >= 3 ? 'trung lập' : 'tiêu cực'

  return `Bạn là quản lý khách sạn chuyên nghiệp tại Việt Nam. Một khách hàng để lại review ${sentiment} (${rating}/5 sao):

"${reviewText}"

Hãy viết 3 câu trả lời ngắn gọn (2-4 câu mỗi loại) với 3 phong cách khác nhau:
1. standard: ${TONE_LABELS.standard}
2. friendly: ${TONE_LABELS.friendly}  
3. apologetic: ${TONE_LABELS.apologetic}

Trả về ĐÚNG định dạng JSON sau, không có text khác:
{
  "standard": "...",
  "friendly": "...",
  "apologetic": "..."
}`
}

export async function POST(req: NextRequest) {
  try {
    const { reviewId } = await req.json()
    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 })
    }

    const db = createServerClient()

    // Get review
    const { data: review, error: reviewErr } = await db
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single()

    if (reviewErr || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check if AI responses already exist
    const { data: existing } = await db
      .from('ai_responses')
      .select('*')
      .eq('review_id', reviewId)

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, responses: existing, cached: true })
    }

    let replies: Record<string, string>

    // Try OpenAI first, then Gemini, then fallback
    // if (process.env.OPENAI_API_KEY) {
    //   replies = await callOpenAI(review.text, review.rating)
    // } else if (process.env.GEMINI_API_KEY) {
    if (process.env.GEMINI_API_KEY) {
      replies = await callGemini(review.text, review.rating)
    } else {
      replies = generateFallbackReplies(review.text, review.rating)
    }

    // Save to DB
    const toInsert = (Object.entries(replies) as [string, string][]).map(([tone, content]) => ({
      review_id: reviewId,
      tone,
      content,
      approved: false,
    }))

    const { data: saved, error: saveErr } = await db
      .from('ai_responses')
      .insert(toInsert)
      .select()

    if (saveErr) throw saveErr

    return NextResponse.json({ success: true, responses: saved, cached: false })
  } catch (err) {
    console.error('generate-reply error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// async function callOpenAI(text: string, rating: number): Promise<Record<string, string>> {
//   const res = await fetch('https://api.openai.com/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       model: '~openai/gpt-latest',
//       messages: [{ role: 'user', content: buildPrompt(text, rating) }],
//       response_format: { type: 'json_object' },
//       temperature: 0.7,
//       max_tokens: 600,
//     }),
//   })

//   const data = await res.json()
//   if (!res.ok) throw new Error(data.error?.message || 'OpenAI error')

//   return JSON.parse(data.choices[0].message.content)
// }

async function callGemini(text: string, rating: number): Promise<Record<string, string>> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(text, rating) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
      }),
    }
  )

  const data = await res.json()
  if (!res.ok) throw new Error('Gemini error')

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
  return JSON.parse(raw)
}

function generateFallbackReplies(text: string, rating: number): Record<string, string> {
  const isPositive = rating >= 4
  const isNegative = rating <= 2

  if (isPositive) {
    return {
      standard:
        'Kính gửi Quý khách, cảm ơn bạn đã dành thời gian để lại đánh giá tích cực. Chúng tôi rất vui khi bạn hài lòng với dịch vụ. Mong được đón tiếp bạn trong những lần tới.',
      friendly:
        'Ôi, cảm ơn bạn rất nhiều vì những lời tốt đẹp! 💙 Đội ngũ chúng mình ai cũng vui khi đọc review này. Hẹn gặp lại bạn sớm nhé!',
      apologetic:
        'Cảm ơn bạn rất nhiều vì đã tin tưởng và đánh giá cao dịch vụ của chúng tôi. Dù vậy, chúng tôi vẫn không ngừng cải thiện để phục vụ bạn tốt hơn mỗi ngày.',
    }
  }

  if (isNegative) {
    return {
      standard:
        'Kính gửi Quý khách, chúng tôi xin ghi nhận phản hồi của bạn. Đây là những thông tin quý giá để chúng tôi cải thiện chất lượng dịch vụ. Chúng tôi sẽ xem xét và khắc phục ngay.',
      friendly:
        'Bạn ơi, chúng mình thực sự rất tiếc vì bạn có trải nghiệm chưa tốt. Cảm ơn bạn đã thành thật chia sẻ — điều này giúp chúng mình cải thiện rất nhiều. Mong có dịp phục vụ bạn tốt hơn!',
      apologetic:
        'Chúng tôi thành thật xin lỗi vì trải nghiệm không như mong đợi của bạn. Chúng tôi nhận trách nhiệm hoàn toàn và cam kết sẽ xem xét, cải thiện ngay những vấn đề bạn đề cập. Mong bạn cho chúng tôi cơ hội được phục vụ lại.',
    }
  }

  return {
    standard:
      'Cảm ơn bạn đã dành thời gian đánh giá. Chúng tôi ghi nhận những ý kiến của bạn và sẽ nỗ lực cải thiện để mang lại trải nghiệm tốt hơn trong tương lai.',
    friendly:
      'Cảm ơn bạn đã chia sẻ nhé! Chúng mình sẽ cố gắng hơn để lần sau bạn thấy hài lòng hơn. Mong gặp lại bạn!',
    apologetic:
      'Cảm ơn bạn đã thành thật phản hồi. Chúng tôi rất tiếc vì chưa đáp ứng được kỳ vọng của bạn và sẽ chủ động cải thiện từng điểm bạn đề cập.',
  }
}
