import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { UserFactory, User } from '../utils/test-data.factory';

/**
 * Extended test with authentication helpers
 */
export interface AuthenticatedPage {
  loginPage: LoginPage;
  user: User;
}

/**
 * Custom fixture for authenticated tests
 * Provides pre-authenticated page objects
 */
export const authenticatedPage = base.extend<AuthenticatedPage>({
  // eslint-disable-next-line no-empty-pattern
  user: async ({}, use) => {
    await use(UserFactory.getStandardUser());
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});
