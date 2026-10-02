// Inventory Functions - Get inventory, update stock, restock, low stock alerts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { verifyAuth, requireAuth, requireAdmin } from '../_shared/auth.ts';
import { handleCors, addCorsHeaders } from '../_shared/cors.ts';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse, validationErrorResponse, notFoundResponse } from '../_shared/response.ts';
import { paginationSchema, inventoryUpdateSchema } from '../_shared/validators.ts';

serve(async (req) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return addCorsHeaders(corsResponse);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];

    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));
        const staffCheck = requireAdmin(auth.user!); // Using admin for now, could add staff check
        if (!staffCheck.success) return addCorsHeaders(forbiddenResponse('Admin access required'));

        // GET /inventory - Get inventory list with pagination
        if (req.method === 'GET' && (action === 'inventory' || action === 'list')) {
            const params = Object.fromEntries(url.searchParams);
            const validation = paginationSchema.safeParse(params);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { page, limit, sort, order, ...filters } = validation.data;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = supabaseAdmin
                .from('products')
                .select(`
                    id, name, price, stock_quantity, low_stock_threshold, is_active,
                    categories!inner(name, slug)
                `, { count: 'exact' })
                .range(from, to)
                .order(sort || 'name', { ascending: order === 'asc' });

            if (filters.low_stock === 'true') {
                query = query.lte('stock_quantity', supabaseAdmin.raw('low_stock_threshold'));
            }
            if (filters.category) {
                query = query.eq('categories.slug', filters.category);
            }

            const { data, error, count } = await query;

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch inventory', error.message));

            // Add low stock flag
            const itemsWithFlag = (data || []).map(item => ({
                ...item,
                is_low_stock: item.stock_quantity <= item.low_stock_threshold
            }));

            return addCorsHeaders(successResponse(itemsWithFlag, 'Inventory fetched', {
                page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit)
            }));
        }

        // GET /inventory/low-stock - Get low stock products
        if (req.method === 'GET' && action === 'low-stock') {
            const { data, error } = await supabaseAdmin
                .from('products')
                .select(`
                    id, name, price, stock_quantity, low_stock_threshold, is_active,
                    categories!inner(name, slug)
                `)
                .lte('stock_quantity', supabaseAdmin.raw('low_stock_threshold'))
                .eq('is_active', true)
                .order('stock_quantity', { ascending: true });

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch low stock', error.message));

            return addCorsHeaders(successResponse(data, 'Low stock products fetched'));
        }

        // GET /inventory/logs - Get inventory logs
        if (req.method === 'GET' && action === 'logs') {
            const params = Object.fromEntries(url.searchParams);
            const validation = paginationSchema.safeParse(params);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { page, limit, sort, order } = validation.data;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = supabaseAdmin
                .from('inventory_logs')
                .select(`
                    id, product_id, change_amount, reason, changed_by, created_at,
                    products!inner(name),
                    profiles!inner(name, email)
                `, { count: 'exact' })
                .range(from, to)
                .order(sort || 'created_at', { ascending: order === 'asc' });

            const { data, error, count } = await query;

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch inventory logs', error.message));

            return addCorsHeaders(successResponse(data, 'Inventory logs fetched', {
                page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit)
            }));
        }

        // PATCH /inventory/stock - Update product stock
        if (req.method === 'PATCH' && action === 'stock') {
            const body = await req.json();
            const validation = inventoryUpdateSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { data, error } = await supabaseAdmin.rpc('update_product_stock', {
                p_product_id: validation.data.product_id,
                p_new_quantity: validation.data.change_amount, // Using as new quantity
                p_reason: validation.data.reason,
                p_changed_by: auth.user!.id
            });

            if (error) return addCorsHeaders(serverErrorResponse('Failed to update stock', error.message));
            
            return addCorsHeaders(successResponse(null, 'Stock updated'));
        }

        // POST /inventory/restock - Restock product
        if (req.method === 'POST' && action === 'restock') {
            const body = await req.json();
            const validation = inventoryUpdateSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { error } = await supabaseAdmin.rpc('restock_product', {
                p_product_id: validation.data.product_id,
                p_quantity: validation.data.change_amount,
                p_reason: validation.data.reason,
                p_changed_by: auth.user!.id
            });

            if (error) return addCorsHeaders(serverErrorResponse('Failed to restock', error.message));
            
            return addCorsHeaders(successResponse(null, 'Product restocked'));
        }

        return addCorsHeaders(errorResponse('Not found', 404));
    } catch (err) {
        return addCorsHeaders(serverErrorResponse('Internal error', err.message));
    }
});