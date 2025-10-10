-- Add original_price column to dishes table for discount display
-- Add reviews table for product reviews with star ratings

-- Step 1: Add original_price column to dishes table
ALTER TABLE public.dishes 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);

-- Update existing dishes to have original_price same as price (no discount initially)
UPDATE public.dishes 
SET original_price = price 
WHERE original_price IS NULL;

-- Step 2: Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_dish_id ON public.reviews(dish_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Enable RLS
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

-- Optional: Insert some sample reviews for testing
-- Uncomment the lines below if you want to test with sample data

-- INSERT INTO public.reviews (dish_id, customer_name, rating, review_text) 
-- SELECT 
--   id,
--   'Sample Customer',
--   4,
--   'Delicious food! Highly recommended.'
-- FROM public.dishes 
-- LIMIT 1;

-- Grant permissions
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
GRANT SELECT ON public.reviews TO anon;

COMMENT ON TABLE public.reviews IS 'Customer reviews and ratings for dishes';
COMMENT ON COLUMN public.reviews.dish_id IS 'Reference to the dish being reviewed';
COMMENT ON COLUMN public.reviews.rating IS 'Star rating from 1 to 5';
COMMENT ON COLUMN public.reviews.review_text IS 'Customer review text (optional)';
COMMENT ON COLUMN public.dishes.original_price IS 'Original price before discount (for strikethrough display)';
