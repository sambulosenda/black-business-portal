# ESLint Fix Plan

## Overview
There are 173 ESLint errors/warnings to fix across the codebase. The main categories are:
1. Unused imports and variables
2. `any` types that need proper typing
3. Unescaped apostrophes in JSX
4. React hooks dependency warnings

## Strategy
1. Fix unused imports/variables first (quick wins)
2. Create proper TypeScript interfaces for `any` types
3. Replace apostrophes with HTML entities
4. Add eslint-disable comments for useEffect dependencies (temporary)

## Phase 1: Remove Unused Imports

### Files to fix:
- /src/app/book/[slug]/page.tsx - Remove: addDays, isAfter, startOfDay
- /src/app/book/[slug]/payment/page.tsx - Remove: params
- /src/app/book/[slug]/payment-form.tsx - Remove: router, fees
- /src/app/bookings/bookings-table.tsx - Remove: showActions
- /src/app/bookings/page.tsx - Remove: format, RefundButton, CancelButton
- /src/app/business/[slug]/components/about-section.tsx - Remove: Calendar
- /src/app/business/[slug]/components/services-section.tsx - Remove: DollarSign, Star
- /src/app/business/dashboard/analytics/analytics-dashboard.tsx - Remove: TrendingDown, Package, businessId
- /src/app/business/dashboard/availability/availability-form.tsx - Remove: AlertCircle
- /src/app/business/dashboard/bookings/page.tsx - Remove: CardDescription, CardHeader, CardTitle, Filter, AlertCircle
- /src/app/business/dashboard/calendar/improved-page.tsx - Remove: TabsContent, parseISO, Users
- /src/app/business/dashboard/calendar/page.tsx - Remove: Tabs, TabsContent, TabsList, TabsTrigger, DropdownMenu, etc.

## Phase 2: Fix TypeScript `any` Types

### Common patterns to fix:
1. Business type: Create proper interface from Prisma schema
2. Service type: Create proper interface
3. Product type: Create proper interface
4. Review type: Create proper interface

### Files with `any` types:
- /src/app/book/[slug]/page.tsx
- /src/app/book/[slug]/payment/page.tsx
- /src/app/bookings/bookings-table.tsx
- /src/app/business/[slug]/components/*.tsx (multiple files)
- /src/components/ui/data-table.tsx
- /src/lib/auth.ts

## Phase 3: Fix Unescaped Entities

### Files to fix:
- Replace `'` with `&apos;` in JSX text content
- Common in dashboard pages and form messages

## Phase 4: Fix React Hooks Dependencies

### Add eslint-disable comments for:
- useEffect hooks with function dependencies
- Complex dependency arrays that would cause infinite loops