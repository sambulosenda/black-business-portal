import { test, expect } from '@playwright/test';
import { loginAs, testAccounts } from './helpers/auth';

test.describe('Business Dashboard', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/business/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test.describe('Authenticated Business Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // Login as business owner before each test
      await loginAs(page, testAccounts.businessOwner1.email, testAccounts.businessOwner1.password);
    });
    
    test('should display business dashboard overview', async ({ page }) => {
      
      await page.goto('/business/dashboard');
      
      // Check main dashboard elements
      await expect(page.locator('h1')).toContainText(`Welcome back, ${testAccounts.businessOwner1.businessName}`);
      
      // Check stats cards
      await expect(page.locator('text=Total Revenue')).toBeVisible();
      await expect(page.locator('h3:has-text("Bookings")').first()).toBeVisible();
      await expect(page.locator('text=Average Rating')).toBeVisible();
      await expect(page.locator('text=Active Services')).toBeVisible();
    });

    test('should display quick actions', async ({ page }) => {
      await page.goto('/business/dashboard');
      
      // Check quick action buttons
      await expect(page.locator('text=Manage Services')).toBeVisible();
      await expect(page.locator('text=View All Bookings')).toBeVisible();
      await expect(page.locator('text=Set Availability')).toBeVisible();
      await expect(page.locator('text=View Analytics')).toBeVisible();
    });

    test('should display business information', async ({ page }) => {
      await page.goto('/business/dashboard');
      
      // Check business info section
      await expect(page.locator('text=Business Information')).toBeVisible();
      await expect(page.locator('dt:has-text("Status")').first()).toBeVisible();
      await expect(page.locator('dt:has-text("Category")')).toBeVisible();
      await expect(page.locator('dt:has-text("Location")')).toBeVisible();
      await expect(page.locator('dt:has-text("Phone")')).toBeVisible();
    });

    test('should navigate to bookings page', async ({ page }) => {
      await page.goto('/business/dashboard');
      await page.click('text=View All Bookings');
      
      await expect(page).toHaveURL('/business/dashboard/bookings');
      await expect(page.locator('h1')).toContainText('Bookings');
    });

    test('should navigate to services management', async ({ page }) => {
      await page.goto('/business/dashboard');
      await page.click('text=Manage Services');
      
      await expect(page).toHaveURL('/business/dashboard/services');
      await expect(page.locator('h1')).toContainText('Services');
    });

    test('should navigate to availability settings', async ({ page }) => {
      await page.goto('/business/dashboard');
      await page.click('text=Set Availability');
      
      await expect(page).toHaveURL('/business/dashboard/availability');
      await expect(page.locator('h1')).toContainText('Availability');
    });

    test('should navigate to analytics page', async ({ page }) => {
      await page.goto('/business/dashboard');
      await page.click('text=View Analytics');
      
      await expect(page).toHaveURL('/business/dashboard/analytics');
      await expect(page.locator('h1')).toContainText('Analytics');
    });

    test('should navigate to business settings', async ({ page }) => {
      await page.goto('/business/dashboard');
      await page.click('text=Edit Business Profile');
      
      await expect(page).toHaveURL('/business/dashboard/settings');
      await expect(page.locator('h1')).toContainText('Business Settings');
    });

    test('should show recent bookings section', async ({ page }) => {
      await page.goto('/business/dashboard');
      
      // Check for recent bookings section
      await expect(page.locator('text=Recent Bookings')).toBeVisible();
      
      // Should show either bookings or empty state
      const hasBookings = await page.locator('p:has-text("Sarah Johnson"), p:has-text("Michael Brown")').count() > 0;
      if (!hasBookings) {
        await expect(page.locator('text=/No bookings yet|Share your business profile/i')).toBeVisible();
      }
    });

    test('should show recent reviews section', async ({ page }) => {
      await page.goto('/business/dashboard');
      
      // Check for recent reviews section
      await expect(page.locator('text=Recent Reviews')).toBeVisible();
      
      // Should show either reviews or empty state
      const hasReviews = await page.locator('[class*="star"]').count() > 0;
      if (!hasReviews) {
        await expect(page.locator('text=/No reviews yet|Reviews will appear/i')).toBeVisible();
      }
    });

  });

  test.describe('Business Dashboard - Non-Business Owner Access', () => {
    test('should redirect customers to regular dashboard', async ({ page }) => {
      // Login as customer
      await loginAs(page, testAccounts.customer1.email, testAccounts.customer1.password);
      
      // Try to access business dashboard
      await page.goto('/business/dashboard');
      
      // Should be redirected to regular dashboard
      await expect(page).toHaveURL('/dashboard');
    });
  });
});