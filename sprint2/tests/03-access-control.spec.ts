import { test, expect } from '@playwright/test';
import { loginAsManager } from './helpers/auth';
import { ROUTES } from './helpers/config';

test.describe('NFR-09 Only Investigators can open Add Violation and Log Contact', () => {
  test('TC-26 (Unacceptable): the Manager types the Add Violation URL and is sent back to the Manager Dashboard', async ({ page }) => {
    await loginAsManager(page);
    const response = await page.goto(ROUTES.addViolation);

    await expect(page.getByRole('button', { name: 'Save listing & violation' }), 'Manager can see the Add violation form').toHaveCount(0);
    test.info().annotations.push({ type: 'Response', description: `HTTP ${response?.status()} at ${page.url()}` });
    await expect(page, 'Manager was not sent back to the dashboard').toHaveURL(new RegExp(`(${ROUTES.overview}|/)$`));
    await expect(page.getByText('SIGNED IN WORKSPACE')).toBeVisible();
  });
});
