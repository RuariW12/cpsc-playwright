import { test, expect } from '@playwright/test';
import { loginAsManager } from './helpers/auth';
import { TEST_RECALLS, REAL_FIRE_RECALL } from './helpers/config';
import { visibleRows, rowFor } from './helpers/recalls';

test.describe('REQ-04 Search and filter the recall list', () => {
  test('TC-05 (Acceptable): search "WarmWave" shows only recall 20002', async ({ page }) => {
    await loginAsManager(page);
    await page.getByLabel('Search recalls').fill('WarmWave');

    await expect(visibleRows(page)).toHaveCount(1);
    await expect(visibleRows(page).first()).toContainText(TEST_RECALLS.warmWave.number);
  });

  test('TC-06 (Acceptable): filter Hazard = Fire shows only 20002, 20004, 20006', async ({ page }) => {
    await loginAsManager(page);
    await page.getByLabel('Filter by hazard').selectOption('Fire');

    // The three Fire test recalls appear...
    for (const r of [TEST_RECALLS.warmWave, TEST_RECALLS.emberGlow, TEST_RECALLS.blazeAway]) {
      await expect(rowFor(page, r.number)).toBeVisible();
    }
    // ...the non-Fire ones do not...
    for (const r of [TEST_RECALLS.brightStart, TEST_RECALLS.pedalPeak, TEST_RECALLS.snugNest]) {
      await expect(rowFor(page, r.number)).toBeHidden();
    }
    // ...and a real seeded fire recall (JKMAX heated blankets, "Fire and Burn Hazards") is included.
    await expect(
      rowFor(page, REAL_FIRE_RECALL.number),
      'Real fire-hazard recall 26778 (JKMAX heated blankets) is missing from the Fire filter',
    ).toBeVisible();
  });
});
