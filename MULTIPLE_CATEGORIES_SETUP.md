# Multiple Categories Per Product Setup Guide

## 🎉 New Feature: Multiple Categories

Products can now belong to multiple categories simultaneously!

**Example:** A "Filter Coffee" can be in both **Breakfast** and **Beverages** categories.

## 📋 Setup Instructions

### Step 1: Run the SQL Schema

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Add support for multiple categories per dish

-- Add new column for multiple categories (array type)
ALTER TABLE public.dishes 
ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Migrate existing single category to array format
UPDATE public.dishes 
SET categories = ARRAY[category]
WHERE categories IS NULL AND category IS NOT NULL;

-- Drop the old CHECK constraint on single category
ALTER TABLE public.dishes 
DROP CONSTRAINT IF EXISTS dishes_category_check;

-- Add CHECK constraint for array categories
ALTER TABLE public.dishes 
ADD CONSTRAINT dishes_categories_check 
CHECK (
  categories IS NOT NULL AND 
  array_length(categories, 1) > 0 AND
  categories <@ ARRAY['Breakfast', 'Lunch', 'Dinner', 'Biryani', 'Sweets', 'Beverages']::TEXT[]
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_dishes_categories ON public.dishes USING GIN (categories);
```

4. Click **Run**
5. You should see: **Success. No rows returned**

### Step 2: Test the Feature

#### A. Add a Product with Multiple Categories
1. Go to **Admin Panel** → **Add Dish** tab
2. Fill in the form:
   - **Dish Name**: "Filter Coffee"
   - **Categories**: Click on **Breakfast** and **Beverages** (both will be highlighted)
   - **Price**: 30
   - **Description**: "Authentic South Indian filter coffee"
   - **Upload Image**
3. Click **Add Dish**
4. The product will appear in both Breakfast and Beverages categories

#### B. View Products with Multiple Categories
1. Go to **Menu** page
2. Click on **Breakfast** filter → Filter Coffee appears
3. Click on **Beverages** filter → Filter Coffee appears again
4. Product cards show all category badges

## 🎨 Features Implemented

### 1. Admin - Add Dish Form
**Multi-Select Category Buttons:**
- Click to select/deselect categories
- Selected categories are highlighted in primary color
- Unselected categories are in secondary color
- Shows count: "Selected: Breakfast, Beverages"
- Must select at least one category

### 2. Product Cards (Menu & Home Page)
**Category Badges:**
- Multiple small badges displayed at the top of the card
- Each badge shows one category
- Color: Primary color with light background
- Wraps to multiple lines if needed

### 3. Product Detail Modal
**Category Display:**
- All categories shown as badges
- Same styling as product cards
- Displayed prominently at the top

### 4. Menu Filtering
**Smart Filtering:**
- Products appear in ALL their assigned categories
- Example: Coffee in both Breakfast and Beverages
- "All" filter shows all products
- Backward compatible with old single-category products

## 💡 Usage Examples

### Example 1: Breakfast Item
```
Categories: [Breakfast]
Appears in: Breakfast filter only
```

### Example 2: Multi-Category Item
```
Categories: [Breakfast, Beverages]
Appears in: Breakfast filter AND Beverages filter
```

### Example 3: Special Biryani
```
Categories: [Lunch, Dinner, Biryani]
Appears in: Lunch, Dinner, AND Biryani filters
```

## 🔧 How It Works

### Database Structure
- **Old**: `category` (TEXT) - Single category
- **New**: `categories` (TEXT[]) - Array of categories
- **Backward Compatible**: Old `category` field still exists

### Admin Form
```tsx
// Multi-select buttons
{['Breakfast', 'Lunch', 'Dinner', 'Biryani', 'Sweets', 'Beverages'].map((cat) => (
  <button
    onClick={() => toggleCategory(cat)}
    className={isSelected(cat) ? 'bg-primary' : 'bg-secondary'}
  >
    {cat}
  </button>
))}
```

### Menu Filtering
```tsx
// Check if dish has the selected category
if (dish.categories && Array.isArray(dish.categories)) {
  return dish.categories.includes(selectedCategory);
}
// Fallback to old format
return dish.category === selectedCategory;
```

## 📊 Database Queries

### Get dishes with specific category
```sql
SELECT * FROM public.dishes 
WHERE 'Breakfast' = ANY(categories);
```

### Get dishes with multiple categories
```sql
SELECT * FROM public.dishes 
WHERE categories && ARRAY['Breakfast', 'Beverages']::TEXT[];
```

### Count dishes per category
```sql
SELECT 
  unnest(categories) as category,
  COUNT(*) as dish_count
FROM public.dishes
GROUP BY category
ORDER BY dish_count DESC;
```

### Find dishes in multiple categories
```sql
SELECT name, categories 
FROM public.dishes 
WHERE array_length(categories, 1) > 1;
```

## 🐛 Troubleshooting

### Categories not showing in admin form
- Refresh the page
- Check browser console for errors
- Verify the SQL ran successfully

### Products not appearing in filters
- Check that `categories` array is not empty
- Run: `SELECT name, categories FROM public.dishes;`
- Verify categories are spelled correctly

### Old products not working
- Run the migration SQL to convert old data
- The system is backward compatible with single `category` field

## 📝 Migration Notes

### Existing Products
- All existing products are automatically migrated
- Their single category becomes an array with one item
- Example: `category: 'Breakfast'` → `categories: ['Breakfast']`

### Backward Compatibility
- Old `category` field is kept for compatibility
- New products set `category` to first item in `categories` array
- Both fields work simultaneously

### Future Cleanup (Optional)
If you want to remove the old `category` field later:
```sql
-- Only run this after confirming everything works
ALTER TABLE public.dishes DROP COLUMN IF EXISTS category;
```

## 🎯 Best Practices

1. **Don't Over-Categorize**: Limit to 2-3 categories per product
2. **Be Consistent**: Use the same category names across products
3. **Logical Grouping**: Only add categories that make sense
4. **Test Filters**: Check that products appear in correct categories

## 🔄 Update Existing Products

To add categories to existing products via SQL:
```sql
-- Add Beverages category to Filter Coffee
UPDATE public.dishes 
SET categories = array_append(categories, 'Beverages')
WHERE name = 'Filter Coffee' 
AND NOT ('Beverages' = ANY(categories));

-- Set multiple categories at once
UPDATE public.dishes 
SET categories = ARRAY['Lunch', 'Dinner', 'Biryani']
WHERE name = 'Chicken Biryani';
```

---

**That's it!** Your products can now belong to multiple categories! 🎉
