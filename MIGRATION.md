# DHOPA App - Supabase Migration Guide

This guide walks you through setting up the Supabase database for the DHOPA Customer App.

## Prerequisites

- Supabase account and project created
- Access to Supabase SQL Editor
- Environment variables ready

## Step 1: Backup Existing Data (if applicable)

If you have an existing Supabase project with data:

\`\`\`sql
-- Backup your existing orders
CREATE TABLE orders_backup AS SELECT * FROM orders;

-- Backup customers
CREATE TABLE customers_backup AS SELECT * FROM customers;
\`\`\`

## Step 2: Run Schema Migration

1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste `scripts/01-create-tables.sql`
4. Click "Run" to execute the schema

This creates:
- Customer profiles with loyalty tracking
- Items catalog with categories
- Add-ons table
- Orders with detailed pricing breakdown
- Order items and add-ons junction tables
- Invoices table
- Order status history tracking
- Row Level Security policies
- Database functions for loyalty and invoicing
- Realtime subscriptions for orders

## Step 3: Seed Initial Data

1. In SQL Editor, copy and paste `scripts/02-seed-data.sql`
2. Click "Run" to populate:
   - Loyalty tier thresholds (Bronze, Silver, Gold)
   - Delivery zones with fees
   - 43 service items across 5 categories
   - 5 add-on options

## Step 4: Verify Installation

Run these queries to verify:

\`\`\`sql
-- Check items count
SELECT category, COUNT(*) FROM items GROUP BY category;

-- Check add-ons
SELECT * FROM add_ons WHERE is_active = true;

-- Check loyalty thresholds
SELECT * FROM loyalty_thresholds ORDER BY min_points;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'orders', 'items');
\`\`\`

## Step 5: Configure Environment Variables

Add these to your Vercel project (or `.env.local` for local development):

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Optional: Push Notifications
FCM_SERVER_KEY=your_fcm_server_key

# Optional: Email
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_ENV=production
NEXTAUTH_URL=https://yourdomain.com
\`\`\`

## Step 6: Test RPC Functions

\`\`\`sql
-- Test loyalty increment (requires a customer UUID)
SELECT increment_loyalty(
  'customer-uuid-here'::uuid,
  100, -- points
  1000.00 -- amount spent
);

-- Test invoice creation
SELECT create_invoice_with_revenue(
  'order-uuid-here'::uuid,
  'customer-uuid-here'::uuid,
  1500.00 -- amount
);
\`\`\`

## Step 7: Enable Realtime

1. Go to Database → Replication
2. Ensure `orders` and `order_status_history` are enabled for realtime
3. Test subscription in your app

## Step 8: Configure Storage (for PDF invoices)

1. Go to Storage → Create new bucket: `invoices`
2. Set public access policy:

\`\`\`sql
-- Allow authenticated users to read their own invoices
CREATE POLICY "Users can view own invoices" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'invoices' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow service role to insert invoices
CREATE POLICY "Service can insert invoices" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'invoices' AND
    auth.role() = 'service_role'
  );
\`\`\`

## Troubleshooting

### RLS Errors
If you get "permission denied" errors:
\`\`\`sql
-- Check your policies
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Temporarily disable RLS for testing (NOT for production)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
\`\`\`

### Migration Conflicts
If you have existing tables:
\`\`\`sql
-- Drop existing tables (CAUTION: data loss)
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_addons CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS delivery_zones CASCADE;
DROP TABLE IF EXISTS loyalty_thresholds CASCADE;
DROP TABLE IF EXISTS add_ons CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Then re-run the schema script
\`\`\`

### Function Errors
If functions fail:
\`\`\`sql
-- Check function exists
SELECT * FROM pg_proc WHERE proname = 'increment_loyalty';

-- Re-create if needed (re-run the function from schema script)
\`\`\`

## Production Checklist

- [ ] Schema migrated successfully
- [ ] Seed data populated
- [ ] RLS policies verified
- [ ] Environment variables configured in Vercel
- [ ] Realtime enabled for orders
- [ ] Storage bucket created for invoices
- [ ] RPC functions tested
- [ ] Test order created and visible in admin panel
- [ ] Stripe webhook configured
- [ ] Push notification setup (if using FCM)

## Admin Panel Compatibility

This schema is compatible with DHOPA Admin Panel v1.1.0. Orders created in the customer app will appear in the admin panel for management.

**Key integration points:**
- `orders` table structure matches admin expectations
- `order_items` and `order_addons` are normalized
- `order_status_history` tracks all status changes
- `customers` table syncs loyalty automatically
- Invoice generation triggers match admin workflow
