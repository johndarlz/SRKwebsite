# Fix "Failed to Reject Order" Error

## Problem
When clicking the "Reject" button in the admin panel, you get an error: **"Failed to update order status"**

## Root Cause
The `orders` table has a CHECK constraint that only allows these statuses:
- Pending
- Cooking
- Out for Delivery
- Delivered

The "Rejected" status is **NOT** in the allowed list, so the database rejects the update.

## Solution

### Step 1: Run the SQL Fix

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Add 'Rejected' status to orders table
-- This fixes the "Failed to update order status" error

-- Drop the existing CHECK constraint
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new CHECK constraint that includes 'Rejected'
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Pending', 'Cooking', 'Out for Delivery', 'Delivered', 'Rejected'));
```

4. Click **Run** (or press F5)
5. You should see: **Success. No rows returned**

### Step 2: Verify It Works

1. Go to your admin panel
2. Find a "Pending" order
3. Click the **Reject** button (red button with X icon)
4. You should see: **"❌ Order rejected"** toast message
5. The order will disappear from the "All Orders" page

### Step 3: Test Customer View

1. Go to the Track Order page
2. Enter the rejected order ID
3. You should see:
   - Red "Rejected" badge
   - Red X icon
   - Message: "❌ Sorry, your order has been rejected. Please contact us for more information."

## What's Been Implemented

### Admin Panel Features:
- ✅ **Accept Button** (Green) - Appears for Pending orders, changes status to "Cooking"
- ✅ **Reject Button** (Red) - Appears for Pending orders, changes status to "Rejected"
- ✅ **Status Dropdown** - Includes all statuses including "Rejected"
- ✅ **Smart Toast Messages**:
  - Accept: "✅ Order accepted!"
  - Reject: "❌ Order rejected"
  - Delivered: "✅ Order marked as delivered!"

### Customer Features:
- ✅ **Automatic Tracking** - Click "Track Order" on confirmation page, no need to paste order ID
- ✅ **Refresh Button** - Check order status without reloading page
- ✅ **Rejected Status Display** - Clear red theme with rejection message
- ✅ **Status Icons**:
  - Pending: ⏳ Clock (Yellow)
  - Cooking: 📦 Package (Orange)
  - Out for Delivery: 🚚 Truck (Blue)
  - Delivered: ✅ Check Circle (Green)
  - Rejected: ❌ X Circle (Red)

## Troubleshooting

### Still getting "Failed to update order status"?
1. Make sure you ran the SQL in Supabase
2. Check the SQL Editor for any error messages
3. Try refreshing your admin panel page
4. Check browser console for errors

### Orders not disappearing from "All Orders"?
- This is correct! Rejected orders are filtered out (like delivered orders)
- They won't show in "All Orders" or "Complete Orders"
- This keeps the admin view clean

### Want to see rejected orders?
You can query them in Supabase SQL Editor:
```sql
SELECT order_id, customer_name, status, created_at 
FROM public.orders 
WHERE status = 'Rejected'
ORDER BY created_at DESC;
```

## Additional SQL Commands

### See all orders with their current status:
```sql
SELECT order_id, customer_name, status, total, created_at 
FROM public.orders 
ORDER BY created_at DESC;
```

### Count orders by status:
```sql
SELECT status, COUNT(*) as count 
FROM public.orders 
GROUP BY status 
ORDER BY count DESC;
```

### Change a rejected order back to pending:
```sql
UPDATE public.orders 
SET status = 'Pending' 
WHERE order_id = 'SRK12345';  -- Replace with your order ID
```

## Important Notes

1. **Rejected orders are permanent** - Make sure you want to reject before clicking
2. **Customers will see the rejection** - They'll get the rejection message when tracking
3. **No notification sent** - The system doesn't automatically notify customers (you may want to call them)
4. **Revenue tracking** - Rejected orders are NOT counted in revenue (only delivered orders count)

## Need Help?

If you're still having issues:
1. Check Supabase logs in the Dashboard
2. Open browser DevTools (F12) and check Console tab
3. Verify the SQL ran successfully
4. Make sure you're logged in as admin

---

**That's it!** Your reject functionality should now work perfectly. 🎉
