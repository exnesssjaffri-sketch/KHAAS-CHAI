// Orders Functions - Place order, get orders, update status
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { verifyAuth, requireAuth, requireAdmin } from '../_shared/auth.ts';
import { handleCors, addCorsHeaders } from '../_shared/cors.ts';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse, validationErrorResponse, notFoundResponse } from '../_shared/response.ts';
import { paginationSchema, orderCreateSchema, orderStatusUpdateSchema } from '../_shared/validators.ts';

serve(async (req) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return addCorsHeaders(corsResponse);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];
    const orderId = pathParts.length > 2 ? pathParts[pathParts.length - 1] : null;

    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));

        const userId = auth.user!.id;
        const isAdminUser = auth.user!.role === 'admin';

        // POST /orders - Place order (customer)
        if (req.method === 'POST' && (action === 'orders' || action === 'place')) {
            const authCheck = requireAuth(auth.user!);
            if (!authCheck.success) return addCorsHeaders(unauthorizedResponse(authCheck.error));

            const body = await req.json();
            const validation = orderCreateSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            // Validate stock for all items and calculate total
            let totalAmount = 0;
            const orderItems = [];

            for (const item of validation.data.items) {
                const { data: product, error: productError } = await supabaseAdmin
                    .from('products')
                    .select('id, name, price, stock_quantity, is_active')
                    .eq('id', item.product_id)
                    .single();

                if (productError || !product) {
                    return addCorsHeaders(errorResponse(`Product ${item.product_id} not found`, 400));
                }
                if (!product.is_active) {
                    return addCorsHeaders(errorResponse(`${product.name} is not available`, 400));
                }
                if (product.stock_quantity < item.quantity) {
                    return addCorsHeaders(errorResponse(`Insufficient stock for ${product.name}`, 400));
                }

                totalAmount += product.price * item.quantity;
                orderItems.push({
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity
                });
            }

            // Create order and decrement stock in a transaction
            const { data: order, error: orderError } = await supabaseAdmin.rpc('place_order', {
                p_user_id: userId,
                p_items: orderItems,
                p_total_amount: totalAmount,
                p_shipping_address: validation.data.shipping_address,
                p_payment_method: validation.data.payment_method,
                p_special_notes: validation.data.special_notes || null
            });

            if (orderError) return addCorsHeaders(serverErrorResponse('Failed to place order', orderError.message));

            return addCorsHeaders(successResponse(order, 'Order placed successfully'));
        }

        // GET /orders/my-orders - Get user's orders
        if (req.method === 'GET' && (action === 'my-orders' || action === 'list')) {
            const params = Object.fromEntries(url.searchParams);
            const validation = paginationSchema.safeParse(params);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { page, limit, sort, order, ...filters } = validation.data;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = supabaseAdmin
                .from('orders')
                .select(`
                    id, items, total_amount, shipping_address, payment_method,
                    payment_status, order_status, created_at
                `, { count: 'exact' })
                .eq('user_id', userId)
                .range(from, to)
                .order(sort || 'created_at', { ascending: order === 'asc' });

            if (filters.status) {
                query = query.eq('order_status', filters.status);
            }

            const { data, error, count } = await query;

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch orders', error.message));

            return addCorsHeaders(successResponse(data, 'Orders fetched', {
                page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit)
            }));
        }

        // GET /orders/:id - Get single order
        if (req.method === 'GET' && orderId && orderId !== 'orders' && orderId !== 'place' && orderId !== 'my-orders' && orderId !== 'list') {
            let query = supabaseAdmin
                .from('orders')
                .select('*')
                .eq('id', orderId);

            if (!isAdminUser) {
                query = query.eq('user_id', userId);
            }

            const { data, error } = await query.single();

            if (error) return addCorsHeaders(notFoundResponse('Order'));
            
            return addCorsHeaders(successResponse(data, 'Order fetched'));
        }

        // PATCH /orders/:id/cancel - Cancel order (customer, only if pending)
        if (req.method === 'PATCH' && orderId && action === 'cancel') {
            const authCheck = requireAuth(auth.user!);
            if (!authCheck.success) return addCorsHeaders(unauthorizedResponse(authCheck.error));

            // Check if order belongs to user and is cancellable
            const { data: order, error: fetchError } = await supabaseAdmin
                .from('orders')
                .select('order_status, user_id')
                .eq('id', orderId)
                .eq('user_id', userId)
                .single();

            if (fetchError || !order) return addCorsHeaders(notFoundResponse('Order'));
            if (order.order_status !== 'pending') {
                return addCorsHeaders(errorResponse('Order cannot be cancelled', 400));
            }

            // Restore stock for cancelled order
            const items = order.items as any[];
            for (const item of items) {
                await supabaseAdmin.rpc('restock_product', {
                    p_product_id: item.product_id,
                    p_quantity: item.quantity,
                    p_reason: `Order ${orderId} cancelled by customer`,
                    p_changed_by: userId
                });
            }

            const { data, error } = await supabaseAdmin
                .from('orders')
                .update({ order_status: 'cancelled' })
                .eq('id', orderId)
                .select()
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to cancel order', error.message));
            
            return addCorsHeaders(successResponse(data, 'Order cancelled'));
        }

        // Admin-only operations below
        const adminCheck = requireAdmin(auth.user!);
        if (!adminCheck.success) return addCorsHeaders(forbiddenResponse(adminCheck.error));

        // GET /orders - Admin list all orders with filters
        if (req.method === 'GET' && (action === 'orders' || action === 'admin-list')) {
            const params = Object.fromEntries(url.searchParams);
            const validation = paginationSchema.safeParse(params);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { page, limit, sort, order, ...filters } = validation.data;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = supabaseAdmin
                .from('orders')
                .select(`
                    id, user_id, items, total_amount, shipping_address, payment_method,
                    payment_status, order_status, created_at,
                    profiles!inner(name, email, phone)
                `, { count: 'exact' })
                .range(from, to)
                .order(sort || 'created_at', { ascending: order === 'asc' });

            if (filters.status) query = query.eq('order_status', filters.status);
            if (filters.payment_status) query = query.eq('payment_status', filters.payment_status);
            if (filters.date_from) query = query.gte('created_at', filters.date_from);
            if (filters.date_to) query = query.lte('created_at', filters.date_to);

            const { data, error, count } = await query;

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch orders', error.message));

            return addCorsHeaders(successResponse(data, 'Orders fetched', {
                page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit)
            }));
        }

        // PATCH /orders/:id/status - Update order status (admin)
        if (req.method === 'PATCH' && orderId && action === 'status') {
            const body = await req.json();
            const validation = orderStatusUpdateSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { data, error } = await supabaseAdmin
                .from('orders')
                .update(validation.data)
                .eq('id', orderId)
                .select()
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to update order status', error.message));
            if (!data) return addCorsHeaders(notFoundResponse('Order'));
            
            return addCorsHeaders(successResponse(data, 'Order status updated'));
        }

        return addCorsHeaders(errorResponse('Not found', 404));
    } catch (err) {
        return addCorsHeaders(serverErrorResponse('Internal error', err.message));
    }
});