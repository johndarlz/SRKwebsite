# Quick Setup Guide - Payment Analysis Feature

## ⚡ Quick Start (5 Minutes)

### Step 1: Create the Database Table
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy the entire content from `supabase/daily_revenues_schema.sql`
4. Paste and click **Run**

### Step 2: Add Test Data (Optional)
Run this in SQL Editor to see the feature in action:

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

### Step 3: Test the Application
1. Log in to the admin panel
2. You'll see **4 stat cards** at the top:
   - Total Orders
   - Pending Orders
   - Delivered
   - **Today's Revenue** (new!)
3. Click on **Payment Analysis** tab
4. Try different filters: Last 7 Days, Last 6 Months, Last 1 Year, Custom Range

## ✅ That's It!

The automatic daily revenue storage is already implemented in the code. It will run automatically when you log in to the admin panel.

## 🎯 What's New

### 1. Today's Revenue Card
- Shows in the stats row with other metrics
- Only counts today's delivered orders
- Updates in real-time

### 2. Payment Analysis Tab
- **Last 7 Days**: Quick weekly overview
- **Last 6 Months**: Monthly trends
- **Last 1 Year**: Yearly analysis
- **Custom Range**: Pick any date range

### 3. Analytics Dashboard
- Total Revenue
- Total Orders
- Average Order Value
- Daily breakdown table with:
  - Date
  - Number of orders
  - Revenue
  - Average order value

### 4. Automatic Data Storage
- Every day at midnight (or when admin logs in)
- Stores yesterday's revenue automatically
- No manual intervention needed

## 📊 How It Works

1. **Today's Revenue**: Calculated in real-time from orders marked as "Delivered" today
2. **Historical Data**: Stored in `daily_revenues` table
3. **Auto-Storage**: Runs when admin logs in, checks if yesterday's data is stored
4. **All Orders Page**: Now shows only non-delivered orders
5. **Complete Orders Page**: Shows only delivered orders with date filters

## 🔧 Advanced Setup (Optional)

For fully automated midnight storage without requiring admin login, see:
- `supabase/PAYMENT_ANALYSIS_SETUP.md` for detailed instructions
- Options include Edge Functions or pg_cron

## 📝 Database Schema

```sql
Table: daily_revenues
- id (UUID, Primary Key)
- date (DATE, Unique)
- revenue (DECIMAL)
- orders_count (INTEGER)
- created_at (TIMESTAMP)
```

## 🐛 Troubleshooting

**No data in Payment Analysis?**
- Run the test data SQL above
- Ensure you have delivered orders in your system

**Today's Revenue shows 0?**
- Mark some orders as "Delivered" today
- Refresh the page

**Automatic storage not working?**
- It runs when admin logs in
- Check browser console for errors
- Verify the `daily_revenues` table exists

## 📚 Full Documentation

See `supabase/PAYMENT_ANALYSIS_SETUP.md` for:
- Detailed setup instructions
- Advanced configuration options
- Database query examples
- Security considerations
- Maintenance tips
