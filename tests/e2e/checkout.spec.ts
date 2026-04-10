import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/cart/CartPage';
import { CheckoutPage } from '../../pages/checkout/CheckoutPage';
import { CheckoutOverviewPage } from '../../pages/checkout/CheckoutOverviewPage';
import { UserFactory } from '../../utils/test-data.factory';
import { createLogger } from '../../utils/logger';


/**
 * Checkout Flow Test Suite - Validates Swag Labs end-to-end checkout process
 * Uses Page Object Model for maintainable test automation
 */
test.describe('Checkout Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let checkoutOverviewPage: CheckoutOverviewPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    checkoutOverviewPage = new CheckoutOverviewPage(page);
  });

  /**
   * Test: Standard user can complete checkout flow
   */
  test('standard_user can complete checkout flow', async ({ page }, testInfo) => {
    const user = UserFactory.getStandardUser();
    const logger = createLogger(testInfo.title, testInfo.project.name);

    await loginPage.navigate();
    logger.info('Starting checkout flow for standard user');
    await loginPage.login(user.username, user.password);
    logger.info('Logging in with standard user credentials');
    await inventoryPage.addSauceLabsBackpackToCart();
    logger.info('Adding item to cart');
    await inventoryPage.goToCart();
    logger.info('Navigating to cart');
    await cartPage.clickCheckout();
    logger.info('Proceeding to checkout');
    await checkoutPage.fillCheckoutInfo('testing', 'testing', '1234');
    logger.info('Filling checkout information');
    await checkoutPage.clickContinue();
    logger.info('Continuing to checkout overview');

    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    logger.info('Verifying checkout overview page');
    await checkoutOverviewPage.clickFinish();
    logger.info('Finishing checkout');
    await checkoutOverviewPage.verifyOrderComplete();
    logger.info('Verifying order completion');
  });

  /**
   * Test: Performance glitch user can complete checkout flow
   */
  
  test('performance_glitch_user can complete checkout flow', async ({ page }, testInfo) => {
    const user = UserFactory.getPerformanceGlitchUser();
    const logger = createLogger(testInfo.title, testInfo.project.name);

    await loginPage.navigate();
    logger.info('Starting checkout flow for performance glitch user');
    await loginPage.login(user.username, user.password);
    logger.info('Logging in with performance glitch user credentials');
    await inventoryPage.addSauceLabsBackpackToCart();
    logger.info('Adding item to cart');
    await inventoryPage.goToCart();
    logger.info('Navigating to cart');
    await cartPage.clickCheckout();
    logger.info('Proceeding to checkout');
    await checkoutPage.fillCheckoutInfo('testing', 'testing', '1234');
    logger.info('Filling checkout information');
    await checkoutPage.clickContinue();
    logger.info('Continuing to checkout overview');

    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    logger.info('Verifying checkout overview page');
    await checkoutOverviewPage.clickFinish();
    logger.info('Finishing checkout');
    await checkoutOverviewPage.verifyOrderComplete();
    logger.info('Verifying order completion');
  });

  /**
   * Test: Visual user can complete checkout flow
   */
  test('visual_user can complete checkout flow', async ({ page }, testInfo) => {
    const user = UserFactory.getVisualUser();
    const logger = createLogger(testInfo.title, testInfo.project.name);

    await loginPage.navigate();
    logger.info('Starting checkout flow for visual user');
    await loginPage.login(user.username, user.password);
    logger.info('Logging in with visual user credentials');
    await inventoryPage.addSauceLabsBackpackToCart();
    logger.info('Adding item to cart');
    await inventoryPage.goToCart();
    logger.info('Navigating to cart');
    await cartPage.clickCheckout();
    logger.info('Proceeding to checkout');
    await checkoutPage.fillCheckoutInfo('testing', 'testing', '1234');
    logger.info('Filling checkout information');
    await checkoutPage.clickContinue();
    logger.info('Continuing to checkout overview');

    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    logger.info('Verifying checkout overview page');
    await checkoutOverviewPage.clickFinish();
    logger.info('Finishing checkout');
    await checkoutOverviewPage.verifyOrderComplete();
    logger.info('Verifying order completion');
  });
});

