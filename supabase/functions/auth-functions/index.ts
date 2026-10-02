// Auth Functions - Profile management
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { verifyAuth, requireAuth } from '../_shared/auth.ts';
import { handleCors, addCorsHeaders } from '../_shared/cors.ts';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, validationErrorResponse } from '../_shared/response.ts';
import { profileUpdateSchema, passwordChangeSchema } from '../_shared/validators.ts';

serve(async (req) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return addCorsHeaders(corsResponse);

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    try {
        // GET /profile - Get current user profile
        if (req.method === 'GET' && path === 'profile') {
            const auth = await verifyAuth(req);
            if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));

            const { data: profile, error } = await supabaseAdmin
                .from('profiles')
                .select('id, name, email, role, phone, address, avatar_url, created_at')
                .eq('id', auth.user!.id)
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch profile', error.message));
            
            return addCorsHeaders(successResponse(profile, 'Profile fetched'));
        }

        // PATCH /profile - Update profile
        if (req.method === 'PATCH' && path === 'profile') {
            const auth = await verifyAuth(req);
            if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));

            const body = await req.json();
            const validation = profileUpdateSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { data: profile, error } = await supabaseAdmin
                .from('profiles')
                .update(validation.data)
                .eq('id', auth.user!.id)
                .select('id, name, email, role, phone, address, avatar_url, created_at')
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to update profile', error.message));
            
            return addCorsHeaders(successResponse(profile, 'Profile updated'));
        }

        // POST /change-password - Change password
        if (req.method === 'POST' && path === 'change-password') {
            const auth = await verifyAuth(req);
            if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));

            const body = await req.json();
            const validation = passwordChangeSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { error } = await supabaseAdmin.auth.admin.updateUserById(auth.user!.id, {
                password: validation.data.new_password
            });

            if (error) return addCorsHeaders(serverErrorResponse('Failed to change password', error.message));
            
            return addCorsHeaders(successResponse(null, 'Password changed successfully'));
        }

        return addCorsHeaders(errorResponse('Not found', 404));
    } catch (err) {
        return addCorsHeaders(serverErrorResponse('Internal error', err.message));
    }
});