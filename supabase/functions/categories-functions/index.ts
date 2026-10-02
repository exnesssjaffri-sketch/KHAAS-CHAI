// Categories Functions - List, create, update, delete categories
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { verifyAuth, requireAuth, requireAdmin } from '../_shared/auth.ts';
import { handleCors, addCorsHeaders } from '../_shared/cors.ts';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse, validationErrorResponse, notFoundResponse } from '../_shared/response.ts';
import { paginationSchema, categoryCreateSchema, categoryUpdateSchema } from '../_shared/validators.ts';

serve(async (req) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return addCorsHeaders(corsResponse);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];
    const categoryId = pathParts.length > 2 ? pathParts[pathParts.length - 1] : null;

    try {
        // GET /categories - List categories (public)
        if (req.method === 'GET' && (action === 'categories' || action === 'list')) {
            const { data, error } = await supabaseAdmin
                .from('categories')
                .select('id, name, slug, image_url, is_active, sort_order')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch categories', error.message));

            return addCorsHeaders(successResponse(data, 'Categories fetched'));
        }

        // Admin-only operations below
        const auth = await verifyAuth(req);
        if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));
        const adminCheck = requireAdmin(auth.user!);
        if (!adminCheck.success) return addCorsHeaders(forbiddenResponse(adminCheck.error));

        // POST /categories - Create category
        if (req.method === 'POST' && (action === 'categories' || action === 'create')) {
            const body = await req.json();
            const validation = categoryCreateSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { data, error } = await supabaseAdmin
                .from('categories')
                .insert(validation.data)
                .select()
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to create category', error.message));
            
            return addCorsHeaders(successResponse(data, 'Category created'));
        }

        // PATCH /categories/:id - Update category
        if (req.method === 'PATCH' && categoryId) {
            const body = await req.json();
            const validation = categoryUpdateSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { data, error } = await supabaseAdmin
                .from('categories')
                .update(validation.data)
                .eq('id', categoryId)
                .select()
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to update category', error.message));
            if (!data) return addCorsHeaders(notFoundResponse('Category'));
            
            return addCorsHeaders(successResponse(data, 'Category updated'));
        }

        // DELETE /categories/:id - Delete category
        if (req.method === 'DELETE' && categoryId) {
            const { error } = await supabaseAdmin
                .from('categories')
                .delete()
                .eq('id', categoryId);

            if (error) return addCorsHeaders(serverErrorResponse('Failed to delete category', error.message));
            
            return addCorsHeaders(successResponse(null, 'Category deleted'));
        }

        return addCorsHeaders(errorResponse('Not found', 404));
    } catch (err) {
        return addCorsHeaders(serverErrorResponse('Internal error', err.message));
    }
});