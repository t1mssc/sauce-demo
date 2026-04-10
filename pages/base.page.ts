import { Page } from '@playwright/test';

/**
 * Abstract base class for all Page Objects
 * Enforces standard practices across all page objects
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Mandatory: Wait for page to be fully loaded
   * Each page must implement at least 2 visibility checks
   */
  abstract waitForReady(): Promise<void>;

  /**
   * Mandatory: Return the page URL
   */
  abstract getUrl(): string;

  /**
   * Navigate to this page and wait for readiness
   */
  async goto(): Promise<void> {
    await this.page.goto(this.getUrl());
    await this.waitForReady();
  }

  /**
   * Capture screenshot with automatic naming
   * @param name - Screenshot name prefix
   */
  async capture(name: string): Promise<void> {
    await this.page.screenshot({
      path: `./screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }
}
