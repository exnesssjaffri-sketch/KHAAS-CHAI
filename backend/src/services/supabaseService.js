// Supabase Service - Database operations
import { supabaseAdmin } from '../config/supabase.js';

export const supabaseService = {
  // Profiles methods
  async getProfile(userId) {
    const { data, error } = await supabaseAdmin.from('profiles').select('id, name, email, role, phone, address, avatar_url, created_at').eq('id', userId).single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabaseAdmin.from('profiles').update(updates).eq('id', userId).select('id, name, email, role, phone, address, avatar_url, created_at').single();
    if (error) throw error;
    return data;
  },

  async getUserByEmail(email) {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('email', email).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  // Categories methods
  async listCategories(filters = {}) {
    let query = supabaseAdmin.from('categories').select('id, name, slug, image_url, is_active, sort_order, created_at').eq('is_active', true).order('sort_order', { ascending: true });
    if (filters.search) query = query.ilike('name', `%${filters.search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getCategory(id) {
    const { data, error } = await supabaseAdmin.from('categories').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createCategory(data) {
    const { category, error } = await supabaseAdmin.from('categories').insert(data).select().single();
    if (error) throw error;
    return category;
  },

  async updateCategory(id, data) {
    const { category, error } = await supabaseAdmin.from('categories').update(data).eq('id', id).select().single();
    if (error) throw error;
    return category;
  },

  async deleteCategory(id) {
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
  // Products methods
  async listProducts(filters = {}) {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc', ...searchFilters } = filters;
    const from = (page - 1) * limit; const to = from + limit - 1;
    let query = supabaseAdmin.from('products').select('id, name, description, price, category_id, images, stock_quantity, low_stock_threshold, ratings_avg, ratings_count, is_featured, is_active, created_at, categories!inner(name, slug)', { count: 'exact' }).eq('is_active', true).range(from, to).order(sort, { ascending: order === 'asc' });
    if (searchFilters.category) query = query.eq('categories.slug', searchFilters.category);
    if (searchFilters.search) query = query.ilike('name', `%${filters.search}%`);
    if (searchFilters.min_price) query = query.gte('price', searchFilters.min_price);
    if (searchFilters.max_price) query = query.lte('price', searchFilters.max_price);
    const { data, error, count } = await query; if (error) throw error;
    return { data, meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } };
  },

  async getProduct(id) {
    const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', id).single();
    if (error) throw error; return data;
  },

  async createProduct(data) {
    const { product, error } = await supabaseAdmin.from('products').insert(data).select().single();
    if (error) throw error; return product;
  },

  async updateProduct(id, data) {
    const { product, error } = await supabaseAdmin.from('products').update(data).eq('id', id).select().single();
    if (error) throw error; return product;
  },

  async deleteProduct(id) {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw error; return true;
  },
  // Cart methods
  async getCart(userId) {
    const { data, error } = await supabaseAdmin.from('cart_items').select('cart_items!inner(id, user_id, product_id, quantity)').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error; return data || [];
  },

  async addToCart(userId, productId, quantity = 1) {
    const { error } = await supabaseAdmin.from('cart_items').insert({ user_id: userId, product_id: productId, quantity });
    if (error) throw error; return true;
  },

  async updateCartItem(userId, itemId, quantity) {
    const { error } = await supabaseAdmin.from('cart_items').update({ quantity }).eq('id', itemId).eq('user_id', userId);
    if (error) throw error; return true;
  },

  async removeFromCart(userId, itemId) {
    const { error } = await supabaseAdmin.from('cart_items').delete().eq('id', itemId).eq('user_id', userId);
    if (error) throw error; return true;
  },

  async clearCart(userId) {
    const { error } = await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);
    if (error) throw error; return true;
  },
  // Orders - GUEST ORDER SUPPORT
  async placeOrder(userId, orderData) {
    const { data, error } = await supabaseAdmin.rpc('place_order', {
      p_user_id: userId,
      p_items: orderData.items,
      p_total_amount: orderData.total_amount,
      p_subtotal: orderData.subtotal,
      p_delivery_fee: orderData.delivery_fee,
      p_packaging_fee: orderData.packaging_fee,
      p_shipping_address: orderData.shipping_address,
      p_payment_method: orderData.payment_method,
      p_special_notes: orderData.special_notes || null,
      p_customer_name: orderData.customer_name || null,
      p_customer_email: orderData.customer_email || null,
      p_customer_phone: orderData.customer_phone || null
    });
    if (error) throw error;
    return data;
  },

  async getUserOrders(userId, filters = {}) {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc', ...searchFilters } = filters;
    const from = (page - 1) * limit; const to = from + limit - 1;
    let query = supabaseAdmin.from('orders').select('id, items, total_amount, shipping_address, payment_method, payment_status, order_status, created_at', { count: 'exact' }).eq('user_id', userId).range(from, to).order(sort, { ascending: order === 'asc' });
    if (searchFilters.status) query = query.eq('order_status', searchFilters.status);
    const { data, error, count } = await query; if (error) throw error;
    return { data, meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } };
  },

  async getOrder(id, userId = null, isAdmin = false) {
    let query = supabaseAdmin.from('orders').select('*').eq('id', id);
    if (!isAdmin && userId) query = query.eq('user_id', userId);
    const { data, error } = await query.single(); if (error) throw error; return data;
  },

  async cancelOrder(id, userId) {
    const { order, error: fetchError } = await supabaseAdmin.from('orders').select('order_status, user_id, items').eq('id', id).eq('user_id', userId).single();
    if (fetchError || !order) throw new Error('Order not found');
    if (order.order_status !== 'pending') throw new Error('Order cannot be cancelled');
    const { error } = await supabaseAdmin.from('orders').update({ order_status: 'cancelled' }).eq('id', id).eq('user_id', userId);
    if (error) throw error; return true;
  },
  // Inventory Management
  async getLowStockProducts() {
    const { data, error } = await supabaseAdmin.from('products').select('id, name, price, stock_quantity, low_stock_threshold, is_active, categories(name, slug)').eq('is_active', true).lte('stock_quantity', 'low_stock_threshold').order('stock_quantity', { ascending: true });
    if (error) throw error; return data || [];
  },

  async updateStock(data) {
    const { error } = await supabaseAdmin.from('inventory_logs').insert(data);
    if (error) throw error; return true;
  },

  async restock(data) {
    const { log, error } = await supabaseAdmin.from('inventory_logs').insert(data).select().single();
    if (error) throw error; return log;
  },

  async getInventoryLogs(filters = {}) {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc', ...searchFilters } = filters;
    const from = (page - 1) * limit; const to = from + limit - 1;
    let query = supabaseAdmin.from('inventory_logs').select('id, product_id, change_amount, reason, changed_by, created_at, products(name)', { count: 'exact' }).range(from, to).order(sort, { ascending: order === 'asc' });
    if (searchFilters.product_id) query = query.eq('product_id', searchFilters.product_id);
    const { data, error, count } = await query; if (error) throw error;
    return { data, meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } };
  },
  // Admin functions
  async listAllOrders(filters = {}) {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc', ...searchFilters } = filters;
    const from = (page - 1) * limit; const to = from + limit - 1;
    let query = supabaseAdmin.from('orders').select('id, user_id, items, total_amount, shipping_address, payment_method, payment_status, order_status, created_at, profiles(name, email)', { count: 'exact' }).range(from, to).order(sort, { ascending: order === 'asc' });
    if (searchFilters.status) query = query.eq('order_status', searchFilters.status);
    if (searchFilters.user_id) query = query.eq('user_id', searchFilters.user_id);
    const { data, error, count } = await query; if (error) throw error;
    return { data || [], meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } };
  },

  async getUser(id) {
    const { data, error } = await supabaseAdmin.from('profiles').select('id, name, email, role, phone, address, avatar_url, created_at').eq('id', id).single();
    if (error) throw error; return data;
  },

  async updateUserRole(id, role) {
    const { data, error } = await supabaseAdmin.from('profiles').update({ role }).eq('id', id).select('id, name, email, role').single();
    if (error) throw error; return data;
  },

  async blockUser(id, block) {
    try { await supabaseAdmin.auth.admin.updateUserById(id, { user_meta: { blocked: block } }); } catch (err) { console.error('Failed to block user:', err); } return true;
  },

  async deleteUser(id) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id); if (error) throw error; return true;
  },
  // Contact Messages
  async submitContact(data) {
    const { message, error } = await supabaseAdmin.from('contact_messages').insert({ name: data.name, email: data.email, message: data.message }).select().single();
    if (error) throw error; return message;
  },

  async listContactMessages(filters = {}) {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc', ...searchFilters } = filters;
    const from = (page - 1) * limit; const to = from + limit - 1;
    let query = supabaseAdmin.from('contact_messages').select('*', { count: 'exact' }).range(from, to).order(sort, { ascending: order === 'asc' });
    if (searchFilters.is_read !== undefined) query = query.eq('is_read', searchFilters.is_read === 'true');
    const { data, error, count } = await query; if (error) throw error;
    return { data, meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } };
  },

  async markContactRead(id) {
    const { error } = await supabaseAdmin.from('contact_messages').update({ is_read: true }).eq('id', id);
    if (error) throw error; return true;
  },

  // Newsletter
  async subscribeNewsletter(email) {
    const { error } = await supabaseAdmin.from('newsletter_subscribers').insert({ email });
    if (error && error.code !== '23505') throw error; return true;
  },

  async listNewsletterSubscribers(filters = {}) {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = filters;
    const from = (page - 1) * limit; const to = from + limit - 1;
    const { data, error, count } = await supabaseAdmin.from('newsletter_subscribers').select('*', { count: 'exact' }).eq('is_active', true).range(from, to).order(sort, { ascending: order === 'asc' });
    if (error) throw error;
    return { data, meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } };
  },

  // Storage - Handle image uploads
  async uploadImage(file, folder = 'products') {
    const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { data, error } = await supabaseAdmin.storage.from('images').upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) throw error;
    const { publicUrl: urlData } = supabaseAdmin.storage.from('images').getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  async deleteImage(url) {
    try {
      const path = url.split('/images/')[1];
      if (!path) return;
      await supabaseAdmin.storage.from('images').remove([path]);
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  }
};

export default supabaseService;
