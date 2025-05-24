/*
  # Configure storage for product images

  1. Storage Policies
    - Allow public access to product images
    - Allow authenticated users to upload images
    - Allow users to delete their own images
*/

-- Allow public access to product images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.uid()::text = owner
);