```markdown
# Claude.md - Playwright QA Automation Standards
## AI Agent Context for Playwright Test Development

---

## 1. Project Context & Stack

**Framework:** Playwright (TypeScript)  
**Test Runner:** Playwright Test (@playwright/test)  
**Reporting:** Playwright HTML Report + Allure (optional)  
**CI/CD:** Docker + Jenkins (Declarative Pipelines)
**Environment:** Node.js 18+ (Alpine/Slim base images)  

**Core Principles:**
- Containerized execution for consistency across environments
- Jenkins Blue Ocean/dashboard integration for visibility
- Accessibility-first selector strategy
- Parallel execution by default (workers: 4+)
- API-seeded data for test isolation
- Visual regression for critical paths

---

## 2. Testing Strategy Pyramid

### 2.1 Test Distribution
```
70% Unit/Component (Developer owned)
20% Integration/API (Shared)
10% E2E Critical Paths (QA owned)
```

### 2.2 E2E Test Categories

**P0 - Smoke Tests (Run on every PR)**
- Login/Authentication flows
- Critical business transactions (Checkout, Booking, etc.)
- Navigation & routing integrity

**P1 - Regression Suite (Nightly/Scheduled)**
- Full user journeys (Happy paths)
- Cross-browser validation (Chromium, Firefox, WebKit)
- Mobile viewport testing

**P2 - Edge Cases (Weekly)**
- Error handling & validation
- Boundary value testing
- Accessibility compliance (WCAG 2.1 AA)

### 2.3 Test Data Strategy
- **Seeding:** Use API calls in `test.beforeEach()` - never use UI to setup data
- **Factories:** Implement typed data factories (e.g., `userFactory.createAdmin()`)
- **Cleanup:** Use `test.afterEach()` with API deletion (soft-delete awareness)
- **Isolation:** Never share state between tests (parallel execution required)

---

## 3. Page Object Architecture

### 3.1 Directory Structure
```
├── pages/
│   ├── base.page.ts          # Abstract base with common methods
│   ├── components/           # Shared UI components (Header, Modal, Toast)
│   │   ├── navigation.component.ts
│   │   └── notification.component.ts
│   └── [feature]/            # Domain-specific pages
│       ├── login.page.ts
│       └── dashboard.page.ts
├── fixtures/
│   ├── test.fixtures.ts      # Custom fixtures extending test
│   └── auth.fixture.ts       # Authentication state helpers
├── utils/
│   ├── api-helper.ts         # REST/GraphQL helpers
│   ├── test-data.factory.ts  # Data generation
│   └── visual-helpers.ts     # Screenshot utilities
└── tests/
    ├── api/                  # Integration tests
    ├── e2e/                  # End-to-end flows
    └── visual/               # Visual regression
```

### 3.2 Base Page Contract
```typescript
// Abstract class enforcing standard practices
abstract class BasePage {
  protected readonly page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }
  
  // Mandatory: Wait for network idle + visible elements
  abstract waitForReady(): Promise<void>;
  
  // Mandatory: URL validation
  abstract getUrl(): string;
  
  // Shared utilities
  async goto(): Promise<void> {
    await this.page.goto(this.getUrl());
    await this.waitForReady();
  }
  
  // Screenshot with automatic naming
  async capture(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `./screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}
```

### 3.3 Page Object Standards

**Selector Priority (Mandatory):**
1. `getByRole()` - buttons, links, headings (accessibility)
2. `getByLabel()` - form inputs
3. `getByText()` - visible text (exact match preferred)
4. `getByTestId()` - last resort for complex components
5. **NEVER** use CSS/XPath selectors (class names, IDs)

**Action Method Pattern:**
```typescript
// Good: Action + Verification
async submitLoginForm(email: string, password: string): Promise<DashboardPage> {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  
  // Wait for navigation or API call completion
  await Promise.all([
    this.page.waitForResponse(resp => resp.url().includes('/api/auth')),
    this.submitButton.click()
  ]);
  
  return new DashboardPage(this.page);
}

// Bad: Simple click without waiting
async clickSubmit() {
  await this.submitButton.click(); // Race conditions likely
}
```

---

## 4. Playwright Configuration Standards

### 4.1 playwright.config.ts
```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  
  // Reporting
  reporter: [
    ['html', { open: 'never' }],
    ['allure-playwright'],
    ['list'] // Console output
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Context options
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Storage state for auth (generated via setup project)
    storageState: 'storageState.json',
  },
  
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
  ],
});
```

---

## 5. AI Agent Instructions (Claude)

### 5.1 Code Generation Rules

**When generating Page Objects:**
1. Always extend `BasePage` abstract class
2. Expose elements as private getters using `locator` (not `selector` strings)
3. Implement `waitForReady()` with at least 2 visibility checks
4. Return new Page instances after navigation actions
5. Add JSDoc comments for complex business logic

**When generating Tests:**
1. Use `test.step()` for readability in reports
2. Group related assertions in `expect.soft()` blocks (failures don't stop test)
3. Use data-driven patterns with `test.describe.parallel()`
4. Tag tests: `@smoke`, `@regression`, `@flaky` (for retry-heavy tests)

**When handling Selectors:**
- ❌ **Forbidden:** `page.locator('.btn-primary')`, `page.locator('#submit')`
- ❌ **Forbidden:** `page.locator('div > div:nth-child(3)')`
- ✅ **Required:** `page.getByRole('button', { name: 'Submit' })`
- ✅ **Required:** `page.getByLabel('Email address')`

### 5.2 Async/Await Patterns
- Always await locators before actions (auto-waiting is good, explicit is better)
- Use `Promise.all()` for concurrent actions (e.g., click + navigation)
- Never use `page.waitForTimeout()` (use `waitForResponse` or `waitForSelector` with state)

### 5.3 Error Handling & Debugging
```typescript
// Wrap flaky operations with retry logic
async safeClick(locator: Locator, maxRetries = 3): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await locator.click({ timeout: 5000 });
      return;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await this.page.waitForLoadState('networkidle');
    }
  }
}

// Automatic debug info on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.evaluate(() => {
      console.log(`URL: ${window.location.href}`);
      console.log(`Console errors: ${window.errors}`); // If captured
    });
  }
});
```

---

## 6. Advanced Patterns

### 6.1 API-First Testing Pattern
```typescript
// Seed data via API, verify via UI
test('user profile update', async ({ page, apiContext }) => {
  // Setup
  const user = await apiContext.post('/api/users', { data: userFactory.build() });
  
  // Action
  const profilePage = new ProfilePage(page);
  await profilePage.goto(user.id);
  await profilePage.updateBio('New bio');
  
  // Verify
  await expect(page.getByText('New bio')).toBeVisible();
  
  // Cleanup (if needed)
  await apiContext.delete(`/api/users/${user.id}`);
});
```

### 6.2 Visual Regression Standards
```typescript
// Component-level visual tests
test('dashboard visual regression', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();
  
  // Wait for all images/fonts
  await page.waitForLoadState('networkidle');
  
  // Mask dynamic content (dates, timestamps)
  await expect(page).toHaveScreenshot('dashboard.png', {
    mask: [page.locator('.current-date'), page.locator('.user-avatar')],
    threshold: 0.2,
    maxDiffPixelRatio: 0.05
  });
});
```

### 6.3 Authentication State Management
```typescript
// Generate storage state once per worker
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/admin.json'
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
```

---

## 7. Maintenance & Self-Healing

### 7.1 Locator Resilience Strategy
When a locator fails:
1. Check for `getByRole` alternatives (preferred)
2. Use `filter()` for specificity: `page.getByRole('button').filter({ hasText: 'Save' })`
3. Implement fallback chains only if necessary:
```typescript
get submitButton() {
  return this.page.getByRole('button', { name: 'Submit' })
    .or(this.page.getByTestId('submit-btn')); // Fallback
}
```

### 7.2 Test Health Monitoring
- Tag flaky tests with `@flaky` and set `retries: 3` in config
- Monitor test duration: fail if >30s for E2E, >5s for API
- Weekly review of `test.skip()` and `test.fixme()` usages

---

## 8. Checklist for Claude

Before generating any test code, verify:
- [ ] Does it use accessibility-first selectors?
- [ ] Are API calls used for test setup instead of UI clicks?
- [ ] Does the Page Object implement `waitForReady()`?
- [ ] Are there proper TypeScript return types?
- [ ] Is error handling implemented for network-dependent actions?
- [ ] Does it follow the `test.step()` pattern for readability?
- [ ] Are dynamic values (dates, random strings) handled via factories?

---

## 9. Example: Complete Implementation

```typescript
// pages/login.page.ts
export class LoginPage extends BasePage {
  // Locators (private)
  private get emailInput() { 
    return this.page.getByLabel('Email address'); 
  }
  private get passwordInput() { 
    return this.page.getByLabel('Password'); 
  }
  private get submitButton() { 
    return this.page.getByRole('button', { name: 'Sign in' }); 
  }
  
  // Implementation of abstract methods
  async waitForReady(): Promise<void> {
    await this.page.waitForURL('/login');
    await this.emailInput.waitFor({ state: 'visible' });
  }
  
  getUrl(): string {
    return '/login';
  }
  
  // Business methods
  async loginAs(email: string, password: string): Promise<DashboardPage> {
    await test.step(`Login as ${email}`, async () => {
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);
      
      await Promise.all([
        this.page.waitForURL('/dashboard'),
        this.submitButton.click()
      ]);
    });
    
    return new DashboardPage(this.page);
  }
}

// tests/e2e/auth.spec.ts
test.describe('Authentication @smoke', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    const dashboard = await loginPage.loginAs(
      'admin@example.com', 
      'password123'
    );
    
    await expect(dashboard.welcomeHeader).toContainText('Welcome');
  });
  
  test('invalid credentials show error @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.emailInput.fill('invalid@example.com');
    await loginPage.passwordInput.fill('wrong');
    await loginPage.submitButton.click();
    
    await expect(
      page.getByRole('alert').getByText('Invalid credentials')
    ).toBeVisible();
  });
});
```

## 10. Docker & Jenkins CI/CD Configuration

### 10.1 Docker Architecture

**Base Image Strategy:**
Use official Playwright images or build custom with browser dependencies cached.

```dockerfile
# Dockerfile.playwright
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Set working directory
WORKDIR /app

# Install additional dependencies (if needed)
RUN apt-get update && apt-get install -y \
    curl \
    openjdk-11-jdk \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies (including playwright browsers)
RUN npm ci
RUN npx playwright install-deps chromium firefox webkit

# Copy test code
COPY . .

# Create directories for reports
RUN mkdir -p playwright-report test-results screenshots

# Set environment variables
ENV CI=true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV NODE_ENV=ci

# Default command (overridden by Jenkins)
CMD ["npx", "playwright", "test", "--reporter=list"]
```

**Docker Compose for Local/CI:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  playwright-tests:
    build:
      context: .
      dockerfile: Dockerfile.playwright
    volumes:
      - ./playwright-report:/app/playwright-report
      - ./test-results:/app/test-results
      - ./screenshots:/app/screenshots
    environment:
      - BASE_URL=http://app-under-test:3000
      - CI=true
    depends_on:
      - app-under-test
    networks:
      - test-network

  app-under-test:
    image: your-application-image:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=test
    networks:
      - test-network

networks:
  test-network:
    driver: bridge
```

**Docker Ignore Optimization:**
```dockerfile
# .dockerignore
node_modules
playwright-report
test-results
screenshots
*.log
.git
.gitignore
README.md
Dockerfile*
docker-compose*
jenkins/
```

### 10.2 Jenkins Pipeline (Declarative)

**Jenkinsfile Structure:**

```groovy
// Jenkinsfile
pipeline {
    agent none  // Define agents per stage for optimization
    
    options {
        timestamps()
        ansiColor('xterm')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 45, unit: 'MINUTES')
    }
    
    environment {
        NODE_ENV = 'ci'
        CI = 'true'
        PLAYWRIGHT_BROWSERS_PATH = '0'  // Use locally installed browsers
        // Credentials injected securely
        BASE_URL = credentials('app-base-url')
        TEST_USER_EMAIL = credentials('test-user-email')
        TEST_USER_PASSWORD = credentials('test-user-password')
    }
    
    stages {
        stage('Pre-build Checks') {
            agent { label 'docker && linux' }
            steps {
                script {
                    // Verify Docker is available
                    sh 'docker --version'
                    sh 'docker-compose --version'
                    
                    // Clean workspace of old reports
                    sh 'rm -rf playwright-report test-results screenshots || true'
                }
            }
        }
        
        stage('Build Test Image') {
            agent { label 'docker && linux' }
            steps {
                script {
                    // Build with cache
                    sh '''
                        docker build \
                            --cache-from playwright-tests:latest \
                            -t playwright-tests:${BUILD_NUMBER} \
                            -f Dockerfile.playwright .
                    '''
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Chrome Tests') {
                    agent { label 'docker && linux' }
                    steps {
                        runPlaywrightTests('chromium', 'playwright-chrome')
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'playwright-report-chrome/**/*', allowEmptyArchive: true
                        }
                    }
                }
                stage('Firefox Tests') {
                    agent { label 'docker && linux' }
                    steps {
                        runPlaywrightTests('firefox', 'playwright-firefox')
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'playwright-report-firefox/**/*', allowEmptyArchive: true
                        }
                    }
                }
                stage('WebKit Tests') {
                    agent { label 'docker && linux' }
                    steps {
                        runPlaywrightTests('webkit', 'playwright-webkit')
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'playwright-report-webkit/**/*', allowEmptyArchive: true
                        }
                    }
                }
            }
        }
        
        stage('Merge Reports') {
            agent { label 'docker && linux' }
            steps {
                script {
                    // Combine reports from parallel runs
                    sh '''
                        mkdir -p merged-report
                        cp -r playwright-report-chrome/* merged-report/ || true
                        cp -r playwright-report-firefox/* merged-report/ || true
                        cp -r playwright-report-webkit/* merged-report/ || true
                    '''
                    
                    // Generate Allure report if used
                    // sh 'allure generate allure-results -o allure-report --clean'
                }
            }
        }
        
        stage('Deploy Reports') {
            agent { label 'docker && linux' }
            steps {
                script {
                    // Publish HTML reports
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'merged-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Test Report'
                    ])
                    
                    // Publish to external dashboard (optional)
                    // sh "curl -X POST -F 'file=@merged-report/index.html' ${REPORT_DASHBOARD_URL}"
                }
            }
        }
    }
    
    post {
        always {
            node('docker && linux') {
                // Cleanup Docker images to save space
                sh '''
                    docker rmi playwright-tests:${BUILD_NUMBER} || true
                    docker system prune -f || true
                '''
                
                // Clean workspace except for last 5 builds (handled by logRotator)
                cleanWs()
            }
        }
        success {
            script {
                // Slack/Teams notification
                slackSend(
                    color: 'good',
                    message: "✅ Tests passed - ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)"
                )
            }
        }
        failure {
            script {
                slackSend(
                    color: 'danger',
                    message: """
                    ❌ Tests FAILED - ${env.JOB_NAME} ${env.BUILD_NUMBER}
                    Failed: ${currentBuild.rawBuild.getAction(hudson.tasks.junit.TestResultAction.class)?.failCount ?: 'N/A'}
                    <${env.BUILD_URL}console|Console Log> | <${env.BUILD_URL}testReport|Test Report>
                    """
                )
                
                // Email notification for critical failures
                emailext(
                    subject: "Test Failure: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                    body: """
                    <p>Playwright tests failed in ${env.JOB_NAME}</p>
                    <p>Check <a href="${env.BUILD_URL}">Jenkins Build</a> for details.</p>
                    <p>Artifacts available in Playwright Test Report</p>
                    """,
                    to: "${env.CHANGE_AUTHOR_EMAIL ?: 'qa-team@company.com'}",
                    mimeType: 'text/html'
                )
            }
        }
        unstable {
            script {
                slackSend(
                    color: 'warning',
                    message: "⚠️ Tests unstable (flaky) - ${env.JOB_NAME} ${env.BUILD_NUMBER}"
                )
            }
        }
    }
}

// Shared function for running tests
def runPlaywrightTests(String project, String containerName) {
    sh """
        docker run --rm \
            --name ${containerName}-${BUILD_NUMBER} \
            -e BASE_URL=${BASE_URL} \
            -e TEST_USER_EMAIL=${TEST_USER_EMAIL} \
            -e TEST_USER_PASSWORD=${TEST_USER_PASSWORD} \
            -e CI=true \
            -v \$(pwd)/playwright-report-${project}:/app/playwright-report \
            -v \$(pwd)/test-results-${project}:/app/test-results \
            playwright-tests:${BUILD_NUMBER} \
            npx playwright test --project=${project} --reporter=html,line,allure-playwright
    """
}
```

### 10.3 Jenkins Configuration Standards

**Node/Agent Requirements:**
- Docker installed with access to daemon
- At least 4GB RAM per browser container
- SSD storage for faster image pulls
- Network access to application under test

**Credential Management:**
```groovy
// In Jenkinsfile or Global Pipeline Libraries
withCredentials([
    string(credentialsId: 'api-key', variable: 'API_KEY'),
    usernamePassword(
        credentialsId: 'test-account', 
        usernameVariable: 'TEST_USER', 
        passwordVariable: 'TEST_PASS'
    )
]) {
    sh 'docker run ... -e API_KEY=$API_KEY ...'
}
```

**Pipeline Optimization:**

```groovy
// Use Jenkins Shared Library for common Playwright steps
// vars/playwrightUtils.groovy

def setupNode() {
    sh '''
        # Cache node_modules between builds
        if [ ! -d "node_modules" ]; then
            npm ci
            npx playwright install
        fi
    '''
}

def runTests(String tags = '') {
    sh """
        npx playwright test \
            ${tags ? '--grep ' + tags : ''} \
            --workers=4 \
            --reporter=html,line,junit
    """
}

def publishResults() {
    junit testResults: 'junit-results.xml', allowEmptyResults: true
    
    publishHTML([
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        reportName: 'E2E Test Results'
    ])
}
```

### 10.4 Multi-Environment Strategy

```groovy
// Jenkinsfile (excerpt)
parameters {
    choice(
        name: 'TEST_ENV', 
        choices: ['dev', 'staging', 'prod'], 
        description: 'Environment to test'
    )
    choice(
        name: 'TEST_SUITE', 
        choices: ['smoke', 'regression', 'full'], 
        description: 'Test suite to run'
    )
    booleanParam(
        name: 'VISUAL_REGRESSION', 
        defaultValue: false, 
        description: 'Run visual regression tests'
    )
}

stages {
    stage('Dynamic Config') {
        steps {
            script {
                def envConfig = [
                    dev: [url: 'https://dev.app.com', workers: 4],
                    staging: [url: 'https://staging.app.com', workers: 2],
                    prod: [url: 'https://app.com', workers: 1]  // Careful with prod
                ]
                
                env.BASE_URL = envConfig[params.TEST_ENV].url
                env.PW_WORKERS = envConfig[params.TEST_ENV].workers
                
                // Update playwright.config.ts dynamically
                sh """
                    cat > .env.ci <<EOF
BASE_URL=${env.BASE_URL}
WORKERS=${env.PW_WORKERS}
EOF
                """
            }
        }
    }
    
    stage('Test Execution') {
        steps {
            script {
                def grepTag = params.TEST_SUITE == 'smoke' ? '@smoke' : 
                             params.TEST_SUITE == 'regression' ? '@regression' : ''
                
                sh """
                    docker run --rm \
                        -e BASE_URL=${BASE_URL} \
                        -e CI=true \
                        playwright-tests:${BUILD_NUMBER} \
                        npx playwright test ${grepTag ? '--grep ' + grepTag : ''} --workers=${PW_WORKERS}
                """
            }
        }
    }
}
```

### 10.5 Troubleshooting & Debugging in CI

**Trace Collection:**
```groovy
// Always collect traces on failure
sh '''
    docker run --rm \
        -v $(pwd)/test-results:/app/test-results \
        playwright-tests:${BUILD_NUMBER} \
        npx playwright test --trace=on-first-retry --retries=2
'''
archiveArtifacts artifacts: 'test-results/**/*.zip', allowEmptyArchive: true
```

**Screenshot on Failure:**
```yaml
# playwright.config.ts
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
}
```

**Jenkins Console Debugging:**
```bash
# Add to Jenkins stage for debugging
docker run --rm playwright-tests:${BUILD_NUMBER} npx playwright install --dry-run
docker run --rm playwright-tests:${BUILD_NUMBER} npx playwright info
```

### 10.6 Local CI Simulation

```bash
#!/bin/bash
# run-local-ci.sh - Simulate Jenkins locally

# Build
docker build -t playwright-local -f Dockerfile.playwright .

# Run with Jenkins-like env vars
docker run --rm \
  -e CI=true \
  -e BASE_URL=http://host.docker.internal:3000 \
  -v $(pwd)/playwright-report:/app/playwright-report \
  -v $(pwd)/test-results:/app/test-results \
  playwright-local \
  npx playwright test --reporter=html,line
```

---

## 11. Environment Management

### 11.1 Configuration Hierarchy

```
Priority (High to Low):
1. Jenkins Environment Variables (env.BASE_URL)
2. .env.ci file (committed, non-sensitive)
3. playwright.config.ts defaults
4. Docker ENV instructions
```

### 11.2 Sensitive Data Handling

```typescript
// utils/config.ts
export const config = {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  credentials: {
    admin: {
      email: process.env.TEST_ADMIN_EMAIL!,
      password: process.env.TEST_ADMIN_PASSWORD!
    }
  },
  // Feature flags for different envs
  features: {
    enablePayments: process.env.ENABLE_PAYMENTS === 'true',
    mockSMS: process.env.CI === 'true'
  }
};

// Validation
if (!config.credentials.admin.email) {
  throw new Error('TEST_ADMIN_EMAIL must be set');
}
```

---

## 12. CI/CD Checklist for Claude

When generating CI/CD configurations:

- [ ] Does the Dockerfile use the official Playwright base image (or install deps correctly)?
- [ ] Are node_modules cached between builds (via Docker layer or Jenkins cache)?
- [ ] Is the Jenkins pipeline using `agent none` with stage-specific agents for parallelization?
- [ ] Are credentials injected via Jenkins credentials binding (not hardcoded)?
- [ ] Are test results archived with `archiveArtifacts` even on failure?
- [ ] Is there a `post { always { cleanWs() } }` block to prevent disk bloat?
- [ ] Are parallel browser tests running in separate stages/containers?
- [ ] Is the `BASE_URL` parameterized for multi-environment support?
- [ ] Are screenshots/videos/traces captured and attached to Jenkins builds?
- [ ] Is there a timeout set to prevent hung builds (`timeout(time: 45, unit: 'MINUTES')`)?

---

## 13. Screen Recording and Test Results Organization

### 13.1 Folder Structure for Test Recordings

Organize all screen recordings by test status and test name for easy navigation and review.

```
recordings/
├── success/
│   ├── checkout-flow/
│   │   └── checkout-flow-chromium-2026-04-10.mp4
│   ├── login-valid-credentials/
│   │   └── login-valid-credentials-firefox-2026-04-10.mp4
│   └── inventory-add-cart/
│       └── inventory-add-cart-webkit-2026-04-10.mp4
├── failure/
│   ├── payment-processing-error/
│   │   └── payment-processing-error-chromium-2026-04-10.mp4
│   ├── login-invalid-credentials/
│   │   └── login-invalid-credentials-firefox-2026-04-10.mp4
│   └── checkout-validation/
│       └── checkout-validation-webkit-2026-04-10.mp4
└── screenshots/
    ├── success/
    │   └── test-name/
    │       └── screenshot-1.png
    └── failure/
        └── test-name/
            └── screenshot-1.png
```

### 13.2 Playwright Configuration for Recording Organization

Update `playwright.config.ts` to leverage test context and organize recordings:

```typescript
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure', // Captures on both success and failure
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  
  // Hook: Organize videos/screenshots after test completion
  webServer: {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 13.3 Test Fixture for Organizing Recordings

Create a custom fixture to automatically organize recordings by test status and name:

```typescript
// fixtures/recording.fixture.ts
import { test as base, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

type RecordingFixture = {
  recordingManager: {
    getTestFolder: (status: 'success' | 'failure') => string;
    getRecordingPath: (status: 'success' | 'failure', testName: string, projectName: string) => string;
  };
};

export const test = base.extend<RecordingFixture>({
  recordingManager: async ({ }, use) => {
    const recordingManager = {
      getTestFolder: (status: 'success' | 'failure'): string => {
        const baseDir = path.join(process.cwd(), 'recordings', status);
        if (!fs.existsSync(baseDir)) {
          fs.mkdirSync(baseDir, { recursive: true });
        }
        return baseDir;
      },

      getRecordingPath: (status: 'success' | 'failure', testName: string, projectName: string): string => {
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const sanitizedTestName = testName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
        const folderPath = path.join(
          recordingManager.getTestFolder(status),
          sanitizedTestName
        );
        
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        
        return folderPath;
      },
    };

    await use(recordingManager);
  },
});

// Hook to organize recordings after each test
test.afterEach(async ({ recordingManager }, testInfo) => {
  const testStatus = testInfo.status === 'passed' ? 'success' : 'failure';
  const testName = testInfo.title;
  const projectName = testInfo.project.name;
  
  const targetFolder = recordingManager.getRecordingPath(testStatus, testName, projectName);
  
  // Rename/move video if it exists
  if (testInfo.attachments.length > 0) {
    testInfo.attachments.forEach(attachment => {
      if (attachment.contentType === 'video/webm' || attachment.path?.endsWith('.webm')) {
        const timestamp = new Date().toISOString().split('T')[0];
        const newPath = path.join(
          targetFolder,
          `${testName.replace(/\s+/g, '-')}-${projectName}-${timestamp}.webm`
        );
        
        if (attachment.path && fs.existsSync(attachment.path)) {
          fs.copyFileSync(attachment.path, newPath);
        }
      }
      
      if (attachment.contentType?.startsWith('image/') || attachment.path?.endsWith('.png')) {
        const screenshotFolder = path.join(process.cwd(), 'recordings', 'screenshots', testStatus, testName.replace(/\s+/g, '-'));
        if (!fs.existsSync(screenshotFolder)) {
          fs.mkdirSync(screenshotFolder, { recursive: true });
        }
        
        const newPath = path.join(screenshotFolder, path.basename(attachment.path || 'screenshot.png'));
        if (attachment.path && fs.existsSync(attachment.path)) {
          fs.copyFileSync(attachment.path, newPath);
        }
      }
    });
  }
});
```

### 13.4 Usage in Test Files

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '../fixtures/recording.fixture';

test.describe('Checkout @smoke', () => {
  test('can complete checkout flow', async ({ page, recordingManager }) => {
    await test.step('Navigate to inventory', async () => {
      await page.goto('/inventory.html');
      await expect(page).toHaveTitle(/Swag Labs/);
    });

    await test.step('Add items to cart', async () => {
      await page.getByRole('button', { name: /Add to cart/i }).first().click();
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toContainText('1');
    });

    await test.step('Proceed to checkout', async () => {
      await page.getByRole('link', { name: /shopping-cart-container/ }).click();
      await page.getByRole('button', { name: /Checkout/ }).click();
      await expect(page).toHaveURL(/checkout-step-one/);
    });

    // Recording is automatically organized by test status
  });

  test('payment processing fails with invalid card', async ({ page, recordingManager }) => {
    await page.goto('/checkout-step-one.html');
    
    // Test logic...
    // On failure, recording goes to: recordings/failure/payment-processing-fails-with-invalid-card/
    // On success, recording goes to: recordings/success/payment-processing-fails-with-invalid-card/
  });
});
```

### 13.5 Jenkins Integration for Recording Management

Update Jenkinsfile to handle organized recordings:

```groovy
// Jenkinsfile excerpt
stage('Organize and Archive Recordings') {
    agent { label 'docker && linux' }
    steps {
        script {
            // Move recordings from all browsers to organized structure
            sh '''
                # Ensure directory structure exists
                mkdir -p recordings/success recordings/failure
                mkdir -p recordings/screenshots/success recordings/screenshots/failure
                
                # Archive organized recordings
                find recordings -type f -name "*.webm" -o -name "*.png" | head -100
            '''
            
            // Archive all recordings with success/failure separation
            archiveArtifacts artifacts: 'recordings/**/*', allowEmptyArchive: true
        }
    }
    post {
        always {
            // Generate index.html for easy navigation
            sh '''
                cat > recordings/index.html <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>Test Recordings - ${BUILD_NUMBER}</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        .section { margin: 20px 0; }
        h2 { color: #333; border-bottom: 2px solid #ddd; }
        .success { color: green; }
        .failure { color: red; }
        video, img { max-width: 100%; border: 1px solid #ccc; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Test Recordings - Build ${BUILD_NUMBER}</h1>
    
    <div class="section">
        <h2 class="success">✓ Successful Tests</h2>
        <p>Videos and screenshots from passed tests are organized by test name.</p>
        <!-- Auto-generated from success folder -->
    </div>
    
    <div class="section">
        <h2 class="failure">✗ Failed Tests</h2>
        <p>Videos and screenshots from failed tests are organized by test name for debugging.</p>
        <!-- Auto-generated from failure folder -->
    </div>
</body>
</html>
EOF
            '''
            
            publishHTML([
                reportDir: 'recordings',
                reportFiles: 'index.html',
                reportName: 'Test Recordings'
            ])
        }
    }
}
```

### 13.6 Docker Volume Configuration

Update `docker-compose.yml` to mount recordings directory:

```yaml
# docker-compose.yml
version: '3.8'

services:
  playwright-tests:
    build:
      context: .
      dockerfile: Dockerfile.playwright
    volumes:
      - ./playwright-report:/app/playwright-report
      - ./test-results:/app/test-results
      - ./recordings:/app/recordings           # Mount for organized recordings
      - ./screenshots:/app/screenshots
    environment:
      - BASE_URL=http://app-under-test:3000
      - CI=true
      - RECORDINGS_DIR=/app/recordings
    depends_on:
      - app-under-test
    networks:
      - test-network

  app-under-test:
    image: your-application-image:latest
    ports:
      - "3000:3000"
    networks:
      - test-network

networks:
  test-network:
    driver: bridge
```

### 13.7 Recording Organization Checklist for Claude

When implementing test recording organization:

- [ ] Are recordings separated into `success/` and `failure/` folders?
- [ ] Is each test's folder named after the test title (sanitized)?
- [ ] Do video files include the browser project name (chromium, firefox, webkit)?
- [ ] Do video files include a timestamp (YYYY-MM-DD)?
- [ ] Are screenshots also organized similarly under `recordings/screenshots/`?
- [ ] Is the custom fixture (`recordingManager`) used in all test files?
- [ ] Does the `test.afterEach()` hook properly move recordings to the right folder?
- [ ] Is the Jenkins stage archiving the complete `recordings/` directory structure?
- [ ] Is an index.html generated for easy navigation of recordings?
- [ ] Are recordings cleaned up periodically to save storage (older than 30 days)?

---

---

**Last Updated:** 2026  
**Owner:** QA Automation
```

