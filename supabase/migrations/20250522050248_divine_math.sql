/*
  # Create storage bucket for product images

  1. New Storage Bucket
    - `product-images` bucket for storing product images
  
  2. Security
    - Enable public access for viewing images
    - Add policy for authenticated users to upload images
*/

-- Create bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (ARRAY_LENGTH(REGEXP_SPLIT_TO_ARRAY(name, '/'), 1) = 2)
);

-- Allow public access to view images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');