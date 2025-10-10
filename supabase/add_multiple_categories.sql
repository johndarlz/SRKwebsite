-- Add support for multiple categories per dish
-- This allows a dish to belong to multiple categories (e.g., Breakfast + Beverages)

-- Step 1: Add new column for multiple categories (array type)
ALTER TABLE public.dishes 
ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Step 2: Migrate existing single category to array format
UPDATE public.dishes 
SET categories = ARRAY[category]
WHERE categories IS NULL AND category IS NOT NULL;

-- Step 3: Drop the old CHECK constraint on single category
ALTER TABLE public.dishes 
DROP CONSTRAINT IF EXISTS dishes_category_check;

-- Step 4: Add CHECK constraint for array categories
-- This ensures each category in the array is valid
ALTER TABLE public.dishes 
ADD CONSTRAINT dishes_categories_check 
CHECK (
  categories IS NOT NULL AND 
  array_length(categories, 1) > 0 AND
  categories <@ ARRAY['Breakfast', 'Lunch', 'Dinner', 'Biryani', 'Sweets', 'Beverages']::TEXT[]
);

-- Step 5: Create index for better query performance on array column
CREATE INDEX IF NOT EXISTS idx_dishes_categories ON public.dishes USING GIN (categories);

-- Step 6: Optional - Keep the old category column for backward compatibility
-- You can drop it later if not needed
-- ALTER TABLE public.dishes DROP COLUMN IF EXISTS category;

-- Verification queries
-- Check the new structure
SELECT name, category as old_category, categories as new_categories 
FROM public.dishes 
LIMIT 5;

-- Test query: Find dishes that belong to a specific category
-- SELECT * FROM public.dishes WHERE 'Breakfast' = ANY(categories);

-- Test query: Find dishes that belong to multiple categories
-- SELECT * FROM public.dishes WHERE categories && ARRAY['Breakfast', 'Beverages']::TEXT[];

COMMENT ON COLUMN public.dishes.categories IS 'Array of categories this dish belongs to (can have multiple)';
