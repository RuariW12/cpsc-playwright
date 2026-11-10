import { test, expect } from '@playwright/test';

test('TC-02: Wrong password shows an error and stays on the login page',
  async ({ page }) => {
  test.setTimeout(90000);

  // Steps 1-2: open the site and log in as the Manager with a wrong password
  await page.goto('https://recall-management-system.onrender.com/');
  await page.getByRole('textbox', { name: 'Username' }).fill(process.env.CPSC_MANAGER_USER);
  await page.getByRole('textbox', { name: 'Password' }).fill('WrongPassword123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Expected result: an error message appears and the user stays on the Login page
  await expect(page.getByText('Invalid username or password.')).toBeVisible();
  await expect(page).toHaveURL(/login/);
});