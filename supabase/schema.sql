-- =============================================
-- ORM Dashboard — Supabase Schema
-- Chạy toàn bộ file này trong Supabase SQL Editor
-- =============================================

-- Bảng reviews: lưu review từ Google Maps
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  place_id    text not null,
  author_name text not null default 'Ẩn danh',
  rating      int  not null check (rating between 1 and 5),
  text        text not null default '',
  time        bigint not null default extract(epoch from now()),
  status      text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at  timestamptz not null default now()
);

-- Bảng ai_responses: lưu 3 câu trả lời AI cho mỗi review
create table if not exists ai_responses (
  id          uuid primary key default gen_random_uuid(),
  review_id   uuid not null references reviews(id) on delete cascade,
  tone        text not null check (tone in ('standard', 'friendly', 'apologetic')),
  content     text not null,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Index để query nhanh hơn
create index if not exists idx_reviews_status    on reviews(status);
create index if not exists idx_reviews_place_id  on reviews(place_id);
create index if not exists idx_ai_review_id      on ai_responses(review_id);

-- Row Level Security (cho phép public read/write — MVP, chưa cần auth)
alter table reviews      enable row level security;
alter table ai_responses enable row level security;

-- Policy: cho phép mọi thao tác (MVP — thêm auth sau nếu cần)
create policy "allow_all_reviews"       on reviews      for all using (true) with check (true);
create policy "allow_all_ai_responses"  on ai_responses for all using (true) with check (true);
