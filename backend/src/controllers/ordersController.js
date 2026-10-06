// Orders Controller
import { supabaseService } from '../services/supabaseService.js';
import { supabaseAdmin } from '../config/supabase.js';
import { sendOrderConfirmation, sendOrderStatusUpdate, sendPaymentSuccess } from '../services/emailService.js';

// Configurable delivery fee rules (server-side, never trust client)
const DELIVERY_FEE = parseFloat(process.env.DELIVERY_FEE) || 120;
const FREE_DELIVERY_THRESHOLD = parseFloat(process.env.FREE_DELIVERY_THRESHOLD) || 1500;
const PACKAGING_FEE = parseFloat(process.env.PACKAGING_FEE) || 50;
const MIN_ORDER_AMOUNT = parseFloat(process.env.MIN_ORDER_AMOUNT) || 400;

export const ordersController = {
  async placeOrder(req, res, next) {
    try {
      const orderData = req.body;
      const userId = req.user?.id || null;

      // If not authenticated, customer info is required
      if (!userId) {
        if (!orderData.customer_name || !orderData.customer_phone) {
          return res.status(400).json({
            success: false,
            message: 'Customer name and phone are required for guest orders'
          });
        }
      }

      // Fetch real product records from the database (never trust client prices)
      const orderItems = [];
      let subtotal = 0;

      for (const item of orderData.items) {
        const { data: product, error } = await supabaseAdmin
          .from('products')
          .select('id, name, price, stock_quantity, is_active')
          .eq('id', item.product_id)
          .single();

        if (error || !product) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.product_id} not found`
          });
        }
        if (!product.is_active) {
          return res.status(400).json({
            success: false,
            message: `${product.name} is not available`
          });
        }
        if (product.stock_quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`
          });
        }

        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;

        orderItems.push({
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity
        });
      }

      // Enforce minimum order amount
      if (subtotal < MIN_ORDER_AMOUNT) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount is Rs ${MIN_ORDER_AMOUNT}`
        });
      }

      // Calculate delivery fee server-side based on fulfillment type and subtotal
      const fulfillment = orderData.fulfillment || 'delivery';
      let deliveryFee = 0;
      if (fulfillment === 'delivery') {
        deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
      }

      // Packaging fee (always applied when items exist)
      const packagingFee = orderItems.length > 0 ? PACKAGING_FEE : 0;

      // Final total calculated server-side
      const totalAmount = subtotal + deliveryFee + packagingFee;

      const result = await supabaseService.placeOrder(userId, {
        items: orderItems,
        total_amount: totalAmount,
        subtotal,
        delivery_fee: deliveryFee,
        packaging_fee: packagingFee,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method,
        special_notes: orderData.special_notes,
        customer_name: orderData.customer_name || orderData.shipping_address?.name || null,
        customer_email: orderData.customer_email || null,
        customer_phone: orderData.customer_phone || orderData.shipping_address?.phone || null
      });

      // Email automation must never make a successful order fail.
      try { await sendOrderConfirmation(result); } catch (emailError) { console.error('[order-email] confirmation failed:', emailError.message); }

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: {
          ...result,
          order_id: result?.id,
          breakdown: {
            subtotal,
            delivery_fee: deliveryFee,
            packaging_fee: packagingFee,
            total: totalAmount
          }
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async trackOrder(req, res, next) {
    try {
      const { token } = req.params;
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('id, items, total_amount, shipping_address, payment_method, payment_status, order_status, customer_name, created_at, updated_at, tracking_token')
        .eq('tracking_token', token)
        .single();
      if (error || !data) return res.status(404).json({ success: false, message: 'Tracking link is invalid or expired' });
      res.json({ success: true, message: 'Order tracking loaded', data });
    } catch (err) { next(err); }
  },

  async getMyOrders(req, res, next) {
    try {
      const result = await supabaseService.getUserOrders(req.user.id, req.query);
      
      res.json({
        success: true,
        message: 'Orders fetched',
        data: result.data,
        meta: result.meta
      });
    } catch (err) {
      next(err);
    }
  },

  async getOrder(req, res, next) {
    try {
      const { id } = req.params;
      const data = await supabaseService.getOrder(id, req.user.id, req.user.role === 'admin');
      
      res.json({
        success: true,
        message: 'Order fetched',
        data
      });
    } catch (err) {
      if (err.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      next(err);
    }
  },

  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const data = await supabaseService.cancelOrder(id, req.user.id);
      
      res.json({
        success: true,
        message: 'Order cancelled',
        data
      });
    } catch (err) {
      if (err.message === 'Order not found') {
        return res.status(404).json({ success: false, message: err.message });
      }
      if (err.message === 'Order cannot be cancelled') {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async listAllOrders(req, res, next) {
    try {
      const result = await supabaseService.listAllOrders(req.query);
      
      res.json({
        success: true,
        message: 'Orders fetched',
        data: result.data,
        meta: result.meta
      });
    } catch (err) {
      next(err);
    }
  },

  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { data: previous, error: previousError } = await supabaseAdmin
        .from('orders').select('*').eq('id', id).single();
      if (previousError || !previous) return res.status(404).json({ success: false, message: 'Order not found' });

      const { data, error } = await supabaseAdmin
        .from('orders').update(req.body).eq('id', id).select('*').single();
      if (error) throw error;

      try {
        await sendOrderStatusUpdate(data, previous.order_status);
        if (previous.payment_status !== 'paid' && data.payment_status === 'paid') {
          await sendPaymentSuccess(data);
        }
      } catch (emailError) { console.error('[order-email] status/payment email failed:', emailError.message); }

      res.json({ success: true, message: 'Order status updated', data });
    } catch (err) {
      if (err.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      next(err);
    }
  }
};

export default ordersController;