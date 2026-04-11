import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * InventoryPage - Page Object Model for Swag Labs inventory page
 * Encapsulates product listing and add-to-cart actions
 */
export class InventoryPage extends BasePage {
  private readonly sauceLabsBackpackAddBtn: Locator;
  private readonly cartIcon: Locator;

  constructor(page: Page) {
    super(page);
    // Locator for "Sauce Labs Backpack" add to cart button
    this.sauceLabsBackpackAddBtn = page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Backpack' }).getByRole('button', { name: 'Add to cart' })
      .or(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')); // Fallback locator
    // Shopping cart icon/link in header
    this.cartIcon = page.locator('#shopping_cart_container a');
  }

  /** @inheritDoc */
  async waitForReady(): Promise<void> {
    await this.cartIcon.waitFor({ state: 'visible' });
  }

  /** @inheritDoc */
  getUrl(): string {
    return 'https://www.saucedemo.com/inventory.html';
  }

  /**
   * Add "Sauce Labs Backpack" to cart
   */
  async addSauceLabsBackpackToCart(): Promise<void> {
    await this.sauceLabsBackpackAddBtn.click();
  }

  /**
   * Navigate to shopping cart
   */
  async goToCart(): Promise<void> {
    await this.cartIcon.click();
  }
}

