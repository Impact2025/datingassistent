/**
 * SMOKE TESTS - User Acceptance Testing
 * Run with: npx playwright test
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://datingassistent.vercel.app';

test.describe('Critical User Flows', () => {
  test('Health endpoint is healthy', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/health`);
    expect(response?.status()).toBe(200);
    
    const data = await response?.json();
    expect(data.status).toBe('healthy');
    expect(data.checks.database).toBe('ok');
    expect(data.checks.api).toBe('ok');
  });

  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Dating/i);
    
    // No console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.waitForLoadState('networkidle');
    expect(errors.length).toBe(0);
  });

  test('Dashboard requires authentication', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Should redirect to login
    await page.waitForURL(/login|auth/);
    expect(page.url()).toMatch(/login|auth/);
  });

  test('Chat page loads with Suspense', async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    
    // Wait for Suspense fallback to be replaced
    await page.waitForLoadState('networkidle');
    
    // Check for chat interface
    const chatPresent = await page.locator('[class*="chat"]').count() > 0;
    expect(chatPresent).toBeTruthy();
  });

  test('BottomNavigation renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto(`${BASE_URL}/dashboard`);
    
    // BottomNavigation should be visible
    const nav = page.locator('nav[aria-label="Hoofdnavigatie"]');
    await expect(nav).toBeVisible();
  });

  test('CSRF token endpoint works', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/csrf-token`);
    expect(response?.status()).toBe(200);
    
    const data = await response?.json();
    expect(data.token).toBeTruthy();
    expect(data.token.length).toBeGreaterThan(32);
  });

  test('Security headers are present', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/health`);
    const headers = response?.headers();
    
    expect(headers?.['x-frame-options']).toBe('DENY');
    expect(headers?.['x-content-type-options']).toBe('nosniff');
    expect(headers?.['x-xss-protection']).toBeTruthy();
  });
});

test.describe('Performance Tests', () => {
  test('Page loads within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('load');
    const loadTime = Date.now() - start;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('No layout shifts on load', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check for CLS issues (basic check)
    const shifts = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 2000);
      });
    });
    
    expect(Number(shifts)).toBeLessThan(0.1); // CLS should be < 0.1
  });
});
