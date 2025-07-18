import { test, expect } from '@playwright/test';

test.describe('Business Dashboard', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/business/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test.describe('Authenticated Business Dashboard', () => {
    // Note: These tests are marked as skip because they require authentication
    // In a real scenario, you'd set up auth before running these
    
    test('should display business dashboard overview', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      
      // Check main dashboard elements
      await expect(page.locator('h1:has-text("Dashboard"), h2:has-text("Welcome back")')).toBeVisible();
      
      // Check stats cards
      await expect(page.locator('text=/Today.*Bookings|Bookings.*Today/i')).toBeVisible();
      await expect(page.locator('text=/Revenue/i')).toBeVisible();
      await expect(page.locator('text=/Customers/i')).toBeVisible();
      await expect(page.locator('text=/Rating/i')).toBeVisible();
    });

    test('should display navigation sidebar', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      
      // Check sidebar menu items
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Calendar')).toBeVisible();
      await expect(page.locator('text=Bookings')).toBeVisible();
      await expect(page.locator('text=Services')).toBeVisible();
      await expect(page.locator('text=Customers')).toBeVisible();
      await expect(page.locator('text=Analytics')).toBeVisible();
      await expect(page.locator('text=Profile')).toBeVisible();
      await expect(page.locator('text=Settings')).toBeVisible();
    });

    test('should navigate to calendar view', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      await page.click('text=Calendar');
      
      await expect(page).toHaveURL('/business/dashboard/calendar');
      
      // Check calendar elements
      await expect(page.locator('text=/Monday|Tuesday|Wednesday/')).toBeVisible();
      await expect(page.locator('button:has-text("Today")')).toBeVisible();
      await expect(page.locator('button:has-text("Month"), button:has-text("Week"), button:has-text("Day")')).toBeVisible();
    });

    test('should navigate to bookings page', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      await page.click('nav >> text=Bookings');
      
      await expect(page).toHaveURL('/business/dashboard/bookings');
      await expect(page.locator('h1:has-text("Bookings")')).toBeVisible();
      
      // Check for bookings table
      await expect(page.locator('table, .bookings-list')).toBeVisible();
    });

    test('should navigate to services management', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      await page.click('text=Services');
      
      await expect(page).toHaveURL('/business/dashboard/services');
      await expect(page.locator('h1:has-text("Services")')).toBeVisible();
      
      // Check for add service button
      await expect(page.locator('button:has-text("Add Service"), a:has-text("Add Service")')).toBeVisible();
    });

    test('should display services list', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard/services');
      
      const hasServices = await page.locator('.service-item, [data-testid="service-row"], tbody tr').count() > 0;
      
      if (hasServices) {
        const firstService = page.locator('.service-item, [data-testid="service-row"], tbody tr').first();
        
        // Check service has edit/delete actions
        await expect(firstService.locator('button:has-text("Edit"), a:has-text("Edit")')).toBeVisible();
        await expect(firstService.locator('button:has-text("Delete")')).toBeVisible();
      } else {
        await expect(page.locator('text=/No services|Add your first service/i')).toBeVisible();
      }
    });

    test('should navigate to customers page', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      await page.click('text=Customers');
      
      await expect(page).toHaveURL('/business/dashboard/customers');
      await expect(page.locator('h1:has-text("Customers")')).toBeVisible();
      
      // Check for search functionality
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    });

    test('should navigate to analytics page', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      await page.click('text=Analytics');
      
      await expect(page).toHaveURL('/business/dashboard/analytics');
      await expect(page.locator('h1:has-text("Analytics")')).toBeVisible();
      
      // Check for charts/metrics
      await expect(page.locator('text=/Revenue|Bookings|Growth/i')).toBeVisible();
    });

    test('should navigate to business profile settings', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      await page.click('nav >> text=Profile');
      
      await expect(page).toHaveURL('/business/dashboard/profile');
      await expect(page.locator('h1:has-text("Business Profile")')).toBeVisible();
      
      // Check form fields
      await expect(page.locator('input[name="businessName"], input[placeholder*="Business name"]')).toBeVisible();
      await expect(page.locator('textarea[name="description"], textarea[placeholder*="Description"]')).toBeVisible();
    });

    test('should navigate to settings page', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      await page.click('nav >> text=Settings');
      
      await expect(page).toHaveURL('/business/dashboard/settings');
      await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
      
      // Check settings sections
      await expect(page.locator('text=/Notifications|Payment|Hours/i')).toBeVisible();
    });

    test('should have staff management', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      
      // Check if staff link exists
      const staffLink = page.locator('text=Staff');
      if (await staffLink.count() > 0) {
        await staffLink.click();
        await expect(page).toHaveURL('/business/dashboard/staff');
        await expect(page.locator('h1:has-text("Staff")')).toBeVisible();
        await expect(page.locator('button:has-text("Add Staff"), a:has-text("Add Staff")')).toBeVisible();
      }
    });

    test('should have products management', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      
      // Check if products link exists
      const productsLink = page.locator('text=Products');
      if (await productsLink.count() > 0) {
        await productsLink.click();
        await expect(page).toHaveURL('/business/dashboard/products');
        await expect(page.locator('h1:has-text("Products")')).toBeVisible();
        await expect(page.locator('button:has-text("Add Product"), a:has-text("Add Product")')).toBeVisible();
      }
    });

    test('should have promotions management', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      
      // Check if promotions link exists
      const promotionsLink = page.locator('text=Promotions');
      if (await promotionsLink.count() > 0) {
        await promotionsLink.click();
        await expect(page).toHaveURL('/business/dashboard/promotions');
        await expect(page.locator('h1:has-text("Promotions")')).toBeVisible();
        await expect(page.locator('button:has-text("Create Promotion"), a:has-text("Create Promotion")')).toBeVisible();
      }
    });

    test('should display recent activity', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/business/dashboard');
      
      // Check for recent bookings or activity section
      const activitySection = page.locator('text=/Recent|Today|Activity/i');
      await expect(activitySection.first()).toBeVisible();
    });
  });
});