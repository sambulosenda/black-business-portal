# Playwright Test Suite

This directory contains end-to-end tests for the Business Portal application using Playwright.

## Test Coverage

### 1. Homepage Tests (`homepage.spec.ts`)
- ✅ Page title and loading
- ✅ Navigation bar visibility
- ✅ Hero section search form
- ✅ Value propositions display

### 2. Authentication Tests (`auth.spec.ts`)
- Login page functionality
- Customer signup flow
- Business signup multi-step form
- Form validation
- Navigation between auth pages

### 3. Search Tests (`search.spec.ts`)
- Search navigation from homepage
- Query parameter handling
- Service type filtering
- Location filtering
- Search results display
- Business card interactions
- Sort functionality

### 4. Business Profile Tests (`business-profile.spec.ts`)
- Profile page display
- About section
- Services with pricing
- Reviews section
- Photos gallery
- Products display (if available)
- Business hours
- Contact information

### 5. Customer Dashboard Tests (`customer-dashboard.spec.ts`)
- Dashboard layout
- Bookings history
- Profile management
- Favorites
- Reviews management
- Note: Most tests require authentication

### 6. Business Dashboard Tests (`business-dashboard.spec.ts`)
- Dashboard overview
- Navigation sidebar
- Calendar view
- Bookings management
- Services management
- Customer CRM
- Analytics
- Staff, Products, Promotions (if enabled)
- Note: All tests require business owner authentication

### 7. Booking Flow Tests (`booking-flow.spec.ts`)
- Service selection
- Date selection calendar
- Time slot selection
- Booking summary
- Notes addition
- Payment process
- Booking confirmation
- Cancellation handling
- Note: Most tests require authentication

### 8. Checkout & Payment Tests (`checkout-payment.spec.ts`)
- Shopping cart functionality
- Product management in cart
- Checkout process
- Promo code application
- Delivery/pickup options
- Stripe payment integration
- Order confirmation

## Running Tests

```bash
# Run all tests
bun test

# Run tests in UI mode
bun test:ui

# Run tests with visible browser
bun test:headed

# Debug tests
bun test:debug

# Run specific test file
bunx playwright test tests/homepage.spec.ts

# Run tests in specific browser
bunx playwright test --project=chromium
```

## Test Status

Many tests are currently skipped (`test.skip()`) because they require:
1. **Authentication**: Customer or business owner login
2. **Test Data**: Specific businesses, services, or products
3. **Payment Integration**: Stripe test mode

## Next Steps

1. **Set up test authentication**:
   - Create test users in seed data
   - Implement auth helpers for tests
   - Use Playwright's auth state persistence

2. **Improve test data**:
   - Ensure consistent test businesses exist
   - Add predictable slugs for testing
   - Create test-specific data fixtures

3. **Add more test types**:
   - API endpoint tests
   - Visual regression tests
   - Performance tests
   - Accessibility tests

4. **CI/CD Integration**:
   - GitHub Actions workflow
   - Test on pull requests
   - Parallel test execution
   - Test result reporting

## Best Practices

1. Use data-testid attributes for reliable element selection
2. Implement Page Object Model for complex pages
3. Keep tests independent and idempotent
4. Use proper waits instead of arbitrary timeouts
5. Test across all supported browsers
6. Write descriptive test names
7. Group related tests with describe blocks

## Debugging Failed Tests

1. Use `--headed` flag to see browser
2. Use `test:ui` for interactive debugging
3. Check test-results folder for screenshots
4. Use `page.pause()` to debug specific steps
5. Enable video recording in playwright.config.ts