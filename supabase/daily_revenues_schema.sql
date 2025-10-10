-- Create daily_revenues table for storing daily revenue snapshots
-- This table will store revenue data that gets automatically saved every day at midnight

CREATE TABLE IF NOT EXISTS daily_revenues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
  orders_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_revenues_date ON daily_revenues(date DESC);

-- Add Row Level Security (RLS)
ALTER TABLE daily_revenues ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is admin-only data)
-- In production, you should restrict this to admin users only
CREATE POLICY "Enable all operations for authenticated users" ON daily_revenues
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create a function to automatically store yesterday's revenue at midnight
-- This can be called via a cron job or edge function
CREATE OR REPLACE FUNCTION store_daily_revenue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  yesterday_date DATE;
  yesterday_revenue DECIMAL(10, 2);
  yesterday_orders_count INTEGER;
BEGIN
  -- Calculate yesterday's date
  yesterday_date := CURRENT_DATE - INTERVAL '1 day';
  
  -- Check if revenue for yesterday already exists
  IF NOT EXISTS (SELECT 1 FROM daily_revenues WHERE date = yesterday_date) THEN
    -- Calculate yesterday's revenue from delivered orders
    SELECT 
      COALESCE(SUM(total), 0),
      COUNT(*)
    INTO 
      yesterday_revenue,
      yesterday_orders_count
    FROM orders
    WHERE 
      status = 'Delivered' 
      AND DATE(created_at) = yesterday_date;
    
    -- Insert only if there were orders
    IF yesterday_orders_count > 0 THEN
      INSERT INTO daily_revenues (date, revenue, orders_count)
      VALUES (yesterday_date, yesterday_revenue, yesterday_orders_count);
    END IF;
  END IF;
END;
$$;

-- Optional: Create a cron job using pg_cron extension (if available)
-- This will run the function every day at midnight
-- Note: pg_cron needs to be enabled in your Supabase project
-- You can also use Supabase Edge Functions with a scheduled trigger instead

-- SELECT cron.schedule(
--   'store-daily-revenue',
--   '0 0 * * *', -- Run at midnight every day
--   $$SELECT store_daily_revenue()$$
-- );

-- Grant necessary permissions
GRANT ALL ON daily_revenues TO authenticated;
GRANT ALL ON daily_revenues TO service_role;

-- Insert some sample data for testing (optional)
-- Uncomment the lines below if you want to test with sample data

-- INSERT INTO daily_revenues (date, revenue, orders_count) VALUES
-- (CURRENT_DATE - INTERVAL '7 days', 1250.50, 15),
-- (CURRENT_DATE - INTERVAL '6 days', 980.00, 12),
-- (CURRENT_DATE - INTERVAL '5 days', 1450.75, 18),
-- (CURRENT_DATE - INTERVAL '4 days', 1100.25, 14),
-- (CURRENT_DATE - INTERVAL '3 days', 1680.00, 21),
-- (CURRENT_DATE - INTERVAL '2 days', 890.50, 11),
-- (CURRENT_DATE - INTERVAL '1 day', 1320.00, 16);

COMMENT ON TABLE daily_revenues IS 'Stores daily revenue snapshots for payment analysis';
COMMENT ON COLUMN daily_revenues.date IS 'The date for which revenue is recorded';
COMMENT ON COLUMN daily_revenues.revenue IS 'Total revenue for the day from delivered orders';
COMMENT ON COLUMN daily_revenues.orders_count IS 'Number of delivered orders for the day';
