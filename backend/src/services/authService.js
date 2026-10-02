// Auth Service - Authentication business logic
import { supabaseAdmin } from '../config/supabase.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export const authService = {
  async register(email, password, name, phone) {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });
    
    if (authError) throw authError;

    const userId = authData.user.id;

    // Create profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        name,
        email,
        role: 'customer',
        phone: phone || null
      })
      .select('id, name, email, role, phone, address, avatar_url, created_at')
      .single();

    if (profileError) throw profileError;

    // Generate tokens
    const accessToken = generateAccessToken(profile);
    const refreshToken = generateRefreshToken(profile);

    return { user: profile, accessToken, refreshToken };
  },

  async login(email, password) {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const user = data.user;
    
    // Get profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, phone, address, avatar_url, created_at')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const accessToken = generateAccessToken(profile);
    const refreshToken = generateRefreshToken(profile);

    return { user: profile, accessToken, refreshToken };
  },

  async refreshAccessToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, phone, address, avatar_url, created_at')
      .eq('id', decoded.sub)
      .single();

    if (error || !profile) throw new Error('User not found');

    const accessToken = generateAccessToken(profile);
    const newRefreshToken = generateRefreshToken(profile);

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(userId) {
    // Could add token blacklist here if needed
    return true;
  },

  async forgotPassword(email) {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });
    if (error) throw error;
    return true;
  },

  async resetPassword(password) {
    // This is handled by Supabase Auth via the reset password link
    // The user clicks the link and sets new password on Supabase hosted page
    // Or we can use admin update if we have the user ID
    return true;
  },

  async updatePassword(userId, newPassword) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });
    if (error) throw error;
    return true;
  }
};

export default authService;