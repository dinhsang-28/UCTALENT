export type ReviewStatus = 'pending' | 'resolved'

export interface Review {
  id: string
  place_id: string
  author_name: string
  rating: number
  text: string
  time: number
  status: ReviewStatus
  created_at: string
  ai_responses?: AIResponse[]
}

export interface AIResponse {
  id: string
  review_id: string
  tone: 'standard' | 'friendly' | 'apologetic'
  content: string
  approved: boolean
}

export interface PlaceDetails {
  name: string
  formatted_address: string
  rating: number
}
