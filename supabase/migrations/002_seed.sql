-- ============================================
-- KHAAS CHAI - SEED DATA
-- Run after schema migration
-- ============================================

-- Insert categories
INSERT INTO categories (name, slug, image_url, is_active, sort_order) VALUES
('Signature Chai', 'signature-chai', null, TRUE, 1),
('Naashta & Snacks', 'naashta-snacks', null, TRUE, 2),
('Desi Mithai & Bakery', 'desi-mithai-bakery', null, TRUE, 3),
('Khaas Dawat Boxes', 'khaas-dawat-boxes', null, TRUE, 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert products
DO $$
DECLARE
    cat_chai UUID;
    cat_naashta UUID;
    cat_mithai UUID;
    cat_dawat UUID;
BEGIN
    SELECT id INTO cat_chai FROM categories WHERE slug = 'signature-chai';
    SELECT id INTO cat_naashta FROM categories WHERE slug = 'naashta-snacks';
    SELECT id INTO cat_mithai FROM categories WHERE slug = 'desi-mithai-bakery';
    SELECT id INTO cat_dawat FROM categories WHERE slug = 'khaas-dawat-boxes';

    INSERT INTO products (name, description, price, category_id, images, stock_quantity, low_stock_threshold, ratings_avg, ratings_count, is_featured, is_active) VALUES
    ('Special Doodh Patti (Matka)', 'Rich, creamy whole buffalo milk slow-simmered in clay handi with freshly crushed green cardamoms and caramelized raw sugar.', 250, cat_chai, '[]'::jsonb, 50, 10, 4.8, 124, TRUE, TRUE),
    ('Pink Kashmiri Noon Chai', 'Velvety Himalayan pink tea aerated overnight with baking soda, rich malai, and a sprinkle of crushed pistachios & almonds.', 360, cat_chai, '[]'::jsonb, 30, 8, 4.9, 89, TRUE, TRUE),
    ('Elaichi Chai', 'Aromatic cardamom-infused chai made with freshly pounded green elaichi pods and premium tea leaves.', 220, cat_chai, '[]'::jsonb, 40, 10, 4.7, 67, FALSE, TRUE),
    ('Koyla Chai', 'Smoky charcoal-brewed chai infused with deep caramelized earthen undertones from clay tandoor.', 290, cat_chai, '[]'::jsonb, 25, 5, 4.6, 45, FALSE, TRUE),
    ('Adrak Chai', 'Fresh ginger and traditional spices brewed with whole buffalo milk for a zesty warming cup.', 240, cat_chai, '[]'::jsonb, 35, 8, 4.7, 52, FALSE, TRUE),
    ('Zafrani Chai', 'Premium saffron-infused chai with Grade-A Mongra saffron strands from Kashmir.', 340, cat_chai, '[]'::jsonb, 20, 5, 4.9, 38, TRUE, TRUE),
    ('Crispy Samosa & Chutney Platter (3 pcs)', 'Handmade cumin pastry crust filled with spiced potatoes, green peas, served with sweet imli & chilled mint chutney.', 220, cat_naashta, '[]'::jsonb, 40, 10, 4.8, 76, FALSE, TRUE),
    ('Crisp Almond Nankhatai', 'Pure desi ghee baked traditional shortbread cookies with blanched almonds.', 180, cat_mithai, '[]'::jsonb, 30, 8, 4.9, 92, TRUE, TRUE),
    ('Baker''s Cake Rusk', 'Twice-baked cardamom crunch rusks perfect for dipping in hot chai.', 140, cat_mithai, '[]'::jsonb, 50, 15, 4.7, 105, FALSE, TRUE),
    ('Shahi Tukray with Rabri', 'Crisp ghee-fried milk bread steeped in saffron-rose syrup, drenched in slow-reduced pistachio rabri.', 320, cat_mithai, '[]'::jsonb, 15, 3, 4.9, 41, TRUE, TRUE),
    ('Ajwaini Namak Paare', 'Carom-scented flaky savory bites, perfect with evening chai.', 120, cat_mithai, '[]'::jsonb, 60, 15, 4.6, 58, FALSE, TRUE)
    ON CONFLICT DO NOTHING;
END $$;

-- Note: Create admin user via Supabase Auth UI or CLI:
-- supabase auth users create admin@khaaschai.com --password "your-secure-password" --email-confirm
-- Then run: UPDATE profiles SET role = 'admin' WHERE email = 'admin@khaaschai.com';