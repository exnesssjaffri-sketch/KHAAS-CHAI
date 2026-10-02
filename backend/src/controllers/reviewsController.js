// Reviews Controller
import { supabaseService } from '../services/supabaseService.js';

export const reviewsController = {
  async listReviews(req, res, next) {
    try {
      const { id: productId } = req.params;
      const result = await supabaseService.listReviews(productId, req.query);
      
      res.json({
        success: true,
        message: 'Reviews fetched',
        data: result.data,
        meta: result.meta
      });
    } catch (err) {
      next(err);
    }
  },

  async addReview(req, res, next) {
    try {
      const { id: productId } = req.params;
      const { rating, comment } = req.body;
      
      const data = await supabaseService.addReview(req.user.id, productId, rating, comment);
      
      res.status(201).json({
        success: true,
        message: 'Review added',
        data
      });
    } catch (err) {
      if (err.message === 'You have already reviewed this product') {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      await supabaseService.deleteReview(id, req.user.id, req.user.role === 'admin');
      
      res.json({
        success: true,
        message: 'Review deleted'
      });
    } catch (err) {
      if (err.message === 'Review not found') {
        return res.status(404).json({ success: false, message: err.message });
      }
      if (err.message === 'Cannot delete this review') {
        return res.status(403).json({ success: false, message: err.message });
      }
      next(err);
    }
  }
};

export default reviewsController;