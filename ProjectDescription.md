📦 Documentation Pack for Cargo Parts (Next.js POC)

This single document contains the contents of multiple project files you can copy into your repo. Each section starts with a file path and full file contents.

⸻

FILE: README.md

Cargo Parts — Next.js POC

A bilingual (AR/EN), RTL-first marketplace to find and order used OEM auto parts from KSA scrapyards. Built with Next.js (App Router) + TypeScript, with seller onboarding, VIN/model search, listing detail, cart, checkout, and sandbox payments.

✨ Features (POC)
•	VIN/model/year search → results with fitment score
•	Listing detail with photos, condition, city, price (SAR)
•	Seller portal: create/edit listings, image upload (signed URLs)
•	Cart → Checkout → Payment intent (sandbox) → Webhook capture
•	Arabic-first i18n & RTL; English toggle
•	Postgres (Prisma) + Storage (Supabase/S3) + Redis (optional)

🧱 Stack
•	Next.js 14 (App Router), TypeScript, Tailwind, Radix UI, shadcn/ui, shadcn/ui, shadcn/ui
•	Prisma → PostgreSQL (Supabase OK for POC)
•	next-intl for i18n (AR default)
•	React Hook Form + Zod
•	Payments: Tap/HyperPay (sandbox) via API route handlers
•	Storage: Supabase/S3 with signed URLs

🚀 Getting Started
1.	Clone repo and install deps

pnpm i


	2.	Create DB and set env vars (see .env.example).
	3.	Push schema & seed

pnpm prisma db push && pnpm prisma db seed


	4.	Run dev

pnpm dev



📂 App Structure (high level)

app/
(marketing)/page.tsx
(shop)/{page.tsx, results/page.tsx, listing/[id]/page.tsx, cart/page.tsx, checkout/page.tsx}
(seller)/{dashboard/page.tsx, listings/page.tsx, listings/new/page.tsx}
api/* route handlers (auth, vin, search, listings, orders, payments, shipping)
lib/* (db, auth, i18n, upload, payments)
components/ui/* (shadcn components)  components/features/*
prisma/schema.prisma

🧪 Scripts
•	pnpm dev — run Next.js
•	pnpm typecheck — TypeScript
•	pnpm lint — ESLint
•	pnpm test — Vitest/Jest (pick one)
•	pnpm e2e — Playwright (basic checkout path)

🗺 Roadmap (POC)
•	Week 1–2: scaffolding, i18n, schema, seller create listing
•	Week 3–4: search, results, detail, uploads, cart
•	Week 5–6: checkout, payments webhook, tracking
•	Week 7–8: polish, reviews (basic), deploy

⸻

FILE: docs/OVERVIEW.md

Product Overview (Cargo Parts)

Cargo Parts connects individual car owners with scrapyards (تشليح) to buy used OEM parts online, with delivery across KSA. POC validates: search accuracy, seller onboarding, and end‑to‑end checkout.

Users
•	Buyer: AR-first, mobile-heavy, wants fitment confidence, price transparency, delivery.
•	Seller (Yard): fast listing flow, photo upload, simple pricing, order notifications.

Key Flows (POC)
1.	VIN decode → search → results → detail → cart → checkout → payment → tracking.
2.	Seller creates listing with photos → instantly searchable.

Non-goals (POC)
•	RFQ/Request-a-Part marketplace (phase 2)
•	Advanced logistics (freight orchestration)
•	Complex dispute/warranty center (basic policy only)

⸻

FILE: docs/ARCHITECTURE.md

Architecture (POC → Scale)

UI components via shadcn/ui (built on Radix).

UI components via shadcn/ui (built on Radix).

UI components via shadcn/ui (built on Radix).

Runtime
•	Next.js (App Router) with a BFF pattern using Route Handlers and Server Actions.
•	Start as a modular monolith; isolate modules (auth, catalog, orders, payments, shipping) for future extraction.

Data Layer
•	PostgreSQL via Prisma (schema in prisma/schema.prisma).
•	Storage (Supabase/S3) with signed URLs for images.
•	Search: Postgres FTS + trigram (Elastic later).
•	Cache/Queues: Redis (optional in POC; required when adding chat/notifications).

Key Services (as modules)
•	auth — email OTP; JWT session cookie; RBAC.
•	catalog — listings, OEM number, make/model/year fitment ranges.
•	search — text ranking + year overlap compatibility bonus.
•	orders — carts, orders, state machine, totals.
•	payments — intents + webhooks (idempotent).
•	shipping — mock rates; real labels later.
•	admin — verify sellers, moderate listings.

API Contracts (selected)
•	POST /api/vin/decode → mock decode
•	GET /api/search → results {items,total}
•	POST /api/listings (seller)
•	POST /api/orders → create order, totals
•	POST /api/payments/intent → client secret / redirect
•	POST /api/payments/webhook → verify HMAC → mark PAID

Observability & Security
•	Request ID per API call; structured logs (pino).
•	Error boundaries; centralized error util mapping to AR/EN messages.
•	Rate limits on OTP/search; CSRF safe (API only + same-site cookies).
•	Secrets in .env (use Vercel + Supabase secrets in prod).

⸻

FILE: docs/NEXTJS_PRO_RULES.md

Rules for Professional Next.js Applications (Team Playbook)

0) UI Kit
   •	Use shadcn/ui for base primitives (Button, Input, Card, Dialog, Sheet, Dropdown). Extend via wrappers in components/ui/ with AR/EN props and RTL awareness.

1) Architecture & Code Organization
   •	App Router only; colocate UI, data fetching, and loading/error states per route segment.
   •	Server-first: Prefer Server Components, Server Actions, and Route Handlers. Keep client components minimal and opt-in.
   •	Feature folders: components/features/<feature> and lib/<domain>; no mega utils.
   •	Explicit boundaries: Modules (auth, catalog, orders, payments) expose typed service functions.

2) Type Safety & Validation
   •	End-to-end types with TypeScript (no any).
   •	Zod for runtime validation on all inputs (API, server actions, env).
   •	env.mjs pattern: parse process.env with Zod at boot; crash fast if invalid.

3) Data Fetching & Caching
   •	Use fetch with cache semantics or Server Actions. Choose a strategy per route:
   •	Static (force-cache) for marketing pages.
   •	Revalidate with revalidate: <seconds> for catalogs.
   •	No-store for personalized data (cart, dashboard).
   •	Memoize expensive server functions; avoid N+1 with batch queries.

4) Performance
   •	Ship less JS: client components only for interactivity.
   •	Code-splitting by route; lazy-load modals/forms.
   •	Image optimization (next/image), responsive sizes.
   •	DB: proper indexes; use SELECT columns (no *).

5) i18n & RTL
   •	next-intl with AR default; English fallback.
   •	Use logical CSS props (ps-, pe-, ms-, me-).
   •	Localize currency/number/date; SAR by default; Eastern numerals toggle.

6) Security
   •	Auth cookies: HttpOnly, SameSite=Lax/Strict, Secure in prod.
   •	Authorization: server-side guards per action; no role checks only in client.
   •	File uploads: signed URLs; verify mime/size; scan if needed.
   •	Webhooks: HMAC verification; idempotency keys.
   •	Rate limits for OTP, login, search, payments.

7) Errors & Reliability
   •	Use Route Segment Error Boundaries. Never leak stack traces to users.
   •	Standard error format { code, message, details? } (localized message at edge).
   •	Background jobs retried with backoff; dedupe by key.

8) Testing
   •	Unit: business logic and Zod schemas.
   •	Integration: API route handlers with a test DB.
   •	E2E: Playwright happy path (VIN→checkout).
   •	PRs require green typecheck + lint + tests.

9) DX & CI/CD
   •	Conventional Commits (feat:, fix:, chore: …) + Changesets for versioning.
   •	GitHub Actions: typecheck, lint, test, build; deploy preview on PR.
   •	Keep .env.example current; secrets in CI as masked vars.

10) Accessibility & UX
    •	All interactive controls keyboard reachable; focus ring visible.
    •	Color contrast >= WCAG AA; RTL-friendly layouts.
    •	Forms with labels, ARIA where needed; error summaries.

11) Observability
    •	Structured logs with request IDs.
    •	Frontend error tracking (Sentry) + backend (Sentry/OTel).
    •	Health endpoint and simple readiness checks.

12) Code Review Checklist (Quick)
    •	Domain logic on server? ✅
    •	Inputs zod-validated? ✅
    •	i18n strings & RTL-safe? ✅
    •	Caching chosen explicitly? ✅
    •	Error states covered? ✅
    •	Tests updated? ✅

⸻

FILE: docs/CONTRIBUTING.md

Contributing Guide

Branching & Commits
•	main is protected. Feature branches: feat/<area>-<short>.
•	Conventional Commits. Example: feat(search): add trgm index.

PR Guidelines
•	Keep PRs < 400 lines net diff if possible.
•	Checklist:
•	Types added/updated
•	Zod validation
•	AR/EN strings
•	RTL checked
•	Tests
•	Screenshots for UI

Code Style
•	Prettier + ESLint; no disable rules without reason.
•	No any///@ts-ignore unless justified and linked to issue.

⸻

FILE: docs/SECURITY.md

Security Practices
•	Store secrets outside the repo; rotate regularly.
•	Enforce 2FA on GitHub and deployments.
•	Validate all webhooks (HMAC); log signature failures.
•	File uploads: size limit, MIME allowlist, strip EXIF.
•	Payments: use hosted fields/SDK from gateway; never store card data.
•	PII: minimal collection, encrypt at rest if stored server-side.

⸻

FILE: docs/API_CONTRACTS.md

API Contracts (POC)

POST /api/vin/decode
•	Body: { vin: string }
•	200: { make, model, year, trim? }

GET /api/search
•	Query: q, make, model, year, oem, city, sort, page
•	200: { items: Listing[], total }

POST /api/listings (seller)
•	Body: { titleAr, priceSar, make, model, fromYear, toYear, photos[], ... }
•	201: { id }

POST /api/orders
•	Body: { items: [{listingId, qty}], address }
•	200: { orderId, total }

POST /api/payments/intent
•	Body: { orderId }
•	200: { clientSecret | redirectUrl }

POST /api/payments/webhook
•	Body: gateway event
•	200: { ok: true } (after signature verify)

⸻

FILE: .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ksa_salvage

# i18n
DEFAULT_LOCALE=ar

# Storage (Supabase/S3)
STORAGE_BUCKET=parts
STORAGE_PUBLIC_URL=https://.../public
STORAGE_SIGNING_KEY=...

# Payments (Sandbox)
PAYMENTS_PUBLIC_KEY=pk_test_...
PAYMENTS_SECRET_KEY=sk_test_...
WEBHOOK_SECRET=whsec_...


⸻

FILE: docs/DECISIONS.md (ADRs)
•	ADR-001: App Router over Pages Router — better colocation & server-first patterns.
•	ADR-002: Prisma over TypeORM — DX speed for POC; migrate later if needed.
•	ADR-003: Postgres FTS + trigram for POC search — migrate to Elastic when >200k listings.
•	ADR-004: Email OTP first — lower friction; SMS later for KSA numbers.
•	ADR-005: Supabase Storage with signed URLs — simplest start, S3 parity later.

⸻

FILE: docs/TEAM_ONBOARDING.md

Setup in Claude Code / local
1.	Duplicate .env.example → .env and fill values.
2.	pnpm i → pnpm prisma db push → pnpm dev.
3.	Use AR as default locale; test English toggle.
4.	Create a seller from seed or via /seller dashboard → post first listing.

Dev Conventions
•	One feature per PR. Keep routes and server actions close to UI.
•	Translate strings as you code; don’t leave TODO i18n.
•	Prefer server utilities over client fetches.

⸻

FILE: docs/NEXT_STEPS.md
•	Generate Prisma schema & seed
•	Stub API route handlers (VIN, search, listings, orders, payments)
•	Scaffolding UI pages with placeholders
•	Add Playwright e2e for the happy path