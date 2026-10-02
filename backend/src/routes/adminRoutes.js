// Admin Routes
import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  userQuerySchema,
  userParamsSchema,
  userRoleUpdateSchema,
  userBlockSchema,
  salesChartQuerySchema,
  topProductsQuerySchema
} from '../validators/admin.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/sales-chart', validate(salesChartQuerySchema), adminController.getSalesChart);
router.get('/dashboard/top-products', validate(topProductsQuerySchema), adminController.getTopProducts);
router.get('/dashboard/recent-orders', adminController.getRecentOrders);

router.get('/users', validate(userQuerySchema), adminController.listUsers);
router.get('/users/:id', validate(userParamsSchema), adminController.getUser);
router.patch('/users/:id/role', validate(userRoleUpdateSchema), adminController.updateUserRole);
router.patch('/users/:id/block', validate(userBlockSchema), adminController.blockUser);
router.delete('/users/:id', validate(userParamsSchema), adminController.deleteUser);

router.get('/contact-messages', validate(userQuerySchema), adminController.listContactMessages);
router.patch('/contact-messages/:id/read', validate(userParamsSchema), adminController.markContactRead);

router.get('/newsletter', validate(userQuerySchema), adminController.listNewsletterSubscribers);

export default router;