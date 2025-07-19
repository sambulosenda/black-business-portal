import { test, expect } from '@playwright/test';

test.describe('Checkout and Payment', () => {
  test('should show empty cart message', async ({ page }) => {
    await page.goto('/cart');
    
    // Check for empty cart message
    await expect(page.locator('text=/Your cart is empty|No items in cart/i')).toBeVisible();
    await expect(page.locator('a:has-text("Continue Shopping"), button:has-text("Browse")')).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    // Visit a business with products
    await page.goto('/business/glamour-hair-salon');
    
    // Go to products tab if it exists
    const productsTab = page.locator('button:has-text("Products"), a:has-text("Products")');
    if (await productsTab.count() > 0) {
      await productsTab.click();
      await page.waitForTimeout(500);
      
      // Add first product to cart
      const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
      await addToCartButton.click();
      
      // Check for success message or cart update
      await expect(page.locator('text=/Added to cart|Cart updated/i').or(page.locator('[data-testid="cart-count"]'))).toBeVisible();
    }
  });

  test('should display cart page', async ({ page }) => {
    await page.goto('/cart');
    
    // If cart has items, check structure
    const hasItems = await page.locator('.cart-item, [data-testid="cart-item"], tr').count() > 0;
    
    if (hasItems) {
      // Check cart structure
      await expect(page.locator('h1:has-text("Cart"), h2:has-text("Cart")')).toBeVisible();
      await expect(page.locator('text=/Subtotal|Total/i')).toBeVisible();
      await expect(page.locator('button:has-text("Checkout"), a:has-text("Checkout")')).toBeVisible();
    }
  });

  test('should update item quantity', async ({ page }) => {
    // Assuming cart has items
    await page.goto('/cart');
    
    const quantityInput = page.locator('input[type="number"], select[name="quantity"]').first();
    if (await quantityInput.count() > 0) {
      // Increase quantity
      await quantityInput.fill('2');
      
      // Wait for cart to update
      await page.waitForTimeout(500);
      
      // Check total updated
      await expect(page.locator('text=/Total|Subtotal/')).toBeVisible();
    }
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/cart');
    
    const removeButton = page.locator('button:has-text("Remove"), button[aria-label*="Remove"]').first();
    if (await removeButton.count() > 0) {
      // Get initial item count
      const initialCount = await page.locator('.cart-item, [data-testid="cart-item"]').count();
      
      // Remove item
      await removeButton.click();
      
      // Confirm if dialog appears
      const confirmButton = page.locator('button:has-text("Yes"), button:has-text("Confirm")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Wait for update
      await page.waitForTimeout(500);
      
      // Check item was removed
      const newCount = await page.locator('.cart-item, [data-testid="cart-item"]').count();
      expect(newCount).toBeLessThan(initialCount);
    }
  });

  test('should navigate to checkout', async ({ page }) => {
    await page.goto('/cart');
    
    const checkoutButton = page.locator('button:has-text("Checkout"), a:has-text("Checkout")');
    if (await checkoutButton.count() > 0) {
      await checkoutButton.click();
      
      // Should navigate to checkout page
      await expect(page).toHaveURL('/checkout');
      await expect(page.locator('h1:has-text("Checkout")')).toBeVisible();
    }
  });

  test('should display checkout form', async ({ page }) => {
    await page.goto('/checkout');
    
    // Check for order summary
    await expect(page.locator('text=/Order Summary|Summary/i')).toBeVisible();
    
    // Check for delivery/pickup options if products in cart
    const deliveryOptions = page.locator('text=/Delivery|Pickup/i');
    if (await deliveryOptions.count() > 0) {
      await expect(deliveryOptions.first()).toBeVisible();
    }
    
    // Check for promo code field
    await expect(page.locator('input[placeholder*="Promo"], input[placeholder*="Discount"], input[name="promoCode"]')).toBeVisible();
    
    // Check for total
    await expect(page.locator('text=/Total:/i')).toBeVisible();
  });

  test('should apply promo code', async ({ page }) => {
    await page.goto('/checkout');
    
    const promoInput = page.locator('input[placeholder*="Promo"], input[placeholder*="Discount"], input[name="promoCode"]');
    const applyButton = page.locator('button:has-text("Apply")');
    
    if (await promoInput.count() > 0 && await applyButton.count() > 0) {
      // Enter invalid promo code
      await promoInput.fill('INVALID123');
      await applyButton.click();
      
      // Check for error message
      await expect(page.locator('text=/Invalid|not found|expired/i')).toBeVisible();
      
      // Clear and try valid code (if known)
      await promoInput.clear();
      await promoInput.fill('SAVE10');
      await applyButton.click();
      
      // If valid, check for discount applied
      const discountText = page.locator('text=/Discount:|Promo applied/i');
      if (await discountText.count() > 0) {
        await expect(discountText).toBeVisible();
      }
    }
  });

  test('should select delivery option', async ({ page }) => {
    await page.goto('/checkout');
    
    const deliveryRadio = page.locator('input[type="radio"][value="delivery"], label:has-text("Delivery")');
    if (await deliveryRadio.count() > 0) {
      await deliveryRadio.click();
      
      // Delivery form should appear
      await expect(page.locator('input[name*="address"], input[placeholder*="Address"]')).toBeVisible();
      await expect(page.locator('input[name*="city"], input[placeholder*="City"]')).toBeVisible();
      await expect(page.locator('input[name*="postal"], input[placeholder*="Zip"], input[placeholder*="Postcode"]')).toBeVisible();
    }
  });

  test('should proceed to payment', async ({ page }) => {
    await page.goto('/checkout');
    
    // Fill required fields if visible
    const addressInput = page.locator('input[name*="address"]').first();
    if (await addressInput.isVisible()) {
      await addressInput.fill('123 Test Street');
      await page.fill('input[name*="city"]', 'Test City');
      await page.fill('input[name*="postal"], input[name*="zip"]', '12345');
    }
    
    // Click pay button
    const payButton = page.locator('button:has-text("Pay"), button:has-text("Place Order"), button:has-text("Continue to Payment")');
    if (await payButton.count() > 0) {
      await payButton.click();
      
      // Should show payment form or redirect to payment
      await expect(page.locator('text=/Payment|Card/i').or(page).url()).toContain(/payment|stripe/);
    }
  });

  test('should display Stripe payment form', async ({ page }) => {
    // Navigate to a payment page
    await page.goto('/payment/order/test-order-id');
    
    // Check for Stripe elements
    const stripeFrame = page.frameLocator('iframe[title*="Secure payment"], iframe[src*="stripe"]').first();
    
    if (await stripeFrame.locator('input').count() > 0) {
      // Stripe Elements detected
      await expect(stripeFrame.locator('input[placeholder*="Card number"], input[placeholder*="1234"]')).toBeVisible();
    } else {
      // Fallback payment form
      await expect(page.locator('input[placeholder*="Card"], form')).toBeVisible();
    }
    
    // Check payment amount
    await expect(page.locator('text=/Total:|Pay:/i')).toBeVisible();
  });

  test('should handle payment errors', async ({ page }) => {
    test.skip(); // Skip as it requires Stripe test mode
    
    await page.goto('/payment/order/test-order-id');
    
    // Fill Stripe form with test card that triggers error
    const stripeFrame = page.frameLocator('iframe[title*="Secure payment"]').first();
    await stripeFrame.locator('input[placeholder*="Card number"]').fill('4000000000000002'); // Declined card
    await stripeFrame.locator('input[placeholder*="MM / YY"]').fill('12/25');
    await stripeFrame.locator('input[placeholder*="CVC"]').fill('123');
    
    // Submit payment
    await page.locator('button:has-text("Pay")').click();
    
    // Check for error message
    await expect(page.locator('text=/declined|failed|error/i')).toBeVisible();
  });

  test('should show order confirmation', async ({ page }) => {
    // After successful payment
    await page.goto('/order/success/test-order-id');
    
    // Check confirmation elements
    await expect(page.locator('text=/Confirmed|Success|Thank you/i')).toBeVisible();
    await expect(page.locator('text=/Order.*#|Reference/i')).toBeVisible();
    
    // Check order details
    await expect(page.locator('text=/Items|Products|Services/i')).toBeVisible();
    await expect(page.locator('text=/Total paid/i')).toBeVisible();
    
    // Check for next steps
    await expect(page.locator('text=/email|confirmation/i')).toBeVisible();
  });

  test('should handle mixed cart (products + services)', async ({ page }) => {
    await page.goto('/cart');
    
    // Check if cart has both products and services
    const hasProducts = await page.locator('text=/Product|Item/i').count() > 0;
    const hasServices = await page.locator('text=/Service|Appointment/i').count() > 0;
    
    if (hasProducts && hasServices) {
      // Mixed cart should show both types
      await expect(page.locator('text=/Products/i')).toBeVisible();
      await expect(page.locator('text=/Services/i')).toBeVisible();
      
      // Should have option to book appointment time
      const checkoutButton = page.locator('button:has-text("Checkout")');
      await checkoutButton.click();
      
      // Should prompt for appointment booking
      await expect(page.locator('text=/appointment|booking time/i')).toBeVisible();
    }
  });
});