// Orders Routes
import { Router } from 'express';
import { ordersController } from '../controllers/ordersController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  orderCreateSchema,
  orderParamsSchema,
  orderQuerySchema,
  orderStatusUpdateSchema
} from '../validators/orders.js';

const router = Router();

// Customer routes
router.post('/', optionalAuth, validate(orderCreateSchema), ordersController.placeOrder);
router.use(authenticate);
router.get('/my', validate(orderQuerySchema), ordersController.getMyOrders);
router.get('/:id', validate(orderParamsSchema), ordersController.getOrder);
router.patch('/:id/cancel', validate(orderParamsSchema), ordersController.cancelOrder);

// Admin routes
router.get('/', authenticate, requireAdmin, validate(orderQuerySchema), ordersController.listAllOrders);
router.patch('/:id/status', authenticate, requireAdmin, validate(orderStatusUpdateSchema), ordersController.updateOrderStatus);

export default router;