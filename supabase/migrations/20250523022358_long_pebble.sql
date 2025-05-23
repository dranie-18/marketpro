/*
  # Set up storage for product images
  
  1. Storage
    - Create product-images bucket if it doesn't exist
    - Set bucket as public
  
  2. Security
    - Allow public access to view images
    - Allow authenticated users to upload images
    - Allow users to delete their own images
*/

DO $$
BEGIN
  -- Create storage bucket for product images if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'product-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('product-images', 'product-images', true);
  END IF;
END $$;

-- Allow public access to product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Product images are publicly accessible'
    AND table_name = 'objects'
  ) THEN
    CREATE POLICY "Product images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');
  END IF;
END $$;

-- Allow authenticated users to upload images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Users can upload product images'
    AND table_name = 'objects'
  ) THEN
    CREATE POLICY "Users can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'product-images' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- Allow users to delete their own images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Users can delete their own images'
    AND table_name = 'objects'
  ) THEN
    CREATE POLICY "Users can delete their own images"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'product-images'
      AND auth.uid()::text = owner
    );
  END IF;
END $$;