// Misc Routes
import { Router } from 'express';
import { miscController } from '../controllers/miscController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { contactSchema, newsletterSchema, paymentIntentSchema } from '../validators/misc.js';

const router = Router();

router.post('/contact', validate(contactSchema), miscController.submitContact);
router.post('/newsletter', validate(newsletterSchema), miscController.subscribeNewsletter);
router.post('/payment-intent', authenticate, validate(paymentIntentSchema), miscController.createPaymentIntent);
router.get('/health', miscController.healthCheck);

export default router;