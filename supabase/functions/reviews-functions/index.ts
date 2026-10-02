// Reviews Functions - Add, list, delete reviews
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { verifyAuth, requireAuth, requireAdmin } from '../_shared/auth.ts';
import { handleCors, addCorsHeaders } from '../_shared/cors.ts';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse, validationErrorResponse, notFoundResponse } from '../_shared/response.ts';
import { paginationSchema, reviewCreateSchema } from '../_shared/validators.ts';

serve(async (req) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return addCorsHeaders(corsResponse);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];
    const reviewId = pathParts.length > 2 ? pathParts[pathParts.length - 1] : null;

    try {
        // GET /reviews - List reviews for a product (public)
        if (req.method === 'GET' && (action === 'reviews' || action === 'list')) {
            const productId = url.searchParams.get('product_id');
            if (!productId) return addCorsHeaders(errorResponse('product_id required', 400));

            const params = Object.fromEntries(url.searchParams);
            const validation = paginationSchema.safeParse(params);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { page, limit, sort, order } = validation.data;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data, error, count } = await supabaseAdmin
                .from('reviews')
                .select(`
                    id, rating, comment, created_at,
                    profiles!inner(name, avatar_url)
                `, { count: 'exact' })
                .eq('product_id', productId)
                .range(from, to)
                .order(sort || 'created_at', { ascending: order === 'asc' });

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch reviews', error.message));

            return addCorsHeaders(successResponse(data, 'Reviews fetched', {
                page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit)
            }));
        }

        // POST /reviews - Add review (authenticated customer)
        if (req.method === 'POST' && (action === 'reviews' || action === 'add')) {
            const auth = await verifyAuth(req);
            if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));
            const authCheck = requireAuth(auth.user!);
            if (!authCheck.success) return addCorsHeaders(unauthorizedResponse(authCheck.error));

            const body = await req.json();
            const validation = reviewCreateSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            // Check if user already reviewed this product
            const { data: existing } = await supabaseAdmin
                .from('reviews')
                .select('id')
                .eq('user_id', auth.user!.id)
                .eq('product_id', validation.data.product_id)
                .single();

            if (existing) {
                return addCorsHeaders(errorResponse('You have already reviewed this product', 400));
            }

            // Check if user has purchased this product (optional verification)
            const { data: hasPurchased } = await supabaseAdmin
                .from('orders')
                .select('id')
                .eq('user_id', auth.user!.id)
                .eq('payment_status', 'paid')
                .contains('items', [{ product_id: validation.data.product_id }])
                .limit(1)
                .single();

            const { data, error } = await supabaseAdmin
                .from('reviews')
                .insert({
                    user_id: auth.user!.id,
                    product_id: validation.data.product_id,
                    rating: validation.data.rating,
                    comment: validation.data.comment || null
                })
                .select()
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to add review', error.message));

            // Update product ratings
            await supabaseAdmin.rpc('update_product_rating', {
                p_product_id: validation.data.product_id
            });

            return addCorsHeaders(successResponse(data, 'Review added'));
        }

        // DELETE /reviews/:id - Delete review (owner or admin)
        if (req.method === 'DELETE' && reviewId && reviewId !== 'reviews') {
            const auth = await verifyAuth(req);
            if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));

            const { data: review, error: fetchError } = await supabaseAdmin
                .from('reviews')
                .select('user_id, product_id')
                .eq('id', reviewId)
                .single();

            if (fetchError || !review) return addCorsHeaders(notFoundResponse('Review'));

            const isOwner = review.user_id === auth.user!.id;
            const isAdminUser = auth.user!.role === 'admin';

            if (!isOwner && !isAdminUser) {
                return addCorsHeaders(forbiddenResponse('Cannot delete this review'));
            }

            const { error } = await supabaseAdmin
                .from('reviews')
                .delete()
                .eq('id', reviewId);

            if (error) return addCorsHeaders(serverErrorResponse('Failed to delete review', error.message));

            // Update product ratings
            await supabaseAdmin.rpc('update_product_rating', {
                p_product_id: review.product_id
            });

            return addCorsHeaders(successResponse(null, 'Review deleted'));
        }

        return addCorsHeaders(errorResponse('Not found', 404));
    } catch (err) {
        return addCorsHeaders(serverErrorResponse('Internal error', err.message));
    }
});