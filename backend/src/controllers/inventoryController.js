// Inventory Controller
import { supabaseService } from '../services/supabaseService.js';

export const inventoryController = {
  async listInventory(req, res, next) {
    try {
      const result = await supabaseService.listInventory(req.query);
      
      res.json({
        success: true,
        message: 'Inventory fetched',
        data: result.data,
        meta: result.meta
      });
    } catch (err) {
      next(err);
    }
  },

  async getLowStock(req, res, next) {
    try {
      const data = await supabaseService.getLowStock();
      
      res.json({
        success: true,
        message: 'Low stock products fetched',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async getInventoryLogs(req, res, next) {
    try {
      const result = await supabaseService.getInventoryLogs(req.query);
      
      res.json({
        success: true,
        message: 'Inventory logs fetched',
        data: result.data,
        meta: result.meta
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStock(req, res, next) {
    try {
      const { product_id, change_amount, reason } = req.body;
      await supabaseService.updateStock(product_id, change_amount, reason, req.user.id);
      
      res.json({
        success: true,
        message: 'Stock updated'
      });
    } catch (err) {
      next(err);
    }
  },

  async restockProduct(req, res, next) {
    try {
      const { product_id, quantity, reason } = req.body;
      await supabaseService.restockProduct(product_id, quantity, reason, req.user.id);
      
      res.json({
        success: true,
        message: 'Product restocked'
      });
    } catch (err) {
      next(err);
    }
  }
};

export default inventoryController;