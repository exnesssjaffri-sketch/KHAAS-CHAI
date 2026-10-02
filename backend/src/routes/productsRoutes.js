// Products Routes
import { Router } from 'express';
import { productsController } from '../controllers/productsController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  productCreateSchema,
  productUpdateSchema,
  productParamsSchema,
  productQuerySchema
} from '../validators/products.js';

const router = Router();

// Public routes
router.get('/', validate(productQuerySchema), productsController.listProducts);
router.get('/featured', productsController.getFeaturedProducts);
router.get('/:id', validate(productParamsSchema), productsController.getProduct);

// Admin routes
router.post('/', authenticate, requireAdmin, validate(productCreateSchema), productsController.createProduct);
router.put('/:id', authenticate, requireAdmin, validate(productUpdateSchema), productsController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, validate(productParamsSchema), productsController.deleteProduct);

export default router;