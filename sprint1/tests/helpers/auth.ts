import { Page, expect } from '@playwright/test';
import { USERS, ROUTES } from './config';

// Fills and submits the Login screen once (REQ-01 / REQ-10).
export async function login(page: Page, who: keyof typeof USERS) {
  const user = USERS[who];
  await page.goto(ROUTES.login);
  await page.getByLabel('Username').fill(user.username);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

// Logs in and waits for the signed-in workspace (used by every test whose subject is not login).
export async function loginAs(page: Page, who: keyof typeof USERS) {
  await login(page, who);
  await expect(page.getByText('SIGNED IN WORKSPACE')).toBeVisible();
}

export const loginAsManager = (page: Page) => loginAs(page, 'manager');
