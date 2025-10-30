-- Basic Supabase Storage Policies for Photo Uploads
-- Run this SQL in your Supabase SQL Editor

-- 1. Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'photos' 
    AND auth.role() = 'authenticated'
    AND name LIKE 'member-photos/%'
  );

-- 2. Allow public read access to photos
CREATE POLICY "Public read access to photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'photos'
  );

-- 3. Allow authenticated users to update photos
CREATE POLICY "Authenticated users can update photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
  );

-- 4. Allow authenticated users to delete photos
CREATE POLICY "Authenticated users can delete photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
  );