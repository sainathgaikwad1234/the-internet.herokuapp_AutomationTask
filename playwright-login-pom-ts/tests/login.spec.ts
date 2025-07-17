// Automated tests for login functionality using Playwright and Page Object Model
// Covers: successful login, failed login (username/password), and error message verification
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const validUsername = 'tomsmith';
const validPassword = 'SuperSecretPassword!';
const invalidUsername = 'wronguser';
const invalidPassword = 'wrongpass';

test.describe('Login Functionality', () => {
  test('Successful login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(validUsername, validPassword);
    // Assert successful login by checking flash message
    await loginPage.assertFlashContains('You logged into a secure area!');
    // Optionally, check for URL change or presence of logout button
    await expect(page).toHaveURL(/secure/);
  });

  test('Failed login with invalid username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(invalidUsername, validPassword);
    // Assert error message
    await loginPage.assertFlashContains('Your username is invalid!');
    await expect(page).toHaveURL(/login/);
  });

  test('Failed login with invalid password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(validUsername, invalidPassword);
    // Assert error message
    await loginPage.assertFlashContains('Your password is invalid!');
    await expect(page).toHaveURL(/login/);
  });

  test('Error message disappears after navigation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(invalidUsername, invalidPassword);
    await loginPage.assertFlashContains('Your username is invalid!');
    // Navigate away and back, error should not persist
    await page.goto('/');
    await loginPage.goto();
    await expect(loginPage.flashMessage).not.toBeVisible();
  });
});
