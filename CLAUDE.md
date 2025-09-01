# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cargo Parts is a bilingual (Arabic/English), RTL-first marketplace for finding and ordering used OEM auto parts from KSA scrapyards. This is a Next.js POC (Proof of Concept) built with App Router and TypeScript.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# TypeScript type checking (no built-in script yet, use):
npx tsc --noEmit
```

## Architecture & Structure

### Tech Stack
- **Framework**: Next.js 15.4.6 with App Router (server-first approach)
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui (built on Radix UI) - Arabic-first with RTL support
- **Database**: PostgreSQL via Prisma (schema in `prisma/schema.prisma`)
- **i18n**: next-intl with Arabic as default locale
- **Forms**: React Hook Form + Zod for validation
- **Payments**: Tap/HyperPay sandbox integration via API route handlers
- **Storage**: Supabase/S3 with signed URLs for images

### Key Architectural Patterns

1. **Server-First Development**: Prefer Server Components, Server Actions, and Route Handlers. Client components should be minimal and opt-in only for interactivity.

2. **Modular Monolith**: Isolated modules for future extraction:
   - `auth` - Email OTP, JWT session cookies, RBAC
   - `catalog` - Listings, OEM numbers, make/model/year fitment
   - `search` - Text ranking + year overlap compatibility
   - `orders` - Carts, orders, state machine, totals
   - `payments` - Intents + webhooks (idempotent)
   - `shipping` - Mock rates initially, real labels later
   - `admin` - Seller verification, listing moderation

3. **Feature Organization**:
   - UI components: `components/ui/*` (shadcn base) and `components/features/*`
   - Domain logic: `lib/<domain>/*`
   - Routes: Colocate UI, data fetching, and loading/error states per route segment

### Planned Route Structure
```
app/
  (marketing)/page.tsx           # Landing page
  (shop)/
    page.tsx                      # Shop home
    results/page.tsx              # Search results
    listing/[id]/page.tsx         # Listing detail
    cart/page.tsx                 # Shopping cart
    checkout/page.tsx             # Checkout flow
  (seller)/
    dashboard/page.tsx            # Seller dashboard
    listings/page.tsx             # Manage listings
    listings/new/page.tsx         # Create listing
  api/*                           # Route handlers
```

## Critical Development Rules

### RTL & Internationalization
- Arabic is the default locale with English fallback
- Use logical CSS properties (`ps-`, `pe-`, `ms-`, `me-`) instead of physical (`left`, `right`)
- Localize all strings using next-intl
- Format currency as SAR by default

### Type Safety & Validation
- No `any` types - maintain end-to-end type safety
- Use Zod for runtime validation on ALL inputs (API, server actions, environment variables)
- Implement `env.mjs` pattern to parse `process.env` with Zod at boot

### Performance
- Minimize client-side JavaScript - use client components only for interactivity
- Implement proper database indexes
- Use `SELECT` specific columns (avoid `SELECT *`)
- Lazy-load modals and forms
- Use next/image for image optimization

### Security
- Auth cookies must be HttpOnly, SameSite=Lax/Strict, Secure in production
- Server-side authorization guards for all actions
- File uploads via signed URLs with MIME/size verification
- HMAC verification for webhooks with idempotency keys
- Rate limiting on OTP, login, search, and payment endpoints

### Error Handling
- Use Route Segment Error Boundaries
- Never leak stack traces to users
- Standard error format: `{ code, message, details? }` with localized messages

## Key User Flows

1. **Buyer Flow**: VIN decode → search → results → detail → cart → checkout → payment → tracking
2. **Seller Flow**: Create listing with photos → instantly searchable

## Environment Setup

Create `.env` file based on `.env.example` with:
- Database URL (PostgreSQL)
- Storage configuration (Supabase/S3)
- Payment gateway keys (sandbox)
- Webhook secrets
- Default locale (ar)

## Important Notes

- This is a POC focusing on search accuracy, seller onboarding, and end-to-end checkout
- The project uses a clean Next.js setup from create-next-app
- Path aliases are configured with `@/*` mapping to the root directory
- ESLint v9 is configured for code quality