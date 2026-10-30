-- ========================================================
-- سكربت إعداد قاعدة بيانات Supabase لموقع مفاجأة عيد الميلاد
-- يتم تشغيل هذا الكود في نافذة SQL Editor داخل لوحة تحكم Supabase
-- ========================================================

-- 1. جدول الإعدادات والمحتوى
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. جدول بطاقات الذكريات الأربعة
CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY,
  image TEXT NOT NULL,
  title TEXT NOT NULL,
  note TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. جدول مصادقة المشرف وكلمة المرور المشفرة
CREATE TABLE IF NOT EXISTS admin_auth (
  id INTEGER PRIMARY KEY DEFAULT 1,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. إعداد مساحة تخزين الصور (Storage Bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', true)
ON CONFLICT (id) DO NOTHING;

-- السماح بالقراءة العامة لصور الذكريات
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'memories');

-- السماح للمشرف برفع واستبدال الصور
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'memories');

CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'memories');

