-- ============================================
-- MIGRATION: Support guest orders (no auth required)
-- ============================================

-- Make user_id nullable so guests can place orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Add customer contact fields for guest orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Update RLS policy to allow guest inserts (user_id IS NULL)
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    (user_id IS NULL AND auth.uid() IS NULL)
  );

-- Also allow authenticated users to read their own orders, and guests to read orders with no user_id
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    (user_id IS NULL)
  );

-- Update the place_order function to handle guest orders (nullable user_id)
CREATE OR REPLACE FUNCTION place_order(
    p_user_id UUID,
    p_items JSONB,
    p_total_amount DECIMAL(10,2),
    p_shipping_address JSONB,
    p_payment_method TEXT,
    p_special_notes TEXT DEFAULT NULL,
    p_customer_name TEXT DEFAULT NULL,
    p_customer_email TEXT DEFAULT NULL,
    p_customer_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_order_id UUID;
    order_record RECORD;
    item_record RECORD;
    product_record RECORD;
BEGIN
    -- Create the order
    INSERT INTO orders (user_id, items, total_amount, shipping_address, payment_method, customer_name, customer_email, customer_phone)
    VALUES (p_user_id, p_items, p_total_amount, p_shipping_address, p_payment_method, p_customer_name, p_customer_email, p_customer_phone)
    RETURNING id INTO new_order_id;

    -- Process each item
    FOR item_record IN SELECT * FROM jsonb_array_elements(p_items) AS elem
    LOOP
        -- Get product details
        SELECT * INTO product_record
        FROM products
        WHERE id = (item_record->>'product_id')::UUID
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product not found: %', item_record->>'product_id';
        END IF;

        IF product_record.stock_quantity < (item_record->>'quantity')::INT THEN
            RAISE EXCEPTION 'Insufficient stock for product: %', product_record.name;
        END IF;

        -- Decrement stock
        UPDATE products
        SET stock_quantity = stock_quantity - (item_record->>'quantity')::INT,
            updated_at = NOW()
        WHERE id = product_record.id;

        -- Log inventory change
        INSERT INTO inventory_logs (product_id, change_amount, reason, changed_by)
        VALUES (
            product_record.id,
            -(item_record->>'quantity')::INT,
            'Order ' || new_order_id,
            p_user_id
        );
    END LOOP;

    -- Clear user's cart (only if user is authenticated)
    IF p_user_id IS NOT NULL THEN
        DELETE FROM cart_items WHERE user_id = p_user_id;
    END IF;

    -- Return order details
    SELECT * INTO order_record FROM orders WHERE id = new_order_id;
    RETURN to_jsonb(order_record);
END;
$$;