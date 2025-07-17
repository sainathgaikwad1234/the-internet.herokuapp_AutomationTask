# Playwright Login Automation (TypeScript, POM)

This project demonstrates automated testing of a login functionality using Playwright, TypeScript, and the Page Object Model (POM) design pattern.

## Test Site
- [https://the-internet.herokuapp.com/login](https://the-internet.herokuapp.com/login)
- Valid credentials: `tomsmith` / `SuperSecretPassword!`

## Features
- Automated tests for:
  - Successful login with valid credentials
  - Failed login with invalid username
  - Failed login with invalid password
  - Error message verification
- Uses Playwright Test runner
- Page Object Model for maintainability
- TypeScript for type safety
- Clear comments and assertions

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run tests:**
   ```bash
   npx playwright test
   ```

## Project Structure
```
playwright-login-pom-ts/
  pages/         # Page Object Model classes
    LoginPage.ts
  tests/         # Test specs
    login.spec.ts
  utils/         # (Reserved for future utilities)
  playwright.config.ts
  tsconfig.json
  package.json
```

## Notes
- Tests run in headless mode by default. Change `headless` in `playwright.config.ts` if you want to see the browser.
- All selectors and actions for the login page are encapsulated in `LoginPage.ts`.
- Assertions are used to verify both success and error scenarios.
