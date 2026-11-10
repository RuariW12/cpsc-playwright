import { test, expect } from '@playwright/test';

test('TC-05: Searching "WarmWave" shows only recall PW-20002', async ({ page }) => {
  test.setTimeout(90000);

  // Steps 1-2: open the site and log in as the Manager
  await page.goto('https://recall-management-system.onrender.com/');
  await page.getByRole('textbox', { name: 'Username' }).fill(process.env.CPSC_MANAGER_USER);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.CPSC_MANAGER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Step 3: search the Recall database (input data: "WarmWave")
  await page.getByRole('textbox', { name: 'Search recalls' }).fill('WarmWave');

  // Expected result: only one recall appears, PW-20002
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('PW-20002');
  await expect(rows.first()).toContainText('WarmWave Electric Throw Blanket');
});