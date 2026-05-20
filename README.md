# 🏨 ORM Dashboard — AI-Powered Review Management

> MVP xây dựng trong 7 ngày | UCTalent Labs  
> Stack: Next.js 14 · Tailwind CSS · Supabase · OpenAI/Gemini

---

## ✨ Tính năng

- **Fetch review** từ Google Maps qua Place ID (hoặc dữ liệu mẫu)
- **AI tạo 3 câu trả lời** với 3 phong cách: Chuyên nghiệp / Thân thiện / Xin lỗi
- **Approve** câu trả lời → đổi trạng thái Pending → Resolved
- Dashboard với filter, stats, và UI đẹp

---

## 🚀 Setup nhanh (5 phút)

### 1. Clone & cài packages
```bash
git clone <repo-url>
cd orm-dashboard
npm install
```

### 2. Tạo Supabase project
1. Vào [supabase.com](https://supabase.com) → New project
2. Vào **SQL Editor** → paste toàn bộ nội dung file `supabase/schema.sql` → Run
3. Vào **Project Settings > API** → copy `URL` và `anon key`

### 3. Tạo file .env.local
```bash
cp .env.example .env.local
```
Điền vào `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENAI_API_KEY=sk-...        # hoặc GEMINI_API_KEY
GOOGLE_PLACES_API_KEY=AIza... # tuỳ chọn
```

### 4. Chạy local
```bash
npm run dev
# Mở http://localhost:3000
```

---

## 🔑 Lấy API Keys

| Key | Cách lấy | Có miễn phí không? |
|-----|----------|---------------------|
| Supabase URL + Key | [supabase.com](https://supabase.com) → Settings → API | ✅ Free tier |
| OpenAI API Key | [platform.openai.com](https://platform.openai.com/api-keys) | $5 credit miễn phí |
| Gemini API Key | [aistudio.google.com](https://aistudio.google.com/app/apikey) | ✅ Free |
| Google Places Key | [console.cloud.google.com](https://console.cloud.google.com) | Có $200 credit/tháng |

> 💡 **Không có key?** Tick checkbox "Dùng dữ liệu mẫu" trên UI để test ngay!

---

## 📦 Deploy lên Vercel

```bash
# 1. Push lên GitHub
git init && git add . && git commit -m "feat: ORM MVP complete"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main

# 2. Deploy
npx vercel

# 3. Thêm env vars trên Vercel Dashboard
# Settings > Environment Variables > thêm từng biến trong .env.local
```

---

## 📁 Cấu trúc project

```
orm-dashboard/
├── app/
│   ├── api/
│   │   ├── fetch-reviews/route.ts  # Lấy review từ Google Places
│   │   ├── generate-reply/route.ts # Gọi AI tạo câu trả lời
│   │   ├── approve-reply/route.ts  # Duyệt và cập nhật DB
│   │   └── reviews/route.ts        # GET danh sách review
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard chính
│   └── globals.css
├── components/
│   ├── FetchSection.tsx            # Form nhập Place ID
│   ├── ReviewCard.tsx              # Card hiển thị 1 review
│   ├── AIResponsePanel.tsx         # Panel 3 câu trả lời AI
│   ├── StatsBar.tsx                # Thống kê
│   ├── StarRating.tsx              # Component sao
│   └── Toast.tsx                   # Thông báo
├── lib/
│   ├── supabase.ts                 # Supabase client
│   └── sample-data.ts              # Dữ liệu mẫu
├── types/index.ts                  # TypeScript types
├── supabase/schema.sql             # DB migration
└── .env.example                    # Template biến môi trường
```

---

## 🗺 Flow chính

```
User nhập Place ID
    → POST /api/fetch-reviews
    → Google Places API (hoặc sample data)
    → Lưu vào Supabase reviews table

User nhấn "Generate AI"
    → POST /api/generate-reply
    → OpenAI / Gemini API
    → Lưu 3 câu trả lời vào ai_responses table

User chọn 1 câu → nhấn "Approve"
    → POST /api/approve-reply
    → ai_responses.approved = true
    → reviews.status = 'resolved'
```

---

## ✅ Definition of Done checklist

- [ ] Source code lưu GitHub, commit rõ ràng từng ngày
- [ ] App chạy trên Vercel không lỗi
- [ ] Flow Place ID → Review → AI → Approve hoạt động mượt
- [ ] Hoàn thành trong 7 ngày lịch
