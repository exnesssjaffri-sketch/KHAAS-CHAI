// Categories Controller
import { supabaseService } from '../services/supabaseService.js';

export const categoriesController = {
  async listCategories(req, res, next) {
    try {
      const data = await supabaseService.listCategories(req.query);
      
      res.json({
        success: true,
        message: 'Categories fetched',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async getCategory(req, res, next) {
    try {
      const { id } = req.params;
      const data = await supabaseService.getCategory(id);
      
      res.json({
        success: true,
        message: 'Category fetched',
        data
      });
    } catch (err) {
      if (err.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      next(err);
    }
  },

  async createCategory(req, res, next) {
    try {
      const data = await supabaseService.createCategory(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Category created',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const data = await supabaseService.updateCategory(id, req.body);
      
      res.json({
        success: true,
        message: 'Category updated',
        data
      });
    } catch (err) {
      if (err.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      next(err);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      await supabaseService.deleteCategory(id);
      
      res.json({
        success: true,
        message: 'Category deleted'
      });
    } catch (err) {
      next(err);
    }
  }
};

export default categoriesController;