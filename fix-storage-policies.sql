-- Drop all existing policies and create simple ones that work
DROP POLICY IF EXISTS "Admin can upload all photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update all photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete all photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- Create simple policies that definitely work
CREATE POLICY "Allow all authenticated users full access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');