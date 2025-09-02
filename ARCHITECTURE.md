# 🏗️ Cargo Parts - Architecture Documentation

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Architecture](#database-architecture)
- [API Design](#api-design)
- [Frontend Architecture](#frontend-architecture)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Scalability Considerations](#scalability-considerations)

## Overview

Cargo Parts is a modern, production-ready marketplace platform specifically designed for the Saudi Arabian auto parts market. The architecture follows a **modular monolith** approach with clear separation of concerns, making it easy to scale and potentially extract services in the future.

### Key Architectural Principles

1. **Arabic-First Design**: All components support Arabic/RTL as the primary language
2. **Server-First Development**: Prefer Server Components and Server Actions
3. **Type Safety**: End-to-end TypeScript with strict type checking
4. **Security by Design**: Built-in security measures throughout the stack
5. **Performance Optimized**: Database optimizations, caching, and minimal client-side JS
6. **Scalable Foundation**: Designed to handle growth from prototype to enterprise

## Tech Stack

### Frontend
```
Next.js 15.4.6 (App Router)    → React framework with latest features
TypeScript 5.0                 → Type-safe development
Tailwind CSS v4                → Utility-first CSS with RTL support
shadcn/ui                      → Component library built on Radix UI
next-intl                      → Internationalization (Arabic/English)
React Hook Form + Zod          → Form handling and validation
```

### Backend
```
Node.js 20+                    → Runtime environment
Prisma 6.14.0                  → Database ORM with type safety
PostgreSQL 14+                 → Primary database
JWT + HTTP-only cookies        → Authentication system
Zod                           → Runtime validation schemas
```

### Infrastructure
```
Vercel (recommended)           → Serverless deployment platform
PostgreSQL (managed)           → Database hosting
Redis (optional)               → Caching and session storage
Supabase Storage              → File storage and uploads
```

## Project Structure

```
cargoparts/
├── 📁 app/                              # Next.js App Router
│   ├── 📁 [locale]/                     # Internationalized pages
│   │   ├── 📄 page.tsx                  # Landing page
│   │   ├── 📄 layout.tsx                # Root layout with i18n
│   │   ├── 📁 shop/                     # Customer-facing pages
│   │   │   ├── 📄 page.tsx              # Shop home/browse
│   │   │   ├── 📄 layout.tsx            # Shop layout
│   │   │   ├── 📄 shop-client.tsx       # Client-side shop logic
│   │   │   └── 📁 listing/
│   │   │       └── 📁 [id]/
│   │   │           └── 📄 page.tsx      # Product detail page
│   │   ├── 📁 seller/                   # Seller dashboard
│   │   │   ├── 📄 admin-layout.tsx      # Seller layout & navigation
│   │   │   ├── 📁 dashboard/            # Analytics & overview
│   │   │   ├── 📁 inventory/            # Inventory management
│   │   │   ├── 📁 orders/               # Order management
│   │   │   └── 📁 [various]/            # Other seller features
│   │   └── 📁 checkout/                 # Checkout flow
│   └── 📁 api/                          # API Routes
│       ├── 📁 auth/                     # Authentication endpoints
│       ├── 📁 listings/                 # Product CRUD operations
│       ├── 📁 sellers/                  # Seller management
│       ├── 📁 orders/                   # Order processing
│       └── 📁 cart/                     # Shopping cart
├── 📁 components/                       # React Components
│   ├── 📁 ui/                          # Base UI components (shadcn)
│   │   ├── 📄 button.tsx               # Button component
│   │   ├── 📄 card.tsx                 # Card component
│   │   └── 📄 [other-ui]/              # Other base components
│   └── 📁 features/                    # Business logic components
│       ├── 📄 enhanced-product-card.tsx # Product display
│       ├── 📄 cart-badge.tsx           # Cart indicator
│       ├── 📄 slide-out-cart.tsx       # Shopping cart UI
│       └── 📄 [other-features]/        # Other feature components
├── 📁 lib/                             # Shared utilities & services
│   ├── 📁 auth/                        # Authentication logic
│   │   ├── 📄 session.ts               # Session management
│   │   ├── 📄 jwt.ts                   # JWT utilities
│   │   └── 📄 user-service.ts          # User operations
│   ├── 📁 catalog/                     # Product catalog services
│   │   ├── 📄 listing-service.ts       # Listing operations
│   │   └── 📄 search-service.ts        # Search functionality
│   ├── 📁 orders/                      # Order management
│   │   ├── 📄 cart-service.ts          # Cart operations
│   │   └── 📄 order-service.ts         # Order processing
│   ├── 📁 sellers/                     # Seller management
│   │   └── 📄 seller-service.ts        # Seller operations
│   ├── 📁 payments/                    # Payment processing
│   └── 📁 utils/                       # Utility functions
├── 📁 prisma/                          # Database
│   ├── 📄 schema.prisma                # Database schema
│   ├── 📁 migrations/                  # Database migrations
│   └── 📄 seed.ts                      # Database seeding
├── 📁 public/                          # Static assets
├── 📁 messages/                        # Internationalization
│   ├── 📄 ar.json                      # Arabic translations
│   └── 📄 en.json                      # English translations
├── 📁 .github/                         # GitHub workflows
│   └── 📁 workflows/
│       ├── 📄 ci.yml                   # CI/CD pipeline
│       └── 📄 deploy.yml               # Deployment workflow
├── 📄 package.json                     # Dependencies & scripts
├── 📄 tsconfig.json                    # TypeScript configuration
├── 📄 tailwind.config.ts               # Tailwind CSS configuration
├── 📄 next.config.js                   # Next.js configuration
├── 📄 README.md                        # Project documentation
├── 📄 CONTRIBUTING.md                  # Contribution guidelines
├── 📄 CODE_OF_CONDUCT.md               # Community guidelines
├── 📄 ARCHITECTURE.md                  # This file
├── 📄 LICENSE                          # MIT license
├── 📄 .env.example                     # Environment variables template
├── 📄 .gitignore                       # Git ignore rules
└── 📄 CLAUDE.md                        # AI assistant instructions
```

## Database Architecture

### Schema Overview

The database uses PostgreSQL with a comprehensive schema designed for a multi-seller marketplace:

```sql
-- Core Entities
Users           → Authentication & profiles
Sellers         → Verified seller accounts
Listings        → Product listings with photos
Orders          → Order management & tracking
Payments        → Payment processing & webhooks
Categories      → Product categorization
Makes & Models  → Vehicle compatibility
```

### Key Tables Structure

#### 🔐 Authentication & Users
```sql
users (id, email, phone, name, role, status, ...)
user_sessions (id, user_id, token_hash, expires_at, ...)
user_verification (id, user_id, type, code, ...)
user_addresses (id, user_id, address_line1, city, ...)
```

#### 🏪 Seller Management  
```sql
sellers (id, user_id, business_name, city, verified, ...)
seller_bank_accounts (id, seller_id, account_info, ...)
seller_analytics (id, seller_id, date, revenue, orders, ...)
```

#### 📦 Product Catalog
```sql
categories (id, name_ar, name_en, parent_id, ...)
makes (id, name, name_ar, logo_url, ...)
models (id, make_id, name, start_year, end_year, ...)
listings (id, seller_id, title_ar, price_halalas, ...)
listing_photos (id, listing_id, file_path, sort_order, ...)
```

#### 🛒 Order Management
```sql
orders (id, buyer_id, seller_id, total_halalas, status, ...)
order_items (id, order_id, listing_id, quantity, ...)
order_status_history (id, order_id, status, timestamp, ...)
cart_items (id, user_id, listing_id, quantity, ...)
```

#### 💳 Payments
```sql
payments (id, order_id, amount_halalas, gateway, status, ...)
payment_webhooks (id, gateway, event_type, payload, ...)
```

### Database Optimizations

#### Indexes
```sql
-- Search performance
CREATE INDEX idx_listings_search_ar ON listings USING gin(to_tsvector('arabic', title_ar));
CREATE INDEX idx_listings_make_model ON listings(make_id, model_id);
CREATE INDEX idx_listings_price ON listings(price_halalas);

-- Order performance  
CREATE INDEX idx_orders_seller_status ON orders(seller_id, status);
CREATE INDEX idx_orders_buyer_created ON orders(buyer_id, created_at DESC);

-- Authentication
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_users_email ON users(email);
```

#### Constraints & Relationships
- Foreign key constraints for data integrity
- Check constraints for enum values
- Unique constraints for business rules
- Cascade deletes where appropriate

## API Design

### RESTful Architecture

The API follows RESTful conventions with consistent response formats:

```typescript
// Success Response
{
  "success": true,
  "data": T,
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "pagination": { "page": 1, "limit": 20, "total": 100 }
  }
}

// Error Response  
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "messageAr": "بيانات الطلب غير صحيحة",
    "details": { "field": "email", "issue": "invalid format" }
  }
}
```

### API Endpoint Categories

#### 🔐 Authentication (`/api/auth/`)
```typescript
POST /api/auth/register     → User registration
POST /api/auth/login        → OTP-based login  
POST /api/auth/logout       → Secure logout
GET  /api/auth/me           → Current user info
POST /api/auth/verify       → Email/phone verification
```

#### 👤 Users (`/api/users/`)
```typescript
GET    /api/users/me        → User profile
PUT    /api/users/me        → Update profile
GET    /api/users/stats     → User statistics
DELETE /api/users/me        → Delete account
```

#### 🏪 Sellers (`/api/sellers/`)
```typescript
POST   /api/sellers             → Apply to become seller
GET    /api/sellers/me          → Seller profile  
GET    /api/sellers/[id]/inventory   → Seller inventory
GET    /api/sellers/[id]/analytics   → Performance metrics
GET    /api/sellers/[id]/counts      → Navigation badges
```

#### 📦 Listings (`/api/listings/`)
```typescript
GET    /api/listings        → Search & browse listings
GET    /api/listings/[id]   → Single listing details
POST   /api/listings        → Create listing (seller only)
PUT    /api/listings/[id]   → Update listing  
DELETE /api/listings/[id]   → Delete listing
```

#### 🛒 Cart & Orders (`/api/cart/`, `/api/orders/`)
```typescript
GET    /api/cart            → Get cart contents
POST   /api/cart            → Add to cart
PUT    /api/cart/[id]       → Update cart item
DELETE /api/cart/[id]       → Remove from cart

POST   /api/orders          → Create order from cart
GET    /api/orders          → List user orders
GET    /api/orders/[id]     → Order details
PATCH  /api/orders/[id]     → Update order status
```

### Security Measures

#### Authentication & Authorization
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  sessionId: string;
  permissions: string[];
  exp: number;
}

// Role-based middleware
const requireRole = (roles: Role[]) => (req, res, next) => {
  const user = req.user;
  if (!user || !roles.includes(user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};
```

#### Rate Limiting
```typescript
const RATE_LIMITS = {
  '/api/auth/login': { windowMs: 15 * 60 * 1000, max: 5 },
  '/api/search': { windowMs: 60 * 1000, max: 60 },
  '/api/orders': { windowMs: 60 * 1000, max: 10 },
  'default': { windowMs: 60 * 1000, max: 100 }
};
```

## Frontend Architecture

### Component Architecture

#### Server Components (Default)
```typescript
// Used for data fetching and static content
async function ListingsPage({ params }: { params: { locale: string } }) {
  const listings = await getListings();
  return <ListingGrid listings={listings} />;
}
```

#### Client Components (Interactive)  
```typescript
'use client';
// Used only for interactive features
function SearchFilters() {
  const [filters, setFilters] = useState<FilterState>({});
  return <FilterForm filters={filters} onChange={setFilters} />;
}
```

### State Management Strategy

#### Server State
- Database queries via Prisma
- Server Actions for mutations
- Server Components for rendering

#### Client State  
- React `useState` for component state
- React `useContext` for shared state
- URL parameters for shareable state

### Internationalization Architecture

#### Translation Structure
```typescript
// messages/ar.json (Primary)
{
  "nav": {
    "home": "الرئيسية",
    "shop": "المتجر",
    "sellers": "البائعون"
  },
  "product": {
    "price": "السعر",
    "condition": "الحالة"
  }
}

// messages/en.json (Fallback)
{
  "nav": {
    "home": "Home", 
    "shop": "Shop",
    "sellers": "Sellers"
  }
}
```

#### RTL Support
```typescript
// Tailwind CSS logical properties
<div className="ps-4 pe-2 ms-auto">  // ✅ RTL-aware
<div className="pl-4 pr-2 ml-auto">  // ❌ Not RTL-aware

// Dynamic direction based on locale
const dir = locale === 'ar' ? 'rtl' : 'ltr';
<html dir={dir} lang={locale}>
```

## Security Architecture

### Authentication Flow
```
1. User enters email/phone
2. OTP sent via SMS/email  
3. OTP verified → JWT token issued
4. Token stored in HTTP-only cookie
5. Middleware validates token on each request
```

### Authorization Layers
```typescript
// API Route Protection
export async function POST(request: Request) {
  const user = await verifyToken(request);
  if (!user) return unauthorized();
  
  if (user.role !== 'SELLER') return forbidden();
  
  // Process request...
}

// Page-level Protection  
export default async function SellerPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SELLER') {
    redirect('/login');
  }
  
  return <SellerDashboard user={user} />;
}
```

### Data Protection
- Passwords: bcrypt hashing
- Sensitive data: Encryption at rest
- API keys: Environment variables only
- PII: Minimal collection, secure handling

## Deployment Architecture

### Vercel Deployment (Recommended)
```
GitHub → Vercel → Production
   ↓       ↓         ↓
  Code   Build    Deploy
  Push   Check    Live
```

### Environment Configuration
```typescript
// Production Environment
DATABASE_URL=postgresql://prod-db
JWT_SECRET=production-secret
TAP_SECRET_KEY=live-key
SUPABASE_URL=production-url

// Development Environment  
DATABASE_URL=postgresql://dev-db
JWT_SECRET=dev-secret
TAP_SECRET_KEY=sandbox-key
```

### CI/CD Pipeline
```yaml
1. Code Quality Checks
   - ESLint, TypeScript, Prettier
   
2. Build & Test  
   - Next.js build
   - Database migrations
   - Unit tests
   
3. Security Scanning
   - Dependency audit
   - CodeQL analysis
   
4. Deployment
   - Preview deployment (PRs)
   - Production deployment (main)
```

## Scalability Considerations

### Current Architecture (Phase 1)
```
Single Next.js Application
├── Server Components (SSR)
├── API Routes (Serverless)  
├── PostgreSQL Database
└── File Storage (Supabase)

Supports: ~10K active users, ~50K listings
```

### Scaling Path (Phase 2)
```
Enhanced Monolith
├── Multiple Vercel Functions
├── Database Read Replicas  
├── Redis Caching Layer
├── CDN for Static Assets
└── Search Engine (Elasticsearch)

Supports: ~100K active users, ~500K listings
```

### Microservices Evolution (Phase 3)
```
Service Architecture
├── User Service (Authentication)
├── Catalog Service (Products)
├── Order Service (Transactions)
├── Payment Service (Billing)
├── Search Service (Discovery)
└── Analytics Service (Insights)

Supports: 1M+ users, millions of listings
```

### Performance Optimizations

#### Database Level
- Connection pooling (PgBouncer)
- Query optimization with indexes
- Materialized views for analytics
- Database partitioning for large tables

#### Application Level  
- Server-side rendering (SSR)
- Static generation where possible
- Image optimization (next/image)
- Code splitting and lazy loading

#### Infrastructure Level
- CDN for static assets
- Edge caching (Vercel Edge)
- Geographic distribution
- Load balancing

---

<div align="center">
  <p><strong>This architecture is designed to grow with your business</strong></p>
  <p>🚀 From startup to enterprise scale</p>
</div>