import { test, expect, Page } from '@playwright/test';
import { loginAsManager } from './helpers/auth';
import { ROUTES, TEST_RECALLS } from './helpers/config';
import { currentPriority, rowFor } from './helpers/recalls';

// Turns off the browser's own form checks so the server's validation is tested too.
// The fail condition is bad data reaching the database, which only the server can prevent.
async function bypassBrowserValidation(page: Page) {
  await page.locator('form[action$="/priority"]').evaluate((f: HTMLFormElement) => { f.noValidate = true; });
}

test.describe('REQ-06 Prioritize a recall', () => {
  test('TC-07 (Acceptable): prioritize 20003 Medium with a valid justification', async ({ page }) => {
    const r = TEST_RECALLS.pedalPeak;
    await loginAsManager(page);
    await page.goto(ROUTES.prioritize(r.id));

    await page.getByLabel('Priority *').selectOption('Medium');
    await page.getByLabel('Prioritization rationale *').fill('No injuries reported; helmets fail impact standard.');
    await page.getByRole('button', { name: 'Save prioritization' }).click();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.recall(r.id)}$`));
    expect(await currentPriority(page, r.id)).toBe('Medium');
    await expect(page.getByText('Justification: No injuries reported; helmets fail impact standard.')).toBeVisible();
    // 20003 shows Medium in the Recall database
    await page.goto(ROUTES.recallDatabase);
    await expect(rowFor(page, r.number)).toContainText('Medium');
  });

  test('TC-08 (Unacceptable): no Priority Level -> error, nothing saved', async ({ page }) => {
    const r = TEST_RECALLS.snugNest;
    await loginAsManager(page);
    const before = await currentPriority(page, r.id);
    await page.goto(ROUTES.prioritize(r.id));

    await page.getByLabel('Priority *').selectOption('');
    await page.getByLabel('Prioritization rationale *').fill('Valid justification text for this recall.');
    // 1) The browser blocks the submit (Priority is required).
    await page.getByRole('button', { name: 'Save prioritization' }).click();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.prioritize(r.id)}$`));
    expect(await page.getByLabel('Priority *').evaluate((s: HTMLSelectElement) => s.validity.valueMissing)).toBe(true);

    // 2) The server also rejects it with a helpful message, and nothing is saved.
    await bypassBrowserValidation(page);
    await page.getByRole('button', { name: 'Save prioritization' }).click();
    await expect(page.getByText(/select a valid priority level|choose a priority level/i)).toBeVisible();
    expect(await currentPriority(page, r.id)).toBe(before);
  });

  test('TC-09 (Unacceptable): justification too short -> length error, nothing saved', async ({ page }) => {
    const r = TEST_RECALLS.snugNest;
    await loginAsManager(page);
    const before = await currentPriority(page, r.id);
    const other = before === 'Medium' ? 'Low' : 'Medium';   // a change the test can detect
    await page.goto(ROUTES.prioritize(r.id));

    await page.getByLabel('Priority *').selectOption(other);
    await page.getByLabel('Prioritization rationale *').fill('bad'); // under the 10-character minimum
    await bypassBrowserValidation(page);
    await page.getByRole('button', { name: 'Save prioritization' }).click();

    await expect.soft(page.getByText(/10 to 500|at least 10|too short/i), 'no length error shown for a 3-character justification').toBeVisible();
    expect(await currentPriority(page, r.id), 'the priority was saved with a 3-character justification').toBe(before);
  });
});
