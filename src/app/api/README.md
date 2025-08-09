# API Routes

Next.js API routes for backend functionality.

## Structure

```
api/
├── auth/           # Authentication endpoints
├── bookings/       # Booking operations
├── business/       # Business management
├── images/         # Image proxy and serving
├── promotions/     # Promotion validation
├── reviews/        # Review management
├── search/         # Search functionality
├── stripe/         # Payment processing
└── upload/         # File uploads
```

## Authentication

Most endpoints require authentication via NextAuth.js:

```typescript
import { requireAuth } from '@/lib/session'

export async function GET(request: Request) {
  const session = await requireAuth()
  // session.user contains authenticated user
}
```

## Route Categories

### Public Endpoints (No Auth)
- `GET /api/search` - Search businesses
- `GET /api/bookings/availability` - Check availability
- `POST /api/auth/signup/*` - User registration
- `POST /api/auth/forgot-password` - Password reset

### Customer Endpoints (Customer Auth)
- `POST /api/bookings` - Create booking
- `POST /api/bookings/cancel` - Cancel booking
- `POST /api/reviews` - Submit review
- `GET /api/bookings` - List user bookings

### Business Endpoints (Business Auth)
- `GET /api/business/*` - All business operations
- `POST /api/business/services` - Manage services
- `GET /api/business/analytics` - View analytics
- `PUT /api/business/profile` - Update profile

### Webhook Endpoints
- `POST /api/stripe/webhook` - Stripe webhooks
- No auth required but signature verification

## Error Handling

Consistent error responses:

```typescript
// Success
return NextResponse.json({ data }, { status: 200 })

// Client error
return NextResponse.json(
  { error: 'Invalid request' },
  { status: 400 }
)

// Server error
return NextResponse.json(
  { error: 'Internal server error' },
  { status: 500 }
)
```

## Database Access

Use Prisma client:

```typescript
import { prisma } from '@/lib/prisma'

const data = await prisma.business.findMany({
  where: { isActive: true },
  include: { services: true }
})
```

## Rate Limiting

Consider implementing rate limiting:
- Auth endpoints: 5 requests/minute
- Search: 30 requests/minute
- Booking creation: 10 requests/hour

## Caching Strategy

- Search results: Cache for 5 minutes
- Business profiles: Cache for 1 hour
- Analytics: Cache for 15 minutes
- User session: Cache for session duration

## Security Best Practices

1. **Input validation** - Validate all inputs with Zod
2. **SQL injection** - Use Prisma (parameterized queries)
3. **XSS prevention** - Sanitize user content
4. **CSRF protection** - Verify request origin
5. **Rate limiting** - Prevent abuse
6. **Logging** - Log errors and suspicious activity

## Testing

Test coverage should include:
- Unit tests for business logic
- Integration tests for DB operations
- E2E tests for critical flows
- Load testing for performance

## Performance

- Use `SELECT` specific fields, not `SELECT *`
- Implement pagination for lists
- Use database indexes effectively
- Cache expensive computations
- Optimize image delivery

## Future Improvements

- [ ] GraphQL endpoint for flexible queries
- [ ] WebSocket support for real-time updates
- [ ] API versioning (v1, v2)
- [ ] OpenAPI documentation
- [ ] Request/response logging
- [ ] Batch operations support