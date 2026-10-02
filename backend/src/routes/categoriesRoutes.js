// Categories Routes
import { Router } from 'express';
import { categoriesController } from '../controllers/categoriesController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryParamsSchema
} from '../validators/categories.js';

const router = Router();

// Public routes
router.get('/', categoriesController.listCategories);
router.get('/:id', validate(categoryParamsSchema), categoriesController.getCategory);

// Admin routes
router.post('/', authenticate, requireAdmin, validate(categoryCreateSchema), categoriesController.createCategory);
router.put('/:id', authenticate, requireAdmin, validate(categoryUpdateSchema), categoriesController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, validate(categoryParamsSchema), categoriesController.deleteCategory);

export default router;