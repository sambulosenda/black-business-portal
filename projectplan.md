# Project Plan: Wellness & Beauty Booking Platform for Black Businesses

## Overview
Building a Treatwell-like appointment booking platform specifically designed for Black-owned wellness and beauty businesses. The platform will connect customers with Black-owned salons, spas, barbershops, and wellness centers.

## Core Features
1. Business listing and discovery
2. Appointment booking system
3. User authentication (customers & businesses)
4. Business profiles with services and pricing
5. Search and filtering functionality
6. Review and rating system

## Technology Stack
- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payment**: Stripe integration
- **Image Storage**: Cloudinary or AWS S3

## Phase 1: Foundation Setup (MVP)

### TODO List

#### 1. Database Setup
- [ ] Install Prisma and PostgreSQL dependencies
- [ ] Create database schema for core entities
- [ ] Set up Prisma client and migrations

#### 2. Authentication System
- [ ] Install and configure NextAuth.js
- [ ] Create shared login page
- [ ] Create separate customer signup flow
- [ ] Create separate business signup flow with verification
- [ ] Implement role-based auth and middleware
- [ ] Create separate dashboards for customers and businesses

#### 3. Business Listing Features
- [ ] Create business model and API routes
- [ ] Build business registration flow
- [ ] Create business profile pages
- [ ] Implement service and pricing management

#### 4. Homepage and Discovery
- [ ] Design and build landing page
- [ ] Create business listing grid/list view
- [ ] Implement search functionality
- [ ] Add category filters (hair, nails, spa, etc.)

#### 5. Booking System Core
- [ ] Create booking model and API
- [ ] Build calendar component for availability
- [ ] Implement booking flow UI
- [ ] Add booking confirmation system

## Phase 2: Enhanced Features

### TODO List

#### 6. User Dashboard
- [ ] Customer booking history
- [ ] Business owner dashboard
- [ ] Analytics for business owners

#### 7. Review System
- [ ] Review model and API
- [ ] Review submission flow
- [ ] Display reviews on business profiles

#### 8. Payment Integration
- [ ] Stripe setup for payment processing
- [ ] Booking payment flow
- [ ] Business payout system

## Design Considerations
- Clean, modern UI celebrating Black beauty and wellness culture
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1)
- Fast loading times for better user experience

## Authentication Flow Details
### Customer Flow
- Simple email/password signup
- Optional social auth (Google, Facebook)
- Immediate access to browse and book

### Business Flow
- Detailed registration form (business name, type, location)
- Business verification step
- Profile completion before going live
- Separate business portal at /business route

## Review Section

### Completed Tasks (Phase 1 - Foundation)
1. **Database Setup** ✓
   - Installed Prisma and dependencies
   - Created comprehensive schema with User, Business, Service, Booking, Review, and Availability models
   - Set up Prisma client singleton
   - Added .env.example for configuration

2. **Authentication System** ✓
   - Installed NextAuth.js with Prisma adapter
   - Created auth configuration with credentials provider
   - Set up JWT session strategy with role support
   - Created API route for NextAuth
   - Added TypeScript definitions for session

### Next Steps
- Create login page UI
- Build customer signup flow
- Build business signup flow with verification
- Create role-based middleware