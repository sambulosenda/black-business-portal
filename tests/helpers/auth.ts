import { Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation after login
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
}

export const testAccounts = {
  customer1: {
    email: 'customer1@example.com',
    password: 'password123',
    name: 'Sarah Johnson'
  },
  customer2: {
    email: 'customer2@example.com',
    password: 'password123',
    name: 'Michael Brown'
  },
  customer3: {
    email: 'customer3@example.com',
    password: 'password123',
    name: 'Aisha Williams'
  },
  businessOwner1: {
    email: 'business1@example.com',
    password: 'password123',
    name: 'Tasha Green',
    businessName: 'Curls & Coils Beauty Bar',
    businessSlug: 'curls-coils-beauty-bar'
  },
  businessOwner2: {
    email: 'business2@example.com',
    password: 'password123',
    name: 'Marcus King',
    businessName: 'King Cuts Barbershop',
    businessSlug: 'king-cuts-barbershop'
  },
  businessOwner3: {
    email: 'business3@example.com',
    password: 'password123',
    name: 'Jasmine Davis',
    businessName: 'Glow Up Nail Studio',
    businessSlug: 'glow-up-nail-studio'
  },
  businessOwner4: {
    email: 'business4@example.com',
    password: 'password123',
    name: 'Amara Thompson',
    businessName: 'Serenity Spa & Wellness',
    businessSlug: 'serenity-spa-wellness'
  }
};