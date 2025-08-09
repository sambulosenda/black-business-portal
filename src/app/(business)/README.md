# Business Routes

Protected routes for business owners to manage their services, bookings, and business profile.

## Structure

```
(business)/
├── business/
│   ├── [slug]/           # Public business profile page
│   ├── join/             # Business onboarding
│   └── dashboard/        # Business admin panel
│       ├── analytics/    # Performance metrics
│       ├── availability/ # Schedule management
│       ├── bookings/     # Booking management
│       ├── calendar/     # Visual calendar view
│       ├── customers/    # Customer management
│       ├── notifications/# Alert settings
│       ├── promotions/   # Discount management
│       ├── reviews/      # Review responses
│       ├── services/     # Service catalog
│       ├── settings/     # Business settings
│       └── staff/        # Team management
```

## Purpose

- **Business operations** - Complete business management suite
- **Analytics & insights** - Track performance and growth
- **Customer relations** - Manage bookings and communications
- **Service management** - Define and price services

## Authentication & Authorization

- **Required**: Business owner authentication
- **Role check**: Must have `role: 'BUSINESS'`
- **Stripe**: Connected account required for payments

## Key Features

### Dashboard Home (`/business/dashboard`)
- Today's bookings overview
- Revenue snapshot
- Quick actions
- Upcoming appointments

### Analytics (`/business/dashboard/analytics`)
- Revenue trends
- Booking patterns
- Customer insights
- Service performance

### Services Management (`/business/dashboard/services`)
- Add/edit services
- Set pricing and duration
- Manage availability per service
- Upload service images

### Settings (`/business/dashboard/settings`)
- Business profile
- Operating hours
- Payment settings (Stripe Connect)
- Notification preferences
- Photo gallery

## Guidelines

- Desktop-first design (businesses primarily use desktop)
- Data tables with sorting/filtering
- Bulk actions where applicable
- Export capabilities for reports
- Real-time updates for bookings

## API Integrations

- `/api/business/*` - All business operations
- `/api/stripe/connect/*` - Payment setup
- `/api/upload/*` - Image uploads
- `/api/business/analytics` - Metrics and reports

## Best Practices

- Cache analytics data (expensive queries)
- Paginate customer lists
- Lazy load calendar events
- Optimize image uploads
- Background jobs for email notifications