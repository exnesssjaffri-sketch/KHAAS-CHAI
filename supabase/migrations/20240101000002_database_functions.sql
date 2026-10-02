-- ============================================
-- DATABASE FUNCTIONS FOR ORDERS AND INVENTORY
-- ============================================

-- Function to place order atomically (decrement stock, create order, log inventory)
CREATE OR REPLACE FUNCTION place_order(
    p_user_id UUID,
    p_items JSONB,
    p_total_amount DECIMAL(10,2),
    p_shipping_address JSONB,
    p_payment_method TEXT,
    p_special_notes TEXT DEFAULT NULL
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
    INSERT INTO orders (user_id, items, total_amount, shipping_address, payment_method)
    VALUES (p_user_id, p_items, p_total_amount, p_shipping_address, p_payment_method)
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

    -- Clear user's cart
    DELETE FROM cart_items WHERE user_id = p_user_id;

    -- Return order details
    SELECT * INTO order_record FROM orders WHERE id = new_order_id;
    RETURN to_jsonb(order_record);
END;
$$;

-- Function to restock product
CREATE OR REPLACE FUNCTION restock_product(
    p_product_id UUID,
    p_quantity INT,
    p_reason TEXT,
    p_changed_by UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity + p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found: %', p_product_id;
    END IF;

    INSERT INTO inventory_logs (product_id, change_amount, reason, changed_by)
    VALUES (p_product_id, p_quantity, p_reason, p_changed_by);
END;
$$;

-- Function to update product stock (admin)
CREATE OR REPLACE FUNCTION update_product_stock(
    p_product_id UUID,
    p_new_quantity INT,
    p_reason TEXT,
    p_changed_by UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    old_quantity INT;
BEGIN
    SELECT stock_quantity INTO old_quantity FROM products WHERE id = p_product_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found: %', p_product_id;
    END IF;

    UPDATE products
    SET stock_quantity = p_new_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;

    INSERT INTO inventory_logs (product_id, change_amount, reason, changed_by)
    VALUES (p_product_id, p_new_quantity - old_quantity, p_reason, p_changed_by);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION place_order TO authenticated;
GRANT EXECUTE ON FUNCTION restock_product TO authenticated;
GRANT EXECUTE ON FUNCTION update_product_stock TO authenticated;