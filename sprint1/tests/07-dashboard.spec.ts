import { test, expect, Page } from '@playwright/test';
import { loginAsManager } from './helpers/auth';
import { ROUTES } from './helpers/config';
import { visibleRows } from './helpers/recalls';

const FILTER_VALUE: Record<string, string> = { High: 'high', Medium: 'medium', Low: 'low', 'Not prioritized': 'not-prioritized' };

// Number of recalls the Recall database lists for a given priority filter.
async function countWithPriority(page: Page, level: string) {
  await page.goto(ROUTES.recallDatabase);
  await page.getByLabel('Filter by priority').selectOption(FILTER_VALUE[level]);
  return visibleRows(page).count();
}

test.describe('REQ-09 Dashboard charts', () => {
  // Partial automation. The "Prioritized recalls per week" chart lives in the external Power BI
  // report, which Playwright can open but not read values from; that check stays manual.
  // Automated here: the Overview's "Recall priorities" chart is shown and its counts match the database.
  test('TC-14 (Acceptable): "Recall priorities" chart is shown and matches the database', async ({ page }) => {
    await loginAsManager(page);
    await page.goto(ROUTES.overview);

    await expect(page.getByRole('heading', { name: 'Recall priorities' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Open report/ })).toHaveAttribute('href', /app\.powerbi\.com/);

    const shown: Record<string, number> = {};
    for (const level of Object.keys(FILTER_VALUE)) {
      const row = page.locator('.priority-row').filter({ has: page.locator('.priority-name', { hasText: new RegExp(`^\\s*${level}\\s*$`) }) });
      shown[level] = Number((await row.locator('.priority-count').innerText()).trim());
    }
    for (const level of Object.keys(FILTER_VALUE)) {
      expect(shown[level], `Overview "${level}" bar matches the Recall database`).toBe(await countWithPriority(page, level));
    }
  });
});
