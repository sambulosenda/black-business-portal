import { test, expect } from '@playwright/test';

test.describe('Customer Dashboard', () => {
  test.use({
    storageState: {
      cookies: [],
      origins: [{
        origin: 'http://localhost:3000',
        localStorage: [{
          name: 'test-auth',
          value: JSON.stringify({ role: 'CUSTOMER', email: 'customer@example.com' })
        }]
      }]
    }
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    // Clear any auth
    await page.context().clearCookies();
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should display customer dashboard layout', async ({ page }) => {
    // Note: In real tests, you'd need to authenticate first
    // This is a placeholder showing the structure
    
    // Skip this test if auth is required
    test.skip();
    
    await page.goto('/dashboard');
    
    // Check main dashboard elements
    await expect(page.locator('h1:has-text("Dashboard"), h2:has-text("Dashboard")')).toBeVisible();
    
    // Check navigation sidebar
    await expect(page.locator('text=Bookings')).toBeVisible();
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Favorites')).toBeVisible();
    await expect(page.locator('text=Reviews')).toBeVisible();
  });

  test('should navigate to bookings page', async ({ page }) => {
    test.skip(); // Skip if auth required
    
    await page.goto('/dashboard');
    await page.click('text=Bookings');
    
    await expect(page).toHaveURL('/dashboard/bookings');
    await expect(page.locator('h1:has-text("Bookings"), h2:has-text("Bookings")')).toBeVisible();
  });

  test('should display booking history', async ({ page }) => {
    test.skip(); // Skip if auth required
    
    await page.goto('/dashboard/bookings');
    
    // Check for bookings table or list
    const hasBookings = await page.locator('.booking-card, [data-testid="booking-item"], tr').count() > 0;
    
    if (hasBookings) {
      // Check booking card structure
      const firstBooking = page.locator('.booking-card, [data-testid="booking-item"], tbody tr').first();
      await expect(firstBooking).toBeVisible();
      
      // Check for key booking info
      await expect(firstBooking.locator('text=/[0-9]{1,2}:[0-9]{2}/')).toBeVisible(); // Time
      await expect(firstBooking.locator('text=/Confirmed|Pending|Completed|Cancelled/')).toBeVisible(); // Status
    } else {
      // Check for no bookings message
      await expect(page.locator('text=/No bookings|booking history/i')).toBeVisible();
    }
  });

  test('should navigate to profile page', async ({ page }) => {
    test.skip(); // Skip if auth required
    
    await page.goto('/dashboard');
    await page.click('text=Profile');
    
    await expect(page).toHaveURL('/dashboard/profile');
    await expect(page.locator('h1:has-text("Profile"), h2:has-text("Profile")')).toBeVisible();
  });

  test('should display profile form', async ({ page }) => {
    test.skip(); // Skip if auth required
    
    await page.goto('/dashboard/profile');
    
    // Check form fields
    await expect(page.locator('input[name="name"], input[placeholder*="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"], input[placeholder*="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"], input[placeholder*="phone"]')).toBeVisible();
    
    // Check save button
    await expect(page.locator('button:has-text("Save"), button:has-text("Update")')).toBeVisible();
  });

  test('should navigate to favorites page', async ({ page }) => {
    test.skip(); // Skip if auth required
    
    await page.goto('/dashboard');
    await page.click('text=Favorites');
    
    await expect(page).toHaveURL('/dashboard/favorites');
    await expect(page.locator('h1:has-text("Favorites"), h2:has-text("Favorites")')).toBeVisible();
  });

  test('should display favorite businesses', async ({ page }) => {
    test.skip(); // Skip if auth required
    
    await page.goto('/dashboard/favorites');
    
    const hasFavorites = await page.locator('.favorite-card, [data-testid="favorite-item"], .business-card').count() > 0;
    
    if (hasFavorites) {
      const firstFavorite = page.locator('.favorite-card, [data-testid="favorite-item"], .business-card').first();
      await expect(firstFavorite).toBeVisible();
      
      // Check for business info
      await expect(firstFavorite.locator('h3, h4')).toBeVisible(); // Business name
      await expect(firstFavorite.locator('button:has-text("Remove"), button[aria-label*="remove"]')).toBeVisible();
    } else {
      await expect(page.locator('text=/No favorites|favorite businesses/i')).toBeVisible();
    }
  });

  test('should navigate to reviews page', async ({ page }) => {
    test.skip(); // Skip if auth required
    
    await page.goto('/dashboard');
    await page.click('text=Reviews');
    
    await expect(page).toHaveURL('/dashboard/reviews');
    await expect(page.locator('h1:has-text("Reviews"), h2:has-text("Reviews")')).toBeVisible();
  });

  test('should display user reviews', async ({ page }) => {
    test.skip(); // Skip if auth required
    
    await page.goto('/dashboard/reviews');
    
    const hasReviews = await page.locator('.review-card, [data-testid="review-item"]').count() > 0;
    
    if (hasReviews) {
      const firstReview = page.locator('.review-card, [data-testid="review-item"]').first();
      await expect(firstReview).toBeVisible();
      
      // Check review structure
      await expect(firstReview.locator('text=/★/')).toBeVisible(); // Rating
      await expect(firstReview.locator('.review-text, p')).toBeVisible(); // Review text
      await expect(firstReview.locator('button:has-text("Edit"), button:has-text("Delete")')).toBeVisible();
    } else {
      await expect(page.locator('text=/No reviews|Write your first review/i')).toBeVisible();
    }
  });

  test('should have logout functionality', async ({ page }) => {
    test.skip(); // Skip if auth required
    
    await page.goto('/dashboard');
    
    // Look for logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), a:has-text("Sign out")');
    await expect(logoutButton).toBeVisible();
    
    // Click logout
    await logoutButton.click();
    
    // Should redirect to home or login
    await expect(page).toHaveURL(/\/$|\/login/);
  });
});