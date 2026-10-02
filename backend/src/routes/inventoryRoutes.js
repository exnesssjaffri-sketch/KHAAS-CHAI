// Inventory Routes
import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  inventoryUpdateSchema,
  restockSchema,
  inventoryQuerySchema
} from '../validators/inventory.js';

const router = Router();

// Admin/Staff routes
router.use(authenticate, requireAdmin);

router.get('/', validate(inventoryQuerySchema), inventoryController.listInventory);
router.get('/low-stock', inventoryController.getLowStock);
router.get('/logs', validate(inventoryQuerySchema), inventoryController.getInventoryLogs);
router.patch('/stock', validate(inventoryUpdateSchema), inventoryController.updateStock);
router.post('/restock', validate(restockSchema), inventoryController.restockProduct);

export default router;