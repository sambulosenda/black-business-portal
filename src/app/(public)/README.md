# Public Routes

This route group contains all publicly accessible pages that don't require authentication.

## Structure

```
(public)/
├── bookings/       # Booking flow for customers
│   ├── [slug]/     # Book a specific business service
│   └── payment/    # Payment processing
└── search/         # Search and discovery pages
```

## Purpose

- **No authentication required** - All pages are accessible to anonymous users
- **SEO optimized** - These pages are indexed by search engines
- **Customer acquisition** - Primary entry points for new users

## Key Pages

- `/search` - Find businesses and services
- `/bookings/[business-slug]` - Book appointments at specific businesses

## Guidelines

- Always optimize for SEO (meta tags, structured data)
- Ensure fast load times (these are landing pages)
- Mobile-first design approach
- Include proper error handling for failed bookings