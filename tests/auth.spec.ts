import { test, expect } from '@playwright/test';
import { loginAs, testAccounts } from './helpers/auth';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');
      
      // Check page title
      await expect(page.locator('h1')).toContainText('Sign in to your account');
      
      // Check form elements
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('Sign in');
      
      // Check links
      await expect(page.locator('text=Don\'t have an account?')).toBeVisible();
      await expect(page.locator('text=Forgot password?')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login');
      
      // Click submit without filling form
      await page.locator('button[type="submit"]').click();
      
      // Check for validation errors
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in invalid credentials
      await page.fill('input[id="email"]', 'invalid@example.com');
      await page.fill('input[id="password"]', 'wrongpassword');
      await page.locator('button[type="submit"]').click();
      
      // Check for error message
      await expect(page.locator('text=Invalid email or password')).toBeVisible();
    });

    test('should navigate to signup pages', async ({ page }) => {
      await page.goto('/login');
      
      // Check customer signup link
      const customerSignupLink = page.locator('a:has-text("Sign up")').first();
      await expect(customerSignupLink).toBeVisible();
      await customerSignupLink.click();
      await expect(page).toHaveURL('/signup/customer');
      
      // Go back and check business signup
      await page.goto('/login');
      const businessSignupLink = page.locator('text=Join as a business');
      await expect(businessSignupLink).toBeVisible();
      await businessSignupLink.click();
      await expect(page).toHaveURL('/business/join');
    });

    test('should login successfully as customer', async ({ page }) => {
      await loginAs(page, testAccounts.customer1.email, testAccounts.customer1.password);
      
      // Should redirect to customer dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('h1')).toContainText('Welcome back');
    });

    test('should login successfully as business owner', async ({ page }) => {
      await loginAs(page, testAccounts.businessOwner1.email, testAccounts.businessOwner1.password);
      
      // Should redirect to business dashboard
      await expect(page).toHaveURL('/business/dashboard');
      await expect(page.locator('h1')).toContainText(`Welcome back, ${testAccounts.businessOwner1.businessName}`);
    });
  });

  test.describe('Customer Signup Page', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto('/signup/customer');
      
      // Check page title
      await expect(page.locator('h1')).toContainText('Create your account');
      
      // Check form elements
      await expect(page.locator('input[id="name"]')).toBeVisible();
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('Create account');
    });

    test('should show validation errors', async ({ page }) => {
      await page.goto('/signup/customer');
      
      // Submit empty form
      await page.locator('button[type="submit"]').click();
      
      // Check validation messages
      await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible();
      await expect(page.locator('text=Invalid email')).toBeVisible();
      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/signup/customer');
      
      // Enter weak password
      await page.fill('input[id="password"]', 'weak');
      await page.locator('button[type="submit"]').click();
      
      // Check password validation
      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    });

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/signup/customer');
      
      // Fill form with existing email
      await page.fill('input[id="name"]', 'Test User');
      await page.fill('input[id="email"]', 'customer@example.com');
      await page.fill('input[id="password"]', 'password123');
      await page.locator('button[type="submit"]').click();
      
      // Check for error
      await expect(page.locator('text=An account with this email already exists')).toBeVisible();
    });
  });

  test.describe('Business Signup Page', () => {
    test('should display business signup form', async ({ page }) => {
      await page.goto('/business/join');
      
      // Check page elements
      await expect(page.locator('h1')).toContainText('Join as a Business');
      await expect(page.locator('text=Grow your beauty business')).toBeVisible();
      
      // Check form steps
      await expect(page.locator('text=Personal Information')).toBeVisible();
      await expect(page.locator('input[id="name"]')).toBeVisible();
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
    });

    test('should navigate through multi-step form', async ({ page }) => {
      await page.goto('/business/join');
      
      // Fill step 1
      await page.fill('input[id="name"]', 'Business Owner');
      await page.fill('input[id="email"]', 'newbusiness@example.com');
      await page.fill('input[id="password"]', 'securepassword123');
      await page.locator('button:has-text("Next")').click();
      
      // Check step 2 is visible
      await expect(page.locator('text=Business Information')).toBeVisible();
      await expect(page.locator('input[name="businessName"]')).toBeVisible();
      await expect(page.locator('textarea[name="description"]')).toBeVisible();
      
      // Go back
      await page.locator('button:has-text("Previous")').click();
      await expect(page.locator('text=Personal Information')).toBeVisible();
    });

    test('should validate business information', async ({ page }) => {
      await page.goto('/business/join');
      
      // Skip to step 2 by filling step 1
      await page.fill('input[id="name"]', 'Business Owner');
      await page.fill('input[id="email"]', 'test@business.com');
      await page.fill('input[id="password"]', 'password123');
      await page.locator('button:has-text("Next")').click();
      
      // Try to submit without business info
      await page.locator('button:has-text("Create Account")').click();
      
      // Check validation
      await expect(page.locator('text=Business name is required')).toBeVisible();
      await expect(page.locator('text=Description must be at least 20 characters')).toBeVisible();
    });
  });
});