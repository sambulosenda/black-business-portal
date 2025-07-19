import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  
  // Check for the new SEO-optimized title
  await expect(page).toHaveTitle('Glamfric - Book Beauty Services in 30 Seconds');
});

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  
  // Check if the page loads without errors
  await expect(page.locator('body')).toBeVisible();
});

test('navigation bar is visible', async ({ page }) => {
  await page.goto('/');
  
  // Check for navigation bar
  const navbar = page.locator('nav');
  await expect(navbar).toBeVisible();
  
  // Check for Glamfric branding in the navbar specifically
  await expect(navbar.locator('text=Glamfric')).toBeVisible();
});

test('hero section search form is visible', async ({ page }) => {
  await page.goto('/');
  
  // Check for search form elements
  await expect(page.locator('input[placeholder*="braids"]')).toBeVisible();
  await expect(page.locator('input[placeholder="City or neighborhood"]')).toBeVisible();
  await expect(page.locator('button:has-text("Find Services")')).toBeVisible();
});

test('value propositions are displayed', async ({ page }) => {
  await page.goto('/');
  
  // Check for key value props
  await expect(page.locator('text=Save up to 30%')).toBeVisible();
  await expect(page.locator('text=Skip the phone calls')).toBeVisible();
  await expect(page.locator('text=Trusted by thousands')).toBeVisible();
});