// Cart Validators
import { z } from 'zod';

export const cartItemSchema = z.object({
  body: z.object({
    product_id: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().positive().max(99)
  })
});

export const cartUpdateSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive().max(99)
  }),
  params: z.object({
    id: z.string().uuid('Invalid cart item ID')
  })
});

export const cartParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid cart item ID')
  })
});