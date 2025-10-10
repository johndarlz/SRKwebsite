-- Add 'Biryani' category to dishes table
-- This fixes the "Failed to add dish" error when trying to add dishes in Biryani category

-- Step 1: Drop the existing CHECK constraint on category column
ALTER TABLE public.dishes 
DROP CONSTRAINT IF EXISTS dishes_category_check;

-- Step 2: Add new CHECK constraint that includes 'Biryani' category
ALTER TABLE public.dishes 
ADD CONSTRAINT dishes_category_check 
CHECK (category IN ('Breakfast', 'Lunch', 'Dinner', 'Biryani', 'Sweets', 'Beverages'));

-- Verify the constraint was added successfully
-- You can run this query to check:
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'public.dishes'::regclass AND conname = 'dishes_category_check';

-- Optional: If you want to see all current dishes and their categories
-- SELECT name, category, price, in_stock 
-- FROM public.dishes 
-- ORDER BY category, name;
