import { test, expect } from '@playwright/test';
import { loginAsInvestigator } from './helpers/auth';
import { ROUTES } from './helpers/config';
import { readState } from './helpers/run-state';

test.describe('REQ-20 Violation List (Screen 3)', () => {
  test('TC-27 (Acceptable): filter status = Awaiting response', async ({ page }) => {
    await loginAsInvestigator(page);
    await page.goto(ROUTES.violations);
    const statusFilter = page.locator('select').filter({ has: page.locator('option', { hasText: 'Awaiting response' }) });
    await expect(statusFilter, 'No status filter with an "Awaiting response" option').toHaveCount(1, { timeout: 3_000 });
    await statusFilter.selectOption({ label: 'Awaiting response' });
    const id = readState().tc15ViolationId;
    // Only violations with at least one contact are shown (TC-15's has contacts after TC-21..23).
    await expect(page.locator('tbody tr:visible', { hasText: 'No contact logged' })).toHaveCount(0);
    await expect(page.locator('tbody tr:visible', { hasText: `#${id}` })).toHaveCount(1);
  });
});

