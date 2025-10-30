-- Simplified Supabase Storage Policies for Photo Uploads
-- Run this SQL in your Supabase SQL Editor

-- 1. Admin can upload photos for any user
CREATE POLICY "Admin can upload all photos" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'photos' 
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    AND name LIKE 'member-photos/%'
  );

-- 2. Users can upload photos to their own folder only
CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'photos' 
    AND auth.role() = 'authenticated'
    AND name LIKE 'member-photos/' || auth.uid()::text || '/%'
  );

-- 3. Public read access to all photos (for displaying member photos)
CREATE POLICY "Public read access to photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'photos'
  );

-- 4. Admin can update all photos
CREATE POLICY "Admin can update all photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 5. Admin can delete all photos
CREATE POLICY "Admin can delete all photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 6. Users can update their own photos only
CREATE POLICY "Users can update own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
    AND name LIKE 'member-photos/' || auth.uid()::text || '/%'
  );

-- 7. Users can delete their own photos only
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
    AND name LIKE 'member-photos/' || auth.uid()::text || '/%'
  );