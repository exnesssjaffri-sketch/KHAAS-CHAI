# Khaas Chai Backend API

Production-ready Node.js + Express backend for Khaas Chai tea brand website.

## Tech Stack

- **Runtime**: Node.js 18+ (ES Modules)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Auth**: Custom JWT with Supabase Auth
- **Validation**: Zod
- **Security**: Helmet, Rate Limiting, CORS

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=3000
NODE_ENV=development

# Supabase (from Dashboard > Settings > API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT (generate secure random strings)
JWT_SECRET=your-32-char-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-32-char-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

Run the SQL migrations in Supabase SQL Editor in order:
1. `supabase/migrations/001_schema.sql` - Creates all tables, functions, RLS policies
2. `supabase/migrations/002_seed.sql` - Inserts sample data

### 4. Create Admin User

```bash
# Option 1: Supabase CLI
supabase auth users create admin@khaaschai.com --password "your-password" --email-confirm

# Option 2: Supabase Dashboard > Authentication > Users > Add User
# Then run in SQL Editor:
UPDATE profiles SET role = 'admin' WHERE email = 'admin@khaaschai.com';
```

### 5. Create Storage Bucket

In Supabase Dashboard > Storage:
1. Create bucket named `images`
2. Set public access
3. Add policy for authenticated uploads

### 6. Run Server

```bash
npm run dev  # Development with auto-reload
npm start    # Production
```

Server runs at `http://localhost:3000`

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register customer | No |
| POST | `/api/v1/auth/login` | Login | No |
| POST | `/api/v1/auth/refresh-token` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout | Yes |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |
| PUT | `/api/v1/auth/update-profile` | Update profile | Yes |
| PUT | `/api/v1/auth/change-password` | Change password | Yes |

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/products` | List products (paginated, filtered) | No |
| GET | `/api/v1/products/featured` | Get featured products | No |
| GET | `/api/v1/products/:id` | Get single product | No |
| POST | `/api/v1/products` | Create product | Admin |
| PUT | `/api/v1/products/:id` | Update product | Admin |
| DELETE | `/api/v1/products/:id` | Delete product | Admin |

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/categories` | List active categories | No |
| GET | `/api/v1/categories/:id` | Get category | No |
| POST | `/api/v1/categories` | Create category | Admin |
| PUT | `/api/v1/categories/:id` | Update category | Admin |
| DELETE | `/api/v1/categories/:id` | Delete category | Admin |

### Cart
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/cart` | Get user cart | Yes |
| POST | `/api/v1/cart` | Add to cart | Yes |
| PUT | `/api/v1/cart/:id` | Update cart item | Yes |
| DELETE | `/api/v1/cart/:id` | Remove from cart | Yes |
| DELETE | `/api/v1/cart/clear` | Clear cart | Yes |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/orders` | Place order | Yes |
| GET | `/api/v1/orders/my` | Get my orders | Yes |
| GET | `/api/v1/orders/:id` | Get order details | Yes |
| PATCH | `/api/v1/orders/:id/cancel` | Cancel order | Yes |
| GET | `/api/v1/orders` | List all orders (admin) | Admin |
| PATCH | `/api/v1/orders/:id/status` | Update order status | Admin |

### Inventory (Admin/Staff)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/inventory` | List inventory | Admin |
| GET | `/api/v1/inventory/low-stock` | Low stock alerts | Admin |
| GET | `/api/v1/inventory/logs` | Stock change logs | Admin |
| PATCH | `/api/v1/inventory/stock` | Update stock | Admin |
| POST | `/api/v1/inventory/restock` | Restock product | Admin |

### Admin Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/admin/dashboard/stats` | Dashboard stats | Admin |
| GET | `/api/v1/admin/dashboard/sales-chart` | Sales chart data | Admin |
| GET | `/api/v1/admin/dashboard/top-products` | Top products | Admin |
| GET | `/api/v1/admin/dashboard/recent-orders` | Recent orders | Admin |
| GET | `/api/v1/admin/users` | List users | Admin |
| PATCH | `/api/v1/admin/users/:id/role` | Change user role | Admin |
| PATCH | `/api/v1/admin/users/:id/block` | Block/unblock user | Admin |
| DELETE | `/api/v1/admin/users/:id` | Delete user | Admin |
| GET | `/api/v1/admin/contact-messages` | Contact messages | Admin |
| GET | `/api/v1/admin/newsletter` | Newsletter subscribers | Admin |

### Reviews
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/reviews/:productId` | List product reviews | No |
| POST | `/api/v1/reviews/:productId` | Add review | Yes |
| DELETE | `/api/v1/reviews/:id` | Delete review | Owner/Admin |

### Misc
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/contact` | Submit contact form | No |
| POST | `/api/v1/newsletter` | Subscribe newsletter | No |
| POST | `/api/v1/payment-intent` | Create payment intent | Yes |
| GET | `/api/v1/health` | Health check | No |

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

## Authentication

Include JWT in Authorization header:
```
Authorization: Bearer <access_token>
```

Token expires in 15 minutes. Use refresh token to get new access token.

## Roles

- **customer**: Default role, can browse, cart, order, review
- **staff**: Inventory management, order status updates
- **admin**: Full access including user management, analytics

## Frontend Integration

See `../src/services/api.js` for the Axios service layer with interceptors.

## File Upload

Upload images to Supabase Storage:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
const response = await api.post('/api/v1/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

## Testing

```bash
# Health check
curl http://localhost:3000/api/v1/health

# List products
curl http://localhost:3000/api/v1/products

# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## Deployment

### Backend (Railway/Render/Fly.io)
1. Set all environment variables
2. Build command: `npm install`
3. Start command: `npm start`

### Frontend (Vercel/Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## License

MIT