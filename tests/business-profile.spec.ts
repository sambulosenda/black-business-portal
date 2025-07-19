import { test, expect } from '@playwright/test';

import { testAccounts } from './helpers/auth';

test.describe('Business Profile Pages', () => {
  // Use a test business slug from seeded data
  const testBusinessSlug = testAccounts.businessOwner1.businessSlug;
  
  test('should display business profile page', async ({ page }) => {
    await page.goto(`/business/${testBusinessSlug}`);
    
    // Check main elements
    await expect(page.locator('h1')).toBeVisible(); // Business name
    // Rating might not exist if no reviews
    const ratingElement = page.locator('text=/★|[0-9]\\.[0-9]|No reviews/i').first();
    await expect(ratingElement).toBeVisible(); 
    // Hours status - check for either open/closed or hours text
    const hoursElement = page.locator('text=/Open|Closed|Hours|AM|PM/i').first();
    await expect(hoursElement).toBeVisible();
    
    // Check tabs
    await expect(page.locator('text=About')).toBeVisible();
    await expect(page.locator('text=Services')).toBeVisible();
    await expect(page.locator('text=Reviews')).toBeVisible();
    await expect(page.locator('text=Photos')).toBeVisible();
  });

  test('should display about section', async ({ page }) => {
    await page.goto(`/business/${testBusinessSlug}`);
    
    // Click about tab if not active
    const aboutTab = page.locator('button:has-text("About"), a:has-text("About")').first();
    if (await aboutTab.getAttribute('aria-selected') !== 'true') {
      await aboutTab.click();
    }
    
    // Check about content
    await expect(page.locator('h2:has-text("About"), h3:has-text("About")')).toBeVisible();
    await expect(page.locator('text=/Location|Address/i')).toBeVisible();
    await expect(page.locator('text=/Hours|Schedule/i')).toBeVisible();
    await expect(page.locator('text=/Contact/i')).toBeVisible();
  });

  test('should display services with prices', async ({ page }) => {
    await page.goto(`/business/${testBusinessSlug}`);
    
    // Click services tab
    await page.click('text=Services');
    
    // Wait for services to load
    await page.waitForTimeout(500);
    
    // Check for service cards
    const serviceCards = page.locator('[data-testid="service-card"], .service-card, [role="article"]');
    await expect(serviceCards.first()).toBeVisible();
    
    // Check service has required info
    const firstService = serviceCards.first();
    await expect(firstService.locator('h3, h4').first()).toBeVisible(); // Service name
    await expect(firstService.locator('text=/\\$|USD|[0-9]+/')).toBeVisible(); // Price
    await expect(firstService.locator('text=/min|hour|mins/')).toBeVisible(); // Duration
  });

  test('should have book now functionality', async ({ page }) => {
    await page.goto(`/business/${testBusinessSlug}`);
    
    // Click services tab
    await page.click('text=Services');
    await page.waitForTimeout(500);
    
    // Find and click book button
    const bookButton = page.locator('button:has-text("Book"), a:has-text("Book")').first();
    await expect(bookButton).toBeVisible();
    await bookButton.click();
    
    // Should navigate to booking page
    await expect(page).toHaveURL(/\/booking|\/book/);
  });

  test('should display reviews section', async ({ page }) => {
    await page.goto(`/business/${testBusinessSlug}`);
    
    // Click reviews tab
    await page.click('text=Reviews');
    await page.waitForTimeout(500);
    
    // Check for reviews or no reviews message
    const hasReviews = await page.locator('.review-card, [data-testid="review"]').count() > 0;
    
    if (hasReviews) {
      // Check review structure
      const firstReview = page.locator('.review-card, [data-testid="review"]').first();
      await expect(firstReview.locator('text=/★/')).toBeVisible(); // Rating
      await expect(firstReview.locator('.review-author, [data-testid="reviewer-name"]')).toBeVisible();
      await expect(firstReview.locator('.review-date, time')).toBeVisible();
    } else {
      // Check for no reviews message
      await expect(page.locator('text=/No reviews yet|Be the first/i')).toBeVisible();
    }
  });

  test('should display photos gallery', async ({ page }) => {
    await page.goto(`/business/${testBusinessSlug}`);
    
    // Click photos tab
    await page.click('text=Photos');
    await page.waitForTimeout(500);
    
    // Check for photos or no photos message
    const hasPhotos = await page.locator('img[alt*="photo"], img[alt*="gallery"], .photo-grid img').count() > 0;
    
    if (hasPhotos) {
      const photos = page.locator('img[alt*="photo"], img[alt*="gallery"], .photo-grid img');
      await expect(photos.first()).toBeVisible();
    } else {
      await expect(page.locator('text=/No photos|Add photos/i')).toBeVisible();
    }
  });

  test('should display products if available', async ({ page }) => {
    await page.goto(`/business/${testBusinessSlug}`);
    
    // Check if products tab exists
    const productsTab = page.locator('button:has-text("Products"), a:has-text("Products")');
    
    if (await productsTab.count() > 0) {
      await productsTab.click();
      await page.waitForTimeout(500);
      
      // Check for product cards
      const productCards = page.locator('[data-testid="product-card"], .product-card');
      if (await productCards.count() > 0) {
        const firstProduct = productCards.first();
        await expect(firstProduct.locator('h3, h4').first()).toBeVisible(); // Product name
        await expect(firstProduct.locator('text=/\\$/')).toBeVisible(); // Price
        await expect(firstProduct.locator('button:has-text("Add to Cart")')).toBeVisible();
      }
    }
  });

  test('should show business hours', async ({ page }) => {
    await page.goto(`/business/${testBusinessSlug}`);
    
    // Look for hours in sidebar or about section
    const hoursSection = page.locator('text=/Monday|Tuesday|Wednesday|Hours/i').first();
    await expect(hoursSection).toBeVisible();
    
    // Check for at least one day's hours
    await expect(page.locator('text=/[0-9]+:[0-9]+\s*(AM|PM)/i')).toBeVisible();
  });

  test('should display contact information', async ({ page }) => {
    await page.goto(`/business/${testBusinessSlug}`);
    
    // Check for contact details
    await expect(page.locator('text=/Phone|Call/i')).toBeVisible();
    await expect(page.locator('text=/Email|@/i')).toBeVisible();
    
    // Check for address
    await expect(page.locator('text=/Street|Ave|Road|Address/i')).toBeVisible();
  });

  test('should handle non-existent business gracefully', async ({ page }) => {
    await page.goto('/business/non-existent-business-123');
    
    // Should show 404 or redirect
    const is404 = await page.locator('text=/404|not found/i').isVisible();
    const isRedirected = page.url().includes('/search') || page.url() === '/';
    
    expect(is404 || isRedirected).toBeTruthy();
  });
});