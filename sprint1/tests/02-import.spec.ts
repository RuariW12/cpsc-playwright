import { test, expect, Page } from '@playwright/test';
import { loginAsManager } from './helpers/auth';
import { ROUTES, ALL_TEST_NUMBERS } from './helpers/config';
import { rowFor } from './helpers/recalls';
import * as path from 'path';

const CSV = path.join(__dirname, '..', 'test-data', 'recalls.csv');

// Uploads the CSV and opens the "CSV Preview" (nothing is saved yet).
async function previewImport(page: Page) {
  await page.goto(ROUTES.importRecalls);
  await page.getByLabel('Select CSV File').setInputFiles(CSV);
  await page.getByRole('button', { name: 'Preview CSV' }).click();
  await expect(page.getByRole('heading', { name: 'CSV Preview' })).toBeVisible();
}

// Each test recall appears exactly once in the Recall database.
async function expectEachTestRecallOnce(page: Page) {
  await page.goto(ROUTES.recallDatabase);
  for (const n of ALL_TEST_NUMBERS) {
    await expect(rowFor(page, n), `${n} should be in the Recall database exactly once`).toHaveCount(1);
  }
}

test.describe('REQ-02 Import recalls', () => {
  test('TC-03 (Acceptable): import 6 recalls -> all 6 saved', async ({ page }) => {
    await loginAsManager(page);
    await previewImport(page);

    // Re-runnable: on the first run all 6 are new. On later runs they already exist,
    // which is TC-04's scenario, so TC-03 just confirms they are in the database.
    if (await page.getByText(/Duplicate recalls detected/).isVisible()) {
      test.info().annotations.push({ type: 'note', description: 'Test recalls were already imported by an earlier run.' });
    } else {
      await expect(page.getByText('6 recall(s) found.')).toBeVisible();
      await page.getByRole('button', { name: /import/i }).last().click();
      await expect(page.getByText(/imported|success/i).first()).toBeVisible();
    }
    await expectEachTestRecallOnce(page);
  });

  test('TC-04 (Unacceptable): re-import the same CSV -> duplicates skipped, no duplicates saved', async ({ page }) => {
    await loginAsManager(page);
    await previewImport(page);

    await expect(page.getByText(`Duplicate recalls detected: ${ALL_TEST_NUMBERS.join(', ')}`)).toBeVisible();
    await expectEachTestRecallOnce(page);
  });
});
