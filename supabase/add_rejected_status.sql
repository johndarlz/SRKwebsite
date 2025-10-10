-- Add 'Rejected' status to orders table
-- This fixes the "Failed to update order status" error when trying to reject orders

-- Step 1: Drop the existing CHECK constraint on status column
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Step 2: Add new CHECK constraint that includes 'Rejected' status
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Pending', 'Cooking', 'Out for Delivery', 'Delivered', 'Rejected'));

-- Verify the constraint was added successfully
-- You can run this query to check:
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'public.orders'::regclass AND conname = 'orders_status_check';

-- Optional: If you want to see all current orders and their statuses
-- SELECT order_id, customer_name, status, created_at 
-- FROM public.orders 
-- ORDER BY created_at DESC;
