// Products Controller
import { supabaseService } from '../services/supabaseService.js';

export const productsController = {
  async listProducts(req, res, next) {
    try {
      const filters = req.query;
      const result = await supabaseService.listProducts(filters);
      
      res.json({
        success: true,
        message: 'Products fetched',
        data: result.data,
        meta: result.meta
      });
    } catch (err) {
      next(err);
    }
  },

  async getFeaturedProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const data = await supabaseService.getFeaturedProducts(limit);
      
      res.json({
        success: true,
        message: 'Featured products fetched',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      const data = await supabaseService.getProduct(id);
      
      res.json({
        success: true,
        message: 'Product fetched',
        data
      });
    } catch (err) {
      if (err.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      next(err);
    }
  },

  async createProduct(req, res, next) {
    try {
      const data = await supabaseService.createProduct(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Product created',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const data = await supabaseService.updateProduct(id, req.body);
      
      res.json({
        success: true,
        message: 'Product updated',
        data
      });
    } catch (err) {
      if (err.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      next(err);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await supabaseService.deleteProduct(id);
      
      res.json({
        success: true,
        message: 'Product deleted'
      });
    } catch (err) {
      next(err);
    }
  }
};

export default productsController;