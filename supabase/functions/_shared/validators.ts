// Zod Validators for input validation
import { z } from 'https://esm.sh/zod@3.22.4';

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
});

export const productCreateSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    price: z.number().positive(),
    category_id: z.string().uuid(),
    images: z.array(z.string().url()).max(3).default([]),
    stock_quantity: z.number().int().nonnegative().default(0),
    low_stock_threshold: z.number().int().nonnegative().default(10),
    is_featured: z.boolean().default(false),
    is_active: z.boolean().default(true),
});

export const productUpdateSchema = productCreateSchema.partial();

export const categoryCreateSchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    image_url: z.string().url().optional().nullable(),
    is_active: z.boolean().default(true),
    sort_order: z.number().int().default(0),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const cartItemSchema = z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive().max(99),
});

export const cartUpdateSchema = z.object({
    quantity: z.number().int().positive().max(99),
});

export const orderCreateSchema = z.object({
    items: z.array(z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
        name: z.string(),
    })).min(1),
    shipping_address: z.object({
        name: z.string().min(1),
        phone: z.string().min(1),
        street: z.string().min(1),
        city: z.string().min(1),
        landmark: z.string().optional(),
    }),
    payment_method: z.enum(['cod', 'jazzcash', 'easypaisa', 'bank_transfer', 'pickup']),
    special_notes: z.string().optional(),
});

export const orderStatusUpdateSchema = z.object({
    order_status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
    payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
});

export const inventoryUpdateSchema = z.object({
    product_id: z.string().uuid(),
    change_amount: z.number().int(),
    reason: z.string().min(1),
});

export const reviewCreateSchema = z.object({
    product_id: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
});

export const contactSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    message: z.string().min(1).max(2000),
});

export const newsletterSchema = z.object({
    email: z.string().email(),
});

export const profileUpdateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    phone: z.string().max(20).optional().nullable(),
    address: z.record(z.any()).optional().nullable(),
});

export const passwordChangeSchema = z.object({
    current_password: z.string().min(1),
    new_password: z.string().min(8).max(128),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
export type ProductCreate = z.infer<typeof productCreateSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
export type CategoryCreate = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type CartUpdate = z.infer<typeof cartUpdateSchema>;
export type OrderCreate = z.infer<typeof orderCreateSchema>;
export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;
export type InventoryUpdate = z.infer<typeof inventoryUpdateSchema>;
export type ReviewCreate = z.infer<typeof reviewCreateSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type PasswordChange = z.infer<typeof passwordChangeSchema>;