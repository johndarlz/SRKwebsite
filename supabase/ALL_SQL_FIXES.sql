-- ============================================
-- ALL SQL FIXES - Run this in Supabase SQL Editor
-- ============================================
-- This file contains all the SQL fixes needed for the application
-- Run this entire file at once in Supabase SQL Editor

-- ============================================
-- 1. ADD REJECTED STATUS TO ORDERS
-- ============================================
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Pending', 'Cooking', 'Out for Delivery', 'Delivered', 'Rejected'));

-- ============================================
-- 2. ADD BIRYANI CATEGORY TO DISHES
-- ============================================
ALTER TABLE public.dishes 
DROP CONSTRAINT IF EXISTS dishes_category_check;

ALTER TABLE public.dishes 
ADD CONSTRAINT dishes_category_check 
CHECK (category IN ('Breakfast', 'Lunch', 'Dinner', 'Biryani', 'Sweets', 'Beverages'));

-- ============================================
-- 3. ADD ORIGINAL PRICE AND REVIEWS SYSTEM
-- ============================================

-- Add original_price column to dishes table
ALTER TABLE public.dishes 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);

-- Update existing dishes to have original_price same as price (no discount initially)
UPDATE public.dishes 
SET original_price = price 
WHERE original_price IS NULL;

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_dish_id ON public.reviews(dish_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reviews"
  ON public.reviews FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete reviews"
  ON public.reviews FOR DELETE
  USING (true);

-- Grant permissions for reviews
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
GRANT SELECT ON public.reviews TO anon;

-- ============================================
-- 4. ADD DAILY REVENUES TABLE (OPTIONAL)
-- ============================================

-- Create daily_revenues table for storing daily revenue snapshots
CREATE TABLE IF NOT EXISTS public.daily_revenues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
  orders_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_revenues_date ON daily_revenues(date DESC);

-- Enable RLS for daily_revenues
ALTER TABLE daily_revenues ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Enable all operations for authenticated users" ON daily_revenues
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions for daily_revenues
GRANT ALL ON daily_revenues TO authenticated;
GRANT ALL ON daily_revenues TO service_role;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check orders constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.orders'::regclass AND conname = 'orders_status_check';

-- Check dishes constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.dishes'::regclass AND conname = 'dishes_category_check';

-- Check if reviews table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'reviews';

-- Check if original_price column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dishes' AND column_name = 'original_price';

-- Check if daily_revenues table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'daily_revenues';

-- ============================================
-- SAMPLE DATA (OPTIONAL - UNCOMMENT TO USE)
-- ============================================

-- Sample reviews for testing
-- INSERT INTO public.reviews (dish_id, customer_name, rating, review_text) 
-- SELECT 
--   id,
--   'Sample Customer',
--   5,
--   'Absolutely delicious! Highly recommended.'
-- FROM public.dishes 
-- LIMIT 3;

-- Sample daily revenues for testing
-- INSERT INTO public.daily_revenues (date, revenue, orders_count) VALUES
-- (CURRENT_DATE - INTERVAL '7 days', 1250.50, 15),
-- (CURRENT_DATE - INTERVAL '6 days', 980.00, 12),
-- (CURRENT_DATE - INTERVAL '5 days', 1450.75, 18),
-- (CURRENT_DATE - INTERVAL '4 days', 1100.25, 14),
-- (CURRENT_DATE - INTERVAL '3 days', 1680.00, 21),
-- (CURRENT_DATE - INTERVAL '2 days', 890.50, 11),
-- (CURRENT_DATE - INTERVAL '1 day', 1320.00, 16);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.reviews IS 'Customer reviews and ratings for dishes';
COMMENT ON COLUMN public.reviews.dish_id IS 'Reference to the dish being reviewed';
COMMENT ON COLUMN public.reviews.rating IS 'Star rating from 1 to 5';
COMMENT ON COLUMN public.reviews.review_text IS 'Customer review text (optional)';
COMMENT ON COLUMN public.dishes.original_price IS 'Original price before discount (for strikethrough display)';
COMMENT ON TABLE public.daily_revenues IS 'Stores daily revenue snapshots for payment analysis';
COMMENT ON COLUMN public.daily_revenues.date IS 'The date for which revenue is recorded';
COMMENT ON COLUMN public.daily_revenues.revenue IS 'Total revenue for the day from delivered orders';
COMMENT ON COLUMN public.daily_revenues.orders_count IS 'Number of delivered orders for the day';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see "Success. No rows returned", all fixes have been applied!
-- You can now use all the new features in your application.
