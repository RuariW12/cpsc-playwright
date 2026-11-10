import { test, expect } from '@playwright/test';

test('CPSC login page loads', async ({ page }) => {
  // Render's free tier can take up to a minute to wake up, so allow extra time
  test.setTimeout(90000);

  await page.goto('https://recall-management-system.onrender.com/');

  await expect(page).toHaveTitle(/RecallOS/);
  await expect(page.getByText('Welcome back')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});