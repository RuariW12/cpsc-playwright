import { test, expect } from '@playwright/test';
import { loginAsManager } from './helpers/auth';
import { ROUTES, TEST_RECALLS } from './helpers/config';
import { rowFor, setPriority } from './helpers/recalls';

test.describe('REQ-07 Priority Queue reorder', () => {
  // This build has no separate Priority queue page: the "Prioritization" menu item opens the
  // Recall database table (/#recallTable), so that table is checked as the queue.
  test('TC-10 (Acceptable): change 20005 from Low to High -> it moves to the High group', async ({ page }) => {
    const r = TEST_RECALLS.snugNest;
    await loginAsManager(page);

    // Start from Low so the test is repeatable.
    await setPriority(page, r.id, 'Low', 'Single fall report; mattress fit issue under review.');
    await page.goto(ROUTES.recallDatabase);
    await page.getByRole('link', { name: 'Prioritization' }).click();
    await expect(rowFor(page, r.number)).toContainText('Low');

    // Change it to High.
    await setPriority(page, r.id, 'High', 'New reports of infants falling through the gap; escalate now.');
    await page.goto(ROUTES.recallDatabase);
    await page.getByRole('link', { name: 'Prioritization' }).click();

    // The queue is ordered High, then Medium, then Low: 20005 must now sit in the High group,
    // i.e. every row above it is also High.
    const rows = await page.locator('#recallTable tbody tr').evaluateAll((trs) =>
      trs.map((tr) => ({ text: tr.textContent || '', priority: (tr as HTMLTableRowElement).cells[4]?.textContent?.trim() })));
    const idx = rows.findIndex((p) => p.text.includes(r.number));
    expect(idx, `${r.number} not found in the queue`).toBeGreaterThanOrEqual(0);
    expect(rows[idx].priority).toBe('High');
    const above = rows.slice(0, idx).filter((p) => p.priority !== 'High').length;
    expect(above, `${above} non-High recalls are listed above ${r.number}; the list is not ordered by priority`).toBe(0);
  });
});
