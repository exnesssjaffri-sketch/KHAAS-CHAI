// Misc Functions - Contact form, newsletter, payment intent placeholder
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { verifyAuth, requireAuth, requireAdmin } from '../_shared/auth.ts';
import { handleCors, addCorsHeaders } from '../_shared/cors.ts';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse, validationErrorResponse } from '../_shared/response.ts';
import { contactSchema, newsletterSchema, paginationSchema } from '../_shared/validators.ts';

serve(async (req) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return addCorsHeaders(corsResponse);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];

    try {
        // POST /contact - Submit contact form (public)
        if (req.method === 'POST' && (action === 'contact' || action === 'submit-contact')) {
            const body = await req.json();
            const validation = contactSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { error } = await supabaseAdmin
                .from('contact_messages')
                .insert(validation.data);

            if (error) return addCorsHeaders(serverErrorResponse('Failed to submit contact form', error.message));

            return addCorsHeaders(successResponse(null, 'Message sent successfully'));
        }

        // POST /newsletter - Subscribe to newsletter (public)
        if (req.method === 'POST' && (action === 'newsletter' || action === 'subscribe')) {
            const body = await req.json();
            const validation = newsletterSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { error } = await supabaseAdmin
                .from('newsletter_subscribers')
                .upsert({ email: validation.data.email }, { onConflict: 'email' });

            if (error) return addCorsHeaders(serverErrorResponse('Failed to subscribe', error.message));

            return addCorsHeaders(successResponse(null, 'Subscribed successfully'));
        }

        // Admin-only operations below
        const auth = await verifyAuth(req);
        if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));
        const adminCheck = requireAdmin(auth.user!);
        if (!adminCheck.success) return addCorsHeaders(forbiddenResponse(adminCheck.error));

        // GET /admin/contact-messages - List contact messages
        if (req.method === 'GET' && action === 'contact-messages') {
            const params = Object.fromEntries(url.searchParams);
            const validation = paginationSchema.safeParse(params);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { page, limit, sort, order, ...filters } = validation.data;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = supabaseAdmin
                .from('contact_messages')
                .select('*', { count: 'exact' })
                .range(from, to)
                .order(sort || 'created_at', { ascending: order === 'asc' });

            if (filters.is_read !== undefined) {
                query = query.eq('is_read', filters.is_read === 'true');
            }

            const { data, error, count } = await query;

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch messages', error.message));

            return addCorsHeaders(successResponse(data, 'Messages fetched', {
                page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit)
            }));
        }

        // PATCH /admin/contact-messages/:id/read - Mark as read
        if (req.method === 'PATCH' && action === 'read') {
            const messageId = pathParts[pathParts.length - 2];
            
            const { error } = await supabaseAdmin
                .from('contact_messages')
                .update({ is_read: true })
                .eq('id', messageId);

            if (error) return addCorsHeaders(serverErrorResponse('Failed to mark as read', error.message));

            return addCorsHeaders(successResponse(null, 'Marked as read'));
        }

        // GET /admin/newsletter - List newsletter subscribers
        if (req.method === 'GET' && action === 'newsletter') {
            const params = Object.fromEntries(url.searchParams);
            const validation = paginationSchema.safeParse(params);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            const { page, limit, sort, order } = validation.data;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data, error, count } = await supabaseAdmin
                .from('newsletter_subscribers')
                .select('*', { count: 'exact' })
                .eq('is_active', true)
                .range(from, to)
                .order(sort || 'created_at', { ascending: order === 'asc' });

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch subscribers', error.message));

            return addCorsHeaders(successResponse(data, 'Subscribers fetched', {
                page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit)
            }));
        }

        // POST /payment-intent - Create payment intent (placeholder for Stripe/Razorpay)
        if (req.method === 'POST' && action === 'payment-intent') {
            const auth = await verifyAuth(req);
            if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));

            const body = await req.json();
            const { amount, currency = 'PKR', order_id } = body;

            if (!amount || amount <= 0) {
                return addCorsHeaders(errorResponse('Invalid amount', 400));
            }

            // TODO: Integrate with actual payment provider (Stripe, Razorpay, etc.)
            // For now, return a placeholder response
            const paymentIntent = {
                id: `pi_${Date.now()}`,
                amount,
                currency,
                status: 'requires_payment_method',
                client_secret: `pi_${Date.now()}_secret_${crypto.randomUUID()}`,
                order_id
            };

            return addCorsHeaders(successResponse(paymentIntent, 'Payment intent created (placeholder)'));
        }

        return addCorsHeaders(errorResponse('Not found', 404));
    } catch (err) {
        return addCorsHeaders(serverErrorResponse('Internal error', err.message));
    }
});