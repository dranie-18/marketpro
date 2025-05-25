/*
  # Storage bucket and policies for product images

  1. Security
    - Create policies for public access to product images
    - Allow authenticated users to upload images
    - Allow users to delete their own images

  Note: Bucket creation is handled conditionally to avoid duplicate key errors
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
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Product images are publicly accessible'
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
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can upload product images'
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
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can delete their own images'
  ) THEN
    CREATE POLICY "Users can delete their own images"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'product-images'
      AND auth.uid()::text = owner
    );
  END IF;
END $$;