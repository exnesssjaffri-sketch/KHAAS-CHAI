-- ============================================
-- ADMIN DASHBOARD FUNCTIONS
-- ============================================

-- Function to get sales chart data
CREATE OR REPLACE FUNCTION get_sales_chart(
    p_period TEXT DEFAULT 'daily',
    p_interval TEXT DEFAULT '1 day',
    p_format TEXT DEFAULT 'YYYY-MM-DD'
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
            AND created_at >= NOW() - INTERVAL ''%s''
            GROUP BY date_trunc(%L, created_at)
            ORDER BY period
        ) t',
        p_period, p_format, 
        CASE p_period 
            WHEN 'daily' THEN '30 days'
            WHEN 'weekly' THEN '12 weeks'
            WHEN 'monthly' THEN '12 months'
            ELSE '30 days'
        END,
        p_period
    ) INTO result;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Function to get top selling products
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_sales_chart TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_products TO authenticated;