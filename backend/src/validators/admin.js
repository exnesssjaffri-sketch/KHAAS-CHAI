// Admin Validators
import { z } from 'zod';

export const userQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
    role: z.enum(['admin', 'staff', 'customer']).optional(),
    search: z.string().optional()
  })
});

export const userParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID')
  })
});

export const userRoleUpdateSchema = z.object({
  body: z.object({
    role: z.enum(['admin', 'staff', 'customer'])
  }),
  params: z.object({
    id: z.string().uuid('Invalid user ID')
  })
});

export const userBlockSchema = z.object({
  body: z.object({
    block: z.boolean()
  }),
  params: z.object({
    id: z.string().uuid('Invalid user ID')
  })
});

export const salesChartQuerySchema = z.object({
  query: z.object({
    period: z.enum(['daily', 'weekly', 'monthly']).default('daily')
  })
});

export const topProductsQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().max(50).default(10)
  })
});