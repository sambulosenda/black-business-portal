# Customer Routes

Protected routes for authenticated customers to manage their bookings and profile.

## Structure

```
(customer)/
├── bookings/           # Customer's booking management
│   ├── confirmation/   # Booking confirmation pages
│   └── [components]    # Booking table, cancel/refund buttons
├── dashboard/          # Customer dashboard home
└── review/            # Leave reviews for completed services
    └── [bookingId]/   # Review specific booking
```

## Purpose

- **Booking management** - View, cancel, and manage appointments
- **Review system** - Rate and review completed services
- **Customer dashboard** - Central hub for customer activities

## Authentication

- **Required**: All routes require customer authentication
- **Middleware**: Protected by auth middleware
- **Redirect**: Unauthenticated users → `/login`

## Key Features

### Bookings Page (`/bookings`)
- View all upcoming and past bookings
- Cancel upcoming bookings
- Request refunds (if eligible)
- Download booking confirmations

### Review System (`/review/[bookingId]`)
- Rate service quality (1-5 stars)
- Written feedback
- Photo uploads
- Only available after service completion

## Guidelines

- Mobile-responsive design (customers often book on mobile)
- Clear booking status indicators
- Easy cancellation flow with clear policies
- Accessible review forms
- Fast loading for booking history

## API Integrations

- `/api/bookings/*` - Booking operations
- `/api/reviews` - Review submissions
- `/api/stripe/*` - Payment and refund processing