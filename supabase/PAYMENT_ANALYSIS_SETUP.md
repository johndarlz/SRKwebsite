# Payment Analysis Setup Guide

This guide will help you set up the daily revenue tracking and payment analysis features in your Supabase database.

## Database Schema

### New Table: `daily_revenues`

This table stores daily revenue snapshots that are automatically saved every day at midnight.

**Columns:**
- `id` (UUID): Primary key
- `date` (DATE): The date for which revenue is recorded (unique)
- `revenue` (DECIMAL): Total revenue for the day from delivered orders
- `orders_count` (INTEGER): Number of delivered orders for the day
- `created_at` (TIMESTAMP): When the record was created

## Setup Instructions

### Step 1: Create the Table

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `daily_revenues_schema.sql`
4. Click **Run** to execute the SQL

### Step 2: Set Up Automatic Daily Storage

You have two options for automatically storing daily revenue:

#### Option A: Using Supabase Edge Functions (Recommended)

1. Install Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Create a new Edge Function:
   ```bash
   supabase functions new store-daily-revenue
   ```

3. Add this code to the function:
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   serve(async (req) => {
     try {
       const supabaseClient = createClient(
         Deno.env.get('SUPABASE_URL') ?? '',
         Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
       )

       const yesterday = new Date()
       yesterday.setDate(yesterday.getDate() - 1)
       const yesterdayStr = yesterday.toISOString().split('T')[0]

       // Check if already exists
       const { data: existing } = await supabaseClient
         .from('daily_revenues')
         .select('*')
         .eq('date', yesterdayStr)
         .single()

       if (!existing) {
         // Get yesterday's delivered orders
         const { data: orders } = await supabaseClient
           .from('orders')
           .select('*')
           .eq('status', 'Delivered')
           .gte('created_at', yesterdayStr)
           .lt('created_at', new Date().toISOString().split('T')[0])

         if (orders && orders.length > 0) {
           const revenue = orders.reduce((sum, o) => sum + o.total, 0)
           
           await supabaseClient
             .from('daily_revenues')
             .insert({
               date: yesterdayStr,
               revenue: revenue,
               orders_count: orders.length
             })
         }
       }

       return new Response(
         JSON.stringify({ success: true }),
         { headers: { "Content-Type": "application/json" } }
       )
     } catch (error) {
       return new Response(
         JSON.stringify({ error: error.message }),
         { status: 500, headers: { "Content-Type": "application/json" } }
       )
     }
   })
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy store-daily-revenue
   ```

5. Set up a cron job using a service like:
   - **Cron-job.org** (free)
   - **EasyCron** (free tier available)
   - **GitHub Actions** (free for public repos)

   Configure it to call your Edge Function URL daily at midnight:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/store-daily-revenue
   ```

#### Option B: Using pg_cron (If Available)

If your Supabase project has pg_cron enabled:

1. Go to SQL Editor
2. Run this command:
   ```sql
   SELECT cron.schedule(
     'store-daily-revenue',
     '0 0 * * *', -- Run at midnight every day
     $$SELECT store_daily_revenue()$$
   );
   ```

Note: pg_cron is not available on all Supabase plans. Check your plan details.

#### Option C: Client-Side Automatic Check (Already Implemented)

The application already includes a client-side check that runs when the admin logs in. This will automatically store yesterday's revenue if it hasn't been stored yet. This is a fallback method and works without any additional setup.

## Features Implemented

### 1. Today's Revenue Card
- Shows only today's delivered orders revenue
- Updates in real-time as orders are marked as delivered
- Displayed alongside Total Orders, Pending Orders, and Delivered count

### 2. Payment Analysis Tab
Provides comprehensive revenue analytics with multiple time period filters:

- **Last 7 Days**: Shows revenue for the past week
- **Last 6 Months**: Shows monthly revenue trends
- **Last 1 Year**: Shows yearly revenue analysis
- **Custom Range**: Filter by specific date range

### 3. Analytics Displayed
- **Total Revenue**: Sum of all revenue in the selected period
- **Total Orders**: Count of all delivered orders
- **Average Order Value**: Revenue divided by number of orders
- **Daily Breakdown Table**: Detailed day-by-day revenue, order count, and average

## Testing the Setup

### 1. Verify Table Creation
Run this query in SQL Editor:
```sql
SELECT * FROM daily_revenues ORDER BY date DESC;
```

### 2. Manually Insert Test Data
```sql
INSERT INTO daily_revenues (date, revenue, orders_count) VALUES
(CURRENT_DATE - INTERVAL '7 days', 1250.50, 15),
(CURRENT_DATE - INTERVAL '6 days', 980.00, 12),
(CURRENT_DATE - INTERVAL '5 days', 1450.75, 18),
(CURRENT_DATE - INTERVAL '4 days', 1100.25, 14),
(CURRENT_DATE - INTERVAL '3 days', 1680.00, 21),
(CURRENT_DATE - INTERVAL '2 days', 890.50, 11),
(CURRENT_DATE - INTERVAL '1 day', 1320.00, 16);
```

### 3. Test the Application
1. Log in to the admin panel
2. Check the "Today's Revenue" card in the stats section
3. Navigate to the "Payment Analysis" tab
4. Try different time period filters
5. Verify the data displays correctly

## Troubleshooting

### Issue: No data showing in Payment Analysis
**Solution**: 
- Ensure the `daily_revenues` table is created
- Insert test data using the SQL above
- Check browser console for any errors

### Issue: Today's revenue not updating
**Solution**:
- Verify orders are marked as "Delivered"
- Check that order `created_at` timestamps are correct
- Refresh the page to reload data

### Issue: Automatic storage not working
**Solution**:
- Check if the Edge Function is deployed correctly
- Verify the cron job is configured and running
- Check Supabase logs for any errors
- The client-side fallback should work when admin logs in

## Database Queries Reference

### Get today's revenue
```sql
SELECT 
  COALESCE(SUM(total), 0) as revenue,
  COUNT(*) as orders_count
FROM orders
WHERE 
  status = 'Delivered' 
  AND DATE(created_at) = CURRENT_DATE;
```

### Get last 7 days revenue
```sql
SELECT * FROM daily_revenues
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

### Get monthly revenue for last 6 months
```sql
SELECT 
  DATE_TRUNC('month', date) as month,
  SUM(revenue) as total_revenue,
  SUM(orders_count) as total_orders
FROM daily_revenues
WHERE date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;
```

### Get yearly revenue
```sql
SELECT 
  DATE_TRUNC('year', date) as year,
  SUM(revenue) as total_revenue,
  SUM(orders_count) as total_orders
FROM daily_revenues
WHERE date >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY DATE_TRUNC('year', date)
ORDER BY year DESC;
```

## Security Considerations

- The table has Row Level Security (RLS) enabled
- Current policy allows all operations for authenticated users
- In production, restrict access to admin users only
- Consider adding audit logging for sensitive operations

## Maintenance

### Backup Data
Regularly backup your `daily_revenues` table:
```sql
-- Export to CSV or use Supabase backup features
SELECT * FROM daily_revenues ORDER BY date;
```

### Clean Old Data (Optional)
If you want to archive data older than 2 years:
```sql
DELETE FROM daily_revenues 
WHERE date < CURRENT_DATE - INTERVAL '2 years';
```

## Support

If you encounter any issues:
1. Check Supabase logs in the Dashboard
2. Verify all SQL queries executed successfully
3. Check browser console for JavaScript errors
4. Ensure your Supabase project has sufficient permissions
