# Fix "Failed to Add Dish" Error for Biryani Category

## Problem
When trying to add a dish in the "Biryani" category, you get an error: **"Failed to add dish"**

## Root Cause
The `dishes` table has a CHECK constraint that only allows these categories:
- Breakfast
- Lunch
- Dinner
- Sweets
- Beverages

The "Biryani" category is **NOT** in the allowed list, even though it appears in the Admin UI dropdown. So the database rejects the insert.

## Solution

### Step 1: Run the SQL Fix

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Add 'Biryani' category to dishes table
-- This fixes the "Failed to add dish" error

-- Drop the existing CHECK constraint
ALTER TABLE public.dishes 
DROP CONSTRAINT IF EXISTS dishes_category_check;

-- Add new CHECK constraint that includes 'Biryani'
ALTER TABLE public.dishes 
ADD CONSTRAINT dishes_category_check 
CHECK (category IN ('Breakfast', 'Lunch', 'Dinner', 'Biryani', 'Sweets', 'Beverages'));
```

4. Click **Run** (or press F5)
5. You should see: **Success. No rows returned**

### Step 2: Test Adding a Biryani Dish

1. Go to your admin panel
2. Click on **"Add Dish"** tab
3. Fill in the details:
   - **Dish Name**: e.g., "Chicken Biryani"
   - **Category**: Select "Biryani"
   - **Price**: e.g., 200
   - **Description**: e.g., "Aromatic basmati rice with spiced chicken"
   - **Upload Image**: Choose an image
4. Click **"Add Dish"**
5. You should see: **"Dish added successfully!"** toast message

## Available Categories After Fix

After running the SQL, these categories will be available:
- ✅ Breakfast
- ✅ Lunch
- ✅ Dinner
- ✅ **Biryani** (newly added)
- ✅ Sweets
- ✅ Beverages

## Troubleshooting

### Still getting "Failed to add dish"?
1. Make sure you ran the SQL in Supabase
2. Check the SQL Editor for any error messages
3. Try refreshing your admin panel page
4. Check browser console (F12) for errors

### Want to add more categories?
If you want to add other categories (e.g., "Starters", "Main Course", "Desserts"), run this SQL:

```sql
-- Drop the existing constraint
ALTER TABLE public.dishes 
DROP CONSTRAINT IF EXISTS dishes_category_check;

-- Add new constraint with all your categories
ALTER TABLE public.dishes 
ADD CONSTRAINT dishes_category_check 
CHECK (category IN (
  'Breakfast', 
  'Lunch', 
  'Dinner', 
  'Biryani', 
  'Starters',      -- Add this
  'Main Course',   -- Add this
  'Desserts',      -- Add this
  'Sweets', 
  'Beverages'
));
```

Then update the Admin.tsx file to add these categories to the dropdown.

### Check existing dishes
To see all your current dishes and their categories:
```sql
SELECT name, category, price, in_stock, created_at 
FROM public.dishes 
ORDER BY category, name;
```

### Count dishes by category
```sql
SELECT category, COUNT(*) as dish_count 
FROM public.dishes 
GROUP BY category 
ORDER BY dish_count DESC;
```

## Important Notes

1. **Case Sensitive**: Category names are case-sensitive. Use "Biryani" not "biryani"
2. **Exact Match**: The category must match exactly what's in the constraint
3. **UI Dropdown**: Make sure the Admin UI dropdown matches the database categories
4. **Image Required**: Don't forget to upload an image when adding a dish

## Need to Update the Admin UI?

If you want to add/remove categories from the dropdown in Admin page, edit this section in `src/pages/Admin.tsx`:

```tsx
<SelectContent>
  <SelectItem value="Breakfast">Breakfast</SelectItem>
  <SelectItem value="Lunch">Lunch</SelectItem>
  <SelectItem value="Dinner">Dinner</SelectItem>
  <SelectItem value="Biryani">Biryani</SelectItem>
  <SelectItem value="Sweets">Sweets</SelectItem>
  <SelectItem value="Beverages">Beverages</SelectItem>
</SelectContent>
```

---

**That's it!** You can now add dishes in the Biryani category. 🍛🎉
