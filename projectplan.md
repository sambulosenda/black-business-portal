# Project Folder Reorganization Plan

## Current Issues
- API routes are deeply nested and scattered
- Business dashboard components mixed with public pages
- Components folder lacks clear domain separation
- Duplicate booking-related folders (book/, booking/, bookings/)

## Proposed Structure

### 1. API Routes Reorganization
**Goal**: Group by feature domain for better maintainability

Current structure has too many nested folders. Proposed flatter structure:
```
src/app/api/
├── auth/          # All auth-related endpoints
├── bookings/      # All booking operations
├── business/      # Business management endpoints
├── customers/     # Customer operations
├── payments/      # Stripe & payment processing
├── search/        # Search functionality
└── uploads/       # File upload endpoints
```

### 2. Page Components Organization
**Goal**: Co-locate page components with their routes

```
src/app/
├── (public)/           # Public-facing pages
│   ├── page.tsx       # Homepage
│   ├── search/
│   ├── business/[slug]/
│   └── book/[slug]/
├── (auth)/            # Auth pages (login, signup, etc)
│   ├── login/
│   ├── signup/
│   └── forgot-password/
├── (customer)/        # Customer dashboard
│   ├── bookings/
│   └── profile/
└── (business)/        # Business dashboard
    ├── dashboard/
    ├── analytics/
    └── settings/
```

### 3. Components Structure
**Goal**: Clear separation between UI components and feature components

```
src/components/
├── ui/               # Reusable UI components (keep as is)
├── features/         # Feature-specific components
│   ├── booking/
│   ├── search/
│   ├── business/
│   └── auth/
├── layouts/          # Layout components
│   ├── navigation.tsx
│   └── footer.tsx
└── shared/           # Shared utilities
    ├── providers.tsx
    └── seo/
```

### 4. Additional Improvements
- Merge duplicate booking folders
- Move business dashboard components closer to their routes
- Create clear separation between public and authenticated routes
- Use route groups for better organization

## Implementation Steps

### Phase 1: Planning & Documentation
- [x] Create this reorganization plan
- [ ] Review with stakeholder
- [ ] Get approval before proceeding

### Phase 2: API Routes (Low Risk)
- [ ] Group auth endpoints
- [ ] Consolidate booking endpoints
- [ ] Reorganize business endpoints
- [ ] Update import paths

### Phase 3: Page Components (Medium Risk)
- [ ] Create route groups
- [ ] Move public pages
- [ ] Move auth pages
- [ ] Move dashboard pages
- [ ] Update all imports

### Phase 4: Component Library (Low Risk)
- [ ] Create features folder
- [ ] Move feature components
- [ ] Create layouts folder
- [ ] Update component imports

### Phase 5: Testing & Cleanup
- [ ] Run build and tests
- [ ] Fix any broken imports
- [ ] Update documentation
- [ ] Clean up empty folders

## Benefits
1. **Better Developer Experience**: Easier to find and maintain code
2. **Clear Separation**: Public vs authenticated, customer vs business
3. **Reduced Nesting**: Flatter structure for API routes
4. **Co-location**: Related files stay together
5. **Scalability**: Easy to add new features

## Risks & Mitigation
- **Risk**: Breaking imports
  - **Mitigation**: Use search & replace, test thoroughly
- **Risk**: Git history confusion
  - **Mitigation**: Single PR with clear commit messages
- **Risk**: Deployment issues
  - **Mitigation**: Test build locally first

## Review Section

### Completed Changes

#### 1. Page Organization (✅ Completed)
Created Next.js route groups for better organization:
- **(public)/** - Contains search and book pages
- **(auth)/** - Contains login, signup, forgot-password, reset-password, and verify-email pages
- **(customer)/** - Contains bookings, booking confirmation, dashboard, and review pages
- **(business)/** - Contains all business dashboard and related pages

#### 2. Component Reorganization (✅ Completed)
Restructured components folder:
- **features/** - Business and search feature components
- **layouts/** - Navigation and footer components
- **shared/** - Providers, loading-page, and SEO components
- **ui/** - Kept as-is for reusable UI components

#### 3. Import Updates (✅ Completed)
Successfully updated all imports across the codebase:
- Navigation imports → `@/components/layouts/navigation`
- Footer imports → `@/components/layouts/footer`
- Providers imports → `@/components/shared/providers`
- Business components → `@/components/features/business/*`
- Search components → `@/components/features/search/*`
- SEO components → `@/components/shared/seo/*`

#### 4. API Routes (Not Modified)
Kept API routes unchanged due to extensive usage throughout the codebase. This avoided breaking changes while still achieving better organization through page and component restructuring.

### Results
- ✅ Build passes successfully
- ✅ No broken imports
- ✅ Cleaner folder structure
- ✅ Better separation of concerns
- ✅ Easier navigation for developers

### Benefits Achieved
1. **Improved Organization**: Clear separation between public, auth, customer, and business sections
2. **Better Developer Experience**: Easier to locate files with logical grouping
3. **Maintainability**: Feature-based component organization
4. **Minimal Risk**: Conservative approach avoided breaking API route dependencies

### Next Steps
- Monitor for any runtime issues
- Consider API route reorganization in a future phase when more time is available for thorough testing
- Update any documentation that references old file paths