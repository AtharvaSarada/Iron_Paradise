-- Supabase Storage Bucket Policies for Photo Uploads
-- Run this SQL in your Supabase SQL Editor after creating the storage bucket

-- First, create the storage bucket (do this in Supabase Dashboard > Storage)
-- Bucket name: 'photos'
-- Public: true (for easy access to member photos)

-- Note: RLS is automatically enabled on storage tables by Supabase
-- No need to manually enable RLS on storage.objects or storage.buckets

-- Object policies for 'photos' bucket

-- 1. Admin can upload photos for any user
CREATE POLICY "Admin can upload all photos" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'photos' 
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    AND (storage.foldername(name))[1] = 'member-photos'
  );

-- 2. Users can upload photos to their own folder only
CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'photos' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'member-photos'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- 3. Public read access to all photos (for displaying member photos)
CREATE POLICY "Public read access to photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'photos'
  );

-- 4. Admin can update/delete all photos
CREATE POLICY "Admin can manage all photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admin can delete all photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 5. Users can update/delete their own photos only
CREATE POLICY "Users can update own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'member-photos'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'member-photos'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Alternative simpler policies if you want less restrictive access:

-- Simple policy: Authenticated users can upload to member-photos folder
-- CREATE POLICY "Simple upload policy" ON storage.objects
--   FOR INSERT 
--   WITH CHECK (
--     bucket_id = 'photos' 
--     AND auth.role() = 'authenticated'
--     AND name LIKE 'member-photos/%'
--   );

-- Simple policy: Anyone can view photos
-- CREATE POLICY "Simple read policy" ON storage.objects
--   FOR SELECT USING (bucket_id = 'photos');

-- File size and type restrictions (implement in your application)
-- Recommended: Max 5MB, allowed types: jpg, jpeg, png, webp