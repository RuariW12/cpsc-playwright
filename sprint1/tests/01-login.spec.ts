import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';
import { USERS, ROUTES } from './helpers/config';

test.describe('REQ-01 Manager login', () => {
  test('TC-01 (Acceptable): correct password opens the Manager workspace', async ({ page }) => {
    await login(page, 'manager');
    await expect(page.getByText('SIGNED IN WORKSPACE')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recall database' })).toBeVisible();
    // Manager menus are offered, including the Manager dashboard (Overview).
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Import recalls' }).first()).toBeVisible();
  });

  test('TC-02 (Unacceptable): wrong password shows an error and stays on Login', async ({ page }) => {
    await page.goto(ROUTES.login);
    await page.getByLabel('Username').fill(USERS.manager.username);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid username or password.')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
