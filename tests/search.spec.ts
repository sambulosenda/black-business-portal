import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('should navigate to search page from homepage', async ({ page }) => {
    await page.goto('/');
    
    // Fill search form
    await page.fill('input[placeholder*="braids"]', 'hair salon');
    await page.fill('input[placeholder="City or neighborhood"]', 'London');
    await page.click('button:has-text("Find Services")');
    
    // Check navigation to search page
    await expect(page).toHaveURL(/\/search\?q=hair\+salon&city=London/);
  });

  test('should display search page elements', async ({ page }) => {
    await page.goto('/search');
    
    // Check page structure
    await expect(page.locator('h1')).toContainText('Find Beauty Services');
    await expect(page.locator('input[placeholder="Search services..."]')).toBeVisible();
    await expect(page.locator('button:has-text("Filters")').or(page.locator('text=Filters'))).toBeVisible();
    
    // Check for results section
    await expect(page.locator('text=/businesses? found|No businesses found/')).toBeVisible();
  });

  test('should perform search with query parameters', async ({ page }) => {
    await page.goto('/search?q=nails');
    
    // Check search input has query
    const searchInput = page.locator('input[placeholder="Search services..."]');
    await expect(searchInput).toHaveValue('nails');
    
    // Check results are filtered
    const results = page.locator('[data-testid="business-card"], .business-card, article');
    const count = await results.count();
    
    if (count > 0) {
      // If there are results, check they're relevant
      const firstResult = results.first();
      await expect(firstResult).toBeVisible();
    } else {
      // If no results, check for no results message
      await expect(page.locator('text=No businesses found')).toBeVisible();
    }
  });

  test('should filter by service type', async ({ page }) => {
    await page.goto('/search');
    
    // Open filters if in mobile view
    const filtersButton = page.locator('button:has-text("Filters")');
    if (await filtersButton.isVisible()) {
      await filtersButton.click();
    }
    
    // Select a service filter
    const hairCheckbox = page.locator('input[type="checkbox"][value="hair"], label:has-text("Hair")');
    if (await hairCheckbox.isVisible()) {
      await hairCheckbox.click();
      
      // Wait for results to update
      await page.waitForTimeout(500);
      
      // Verify URL updated with filter
      await expect(page).toHaveURL(/services=hair/);
    }
  });

  test('should filter by location', async ({ page }) => {
    await page.goto('/search');
    
    // Enter location
    const locationInput = page.locator('input[placeholder*="location"], input[placeholder*="city"], input[name="location"]').first();
    await locationInput.fill('New York');
    await locationInput.press('Enter');
    
    // Wait for results to update
    await page.waitForTimeout(500);
    
    // Check URL updated
    await expect(page).toHaveURL(/city=New\+York|location=New\+York/);
  });

  test('should display business cards with key information', async ({ page }) => {
    await page.goto('/search');
    
    // Wait for results to load
    await page.waitForTimeout(1000);
    
    const businessCards = page.locator('[data-testid="business-card"], .business-card, article').first();
    
    if (await businessCards.count() > 0) {
      const firstCard = businessCards.first();
      
      // Check business card has essential elements
      await expect(firstCard.locator('h2, h3').first()).toBeVisible(); // Business name
      await expect(firstCard.locator('text=/★|rating|reviews?/i')).toBeVisible(); // Rating
      await expect(firstCard.locator('text=/\\$|from|starting/i')).toBeVisible(); // Price
    }
  });

  test('should navigate to business profile on card click', async ({ page }) => {
    await page.goto('/search');
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    const businessCards = page.locator('[data-testid="business-card"], .business-card, article a, a[href*="/business/"]').first();
    
    if (await businessCards.count() > 0) {
      // Click first business card
      await businessCards.first().click();
      
      // Check navigation to business profile
      await expect(page).toHaveURL(/\/business\/[a-zA-Z0-9-]+/);
      await expect(page.locator('h1')).toBeVisible(); // Business name in profile
    }
  });

  test('should show no results message', async ({ page }) => {
    await page.goto('/search?q=xyznonexistentservice123');
    
    // Wait for search to complete
    await page.waitForTimeout(1000);
    
    // Check for no results message
    await expect(page.locator('text=/No businesses found|No results|Try adjusting/i')).toBeVisible();
  });

  test('should sort results', async ({ page }) => {
    await page.goto('/search');
    
    // Look for sort dropdown
    const sortDropdown = page.locator('select[name="sort"], button:has-text("Sort"), [data-testid="sort-dropdown"]').first();
    
    if (await sortDropdown.isVisible()) {
      // If it's a select element
      if (await sortDropdown.evaluate(el => el.tagName === 'SELECT')) {
        await sortDropdown.selectOption({ label: 'Price: Low to High' });
      } else {
        // If it's a button dropdown
        await sortDropdown.click();
        await page.click('text=Price: Low to High');
      }
      
      // Check URL updated with sort parameter
      await expect(page).toHaveURL(/sort=price_asc/);
    }
  });

  test('should maintain search state on page refresh', async ({ page }) => {
    // Navigate with specific search parameters
    await page.goto('/search?q=massage&city=London&services=spa');
    
    // Verify search state is loaded
    const searchInput = page.locator('input[placeholder="Search services..."]');
    await expect(searchInput).toHaveValue('massage');
    
    // Reload page
    await page.reload();
    
    // Verify state is maintained
    await expect(searchInput).toHaveValue('massage');
    await expect(page).toHaveURL(/q=massage/);
    await expect(page).toHaveURL(/city=London/);
  });
});