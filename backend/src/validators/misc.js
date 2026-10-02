// Misc Validators
import { z } from 'zod';

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email('Invalid email address'),
    message: z.string().min(1).max(2000)
  })
});

export const newsletterSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address')
  })
});

export const paymentIntentSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().default('PKR'),
    order_id: z.string().uuid().optional()
  })
});