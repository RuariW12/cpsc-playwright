import { Page, expect } from '@playwright/test';
import { USERS, ROUTES } from './config';

// Fills and submits the Login screen.
export async function login(page: Page, who: keyof typeof USERS) {
  const user = USERS[who];
  await page.goto(ROUTES.login);
  await page.getByLabel('Username').fill(user.username);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('SIGNED IN WORKSPACE')).toBeVisible();
}

export const loginAsInvestigator = (page: Page) => login(page, 'investigator');
export const loginAsManager = (page: Page) => login(page, 'manager');
