# 🚗 Cargo Parts - KSA Auto Parts Marketplace

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.14.0-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**A bilingual (Arabic/English), RTL-first marketplace for finding and ordering used OEM auto parts from KSA scrapyards**

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

## 🌟 Overview

Cargo Parts is a modern, production-ready marketplace platform specifically designed for the Saudi Arabian auto parts market. Built with Next.js 15 and TypeScript, it offers a comprehensive solution for connecting scrapyards, dealers, and customers in a seamless, bilingual experience.

### 🎯 Key Highlights

- **🌍 Bilingual Support**: Arabic-first design with RTL support and English fallback
- **🔍 Smart Search**: Advanced search with vehicle compatibility matching (year overlap logic)
- **👥 Multi-Role System**: Buyers, Sellers, Admins with comprehensive role-based access control
- **📱 Responsive Design**: Mobile-first approach with progressive web app capabilities
- **🔐 Enterprise Security**: JWT authentication, OTP verification, and comprehensive authorization
- **💰 Payment Integration**: Saudi-specific payment gateways (Tap, HyperPay, MADA)
- **📊 Business Intelligence**: Real-time analytics and reporting for sellers

## ✨ Features

### 🛒 For Buyers
- **Vehicle-Specific Search**: Search by make, model, year, VIN decode
- **Advanced Filtering**: Filter by condition, price, location, seller rating
- **Real-time Inventory**: Live stock updates and availability
- **Secure Checkout**: Multi-payment options with SAR currency support
- **Order Tracking**: Complete order lifecycle management

### 🏪 For Sellers
- **Inventory Management**: Comprehensive listing management with photo uploads
- **Analytics Dashboard**: Revenue tracking, performance metrics, growth analytics
- **Order Management**: Complete order processing workflow
- **Customer Communication**: Built-in messaging system
- **Verification System**: Business verification for trusted seller status

### 🔧 For Administrators
- **User Management**: Complete user and seller administration
- **Content Moderation**: Listing approval and review system
- **Analytics**: Platform-wide metrics and business intelligence
- **Configuration**: Dynamic business rules and content management

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Internationalization**: next-intl with Arabic/English support
- **State Management**: React Server Components + Client Components

### Backend
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies + OTP verification
- **API**: RESTful APIs with validation (Zod)
- **File Storage**: Supabase/S3 with signed URLs
- **Payments**: Tap, HyperPay, MADA integration
- **Email/SMS**: Multi-provider support for notifications

### Infrastructure
- **Deployment**: Vercel (recommended) or AWS/Docker
- **Database**: PostgreSQL (AWS RDS, Supabase, or local)
- **Cache**: Redis for session management and caching
- **CDN**: Vercel Edge Network or CloudFlare
- **Monitoring**: Built-in analytics and error tracking

## 📦 Installation

### Prerequisites
- Node.js 20+ 
- PostgreSQL 14+
- npm/yarn/pnpm

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cargoparts.git
cd cargoparts
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

5. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cargoparts"

# Authentication
JWT_SECRET="your-secure-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"

# Payment Gateways
TAP_SECRET_KEY="your-tap-secret-key"
HYPERPAY_ACCESS_TOKEN="your-hyperpay-token"

# File Upload
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# Email/SMS
SMTP_HOST="your-smtp-host"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
SMS_API_KEY="your-sms-api-key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEFAULT_LOCALE="ar"
```

## 🏗️ Architecture

### Project Structure
```
cargoparts/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized pages
│   │   ├── shop/          # Shop pages (browse, search, detail)
│   │   ├── seller/        # Seller dashboard and management
│   │   └── admin/         # Admin panel
│   └── api/               # API routes
├── components/
│   ├── ui/                # Base UI components (shadcn/ui)
│   └── features/          # Business logic components
├── lib/
│   ├── auth/              # Authentication utilities
│   ├── catalog/           # Product catalog services
│   ├── orders/            # Order management
│   ├── payments/          # Payment processing
│   └── sellers/           # Seller services
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
└── public/                # Static assets
```

### Database Schema

The application uses a comprehensive PostgreSQL schema with 25+ tables:

- **User Management**: Users, sessions, verification, addresses
- **Seller System**: Seller profiles, verification, bank accounts
- **Catalog**: Categories, makes, models, listings, photos
- **Orders**: Orders, items, cart, status tracking
- **Payments**: Payment processing, webhooks, refunds
- **Communication**: Messages, notifications, reviews
- **Analytics**: Business intelligence and reporting

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed database with sample data
npm run db:push      # Push schema changes to database
```

### Development Guidelines

- **Code Style**: Follow the existing TypeScript and React patterns
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update documentation for API changes
- **Internationalization**: Always provide Arabic and English content
- **Security**: Follow security best practices for authentication and data handling

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login with OTP
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Catalog Endpoints
- `GET /api/listings` - Browse and search listings
- `GET /api/listings/[id]` - Get listing details
- `POST /api/listings` - Create listing (sellers only)
- `PUT /api/listings/[id]` - Update listing

### Order Management
- `GET /api/cart` - Get cart contents
- `POST /api/cart` - Add to cart
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders

### Seller APIs
- `GET /api/sellers/[id]/inventory` - Seller inventory
- `GET /api/sellers/[id]/analytics` - Seller analytics
- `GET /api/sellers/[id]/counts` - Navigation counts

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Docker

```bash
# Build image
docker build -t cargoparts .

# Run container
docker run -p 3000:3000 cargoparts
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🐛 Issues & Support

- **Bug Reports**: Use GitHub Issues with the bug template
- **Feature Requests**: Use GitHub Issues with the feature template
- **Questions**: Check the documentation first, then create a discussion

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

