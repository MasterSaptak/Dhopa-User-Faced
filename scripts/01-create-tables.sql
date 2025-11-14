-- DHOPA Laundry App - Database Schema
-- Compatible with Admin Panel v1.1.0
-- Run this script in your Supabase SQL Editor

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE order_status AS ENUM ('pending', 'processing', 'ready', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE delivery_type AS ENUM ('pickup', 'delivery');
CREATE TYPE loyalty_tier AS ENUM ('Bronze', 'Silver', 'Gold');

-- ============================================
-- CUSTOMERS (extends Supabase auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  email TEXT,
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier loyalty_tier DEFAULT 'Bronze',
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  fcm_token TEXT, -- For push notifications
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ITEMS CATALOG
-- ============================================

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  tooltip TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADD-ONS
-- ============================================

CREATE TABLE IF NOT EXISTS add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOYALTY THRESHOLDS
-- ============================================

CREATE TABLE IF NOT EXISTS loyalty_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier loyalty_tier NOT NULL UNIQUE,
  min_points INTEGER NOT NULL,
  max_points INTEGER,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DELIVERY ZONES
-- ============================================

CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pincode TEXT,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  delivery_type delivery_type DEFAULT 'pickup',
  delivery_date DATE,
  pickup_date DATE,
  delivery_time TEXT,
  pickup_time TEXT,
  delivery_address TEXT,
  delivery_zone_id UUID REFERENCES delivery_zones(id),
  special_instructions TEXT,
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  addons_total DECIMAL(10,2) DEFAULT 0,
  configuration_total DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_code TEXT,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Payment
  payment_method TEXT DEFAULT 'cash',
  payment_id TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Loyalty
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  
  -- Metadata
  invoice_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  
  -- Configuration options
  starch BOOLEAN DEFAULT false,
  dettol BOOLEAN DEFAULT false,
  express BOOLEAN DEFAULT false,
  spot_remove BOOLEAN DEFAULT false,
  configuration_cost DECIMAL(10,2) DEFAULT 0,
  
  line_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER ADD-ONS
-- ============================================

CREATE TABLE IF NOT EXISTS order_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES add_ons(id),
  addon_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICES
-- ============================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  pdf_url TEXT,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER STATUS HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status order_status,
  new_status order_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_addons_order_id ON order_addons(order_id);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_is_active ON items(is_active);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Customers: users can read/update their own record
CREATE POLICY "Users can view own profile" ON customers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON customers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON customers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Items: public read access
CREATE POLICY "Anyone can view active items" ON items
  FOR SELECT USING (is_active = true);

-- Add-ons: public read access
CREATE POLICY "Anyone can view active add-ons" ON add_ons
  FOR SELECT USING (is_active = true);

-- Loyalty thresholds: public read access
CREATE POLICY "Anyone can view loyalty thresholds" ON loyalty_thresholds
  FOR SELECT USING (true);

-- Delivery zones: public read access
CREATE POLICY "Anyone can view active delivery zones" ON delivery_zones
  FOR SELECT USING (is_active = true);

-- Orders: users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Order items: users can view items from their orders
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
    )
  );

-- Order add-ons: users can view add-ons from their orders
CREATE POLICY "Users can view own order addons" ON order_addons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_addons.order_id AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own order addons" ON order_addons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_addons.order_id AND orders.customer_id = auth.uid()
    )
  );

-- Invoices: users can view their own invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = customer_id);

-- Order status history: users can view history of their orders
CREATE POLICY "Users can view own order history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.customer_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_add_ons_updated_at BEFORE UPDATE ON add_ons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment customer loyalty points
CREATE OR REPLACE FUNCTION increment_loyalty(
  p_customer_id UUID,
  p_points INTEGER,
  p_amount_spent DECIMAL
)
RETURNS void AS $$
DECLARE
  v_new_points INTEGER;
  v_new_tier loyalty_tier;
BEGIN
  -- Update customer record
  UPDATE customers
  SET 
    loyalty_points = loyalty_points + p_points,
    total_spent = total_spent + p_amount_spent,
    total_orders = total_orders + 1
  WHERE id = p_customer_id
  RETURNING loyalty_points INTO v_new_points;
  
  -- Determine new tier
  SELECT tier INTO v_new_tier
  FROM loyalty_thresholds
  WHERE v_new_points >= min_points 
    AND (max_points IS NULL OR v_new_points <= max_points)
  ORDER BY min_points DESC
  LIMIT 1;
  
  -- Update tier if changed
  IF v_new_tier IS NOT NULL THEN
    UPDATE customers SET loyalty_tier = v_new_tier WHERE id = p_customer_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create invoice with order
CREATE OR REPLACE FUNCTION create_invoice_with_revenue(
  p_order_id UUID,
  p_customer_id UUID,
  p_amount DECIMAL
)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_invoice_number TEXT;
BEGIN
  -- Generate invoice number
  v_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('invoice_sequence')::TEXT, 6, '0');
  
  -- Create invoice
  INSERT INTO invoices (invoice_number, order_id, customer_id, amount)
  VALUES (v_invoice_number, p_order_id, p_customer_id, p_amount)
  RETURNING id INTO v_invoice_id;
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_sequence START 1;

-- Function to track order status changes
CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO order_status_history (order_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_order_status AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION track_order_status_change();

-- ============================================
-- REALTIME PUBLICATION
-- ============================================

-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_status_history;
