import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { ROUTES, TEST_RECALLS } from './helpers/config';

test.describe('Access control', () => {
  test('TC-12 (Unacceptable, REQ-10): Investigator cannot reach the Prioritize page', async ({ page }) => {
    await loginAs(page, 'investigator');

    // Manager-only links are not offered to the Investigator...
    await expect(page.getByRole('link', { name: 'Set Priority' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Import recalls/ })).toHaveCount(0);

    // ...and typing the Prioritize URL directly is refused.
    const res = await page.goto(ROUTES.prioritize(TEST_RECALLS.pedalPeak.id));
    expect(res?.status()).toBe(403);
    await expect(page.getByRole('button', { name: 'Save prioritization' })).toHaveCount(0);
  });

  test('TC-13 (Unacceptable, NFR-01): logged-out user is sent to Login', async ({ page }) => {
    // No login first
    await page.goto(ROUTES.recallDatabase);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });
});
