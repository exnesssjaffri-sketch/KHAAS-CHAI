// Cart Routes
import { Router } from 'express';
import { cartController } from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  cartItemSchema,
  cartUpdateSchema,
  cartParamsSchema
} from '../validators/cart.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/', validate(cartItemSchema), cartController.addToCart);
router.put('/:id', validate(cartUpdateSchema), cartController.updateCartItem);
router.delete('/:id', validate(cartParamsSchema), cartController.removeCartItem);
router.delete('/clear', cartController.clearCart);

export default router;