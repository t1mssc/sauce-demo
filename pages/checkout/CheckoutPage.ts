import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * CheckoutPage - Page Object Model for Swag Labs checkout step 1 (information)
 * Encapsulates checkout form fields and continue action
 */
export class CheckoutPage extends BasePage {
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.postalCodeInput = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  /** @inheritDoc */
  async waitForReady(): Promise<void> {
    await Promise.all([
      this.firstNameInput.waitFor({ state: 'visible' }),
      this.continueButton.waitFor({ state: 'visible' }),
    ]);
  }

  /** @inheritDoc */
  getUrl(): string {
    return 'https://www.saucedemo.com/checkout-step-one.html';
  }

  /**
   * Fill checkout information
   * @param firstName - First name
   * @param lastName - Last name
   * @param postalCode - Zip/Postal code
   */
  async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  /**
   * Click continue button
   */
  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }
}
