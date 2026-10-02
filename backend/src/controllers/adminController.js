// Admin Controller
import { supabaseService } from '../services/supabaseService.js';

export const adminController = {
  async getDashboardStats(req, res, next) {
    try {
      const data = await supabaseService.getDashboardStats();
      
      res.json({
        success: true,
        message: 'Dashboard stats fetched',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async getSalesChart(req, res, next) {
    try {
      const { period } = req.query;
      const data = await supabaseService.getSalesChart(period);
      
      res.json({
        success: true,
        message: 'Sales chart fetched',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async getTopProducts(req, res, next) {
    try {
      const { limit } = req.query;
      const data = await supabaseService.getTopProducts(parseInt(limit) || 10);
      
      res.json({
        success: true,
        message: 'Top products fetched',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async getRecentOrders(req, res, next) {
    try {
      const { limit } = req.query;
      const data = await supabaseService.getRecentOrders(parseInt(limit) || 10);
      
      res.json({
        success: true,
        message: 'Recent orders fetched',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async listUsers(req, res, next) {
    try {
      const result = await supabaseService.listUsers(req.query);
      
      res.json({
        success: true,
        message: 'Users fetched',
        data: result.data,
        meta: result.meta
      });
    } catch (err) {
      next(err);
    }
  },

  async getUser(req, res, next) {
    try {
      const { id } = req.params;
      const data = await supabaseService.getUser(id);
      
      res.json({
        success: true,
        message: 'User fetched',
        data
      });
    } catch (err) {
      if (err.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      next(err);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const data = await supabaseService.updateUserRole(id, role);
      
      res.json({
        success: true,
        message: 'User role updated',
        data
      });
    } catch (err) {
      if (err.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      next(err);
    }
  },

  async blockUser(req, res, next) {
    try {
      const { id } = req.params;
      const { block } = req.body;
      await supabaseService.blockUser(id, block);
      
      res.json({
        success: true,
        message: block ? 'User blocked' : 'User unblocked'
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      
      // Prevent deleting self
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete yourself'
        });
      }
      
      await supabaseService.deleteUser(id);
      
      res.json({
        success: true,
        message: 'User deleted'
      });
    } catch (err) {
      next(err);
    }
  },

  async listContactMessages(req, res, next) {
    try {
      const result = await supabaseService.listContactMessages(req.query);
      
      res.json({
        success: true,
        message: 'Contact messages fetched',
        data: result.data,
        meta: result.meta
      });
    } catch (err) {
      next(err);
    }
  },

  async markContactRead(req, res, next) {
    try {
      const { id } = req.params;
      await supabaseService.markContactRead(id);
      
      res.json({
        success: true,
        message: 'Marked as read'
      });
    } catch (err) {
      next(err);
    }
  },

  async listNewsletterSubscribers(req, res, next) {
    try {
      const result = await supabaseService.listNewsletterSubscribers(req.query);
      
      res.json({
        success: true,
        message: 'Newsletter subscribers fetched',
        data: result.data,
        meta: result.meta
      });
    } catch (err) {
      next(err);
    }
  }
};

export default adminController;