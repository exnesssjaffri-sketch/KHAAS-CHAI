// Cart Controller
import { supabaseService } from '../services/supabaseService.js';

export const cartController = {
  async getCart(req, res, next) {
    try {
      const items = await supabaseService.getCart(req.user.id);
      
      // Filter active products and calculate totals
      const cartItems = items.filter(item => item.products?.is_active);
      const subtotal = cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
      const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      res.json({
        success: true,
        message: 'Cart fetched',
        data: {
          items: cartItems,
          subtotal,
          item_count: itemCount
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async addToCart(req, res, next) {
    try {
      const { product_id, quantity } = req.body;
      const data = await supabaseService.addToCart(req.user.id, product_id, quantity);
      
      res.status(201).json({
        success: true,
        message: 'Added to cart',
        data
      });
    } catch (err) {
      if (err.message === 'Product not found') {
        return res.status(404).json({ success: false, message: err.message });
      }
      if (err.message === 'Product not available') {
        return res.status(400).json({ success: false, message: err.message });
      }
      if (err.message === 'Insufficient stock') {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async updateCartItem(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const data = await supabaseService.updateCartItem(req.user.id, id, quantity);
      
      res.json({
        success: true,
        message: 'Cart updated',
        data
      });
    } catch (err) {
      if (err.message === 'Cart item not found') {
        return res.status(404).json({ success: false, message: err.message });
      }
      if (err.message === 'Insufficient stock') {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async removeCartItem(req, res, next) {
    try {
      const { id } = req.params;
      await supabaseService.removeCartItem(req.user.id, id);
      
      res.json({
        success: true,
        message: 'Removed from cart'
      });
    } catch (err) {
      next(err);
    }
  },

  async clearCart(req, res, next) {
    try {
      await supabaseService.clearCart(req.user.id);
      
      res.json({
        success: true,
        message: 'Cart cleared'
      });
    } catch (err) {
      next(err);
    }
  }
};

export default cartController;