// Category Validators
import { z } from 'zod';

export const categoryCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    image_url: z.string().url().optional().nullable(),
    is_active: z.boolean().default(true),
    sort_order: z.number().int().default(0)
  })
});

export const categoryUpdateSchema = z.object({
  body: categoryCreateSchema.shape.body.partial(),
  params: z.object({
    id: z.string().uuid('Invalid category ID')
  })
});

export const categoryParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID')
  })
});