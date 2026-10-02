// Misc Controller
import { supabaseService } from '../services/supabaseService.js';

export const miscController = {
  async submitContact(req, res, next) {
    try {
      await supabaseService.submitContact(req.body);
      
      res.json({
        success: true,
        message: 'Message sent successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async subscribeNewsletter(req, res, next) {
    try {
      const { email } = req.body;
      await supabaseService.subscribeNewsletter(email);
      
      res.json({
        success: true,
        message: 'Subscribed successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async createPaymentIntent(req, res, next) {
    try {
      const { amount, currency = 'PKR', order_id } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }
      
      // Placeholder for Stripe/Razorpay integration
      const paymentIntent = {
        id: `pi_${Date.now()}`,
        amount,
        currency,
        status: 'requires_payment_method',
        client_secret: `pi_${Date.now()}_secret_${crypto.randomUUID()}`,
        order_id
      };
      
      res.json({
        success: true,
        message: 'Payment intent created (placeholder)',
        data: paymentIntent
      });
    } catch (err) {
      next(err);
    }
  },

  async healthCheck(req, res) {
    res.json({
      success: true,
      message: 'Server is healthy',
      data: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      }
    });
  }
};

export default miscController;