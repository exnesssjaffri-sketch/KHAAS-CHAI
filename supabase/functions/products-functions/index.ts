// Products Functions - List, get, create, update, delete products
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { verifyAuth, requireAuth, requireAdmin } from '../_shared/auth.ts';
import { handleCors, addCorsHeaders } from '../_shared/cors.ts';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse, validationErrorResponse, notFoundResponse } from '../_shared/response.ts';
import { paginationSchema, productCreateSchema, productUpdateSchema } from '../_shared/validators.ts';

serve(async (req) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return addCorsHeaders(corsResponse);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];
    const productId = pathParts.length > 2 ? pathParts[pathParts.length - 1] : null;

    try {
        // GET /products - List products with pagination, search, filters
        if (req.method === 'GET' && (action === 'products' || action === 'list')) {
            const params = Object.fromEntries(url.searchParams);
            const validation = paginationSchema.safeParse(params);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { page, limit, sort, order, ...filters } = validation.data;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = supabaseAdmin
                .from('products')
                .select(`
                    id, name, description, price, category_id, images, 
                    stock_quantity, low_stock_threshold, ratings_avg, ratings_count,
                    is_featured, is_active, created_at,
                    categories!inner(name, slug)
                `, { count: 'exact' })
                .eq('is_active', true)
                .range(from, to)
                .order(sort || 'created_at', { ascending: order === 'asc' });

            // Apply filters
            if (filters.category) {
                query = query.eq('categories.slug', filters.category);
            }
            if (filters.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }
            if (filters.min_price) {
                query = query.gte('price', parseFloat(filters.min_price));
            }
            if (filters.max_price) {
                query = query.lte('price', parseFloat(filters.max_price));
            }
            if (filters.featured === 'true') {
                query = query.eq('is_featured', true);
            }
            if (filters.in_stock === 'true') {
                query = query.gt('stock_quantity', 0);
            }

            const { data, error, count } = await query;

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch products', error.message));

            return addCorsHeaders(successResponse(data, 'Products fetched', {
                page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit)
            }));
        }

        // GET /products/featured - List featured products
        if (req.method === 'GET' && action === 'featured') {
            const { data, error } = await supabaseAdmin
                .from('products')
                .select(`
                    id, name, description, price, category_id, images,
                    stock_quantity, ratings_avg, ratings_count,
                    categories!inner(name, slug)
                `)
                .eq('is_active', true)
                .eq('is_featured', true)
                .gt('stock_quantity', 0)
                .order('ratings_avg', { ascending: false })
                .limit(10);

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch featured products', error.message));

            return addCorsHeaders(successResponse(data, 'Featured products fetched'));
        }

        // GET /products/:id - Get single product
        if (req.method === 'GET' && productId && productId !== 'products' && productId !== 'list' && productId !== 'featured') {
            const { data, error } = await supabaseAdmin
                .from('products')
                .select(`
                    id, name, description, price, category_id, images,
                    stock_quantity, low_stock_threshold, ratings_avg, ratings_count,
                    is_featured, is_active, created_at,
                    categories!inner(name, slug)
                `)
                .eq('id', productId)
                .eq('is_active', true)
                .single();

            if (error) return addCorsHeaders(notFoundResponse('Product'));
            
            return addCorsHeaders(successResponse(data, 'Product fetched'));
        }

        // Admin-only operations below
        const auth = await verifyAuth(req);
        if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));
        const adminCheck = requireAdmin(auth.user!);
        if (!adminCheck.success) return addCorsHeaders(forbiddenResponse(adminCheck.error));

        // POST /products - Create product
        if (req.method === 'POST' && (action === 'products' || action === 'create')) {
            const body = await req.json();
            const validation = productCreateSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { data, error } = await supabaseAdmin
                .from('products')
                .insert(validation.data)
                .select()
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to create product', error.message));
            
            return addCorsHeaders(successResponse(data, 'Product created'));
        }

        // PATCH /products/:id - Update product
        if (req.method === 'PATCH' && productId) {
            const body = await req.json();
            const validation = productUpdateSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { data, error } = await supabaseAdmin
                .from('products')
                .update(validation.data)
                .eq('id', productId)
                .select()
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to update product', error.message));
            if (!data) return addCorsHeaders(notFoundResponse('Product'));
            
            return addCorsHeaders(successResponse(data, 'Product updated'));
        }

        // DELETE /products/:id - Delete product
        if (req.method === 'DELETE' && productId) {
            const { error } = await supabaseAdmin
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) return addCorsHeaders(serverErrorResponse('Failed to delete product', error.message));
            
            return addCorsHeaders(successResponse(null, 'Product deleted'));
        }

        return addCorsHeaders(errorResponse('Not found', 404));
    } catch (err) {
        return addCorsHeaders(serverErrorResponse('Internal error', err.message));
    }
});