# E-commerce Automation Tests

## Project Overview
This repository contains end-to-end automated tests for a web application using the Playwright framework. The tests cover various user journeys and functionalities within the application.

## Tech Stack
- **Playwright**: Framework for automating browser actions.
- **TypeScript**: Language used to write tests.
- **Jenkins**: CI/CD server for running tests.
- **Allure**: Reporting tool for detailed test results.

## Prerequisites
Ensure you have Node.js, Docker, and Jenkins installed on your machine.

## Installation
Run the following commands to install project dependencies:
```bash
npm install
```

## Setup
To set up the environment, build the Docker image:
```bash
docker build -t playwright-local .
```

## Running Tests Inside Docker
After building the Docker image, you can run the tests inside a container:

1. **Run in Headless Mode:**
   ```bash
   docker run --rm playwright-local npx playwright test
   ```

2. **Run in Heeded Mode (for debugging):**
   ```bash
   docker run -it --rm playwright-local bash
   npx playwright test --headed
   ```

## Project Structure
- **data/**: Contains the JSON file with test user data (`users.json`).
- **docker-compose.yaml**: Docker Compose configuration file.
- **install_dependencies.bat** and **install_dependencies.sh**: Scripts to install project dependencies.
- **pages/**: Contains TypeScript files defining Page Objects for different pages of the application (`LoginPage.ts`, `CartPage.ts`, etc.).
- **tests/e2e/**: End-to-end test files.
- **utils/**: Utility functions like logger creation and user data factory.

## Test Flow Summary
1. **Login Tests**:
   - Validates user login with valid, locked-out, performance glitch, visual, and invalid credentials.
2. **Checkout Tests**:
   - Verifies the successful completion of the checkout process for various user types.

## Notes / Best Practices
- Ensure Docker Compose services are running before executing tests.
- Use `npx playwright test --headed` if you encounter issues with elements not being found or actions not being performed as expected.
- Generate reports using Allure:
  ```bash
  npx allure serve
  ```