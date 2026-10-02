// Authentication Middleware
import { verifyAccessToken } from '../utils/jwt.js';
import { supabaseAdmin } from '../config/supabase.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyAccessToken(token);

    // Get user profile from Supabase
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, phone, address, avatar_url')
      .eq('id', decoded.sub)
      .single();

    if (error || !profile) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = profile;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}

export const requireAdmin = requireRole('admin');
export const requireStaff = requireRole('admin', 'staff');
export const requireAuth = requireRole('admin', 'staff', 'customer');

// Optional authentication - sets req.user if token is present, otherwise continues
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyAccessToken(token);

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, phone, address, avatar_url')
      .eq('id', decoded.sub)
      .single();

    if (error || !profile) {
      return next();
    }

    req.user = profile;
    next();
  } catch (err) {
    // Token invalid/expired - continue without auth
    next();
  }
}