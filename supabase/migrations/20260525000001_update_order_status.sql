ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending_confirmation', 'pending_payment', 'preparing', 'assigned', 'in_transit', 'delivered', 'cancelled'));
