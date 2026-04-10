import { test as base, Page, Locator } from '@playwright/test';

/**
 * Extended test with common utilities
 */
export interface TestFixtures {
  captureScreenshot: (name: string) => Promise<void>;
  safeClick: (locator: Locator, maxRetries?: number) => Promise<void>;
}

/**
 * Custom fixtures extending Playwright test
 * Provides reusable utilities for all tests
 */
export const testFixtures = base.extend<TestFixtures>({
  /**
   * Capture screenshot with automatic naming
   */
  captureScreenshot: async ({ page }, use) => {
    await use(async (name: string) => {
      await page.screenshot({
        path: `./screenshots/${name}-${Date.now()}.png`,
        fullPage: true,
      });
    });
  },

  /**
   * Safe click with retry logic for flaky elements
   */
  safeClick: async ({ page }, use) => {
    await use(async (locator: Locator, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          await locator.click({ timeout: 5000 });
          return;
        } catch (e) {
          if (i === maxRetries - 1) throw e;
          await page.waitForLoadState('networkidle');
        }
      }
    });
  },
});
