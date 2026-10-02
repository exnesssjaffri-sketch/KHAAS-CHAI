// Product Validators
import { z } from 'zod';

export const productCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    category_id: z.string().uuid('Invalid category ID'),
    images: z.array(z.string().url()).max(3).default([]),
    stock_quantity: z.number().int().nonnegative().default(0),
    low_stock_threshold: z.number().int().nonnegative().default(10),
    is_featured: z.boolean().default(false),
    is_active: z.boolean().default(true)
  })
});

export const productUpdateSchema = z.object({
  body: productCreateSchema.shape.body.partial(),
  params: z.object({
    id: z.string().uuid('Invalid product ID')
  })
});

export const productParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID')
  })
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
    category: z.string().optional(),
    min_price: z.coerce.number().positive().optional(),
    max_price: z.coerce.number().positive().optional(),
    featured: z.enum(['true', 'false']).optional(),
    in_stock: z.enum(['true', 'false']).optional()
  })
});