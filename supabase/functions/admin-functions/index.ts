// Admin Functions - Dashboard stats, sales charts, user management
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { verifyAuth, requireAdmin } from '../_shared/auth.ts';
import { handleCors, addCorsHeaders } from '../_shared/cors.ts';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse, validationErrorResponse, notFoundResponse } from '../_shared/response.ts';
import { paginationSchema } from '../_shared/validators.ts';

serve(async (req) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return addCorsHeaders(corsResponse);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];
    const userId = pathParts.length > 2 ? pathParts[pathParts.length - 1] : null;

    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));
        const adminCheck = requireAdmin(auth.user!);
        if (!adminCheck.success) return addCorsHeaders(forbiddenResponse(adminCheck.error));

        // GET /admin/dashboard - Get dashboard statistics
        if (req.method === 'GET' && (action === 'dashboard' || action === 'stats')) {
            const { data, error } = await supabaseAdmin
                .from('admin_dashboard_stats')
                .select('*')
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch dashboard stats', error.message));

            return addCorsHeaders(successResponse(data, 'Dashboard stats fetched'));
        }

        // GET /admin/sales-chart - Get sales chart data
        if (req.method === 'GET' && action === 'sales-chart') {
            const period = url.searchParams.get('period') || 'daily'; // daily, weekly, monthly
            let interval, format;
            
            switch (period) {
                case 'weekly':
                    interval = '1 week';
                    format = 'YYYY-"W"WW';
                    break;
                case 'monthly':
                    interval = '1 month';
                    format = 'YYYY-MM';
                    break;
                default:
                    interval = '1 day';
                    format = 'YYYY-MM-DD';
            }

            const { data, error } = await supabaseAdmin.rpc('get_sales_chart', {
                p_period: period,
                p_interval: interval,
                p_format: format
            });

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch sales chart', error.message));

            return addCorsHeaders(successResponse(data, 'Sales chart fetched'));
        }

        // GET /admin/top-products - Get top selling products
        if (req.method === 'GET' && action === 'top-products') {
            const limit = parseInt(url.searchParams.get('limit') || '10');
            
            const { data, error } = await supabaseAdmin.rpc('get_top_products', {
                p_limit: limit
            });

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch top products', error.message));

            return addCorsHeaders(successResponse(data, 'Top products fetched'));
        }

        // GET /admin/recent-orders - Get recent orders
        if (req.method === 'GET' && action === 'recent-orders') {
            const limit = parseInt(url.searchParams.get('limit') || '10');
            
            const { data, error } = await supabaseAdmin
                .from('orders')
                .select(`
                    id, total_amount, order_status, payment_status, created_at,
                    profiles!inner(name, email)
                `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch recent orders', error.message));

            return addCorsHeaders(successResponse(data, 'Recent orders fetched'));
        }

        // GET /admin/users - List all users
        if (req.method === 'GET' && (action === 'users' || action === 'list')) {
            const params = Object.fromEntries(url.searchParams);
            const validation = paginationSchema.safeParse(params);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { page, limit, sort, order, ...filters } = validation.data;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = supabaseAdmin
                .from('profiles')
                .select('id, name, email, role, phone, created_at', { count: 'exact' })
                .range(from, to)
                .order(sort || 'created_at', { ascending: order === 'asc' });

            if (filters.role) query = query.eq('role', filters.role);
            if (filters.search) query = query.ilike('name', `%${filters.search}%`);

            const { data, error, count } = await query;

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch users', error.message));

            return addCorsHeaders(successResponse(data, 'Users fetched', {
                page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit)
            }));
        }

        // GET /admin/users/:id - Get single user
        if (req.method === 'GET' && userId && userId !== 'dashboard' && userId !== 'stats' && userId !== 'sales-chart' && userId !== 'top-products' && userId !== 'recent-orders' && userId !== 'users' && userId !== 'list') {
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('id, name, email, role, phone, address, avatar_url, created_at')
                .eq('id', userId)
                .single();

            if (error) return addCorsHeaders(notFoundResponse('User'));
            
            return addCorsHeaders(successResponse(data, 'User fetched'));
        }

        // PATCH /admin/users/:id/role - Update user role
        if (req.method === 'PATCH' && userId && action === 'role') {
            const body = await req.json();
            const { role } = body;
            
            if (!['admin', 'staff', 'customer'].includes(role)) {
                return addCorsHeaders(errorResponse('Invalid role', 400));
            }

            const { data, error } = await supabaseAdmin
                .from('profiles')
                .update({ role })
                .eq('id', userId)
                .select('id, name, email, role')
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to update role', error.message));
            if (!data) return addCorsHeaders(notFoundResponse('User'));
            
            return addCorsHeaders(successResponse(data, 'User role updated'));
        }

        // PATCH /admin/users/:id/block - Block/unblock user
        if (req.method === 'PATCH' && userId && action === 'block') {
            const body = await req.json();
            const { block } = body;

            if (block) {
                await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { blocked: true } });
            } else {
                await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { blocked: false } });
            }

            return addCorsHeaders(successResponse(null, block ? 'User blocked' : 'User unblocked'));
        }

        // DELETE /admin/users/:id - Delete user
        if (req.method === 'DELETE' && userId) {
            // Prevent deleting self
            if (userId === auth.user!.id) {
                return addCorsHeaders(errorResponse('Cannot delete yourself', 400));
            }

            const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
            if (error) return addCorsHeaders(serverErrorResponse('Failed to delete user', error.message));
            
            return addCorsHeaders(successResponse(null, 'User deleted'));
        }

        return addCorsHeaders(errorResponse('Not found', 404));
    } catch (err) {
        return addCorsHeaders(serverErrorResponse('Internal error', err.message));
    }
});