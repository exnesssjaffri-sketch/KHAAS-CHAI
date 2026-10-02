// Reviews Validators
import { z } from 'zod';

export const reviewCreateSchema = z.object({
  body: z.object({
    product_id: z.string().uuid('Invalid product ID'),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional()
  }),
  params: z.object({
    id: z.string().uuid('Invalid product ID')
  })
});

export const reviewQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc')
  }),
  params: z.object({
    id: z.string().uuid('Invalid product ID')
  })
});

export const reviewParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID')
  })
});