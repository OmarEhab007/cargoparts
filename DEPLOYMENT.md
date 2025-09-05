# 🚀 CargoParts Deployment Guide

This guide provides step-by-step instructions for deploying CargoParts to production environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Deployment Options](#deployment-options)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Docker Deployment](#docker-deployment)
  - [AWS Deployment](#aws-deployment)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- [ ] **Domain name** registered and configured
- [ ] **SSL certificate** (handled automatically by most platforms)
- [ ] **PostgreSQL database** (production-ready)
- [ ] **Redis instance** for sessions and caching
- [ ] **Payment gateway accounts** (Tap Payment, HyperPay)
- [ ] **Email service** (Mailgun, SendGrid, or SMTP)
- [ ] **SMS service** (Unifonic for Saudi Arabia)
- [ ] **File storage** (AWS S3 or Supabase)

## Environment Setup

### 1. Production Environment Variables

Copy `.env.production` template and fill in all values:

```bash
cp .env.production .env.local
```

**Critical Variables to Update:**

```env
# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Database (use production credentials)
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Security (generate strong secrets)
JWT_SECRET="your-64-character-secret"
OTP_SECRET="your-32-character-secret"

# Payment (production keys)
TAP_API_KEY="sk_live_..."
TAP_SECRET_KEY="sk_..."
TAP_SANDBOX_MODE="false"

# Storage (production S3 bucket)
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
S3_BUCKET="your-production-bucket"
```

### 2. Generate Production Secrets

```bash
# Generate JWT secret (64 characters)
openssl rand -base64 48

# Generate OTP secret (32 characters)
openssl rand -base64 24
```

## Database Setup

### 1. Production Database

**Option A: AWS RDS (Recommended for AWS deployment)**

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier cargoparts-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 16.1 \
  --master-username cargoparts \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 100 \
  --storage-type gp2 \
  --multi-az \
  --publicly-accessible
```

**Option B: Supabase (Managed PostgreSQL)**

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings > Database
3. Update `DATABASE_URL` in environment variables

**Option C: Neon (Serverless PostgreSQL)**

1. Create database at [neon.tech](https://neon.tech)
2. Copy connection string
3. Update `DATABASE_URL` in environment variables

### 2. Run Migrations

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Deploy migrations to production database
npx prisma migrate deploy

# Optionally seed with initial data
npx prisma db seed
```

### 3. Database Optimization

```bash
# Create performance indexes (run these SQL commands)
-- Listings search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_search 
ON "Listing" USING gin(to_tsvector('english', "titleAr" || ' ' || COALESCE("titleEn", '')));

-- Vehicle compatibility indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_vehicle 
ON "Listing" ("make", "model", "fromYear", "toYear");

-- Location-based search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_location 
ON "Listing" ("city", "status", "createdAt");

-- Seller analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_seller_analytics 
ON "Order" ("sellerId", "status", "createdAt");
```

## Deployment Options

### Vercel (Recommended)

#### Prerequisites
- GitHub repository
- Vercel account
- Production database ready

#### Steps

1. **Connect Repository to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel --prod
```

2. **Configure Environment Variables in Vercel Dashboard**

   - Go to Project Settings > Environment Variables
   - Add all production environment variables
   - Ensure sensitive variables are marked as "Sensitive"

3. **Domain Configuration**

   - Add your custom domain in Vercel dashboard
   - Configure DNS records as instructed
   - SSL certificate will be automatically provisioned

4. **Deploy**

   ```bash
   # Deploy to production
   git push origin main
   
   # Or deploy manually
   vercel --prod
   ```

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### Docker Deployment

#### 1. Build Docker Image

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
    restart: unless-stopped

volumes:
  redis_data:
```

#### 3. Deploy with Docker

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Update deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### AWS Deployment

#### 1. ECS with Fargate

**Create Task Definition:**

```json
{
  "family": "cargoparts-prod",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "cargoparts-app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/cargoparts:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:region:account:parameter/cargoparts/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/cargoparts",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

**Deploy with AWS CLI:**

```bash
# Create ECR repository
aws ecr create-repository --repository-name cargoparts

# Build and push image
docker build -t cargoparts .
docker tag cargoparts:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/cargoparts:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/cargoparts:latest

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster cargoparts-cluster \
  --service-name cargoparts-service \
  --task-definition cargoparts-prod:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-abcdef],assignPublicIp=ENABLED}"
```

#### 2. Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name cargoparts-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-abcdef

# Create target group
aws elbv2 create-target-group \
  --name cargoparts-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-12345 \
  --target-type ip \
  --health-check-path /api/health

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:region:account:loadbalancer/app/cargoparts-alb/123456 \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:region:account:certificate/123456 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/cargoparts-targets/123456
```

## Post-Deployment

### 1. Health Checks

Create health check endpoint:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Database connection failed'
    }, { status: 503 });
  }
}
```

### 2. Domain and SSL Configuration

**DNS Records:**
```
Type    Name              Value
A       @                 your-server-ip
CNAME   www               your-domain.com
MX      @                 mail.your-domain.com
TXT     @                 "v=spf1 include:mailgun.org ~all"
```

### 3. CDN Setup

**CloudFront Configuration:**
```json
{
  "Origins": [
    {
      "DomainName": "your-app.vercel.app",
      "Id": "vercel-origin",
      "CustomOriginConfig": {
        "HTTPPort": 443,
        "OriginProtocolPolicy": "https-only"
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "vercel-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "optimized-for-uncompressed-files"
  }
}
```

## Monitoring & Maintenance

### 1. Monitoring Setup

**Sentry Integration:**
```typescript
// sentry.config.js
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // Your Next.js config
};

export default withSentryConfig(nextConfig, {
  org: 'your-org',
  project: 'cargoparts',
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
```

### 2. Log Management

```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});

export default logger;
```

### 3. Backup Strategy

**Database Backups:**
```bash
#!/bin/bash
# backup.sh - Daily database backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="cargoparts"

# Create backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/cargoparts_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/cargoparts_$DATE.sql"

# Upload to S3
aws s3 cp "$BACKUP_DIR/cargoparts_$DATE.sql.gz" s3://your-backup-bucket/database/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "cargoparts_*.sql.gz" -mtime +30 -delete
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check connection pool status
# Add to your health check endpoint
const pool = await prisma.$queryRaw`
  SELECT count(*) as connection_count 
  FROM pg_stat_activity 
  WHERE datname = current_database();
`;
```

#### 2. Memory Issues
```bash
# Monitor memory usage
docker stats

# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096"
```

#### 3. Payment Gateway Issues
```bash
# Test webhook endpoints
curl -X POST https://your-domain.com/api/webhooks/tap \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check payment gateway configuration
echo $TAP_SANDBOX_MODE  # Should be "false" in production
```

#### 4. SSL Certificate Issues
```bash
# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Verify certificate expiration
echo | openssl s_client -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Performance Optimization

#### 1. Database Query Optimization
```sql
-- Analyze slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Add missing indexes
EXPLAIN ANALYZE SELECT * FROM "Listing" WHERE "make" = 'Toyota';
```

#### 2. Caching Strategy
```typescript
// Implement Redis caching
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedData(key: string) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedData(key: string, data: any, ttl = 3600) {
  await redis.setex(key, ttl, JSON.stringify(data));
}
```

#### 3. Image Optimization
```typescript
// next.config.js
const nextConfig = {
  images: {
    domains: ['your-s3-bucket.s3.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
};
```

### Support and Maintenance

#### 1. Update Process
```bash
# 1. Backup current version
git tag -a v1.0.0 -m "Production release v1.0.0"

# 2. Deploy to staging
git checkout staging
git merge main
# Test thoroughly

# 3. Deploy to production
git checkout production
git merge main
git push origin production
```

#### 2. Rollback Process
```bash
# Quick rollback on Vercel
vercel rollback

# Docker rollback
docker-compose -f docker-compose.prod.yml down
docker tag cargoparts:previous cargoparts:latest
docker-compose -f docker-compose.prod.yml up -d
```

For additional support or questions about deployment, please check the [troubleshooting section](#troubleshooting) or create an issue in the GitHub repository.