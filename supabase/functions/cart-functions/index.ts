// Cart Functions - Get, add, update, remove, clear cart
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { verifyAuth, requireAuth } from '../_shared/auth.ts';
import { handleCors, addCorsHeaders } from '../_shared/cors.ts';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, validationErrorResponse, notFoundResponse } from '../_shared/response.ts';
import { cartItemSchema, cartUpdateSchema } from '../_shared/validators.ts';

serve(async (req) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return addCorsHeaders(corsResponse);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];
    const itemId = pathParts.length > 2 ? pathParts[pathParts.length - 1] : null;

    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return addCorsHeaders(unauthorizedResponse(auth.error));
        const authCheck = requireAuth(auth.user!);
        if (!authCheck.success) return addCorsHeaders(unauthorizedResponse(authCheck.error));

        const userId = auth.user!.id;

        // GET /cart - Get user's cart with product details
        if (req.method === 'GET' && (action === 'cart' || action === 'get')) {
            const { data, error } = await supabaseAdmin
                .from('cart_items')
                .select(`
                    id, quantity, created_at,
                    products!inner(
                        id, name, description, price, images, 
                        stock_quantity, is_active,
                        categories!inner(name, slug)
                    )
                `)
                .eq('user_id', userId);

            if (error) return addCorsHeaders(serverErrorResponse('Failed to fetch cart', error.message));

            // Filter out inactive products and calculate totals
            const cartItems = (data || []).filter(item => item.products?.is_active);
            const subtotal = cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
            const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

            return addCorsHeaders(successResponse({
                items: cartItems,
                subtotal,
                item_count: itemCount
            }, 'Cart fetched'));
        }

        // POST /cart - Add item to cart
        if (req.method === 'POST' && (action === 'cart' || action === 'add')) {
            const body = await req.json();
            const validation = cartItemSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            // Check product exists and is active
            const { data: product, error: productError } = await supabaseAdmin
                .from('products')
                .select('id, stock_quantity, is_active')
                .eq('id', validation.data.product_id)
                .single();

            if (productError || !product) return addCorsHeaders(notFoundResponse('Product'));
            if (!product.is_active) return addCorsHeaders(errorResponse('Product not available', 400));
            if (product.stock_quantity < validation.data.quantity) {
                return addCorsHeaders(errorResponse('Insufficient stock', 400));
            }

            // Upsert cart item
            const { data, error } = await supabaseAdmin
                .from('cart_items')
                .upsert({
                    user_id: userId,
                    product_id: validation.data.product_id,
                    quantity: validation.data.quantity
                }, { onConflict: 'user_id,product_id' })
                .select()
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to add to cart', error.message));
            
            return addCorsHeaders(successResponse(data, 'Added to cart'));
        }

        // PATCH /cart/:id - Update cart item quantity
        if (req.method === 'PATCH' && itemId && itemId !== 'cart') {
            const body = await req.json();
            const validation = cartUpdateSchema.safeParse(body);
            if (!validation.success) return addCorsHeaders(validationErrorResponse(validation.error.flatten()));

            // Check stock
            const { data: cartItem, error: itemError } = await supabaseAdmin
                .from('cart_items')
                .select('product_id, products!inner(stock_quantity)')
                .eq('id', itemId)
                .eq('user_id', userId)
                .single();

            if (itemError || !cartItem) return addCorsHeaders(notFoundResponse('Cart item'));
            
            const stock = cartItem.products?.stock_quantity || 0;
            if (stock < validation.data.quantity) {
                return addCorsHeaders(errorResponse('Insufficient stock', 400));
            }

            const { data, error } = await supabaseAdmin
                .from('cart_items')
                .update({ quantity: validation.data.quantity })
                .eq('id', itemId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) return addCorsHeaders(serverErrorResponse('Failed to update cart', error.message));
            
            return addCorsHeaders(successResponse(data, 'Cart updated'));
        }

        // DELETE /cart/:id - Remove item from cart
        if (req.method === 'DELETE' && itemId && itemId !== 'cart') {
            const { error } = await supabaseAdmin
                .from('cart_items')
                .delete()
                .eq('id', itemId)
                .eq('user_id', userId);

            if (error) return addCorsHeaders(serverErrorResponse('Failed to remove from cart', error.message));
            
            return addCorsHeaders(successResponse(null, 'Removed from cart'));
        }

        // DELETE /cart/clear - Clear entire cart
        if (req.method === 'DELETE' && action === 'clear') {
            const { error } = await supabaseAdmin
                .from('cart_items')
                .delete()
                .eq('user_id', userId);

            if (error) return addCorsHeaders(serverErrorResponse('Failed to clear cart', error.message));
            
            return addCorsHeaders(successResponse(null, 'Cart cleared'));
        }

        return addCorsHeaders(errorResponse('Not found', 404));
    } catch (err) {
        return addCorsHeaders(serverErrorResponse('Internal error', err.message));
    }
});