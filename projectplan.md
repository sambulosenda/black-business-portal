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

### Completed Tasks (Authentication)
3. **Authentication Pages** ✓
   - Created shared login page with form validation
   - Built customer signup flow with simple registration
   - Built business signup with 2-step form (personal info → business details)
   - Created API routes for both signup types
   - Added middleware for route protection and role-based access

### Completed Tasks (Dashboards & Homepage)
4. **Dashboard Pages** ✓
   - Created customer dashboard with bookings and reviews
   - Built business owner dashboard with stats and management links
   - Added navigation layouts for authenticated users
   - Implemented role-based redirects

5. **Homepage** ✓
   - Built landing page with hero section
   - Added category browsing with emoji icons
   - Created business listings grid with ratings
   - Included services preview and pricing
   - Added CTA section for businesses

### Completed Tasks (Business Features)
6. **Business Profile Pages** ✓
   - Created dynamic profile pages showing all business details
   - Display services with pricing and booking buttons
   - Show reviews and ratings
   - Added contact information and hours sidebar

7. **Search & Filtering** ✓
   - Built search page with multiple filters
   - Text search across business names and services
   - Filter by category, city, and minimum rating
   - API endpoint for search functionality

8. **Service Management** ✓
   - Business owners can add/edit/delete services
   - Set pricing and duration for each service
   - Toggle services active/inactive
   - Categorize services for better organization

### Completed Tasks (Data Seeding)
9. **Database Seeding** ✓
   - Created comprehensive seed script with dummy data
   - Added 3 customer accounts and 4 business accounts
   - Populated services, bookings, reviews, and availability
   - Configured seed command in package.json

### Current Status
The platform MVP is nearly complete with:
- ✅ Authentication system (login/signup for customers and businesses)
- ✅ Customer and business dashboards
- ✅ Business profile pages with services
- ✅ Search functionality with filters
- ✅ Service management for businesses
- ✅ Database populated with test data

### Completed Tasks (Booking System)
10. **Booking System** ✓
    - Created booking page with service selection
    - Built calendar component with date picker
    - Implemented time slot generation based on availability
    - Added real-time availability checking
    - Created booking confirmation page
    - Built customer bookings management page

### MVP Complete! 🎉
The platform now has all core features:
- ✅ User authentication (separate flows for customers/businesses)
- ✅ Business profiles and discovery
- ✅ Service management
- ✅ Search and filtering
- ✅ Complete booking system
- ✅ Customer and business dashboards

### Remaining Features (Phase 2)
- Availability management for businesses
- Review system after completed bookings
- Payment integration (Stripe)
- Email notifications
- Business analytics dashboard