-- KHAAS CHAI
-- 004_guest_checkout_security.sql
-- Secure guest checkout. Existing schema is preserved.
-- Guest orders are created only by the server using the Supabase service role.

BEGIN;

ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Remove the unsafe anonymous order read/insert policies.
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;

-- No browser/client role may insert orders directly.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.orders FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.orders FROM authenticated;

-- Authenticated users may read only their own orders.
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Keep service-role access for the Express backend.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO service_role;

-- Remove every previous place_order overload created by the old migrations.
DROP FUNCTION IF EXISTS public.place_order(UUID, JSONB, DECIMAL, JSONB, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.place_order(UUID, JSONB, DECIMAL, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.place_order(UUID, JSONB, DECIMAL, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, DECIMAL, DECIMAL, DECIMAL);

-- Authoritative order creation.
-- p_total_amount/subtotal/fees are values calculated by the trusted backend.
-- Product name/price/availability/stock are re-read and locked here.
CREATE OR REPLACE FUNCTION public.place_order(
  p_user_id UUID,
  p_items JSONB,
  p_total_amount DECIMAL(10,2),
  p_shipping_address JSONB,
  p_payment_method TEXT,
  p_special_notes TEXT DEFAULT NULL,
  p_customer_name TEXT DEFAULT NULL,
  p_customer_email TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL,
  p_subtotal DECIMAL(10,2) DEFAULT NULL,
  p_delivery_fee DECIMAL(10,2) DEFAULT 0,
  p_packaging_fee DECIMAL(10,2) DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_order_id UUID;
  item_record JSONB;
  product_record RECORD;
  requested_qty INTEGER;
  authoritative_items JSONB := '[]'::jsonb;
  calculated_subtotal DECIMAL(10,2) := 0;
  calculated_total DECIMAL(10,2);
  order_record RECORD;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  IF p_shipping_address IS NULL OR jsonb_typeof(p_shipping_address) <> 'object' THEN
    RAISE EXCEPTION 'Shipping address is required';
  END IF;

  IF p_payment_method NOT IN ('cod', 'jazzcash', 'easypaisa', 'bank_transfer', 'pickup') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  IF p_user_id IS NULL AND (NULLIF(BTRIM(p_customer_name), '') IS NULL OR NULLIF(BTRIM(p_customer_phone), '') IS NULL) THEN
    RAISE EXCEPTION 'Guest orders require customer name and phone';
  END IF;

  IF COALESCE(p_delivery_fee, 0) < 0 OR COALESCE(p_packaging_fee, 0) < 0 THEN
    RAISE EXCEPTION 'Invalid order fees';
  END IF;

  FOR item_record IN
    SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF jsonb_typeof(item_record) <> 'object'
       OR NULLIF(item_record->>'product_id', '') IS NULL
       OR NULLIF(item_record->>'quantity', '') IS NULL
       OR (item_record->>'quantity') !~ '^[1-9][0-9]*$' THEN
      RAISE EXCEPTION 'Invalid order item';
    END IF;

    requested_qty := (item_record->>'quantity')::INTEGER;

    SELECT id, name, price, stock_quantity, is_active
      INTO product_record
      FROM public.products
     WHERE id = (item_record->>'product_id')::UUID
     FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', item_record->>'product_id';
    END IF;

    IF product_record.is_active IS NOT TRUE THEN
      RAISE EXCEPTION 'Product is not available: %', product_record.name;
    END IF;

    IF product_record.stock_quantity < requested_qty THEN
      RAISE EXCEPTION 'Insufficient stock for product: %', product_record.name;
    END IF;

    calculated_subtotal :=
      calculated_subtotal + (product_record.price * requested_qty);

    -- Rebuild the stored item from database truth.
    authoritative_items :=
      authoritative_items || jsonb_build_array(
        jsonb_build_object(
          'product_id', product_record.id,
          'name', product_record.name,
          'price', product_record.price,
          'quantity', requested_qty
        )
      );
  END LOOP;

  calculated_subtotal := ROUND(calculated_subtotal, 2);
  calculated_total := ROUND(
    calculated_subtotal
    + COALESCE(p_delivery_fee, 0)
    + COALESCE(p_packaging_fee, 0),
    2
  );

  -- The backend must send the same server-calculated subtotal/total.
  -- The database still independently calculates the product subtotal.
  IF p_subtotal IS NULL OR ROUND(p_subtotal, 2) <> calculated_subtotal THEN
    RAISE EXCEPTION 'Order subtotal mismatch';
  END IF;

  IF p_total_amount IS NULL OR ROUND(p_total_amount, 2) <> calculated_total THEN
    RAISE EXCEPTION 'Order total mismatch';
  END IF;

  INSERT INTO public.orders (
    user_id,
    items,
    total_amount,
    shipping_address,
    payment_method,
    customer_name,
    customer_email,
    customer_phone
  )
  VALUES (
    p_user_id,
    authoritative_items,
    calculated_total,
    p_shipping_address,
    p_payment_method,
    NULLIF(BTRIM(p_customer_name), ''),
    NULLIF(BTRIM(p_customer_email), ''),
    NULLIF(BTRIM(p_customer_phone), '')
  )
  RETURNING id INTO new_order_id;

  -- Decrement locked products and record the inventory movement.
  FOR item_record IN
    SELECT value FROM jsonb_array_elements(authoritative_items)
  LOOP
    requested_qty := (item_record->>'quantity')::INTEGER;

    UPDATE public.products
       SET stock_quantity = stock_quantity - requested_qty,
           updated_at = NOW()
     WHERE id = (item_record->>'product_id')::UUID;

    INSERT INTO public.inventory_logs (
      product_id,
      change_amount,
      reason,
      changed_by
    )
    VALUES (
      (item_record->>'product_id')::UUID,
      -requested_qty,
      'Order ' || new_order_id::TEXT,
      p_user_id
    );
  END LOOP;

  IF p_user_id IS NOT NULL THEN
    DELETE FROM public.cart_items WHERE user_id = p_user_id;
  END IF;

  SELECT *
    INTO order_record
    FROM public.orders
   WHERE id = new_order_id;

  RETURN to_jsonb(order_record);
END;
$$;

-- This RPC is a server-only primitive.
REVOKE ALL ON FUNCTION public.place_order(
  UUID, JSONB, DECIMAL, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, DECIMAL, DECIMAL, DECIMAL
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.place_order(
  UUID, JSONB, DECIMAL, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, DECIMAL, DECIMAL, DECIMAL
) TO service_role;

COMMIT;
