// Inventory Validators
import { z } from 'zod';

export const inventoryUpdateSchema = z.object({
  body: z.object({
    product_id: z.string().uuid('Invalid product ID'),
    change_amount: z.number().int(),
    reason: z.string().min(1, 'Reason is required')
  })
});

export const restockSchema = z.object({
  body: z.object({
    product_id: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().positive(),
    reason: z.string().min(1, 'Reason is required')
  })
});

export const inventoryQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('asc'),
    low_stock: z.enum(['true', 'false']).optional(),
    category: z.string().optional()
  })
});