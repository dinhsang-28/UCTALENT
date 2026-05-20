import { createServerClient } from './supabase'

const SAMPLE_REVIEWS = [
  {
    author_name: 'Nguyễn Minh Tuấn',
    rating: 5,
    text: 'Khách sạn tuyệt vời! Phòng sạch sẽ, view đẹp, nhân viên rất nhiệt tình. Bữa sáng buffet phong phú. Chắc chắn sẽ quay lại lần sau.',
    time: Math.floor(Date.now() / 1000) - 86400,
  },
  {
    author_name: 'Trần Thị Hoa',
    rating: 2,
    text: 'Phòng nhỏ hơn mô tả trên web, điều hòa hơi ồn ban đêm. Wifi chậm, không ổn định. Nhân viên lễ tân không thân thiện lắm.',
    time: Math.floor(Date.now() / 1000) - 172800,
  },
  {
    author_name: 'Lê Văn Đức',
    rating: 4,
    text: 'Vị trí đắc địa, gần trung tâm, tiện di chuyển. Giá cả hợp lý. Chỉ có điều bãi đỗ xe hơi chật. Nhân viên phục vụ tốt.',
    time: Math.floor(Date.now() / 1000) - 259200,
  },
  {
    author_name: 'Phạm Thu Hằng',
    rating: 1,
    text: 'Thất vọng hoàn toàn. Đặt phòng deluxe nhưng nhận phòng standard. Khi phàn nàn thì lễ tân thái độ không tốt. Sẽ không bao giờ quay lại.',
    time: Math.floor(Date.now() / 1000) - 345600,
  },
  {
    author_name: 'Hoàng Quốc Bảo',
    rating: 3,
    text: 'Tạm được. Phòng sạch nhưng hơi cũ. Bữa sáng ổn. Nhân viên có thể cải thiện thêm về kỹ năng phục vụ.',
    time: Math.floor(Date.now() / 1000) - 432000,
  },
]

export async function seedSampleData(placeId: string) {
  const db = createServerClient()

  const toInsert = SAMPLE_REVIEWS.map(r => ({
    place_id: placeId,
    author_name: r.author_name,
    rating: r.rating,
    text: r.text,
    time: r.time,
    status: 'pending',
  }))

  const { data, error } = await db
    .from('reviews')
    .insert(toInsert)
    .select()

  if (error) throw error
  return data
}
