import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * CheckoutOverviewPage - Page Object Model for Swag Labs checkout step 2 (overview)
 * Encapsulates order review and order completion actions
 */
export class CheckoutOverviewPage extends BasePage {
  private readonly finishButton: Locator;
  private readonly orderCompleteHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.finishButton = page.getByRole('button', { name: 'Finish' })
      .or(this.page.locator('[data-test="continue"]')); // Fallback locator
    this.orderCompleteHeader = page.getByRole('heading', { name: 'Thank you for your order!' });
  }

  /** @inheritDoc */
  async waitForReady(): Promise<void> {
    await this.finishButton.waitFor({ state: 'visible' });
  }

  /** @inheritDoc */
  getUrl(): string {
    return 'https://www.saucedemo.com/checkout-step-two.html';
  }

  /**
   * Click finish button to complete order
   */
  async clickFinish(): Promise<void> {
    await this.finishButton.click();
  }

  /**
   * Verify order completion success message is visible
   */
  async verifyOrderComplete(): Promise<void> {
    await this.orderCompleteHeader.waitFor({ state: 'visible' });
  }
}

