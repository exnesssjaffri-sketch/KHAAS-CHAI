-- ============================================
-- REVIEWS & RATING FUNCTIONS
-- ============================================

-- Function to update product rating
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

GRANT EXECUTE ON FUNCTION update_product_rating TO authenticated;