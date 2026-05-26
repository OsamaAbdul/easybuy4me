-- 1. Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_menu_items_updated_at
BEFORE UPDATE ON menu_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_menu_items_vendor ON menu_items(vendor_id);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select active menu items" ON menu_items
    FOR SELECT USING (is_available = TRUE);

-- 2. Insert dummy vendors and menu items
DO $$ 
DECLARE
    vendor_id_1 UUID := gen_random_uuid();
    vendor_id_2 UUID := gen_random_uuid();
BEGIN
    -- Insert Vendors
    INSERT INTO vendors (id, name, category, address, phone_number) VALUES
    (vendor_id_1, 'KFC - Victoria Island', 'restaurant', 'Adetokunbo Ademola St, VI', '+2348000000001'),
    (vendor_id_2, 'Mega Chicken', 'restaurant', 'Lekki Epe Expressway', '+2348000000002');

    -- Insert Menu Items for KFC
    INSERT INTO menu_items (vendor_id, name, description, price) VALUES
    (vendor_id_1, 'Streetwise 2', '2 pieces of chicken + chips', 3500.00),
    (vendor_id_1, 'Zinger Burger', 'Spicy chicken burger', 4000.00),
    (vendor_id_1, '5pc Chicken Bucket', '5 pieces original recipe', 7500.00);

    -- Insert Menu Items for Mega Chicken
    INSERT INTO menu_items (vendor_id, name, description, price) VALUES
    (vendor_id_2, 'Jollof Rice & Chicken', 'Classic Nigerian Jollof with fried chicken', 4500.00),
    (vendor_id_2, 'Fried Rice & Turkey', 'Special fried rice with roasted turkey', 5500.00),
    (vendor_id_2, 'Meat Pie', 'Freshly baked meat pie', 1200.00);
END $$;
