# CargoTime Authentication System

This document describes the complete authentication system implementation for the CargoTime marketplace, featuring email OTP-based authentication, JWT sessions, and comprehensive security measures.

## Overview

The authentication system is designed with security, scalability, and user experience in mind:

- **Email OTP Authentication**: Passwordless login using 6-digit OTP codes
- **JWT Session Management**: Secure session tokens with refresh capability
- **Role-Based Access Control**: Support for BUYER, SELLER, ADMIN, and SUPER_ADMIN roles
- **Bilingual Support**: Arabic and English error messages and emails
- **Rate Limiting**: Protection against brute force attacks
- **Saudi Compliance**: Phone number validation and Arabic-first design

## Architecture

### Core Components

1. **User Service** (`/lib/auth/user-service.ts`)
   - User CRUD operations
   - Email/phone verification
   - Login flow management

2. **Session Service** (`/lib/auth/session.ts`)
   - JWT token generation and validation
   - Session persistence with database
   - Cookie management (HttpOnly, Secure, SameSite)

3. **OTP Service** (`/lib/auth/otp.ts`)
   - OTP generation and validation
   - Expiry and attempt limit management

4. **Admin Service** (`/lib/auth/admin-service.ts`)
   - Admin user creation and management
   - Permission validation

5. **Email Service** (`/lib/communication/email-service.ts`)
   - Transactional email sending
   - Multilingual templates
   - OTP and verification emails

## API Endpoints

### Public Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Initiate login (sends OTP) |
| POST | `/api/auth/verify-otp` | Complete login with OTP |
| POST | `/api/auth/verify-email` | Verify email with OTP |
| POST | `/api/auth/resend-otp` | Resend OTP code |
| POST | `/api/auth/refresh` | Refresh session token |
| POST | `/api/auth/logout` | Logout and clear session |

### Protected Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/auth/me` | Get current user profile | Any authenticated |
| PATCH | `/api/auth/me` | Update user profile | Any authenticated |

### Admin Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | List/search users | ADMIN, SUPER_ADMIN |
| GET | `/api/admin/users/[id]` | Get user details | ADMIN, SUPER_ADMIN |
| PATCH | `/api/admin/users/[id]` | Update user status | ADMIN, SUPER_ADMIN |
| GET | `/api/admin/stats` | Get system statistics | ADMIN, SUPER_ADMIN |

## Authentication Flow

### Registration Flow
1. User submits email and optional profile data
2. System validates input and checks for existing users
3. User record created with `PENDING_VERIFICATION` status
4. Verification email sent with OTP
5. User verifies email with OTP to activate account

### Login Flow
1. User submits email address
2. System sends OTP to email (if user exists)
3. User submits email + OTP for verification
4. System validates OTP and creates session
5. JWT tokens (access + refresh) set as HttpOnly cookies
6. User is authenticated for subsequent requests

### Session Management
- Access tokens expire after 7 days
- Refresh tokens expire after 30 days
- Tokens are automatically refreshed on valid requests
- Sessions are stored in database for validation
- All user sessions can be invalidated (logout all devices)

## Security Features

### Rate Limiting
- **OTP Requests**: 5 per hour per IP
- **Login Attempts**: 10 per hour per IP
- **General API**: 100 requests per 15 minutes per IP

### Input Validation
- All inputs validated with Zod schemas
- Email format validation
- Saudi phone number format (+966XXXXXXXXX)
- OTP code format (6 digits)

### Session Security
- JWT tokens signed with strong secret
- HttpOnly cookies prevent XSS attacks
- Secure flag for HTTPS-only transmission
- SameSite policy prevents CSRF attacks
- Session validation checks user status

### Error Handling
- No information leakage in error messages
- Consistent error format with bilingual support
- Rate limit headers included in responses
- Proper HTTP status codes

## Admin User Management

### Creating Admin Users

#### Via Script
```bash
# Create default admins
npm run create-admin

# Create specific admin
npm run create-admin -- --email=admin@example.com --name="Admin Name" --role=SUPER_ADMIN
```

#### Via API (Super Admin only)
```typescript
POST /api/admin/users
{
  "email": "admin@example.com",
  "name": "Admin Name",
  "role": "ADMIN"
}
```

### Admin Roles

- **SUPER_ADMIN**: Full system access, can manage other admins
- **ADMIN**: User management, content moderation, analytics
- **SELLER**: Listing management, order fulfillment
- **BUYER**: Basic user with shopping capabilities

## Database Schema

### Users Table
```sql
- id: String (CUID)
- email: String (unique)
- emailVerified: DateTime?
- name: String?
- phone: String? (unique)
- phoneVerified: DateTime?
- avatar: String?
- role: Role (BUYER, SELLER, ADMIN, SUPER_ADMIN)
- status: UserStatus (ACTIVE, INACTIVE, BANNED, PENDING_VERIFICATION)
- lastLoginAt: DateTime?
- preferredLocale: String (ar, en)
- createdAt: DateTime
- updatedAt: DateTime
```

### Sessions Table
```sql
- id: String (CUID)
- userId: String
- token: String (unique)
- expiresAt: DateTime
- userAgent: String?
- ipAddress: String?
- createdAt: DateTime
```

### OTP Codes Table
```sql
- id: String (CUID)
- userId: String
- code: String
- type: OtpType (EMAIL_VERIFICATION, PHONE_VERIFICATION, LOGIN)
- expiresAt: DateTime
- attempts: Int (default: 0)
- verified: Boolean (default: false)
- createdAt: DateTime
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/cargoparts"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
SESSION_COOKIE_NAME="cargoparts-session"
AUTH_COOKIE_SECURE="true"  # Set to true in production
AUTH_COOKIE_SAME_SITE="lax"

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@cargoparts.sa"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@cargoparts.sa"

# Rate Limiting
RATE_LIMIT_OTP_PER_HOUR="5"
RATE_LIMIT_LOGIN_PER_HOUR="10"

# Application
NEXT_PUBLIC_APP_URL="https://cargoparts.sa"
NEXT_PUBLIC_DEFAULT_LOCALE="ar"
```

## Usage Examples

### Frontend Authentication

#### Login Component
```typescript
const login = async (email: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  if (response.ok) {
    // Show OTP input form
  }
};

const verifyOtp = async (email: string, otpCode: string) => {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otpCode })
  });
  
  if (response.ok) {
    // User is now authenticated
    window.location.href = '/dashboard';
  }
};
```

#### Getting Current User
```typescript
const getCurrentUser = async () => {
  const response = await fetch('/api/auth/me');
  if (response.ok) {
    return await response.json();
  }
  return null;
};
```

### Backend Route Protection

```typescript
import { requireAdmin } from '@/lib/auth/middleware-helpers';

export async function GET(req: NextRequest) {
  // Apply admin authentication
  const authCheck = await requireAdmin()(req);
  if (authCheck) return authCheck;

  // Admin-only logic here
  return NextResponse.json({ data: 'admin data' });
}
```

## Testing

### Manual Testing Checklist

1. **Registration Flow**
   - [ ] Register with valid email
   - [ ] Register with duplicate email (should fail)
   - [ ] Register with invalid email format (should fail)
   - [ ] Verify email with correct OTP
   - [ ] Verify email with incorrect OTP (should fail)
   - [ ] Verify email with expired OTP (should fail)

2. **Login Flow**
   - [ ] Login with valid email
   - [ ] Login with non-existent email
   - [ ] Complete login with correct OTP
   - [ ] Complete login with incorrect OTP (should fail)
   - [ ] Test session persistence across requests

3. **Admin Functions**
   - [ ] Create admin user via script
   - [ ] Admin login and access to admin routes
   - [ ] User status updates by admin
   - [ ] Permission checks for different roles

4. **Security**
   - [ ] Rate limiting on OTP requests
   - [ ] Rate limiting on login attempts
   - [ ] Session expiration and refresh
   - [ ] Logout clears session properly

### Automated Tests

```bash
# Run authentication tests
npm test -- auth

# Run integration tests
npm test -- --grep "authentication"
```

## Monitoring and Logging

### Key Metrics to Monitor
- Authentication success/failure rates
- OTP delivery and verification rates
- Session duration and refresh patterns
- Rate limiting triggers
- Admin action logs

### Log Formats
```typescript
// Successful login
{
  level: 'info',
  event: 'user_login',
  userId: 'cuid...',
  email: 'user@example.com',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  timestamp: '2024-01-01T12:00:00Z'
}

// Failed authentication
{
  level: 'warn',
  event: 'auth_failure',
  email: 'user@example.com',
  reason: 'invalid_otp',
  ipAddress: '192.168.1.1',
  timestamp: '2024-01-01T12:00:00Z'
}
```

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check SMTP configuration
   - Verify firewall settings
   - Test email service health endpoint

2. **Session Not Persisting**
   - Check cookie settings (HttpOnly, Secure, SameSite)
   - Verify JWT secret is consistent
   - Check session expiration settings

3. **Rate Limiting Issues**
   - Clear rate limit cache if needed
   - Check IP detection (proxy headers)
   - Adjust rate limits for testing

4. **Admin Access Issues**
   - Verify admin user creation
   - Check role assignments
   - Validate permission middleware

### Health Checks

```bash
# Check email service
curl -X GET /api/health/email

# Check database connection
curl -X GET /api/health/database

# Check authentication system
curl -X GET /api/health/auth
```

## Migration and Deployment

### Production Checklist
- [ ] Set secure environment variables
- [ ] Enable HTTPS and secure cookies
- [ ] Configure proper SMTP settings
- [ ] Set up monitoring and alerting
- [ ] Create initial admin users
- [ ] Test all authentication flows
- [ ] Verify rate limiting configuration

### Database Migrations
```bash
# Apply authentication schema
npx prisma migrate deploy

# Create admin users
npm run create-admin
```

## Support and Maintenance

- **Documentation**: Keep this document updated with changes
- **Security**: Regular security audits and dependency updates
- **Performance**: Monitor and optimize query performance
- **Compliance**: Ensure continued Saudi market compliance

For technical support or questions about the authentication system, contact the development team.