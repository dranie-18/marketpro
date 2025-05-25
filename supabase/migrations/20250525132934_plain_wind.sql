/*
  # Storage bucket and policies setup

  1. Changes
    - Creates product-images storage bucket if it doesn't exist
    - Sets up policies for public access, upload, and deletion
  
  2. Security
    - Public read access to product images
    - Only authenticated users can upload
    - Users can only delete their own images
*/

-- Create storage bucket for product images if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'product-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('product-images', 'product-images', true);
  END IF;
END $$;

-- Allow public access to product images
CREATE POLICY IF NOT EXISTS "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY IF NOT EXISTS "Users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own images
CREATE POLICY IF NOT EXISTS "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.uid()::text = owner
);