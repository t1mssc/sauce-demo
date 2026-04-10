
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/LoginPage';
import { UserFactory } from '../../utils/test-data.factory';
import { createLogger } from '../../utils/logger';

// Increase timeout for all login tests to 60s
test.describe.configure({ timeout: 60000 });

/**
 * Login Test Suite - Data-driven authentication flow tests
 * Uses Page Object Model and JSON data for maintainable test automation.
 */
test.describe('Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  /**
   * Test: Standard user can login with valid credentials
   */
  test('standard_user can login with valid credentials', async ({ page }, testInfo) => {
    const user = UserFactory.getStandardUser();
    const logger = createLogger(testInfo.title, testInfo.project.name);

    await loginPage.login(user.username, user.password);
    logger.info('Logging in with standard user credentials');
    await expect(page).toHaveURL(/.*inventory\.html/);
    logger.info('Successfully logged in and navigated to inventory page');
  });

  /**
   * Test: Locked out user shows error message
   */
  test('locked_out_user shows error message', async ({ page }, testInfo) => {
    const user = UserFactory.getLockedOutUser();
    const logger = createLogger(testInfo.title, testInfo.project.name);
      
    await loginPage.login(user.username, user.password);
    logger.info('Logging in with locked out user credentials');

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).not.toBeNull();
    expect(errorMessage).toContain('locked out');
    logger.info('Checking for error message');
  });

  /**
   * Test: Performance glitch user has slow login
   */
  test('performance_glitch_user can login', async ({ page }, testInfo) => {
    const user = UserFactory.getPerformanceGlitchUser();
    const logger = createLogger(testInfo.title, testInfo.project.name);
    
    await loginPage.login(user.username, user.password);
    logger.info('Logging in with performance glitch user credentials');
    await expect(page).toHaveURL(/.*inventory\.html/);
    logger.info('Successfully logged in and navigated to inventory page');
  });

  /**
   * Test: Visual user can login
   */
  test('visual_user can login', async ({ page }, testInfo) => {
    const user = UserFactory.getVisualUser();
    const logger = createLogger(testInfo.title, testInfo.project.name);
    
    await loginPage.login(user.username, user.password);
    logger.info('Logging in with visual user credentials');
    await expect(page).toHaveURL(/.*inventory\.html/);
    logger.info('Successfully logged in and navigated to inventory page');
  });

  /**
   * Test: Invalid credentials show error message
   */
  test('invalid credentials show error message', async ({ page }, testInfo) => {
    const logger = createLogger(testInfo.title, testInfo.project.name);

    await loginPage.login('invalid_user', 'invalid_password');
    logger.info('Attempting login with invalid credentials');
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).not.toBeNull();
    expect(errorMessage).toContain('Username and password do not match');
    logger.info('Verified error message for invalid credentials');
  });
});
