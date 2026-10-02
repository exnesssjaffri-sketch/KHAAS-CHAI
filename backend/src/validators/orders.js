// Order Validators
import { z } from 'zod';

export const orderCreateSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive(),
    })).min(1, 'At least one item is required'),
    shipping_address: z.object({
      name: z.string().min(1),
      phone: z.string().min(1),
      street: z.string().min(1),
      city: z.string().min(1),
      landmark: z.string().optional()
    }),
    payment_method: z.enum(['cod', 'jazzcash', 'easypaisa', 'bank_transfer', 'pickup']),
    special_notes: z.string().optional(),
    // Guest/customer info - required when not authenticated
    customer_name: z.string().min(1).optional(),
    customer_email: z.string().email().optional(),
    customer_phone: z.string().min(1).optional(),
  })
});

export const orderParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID')
  })
});

export const orderQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
    payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional()
  })
});

export const orderStatusUpdateSchema = z.object({
  body: z.object({
    order_status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
    payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional()
  }),
  params: z.object({
    id: z.string().uuid('Invalid order ID')
  })
});