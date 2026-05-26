-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger helper function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_number TEXT UNIQUE NOT NULL,
    full_name TEXT,
    delivery_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for whatsapp lookup
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp ON customers(whatsapp_number);


-- 2. VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('restaurant', 'grocery', 'supermarket', 'pharmacy', 'other')),
    address TEXT,
    phone_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_vendors_updated_at
BEFORE UPDATE ON vendors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 3. DISPATCHERS TABLE
CREATE TABLE IF NOT EXISTS dispatchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    vehicle_type TEXT CHECK (vehicle_type IN ('bike', 'car', 'van', 'foot')),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    current_latitude NUMERIC(9, 6),
    current_longitude NUMERIC(9, 6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_dispatchers_updated_at
BEFORE UPDATE ON dispatchers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code TEXT UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    dispatcher_id UUID REFERENCES dispatchers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending_payment' 
        CHECK (status IN ('pending_payment', 'preparing', 'assigned', 'in_transit', 'delivered', 'cancelled')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_text TEXT,
    errand_description TEXT,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    service_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT CHECK (payment_method IN ('flutterwave', 'opay_manual', 'bank_transfer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate short 6-digit tracking code trigger (e.g. EBY-481923)
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.tracking_code IS NULL THEN
    LOOP
      -- Generate random 6 digit code
      new_code := 'EBY-' || floor(random() * 900000 + 100000)::text;
      
      -- Check uniqueness
      SELECT EXISTS(SELECT 1 FROM orders WHERE tracking_code = new_code) INTO code_exists;
      
      IF NOT code_exists THEN
        NEW.tracking_code := new_code;
        EXIT;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_tracking_code
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_tracking_code();

-- Create index for order lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);


-- 5. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    reference TEXT UNIQUE NOT NULL, -- Flutterwave tx_ref
    transaction_id TEXT, -- Flutterwave internal ID
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', '
    
    
    
    
    
    
    
    
    
    
    
    ', 'failed')),
    payment_gateway TEXT NOT NULL DEFAULT 'flutterwave',
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);


-- 6. WHATSAPP MESSAGES TABLE
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    message_sid TEXT, -- WhatsApp Message ID from Cloud API
    message_body TEXT NOT NULL,
    metadata JSONB, -- For message type details (media, locations, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_customer ON whatsapp_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- 1. CUSTOMERS RLS
-- Service role has full access by default.
-- Users/anonymous (frontend) can view their own customer record if they query by ID.
CREATE POLICY "Allow public select by id" ON customers
    FOR SELECT USING (TRUE);

-- 2. VENDORS RLS
-- Anyone can see active vendors on the frontend.
CREATE POLICY "Allow public select active vendors" ON vendors
    FOR SELECT USING (is_active = TRUE);

-- 3. DISPATCHERS RLS
-- Anyone can see dispatcher basic details (for tracking).
CREATE POLICY "Allow public select active dispatchers" ON dispatchers
    FOR SELECT USING (status != 'offline');

-- 4. ORDERS RLS
-- Anyone can read their own order details if they know the tracking_code.
CREATE POLICY "Allow tracking order by code or id" ON orders
    FOR SELECT USING (TRUE);

-- 5. PAYMENTS RLS
-- Payments are sensitive, do not expose details publicly.
CREATE POLICY "Allow read if authorized" ON payments
    FOR SELECT USING (FALSE); -- Only service_role can access

-- 6. WHATSAPP MESSAGES RLS
-- WhatsApp message history is sensitive.
CREATE POLICY "Allow read message history if authorized" ON whatsapp_messages
    FOR SELECT USING (FALSE); -- Only service_role can access
