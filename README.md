

##  Setup nhanh 

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
##  Deploy lên Vercel

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
