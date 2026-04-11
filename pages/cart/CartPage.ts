import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * CartPage - Page Object Model for Swag Labs shopping cart page
 * Encapsulates cart actions and checkout initiation
 */
export class CartPage extends BasePage {
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.checkoutButton = this.page.getByRole('button', { name: 'Checkout' })
      .or(this.page.locator('[data-test="checkout"]')); // Fallback locator
  }

  /** @inheritDoc */
  async waitForReady(): Promise<void> {
    await this.checkoutButton.waitFor({ state: 'visible' });
  }

  /** @inheritDoc */
  getUrl(): string {
    return 'https://www.saucedemo.com/cart.html';
  }

  /**
   * Click checkout button to proceed
   */
  async clickCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}

