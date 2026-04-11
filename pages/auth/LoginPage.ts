import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * LoginPage - Page Object Model for Swag Labs login page
 * Encapsulates all login-related locators and actions
 */
export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    // Using getByRole for accessible and reliable locators
    this.usernameInput = page.getByPlaceholder('Username')
      .or(this.page.locator('[data-test="username"]')); // Fallback locator
    this.passwordInput = page.getByPlaceholder('Password')
      .or(this.page.locator('[data-test="password"]')); // Fallback locator
    this.loginButton = page.getByRole('button', { name: 'Login' })
      .or(this.page.locator('[data-test="login-button"]')); // Fallback locator
  }

  /** @inheritDoc */
  async waitForReady(): Promise<void> {
    await Promise.all([
      this.usernameInput.waitFor({ state: 'visible' }),
      this.passwordInput.waitFor({ state: 'visible' }),
    ]);
  }

  /** @inheritDoc */
  getUrl(): string {
    return 'https://www.saucedemo.com/';
  }

  /**
   * Navigate to the login page with retry logic for WebKit flakiness
   */
  async navigate(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        await this.page.goto(this.getUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
        await this.waitForReady();
        return;
      } catch (err: any) {
        attempts++;
        // Only retry on frame detachment/navigation errors
        if (attempts >= maxAttempts || !(err.message && err.message.includes('frame was detached'))) {
          throw err;
        }
        // Optionally wait before retrying
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill in username field
   * @param username - The username to enter
   */
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /**
   * Fill in password field
   * @param password - The password to enter
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Click the login button
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Perform complete login flow
   * @param username - The username
   * @param password - The password
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  /**
   * Get error message text if present on the login page
   * @returns Error message text or null if not present
   */
  async getErrorMessage(): Promise<string | null> {
    const errorLocator = this.page.locator('[data-test="error"]');
    const isVisible = await errorLocator.isVisible().catch(() => false);
    if (!isVisible) {
      return null;
    }
    return errorLocator.textContent();
  }
}

