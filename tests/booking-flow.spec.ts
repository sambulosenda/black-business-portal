import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  const testBusinessSlug = 'glamour-hair-salon';
  
  test('should require login for booking', async ({ page }) => {
    // Navigate to business and try to book
    await page.goto(`/business/${testBusinessSlug}`);
    await page.click('text=Services');
    await page.waitForTimeout(500);
    
    // Click book button
    const bookButton = page.locator('button:has-text("Book"), a:has-text("Book")').first();
    await bookButton.click();
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=/Sign in|Login/i')).toBeVisible();
  });

  test.describe('Authenticated Booking Flow', () => {
    // Note: These tests require authentication setup
    
    test('should start booking from service selection', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto(`/business/${testBusinessSlug}`);
      await page.click('text=Services');
      await page.waitForTimeout(500);
      
      // Select a service
      const bookButton = page.locator('button:has-text("Book"), a:has-text("Book")').first();
      await bookButton.click();
      
      // Should navigate to booking page
      await expect(page).toHaveURL(/\/booking|\/book/);
      
      // Check booking page elements
      await expect(page.locator('h1:has-text("Book"), h2:has-text("Book")')).toBeVisible();
      await expect(page.locator('text=/Select Date|Choose Date/i')).toBeVisible();
    });

    test('should display calendar for date selection', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      // Navigate directly to booking page
      await page.goto(`/booking/new?business=${testBusinessSlug}&service=haircut`);
      
      // Check calendar is visible
      await expect(page.locator('.calendar, [role="grid"]')).toBeVisible();
      
      // Check for month navigation
      await expect(page.locator('button[aria-label*="Previous"], button:has-text("<")')).toBeVisible();
      await expect(page.locator('button[aria-label*="Next"], button:has-text(">")')).toBeVisible();
      
      // Check for date cells
      await expect(page.locator('[role="gridcell"], .calendar-day')).toBeVisible();
    });

    test('should select a date', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto(`/booking/new?business=${testBusinessSlug}&service=haircut`);
      
      // Click on an available date (future date)
      const availableDate = page.locator('[role="gridcell"]:not([aria-disabled="true"]), .calendar-day:not(.disabled)').first();
      await availableDate.click();
      
      // Check date is selected
      await expect(availableDate).toHaveClass(/selected|active/);
      
      // Time slots should appear
      await expect(page.locator('text=/Select Time|Available Times|[0-9]+:[0-9]+/i')).toBeVisible();
    });

    test('should display available time slots', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto(`/booking/new?business=${testBusinessSlug}&service=haircut`);
      
      // Select a date first
      const availableDate = page.locator('[role="gridcell"]:not([aria-disabled="true"])').first();
      await availableDate.click();
      
      // Check time slots
      await expect(page.locator('.time-slot, button:has-text(":"), [data-testid="time-slot"]')).toBeVisible();
      
      // Should have multiple time options
      const timeSlots = page.locator('.time-slot, button:has-text(":"), [data-testid="time-slot"]');
      await expect(await timeSlots.count()).toBeGreaterThan(0);
    });

    test('should select a time slot', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto(`/booking/new?business=${testBusinessSlug}&service=haircut`);
      
      // Select date
      await page.locator('[role="gridcell"]:not([aria-disabled="true"])').first().click();
      
      // Select time
      const timeSlot = page.locator('.time-slot, button:has-text(":"), [data-testid="time-slot"]').first();
      await timeSlot.click();
      
      // Check time is selected
      await expect(timeSlot).toHaveClass(/selected|active/);
      
      // Continue button should be enabled
      await expect(page.locator('button:has-text("Continue"), button:has-text("Next")')).toBeEnabled();
    });

    test('should show booking summary', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      // Assume we've selected service, date, and time
      await page.goto(`/booking/confirm?business=${testBusinessSlug}&service=haircut&date=2024-12-25&time=14:00`);
      
      // Check summary elements
      await expect(page.locator('text=/Summary|Booking Details/i')).toBeVisible();
      await expect(page.locator('text=/Service:/i')).toBeVisible();
      await expect(page.locator('text=/Date:/i')).toBeVisible();
      await expect(page.locator('text=/Time:/i')).toBeVisible();
      await expect(page.locator('text=/Price:|Total:/i')).toBeVisible();
    });

    test('should allow adding notes', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto(`/booking/confirm?business=${testBusinessSlug}&service=haircut`);
      
      // Find notes field
      const notesField = page.locator('textarea[name="notes"], textarea[placeholder*="notes"], textarea[placeholder*="special requests"]');
      await expect(notesField).toBeVisible();
      
      // Add notes
      await notesField.fill('Please use organic products only');
      await expect(notesField).toHaveValue('Please use organic products only');
    });

    test('should proceed to payment', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto(`/booking/confirm?business=${testBusinessSlug}&service=haircut`);
      
      // Click confirm/pay button
      const payButton = page.locator('button:has-text("Pay"), button:has-text("Confirm"), button:has-text("Book")').last();
      await payButton.click();
      
      // Should navigate to payment page
      await expect(page).toHaveURL(/\/payment|\/checkout|\/booking.*payment/);
    });

    test('should show payment form', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/booking/payment/test-booking-id');
      
      // Check for Stripe elements or payment form
      await expect(page.locator('text=/Payment|Card Details/i')).toBeVisible();
      
      // Check for card input fields (Stripe iframe or inputs)
      await expect(page.frameLocator('iframe').locator('input').or(page.locator('input[placeholder*="Card number"]'))).toBeVisible();
      
      // Check total amount
      await expect(page.locator('text=/Total:|Amount:/i')).toBeVisible();
    });

    test('should handle booking cancellation', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto('/dashboard/bookings');
      
      // Find a booking with cancel option
      const cancelButton = page.locator('button:has-text("Cancel")').first();
      if (await cancelButton.count() > 0) {
        await cancelButton.click();
        
        // Confirm cancellation dialog
        await expect(page.locator('text=/Are you sure|Confirm cancellation/i')).toBeVisible();
        await page.locator('button:has-text("Yes"), button:has-text("Confirm")').click();
        
        // Check for success message
        await expect(page.locator('text=/cancelled|Cancellation successful/i')).toBeVisible();
      }
    });

    test('should show booking confirmation', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      // After successful payment
      await page.goto('/booking/success/test-booking-id');
      
      // Check confirmation elements
      await expect(page.locator('text=/Confirmed|Success|Booked/i')).toBeVisible();
      await expect(page.locator('text=/Reference|Booking ID/i')).toBeVisible();
      
      // Check for booking details
      await expect(page.locator('text=/Date:/i')).toBeVisible();
      await expect(page.locator('text=/Time:/i')).toBeVisible();
      await expect(page.locator('text=/Service:/i')).toBeVisible();
      
      // Check for action buttons
      await expect(page.locator('text=/Add to calendar|View booking/i')).toBeVisible();
    });

    test('should validate booking constraints', async ({ page }) => {
      test.skip(); // Skip if auth required
      
      await page.goto(`/booking/new?business=${testBusinessSlug}&service=haircut`);
      
      // Try to select past date (should be disabled)
      const pastDates = page.locator('[aria-disabled="true"], .calendar-day.disabled');
      await expect(pastDates.first()).toBeVisible();
      
      // Past dates should not be clickable
      await pastDates.first().click();
      
      // Time slots should not appear for past dates
      await expect(page.locator('.time-slot')).not.toBeVisible();
    });
  });
});