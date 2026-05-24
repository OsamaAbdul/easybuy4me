-- Auto-assign dispatcher function when order state moves to 'preparing'
CREATE OR REPLACE FUNCTION auto_assign_dispatcher()
RETURNS TRIGGER AS $$
DECLARE
    assigned_dispatcher_id UUID;
    dispatcher_name TEXT;
BEGIN
    -- Check if order status is updated to 'preparing'
    IF NEW.status = 'preparing' AND (OLD.status IS NULL OR OLD.status != 'preparing') THEN
        -- Find the first available dispatcher (FIFO or nearest)
        SELECT id, name INTO assigned_dispatcher_id, dispatcher_name
        FROM dispatchers
        WHERE status = 'available'
        ORDER BY created_at ASC
        LIMIT 1;

        -- If an available dispatcher is found, assign them
        IF assigned_dispatcher_id IS NOT NULL THEN
            NEW.dispatcher_id := assigned_dispatcher_id;
            NEW.status := 'assigned';

            -- Mark the dispatcher as busy
            UPDATE dispatchers
            SET status = 'busy'
            WHERE id = assigned_dispatcher_id;
            
            -- Raise notice for logs
            RAISE NOTICE 'Rider % assigned to order %', dispatcher_name, NEW.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to orders table
DROP TRIGGER IF EXISTS trigger_auto_assign_dispatcher ON orders;
CREATE TRIGGER trigger_auto_assign_dispatcher
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION auto_assign_dispatcher();
