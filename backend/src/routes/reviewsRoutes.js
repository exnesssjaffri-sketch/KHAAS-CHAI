// Reviews Routes
import { Router } from 'express';
import { reviewsController } from '../controllers/reviewsController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reviewCreateSchema, reviewQuerySchema, reviewParamsSchema } from '../validators/reviews.js';

const router = Router();

router.get('/:id', validate(reviewQuerySchema), reviewsController.listReviews);
router.post('/:id', authenticate, validate(reviewCreateSchema), reviewsController.addReview);
router.delete('/:id', authenticate, validate(reviewParamsSchema), reviewsController.deleteReview);

export default router;