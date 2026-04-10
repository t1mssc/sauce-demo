/**
 * User interface matching the JSON test data structure
 */
export interface User {
  username: string;
  password: string;
  expectedBehavior: string;
  description: string;
}

/**
 * Test data factory for Swag Labs e-commerce application
 * Provides typed access to test user data
 */
export const UserFactory = {
  /**
   * Get all users from test data
   */
  getUsers(): User[] {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const users: User[] = require('../data/users.json');
    return users;
  },

  /**
   * Get a specific user by username
   */
  getUser(username: string): User | undefined {
    return this.getUsers().find(u => u.username === username);
  },

  /**
   * Get standard user for happy path tests
   */
  getStandardUser(): User {
    return this.getUser('standard_user')!;
  },

  /**
   * Get locked out user for error handling tests
   */
  getLockedOutUser(): User {
    return this.getUser('locked_out_user')!;
  },

  /**
   * Get performance glitch user for timing tests
   */
  getPerformanceGlitchUser(): User {
    return this.getUser('performance_glitch_user')!;
  },

  /**
   * Get visual user for visual regression tests
   */
  getVisualUser(): User {
    return this.getUser('visual_user')!;
  },
};
