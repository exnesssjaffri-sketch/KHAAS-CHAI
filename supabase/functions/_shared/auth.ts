// Auth Helper - JWT verification and role checking
import { supabaseAdmin } from './supabase.ts';

export interface AuthUser {
    id: string;
    email: string;
    role: string;
}

export interface AuthResult {
    success: boolean;
    user?: AuthUser;
    error?: string;
}

/**
 * Verify JWT token and get user with role from profiles table
 */
export async function verifyAuth(req: Request): Promise<AuthResult> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        
        if (error || !user) {
            return { success: false, error: 'Invalid or expired token' };
        }

        // Get user profile with role
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, name, email, role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return { success: false, error: 'User profile not found' };
        }

        return {
            success: true,
            user: {
                id: profile.id,
                email: profile.email,
                role: profile.role
            }
        };
    } catch (err) {
        return { success: false, error: 'Authentication failed' };
    }
}

/**
 * Require admin role
 */
export function requireAdmin(user: AuthUser): { success: boolean; error?: string } {
    if (user.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
    }
    return { success: true };
}

/**
 * Require staff or admin role
 */
export function requireStaff(user: AuthUser): { success: boolean; error?: string } {
    if (!['admin', 'staff'].includes(user.role)) {
        return { success: false, error: 'Staff or admin access required' };
    }
    return { success: true };
}

/**
 * Require customer role (or any authenticated user)
 */
export function requireAuth(user: AuthUser): { success: boolean; error?: string } {
    if (!user) {
        return { success: false, error: 'Authentication required' };
    }
    return { success: true };
}