// Auth Controller
import { authService } from '../services/authService.js';
import { supabaseAdmin } from '../config/supabase.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password, name, phone } = req.body;
      const result = await authService.register(email, password, name, phone);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result
      });
    } catch (err) {
      if (err.message.includes('duplicate') || err.message.includes('already registered')) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (err) {
      if (err.message.includes('Invalid login credentials')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      next(err);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshAccessToken(refreshToken);
      
      res.json({
        success: true,
        message: 'Token refreshed',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      await authService.logout(req.user.id);
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      
      // Always return success for security (don't reveal if email exists)
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      // This endpoint is typically not needed as Supabase handles reset via email link
      // But we keep it for completeness
      res.json({
        success: true,
        message: 'Use the reset link sent to your email'
      });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req, res, next) {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, name, email, role, phone, address, avatar_url, created_at')
        .eq('id', req.user.id)
        .single();
      
      if (error) throw error;
      
      res.json({
        success: true,
        message: 'Profile fetched',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { name, phone, address } = req.body;
      const updates = {};
      if (name) updates.name = name;
      if (phone !== undefined) updates.phone = phone;
      if (address !== undefined) updates.address = address;

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', req.user.id)
        .select('id, name, email, role, phone, address, avatar_url, created_at')
        .single();
      
      if (error) throw error;
      
      res.json({
        success: true,
        message: 'Profile updated',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: req.user.email,
        password: currentPassword
      });
      
      if (signInError) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      await authService.updatePassword(req.user.id, newPassword);
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

export default authController;