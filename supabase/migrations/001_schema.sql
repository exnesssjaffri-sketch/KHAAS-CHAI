-- ============================================
-- KHAAS CHAI - DATABASE SCHEMA
-- Run these in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
    phone TEXT,
    address JSONB,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
    ratings_avg DECIMAL(3,2) NOT NULL DEFAULT 0 CHECK (ratings_avg >= 0 AND ratings_avg <= 5),
    ratings_count INT NOT NULL DEFAULT 0 CHECK (ratings_count >= 0),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_products_name_search ON products USING GIN (to_tsvector('english', name));

-- ============================================
-- CART ITEMS TABLE
-- ============================================
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    shipping_address JSONB NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'jazzcash', 'easypaisa', 'bank_transfer', 'pickup')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- ============================================
-- INVENTORY LOGS TABLE
-- ============================================
CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    change_amount INT NOT NULL,
    reason TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_created_at ON inventory_logs(created_at DESC);
CREATE INDEX idx_inventory_logs_changed_by ON inventory_logs(changed_by);

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_is_read ON contact_messages(is_read);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- ============================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_is_active ON newsletter_subscribers(is_active);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Place order (transaction-safe stock decrement)
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
    INSERT INTO orders (user_id, items, total_amount, shipping_address, payment_method)
    VALUES (p_user_id, p_items, p_total_amount, p_shipping_address, p_payment_method)
    RETURNING id INTO new_order_id;

    FOR item_record IN SELECT * FROM jsonb_array_elements(p_items) AS elem
    LOOP
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

        UPDATE products
        SET stock_quantity = stock_quantity - (item_record->>'quantity')::INT,
            updated_at = NOW()
        WHERE id = product_record.id;

        INSERT INTO inventory_logs (product_id, change_amount, reason, changed_by)
        VALUES (
            product_record.id,
            -(item_record->>'quantity')::INT,
            'Order ' || new_order_id,
            p_user_id
        );
    END LOOP;

    DELETE FROM cart_items WHERE user_id = p_user_id;

    SELECT * INTO order_record FROM orders WHERE id = new_order_id;
    RETURN to_jsonb(order_record);
END;
$$;

-- Restock product
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

-- Update product stock (admin)
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

-- Update product rating
CREATE OR REPLACE FUNCTION update_product_rating(p_product_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    rating_count INT;
BEGIN
    SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0), COUNT(*)
    INTO avg_rating, rating_count
    FROM reviews
    WHERE product_id = p_product_id;

    UPDATE products
    SET ratings_avg = avg_rating,
        ratings_count = rating_count,
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$$;

-- Get sales chart
CREATE OR REPLACE FUNCTION get_sales_chart(
    p_period TEXT DEFAULT 'daily',
    p_interval TEXT DEFAULT '1 day',
    p_format TEXT DEFAULT 'YYYY-MM-DD',
    p_date_range TEXT DEFAULT '30 days'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    EXECUTE format(
        'SELECT jsonb_agg(to_jsonb(t)) FROM (
            SELECT 
                to_char(date_trunc(%L, created_at), %L) as period,
                COUNT(*) as order_count,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM orders
            WHERE payment_status = ''paid''
            AND created_at >= NOW() - INTERVAL %L
            GROUP BY date_trunc(%L, created_at)
            ORDER BY period
        ) t',
        p_period, p_format, p_date_range, p_period
    ) INTO result;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Get top products
CREATE OR REPLACE FUNCTION get_top_products(p_limit INT DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(to_jsonb(t)) INTO result
    FROM (
        SELECT 
            p.id,
            p.name,
            p.price,
            p.images,
            COALESCE(SUM((oi->>'quantity')::INT), 0) as total_sold,
            COALESCE(SUM((oi->>'quantity')::INT * (oi->>'price')::DECIMAL), 0) as total_revenue
        FROM products p
        LEFT JOIN LATERAL jsonb_array_elements(o.items) AS oi ON true
        LEFT JOIN orders o ON o.payment_status = 'paid'
        WHERE p.is_active = TRUE
        GROUP BY p.id, p.name, p.price, p.images
        ORDER BY total_sold DESC
        LIMIT p_limit
    ) t;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Admin dashboard stats view
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM profiles WHERE role = 'customer') AS total_customers,
    (SELECT COUNT(*) FROM profiles WHERE role IN ('admin', 'staff')) AS total_staff,
    (SELECT COUNT(*) FROM products WHERE is_active = TRUE) AS total_products,
    (SELECT COUNT(*) FROM categories WHERE is_active = TRUE) AS total_categories,
    (SELECT COUNT(*) FROM orders) AS total_orders,
    (SELECT COUNT(*) FROM orders WHERE order_status = 'pending') AS pending_orders,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid') AS total_revenue,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid' AND created_at >= DATE_TRUNC('month', NOW())) AS monthly_revenue,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid' AND created_at >= DATE_TRUNC('day', NOW())) AS daily_revenue;

-- Low stock products view
CREATE OR REPLACE VIEW low_stock_products AS
SELECT p.id, p.name, p.stock_quantity, p.low_stock_threshold, c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE AND p.stock_quantity <= p.low_stock_threshold;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION place_order TO authenticated;
GRANT EXECUTE ON FUNCTION restock_product TO authenticated;
GRANT EXECUTE ON FUNCTION update_product_stock TO authenticated;
GRANT EXECUTE ON FUNCTION update_product_rating TO authenticated;
GRANT EXECUTE ON FUNCTION get_sales_chart TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_products TO authenticated;