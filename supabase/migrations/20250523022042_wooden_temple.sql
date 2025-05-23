/*
  # Initial Schema Setup for Marketplace

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - References auth.users
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `products`
      - `id` (uuid, primary key)
      - `seller_id` (uuid) - References profiles
      - `title` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `price` (numeric)
      - `condition` (text) - 'new' or 'used'
      - `category` (text)
      - `location` (text)
      - `status` (text) - 'active', 'sold', 'archived'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `product_images`
      - `id` (uuid, primary key)
      - `product_id` (uuid) - References products
      - `url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public read access where appropriate
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  condition text NOT NULL CHECK (condition IN ('new', 'used')),
  category text NOT NULL,
  location text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own products"
  ON products
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own products"
  ON products
  FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own products"
  ON products
  FOR DELETE
  USING (auth.uid() = seller_id);

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Product images policies
CREATE POLICY "Product images are viewable by everyone"
  ON product_images
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert images for their own products"
  ON product_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_id
      AND seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images of their own products"
  ON product_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_id
      AND seller_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();