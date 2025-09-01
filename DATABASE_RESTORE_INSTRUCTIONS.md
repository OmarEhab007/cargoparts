# Database Connection Restoration Instructions

## Issue Summary
The database connection was temporarily disabled due to a port conflict between local PostgreSQL and Docker container.

## What was done
1. **Port Change**: Changed Docker PostgreSQL from port 5432 to 5433
2. **Temporary Fix**: Disabled database calls in:
   - `app/[locale]/shop/page.tsx` (line 1 commented out, returns empty array)
   - `app/api/listings/route.ts` (lines 25-35 return empty results)

## To Restore Database Functionality

### 1. Verify Docker is running
```bash
docker ps | grep cargo-parts-db
```

### 2. Test database connection
```bash
psql "postgresql://cargo:cargo@127.0.0.1:5433/cargo_parts" -c "SELECT 1"
```

### 3. Generate Prisma client (if needed)
```bash
npx prisma generate
```

### 4. Run migrations (if needed)
```bash
npx prisma db push
```

### 5. Restore shop page
Uncomment line 1 in `app/[locale]/shop/page.tsx`:
```typescript
import { listingService } from '@/lib/catalog/listing-service';
```

And replace lines 5-7:
```typescript
// FROM:
const listings: any[] = [];

// TO:
const { listings } = await listingService.getListings({}, 1, 20);
```

### 6. Restore API route
In `app/api/listings/route.ts`, replace lines 25-35 with:
```typescript
const result = await listingService.getListings(
  {
    make: params.make,
    model: params.model,
    yearFrom: params.yearFrom,
    yearTo: params.yearTo,
    condition: params.condition,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    search: params.search,
    sellerId: params.sellerId,
  },
  params.page || 1,
  params.limit || 20
);
```

## Current Status
- ✅ Server running on http://localhost:3000
- ✅ Design system page working: http://localhost:3000/ar/design-system
- ✅ Shop page loads (empty listings): http://localhost:3000/ar/shop  
- ✅ API returns empty results: http://localhost:3000/api/listings
- ❌ Database calls temporarily disabled

## Database Configuration
- **Host**: 127.0.0.1
- **Port**: 5433 (changed from 5432)
- **Database**: cargo_parts
- **Username**: cargo  
- **Password**: cargo