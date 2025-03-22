/*
  # Momo Shop Management System Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
    - `dishes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category_id` (uuid, foreign key)
      - `price` (integer)
      - `created_at` (timestamp)
    
    - `daily_sales`
      - `id` (uuid, primary key)
      - `dish_id` (uuid, foreign key)
      - `quantity` (integer)
      - `total_amount` (integer)
      - `sale_date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy for categories
CREATE POLICY "Allow full access to authenticated users" ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create dishes table
CREATE TABLE dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  price integer NOT NULL CHECK (price > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, category_id)
);

-- Enable RLS for dishes
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Create policy for dishes
CREATE POLICY "Allow full access to authenticated users" ON dishes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create daily_sales table
CREATE TABLE daily_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id uuid REFERENCES dishes(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  total_amount integer NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for daily_sales
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;

-- Create policy for daily_sales
CREATE POLICY "Allow full access to authenticated users" ON daily_sales
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_daily_sales_dish ON daily_sales(dish_id);
CREATE INDEX idx_daily_sales_date ON daily_sales(sale_date);

-- Insert some sample categories
INSERT INTO categories (name) VALUES
  ('Steamed'),
  ('Fried'),
  ('Pan Fried'),
  ('Tandoori')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample dishes
DO $$ 
DECLARE 
  steamed_id uuid;
  fried_id uuid;
  pan_fried_id uuid;
  tandoori_id uuid;
BEGIN
  SELECT id INTO steamed_id FROM categories WHERE name = 'Steamed' LIMIT 1;
  SELECT id INTO fried_id FROM categories WHERE name = 'Fried' LIMIT 1;
  SELECT id INTO pan_fried_id FROM categories WHERE name = 'Pan Fried' LIMIT 1;
  SELECT id INTO tandoori_id FROM categories WHERE name = 'Tandoori' LIMIT 1;

  INSERT INTO dishes (name, category_id, price) VALUES
    ('Veg Momo', steamed_id, 80),
    ('Chicken Momo', steamed_id, 100),
    ('Paneer Momo', steamed_id, 90),
    ('Veg Fried Momo', fried_id, 90),
    ('Chicken Fried Momo', fried_id, 110),
    ('Paneer Fried Momo', fried_id, 100),
    ('Veg Pan Fried Momo', pan_fried_id, 100),
    ('Chicken Pan Fried Momo', pan_fried_id, 120),
    ('Paneer Pan Fried Momo', pan_fried_id, 110),
    ('Veg Tandoori Momo', tandoori_id, 110),
    ('Chicken Tandoori Momo', tandoori_id, 130),
    ('Paneer Tandoori Momo', tandoori_id, 120)
  ON CONFLICT (name, category_id) DO NOTHING;
END $$;