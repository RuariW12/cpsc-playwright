import { test, expect } from '@playwright/test';
import { loginAsInvestigator } from './helpers/auth';
import { ROUTES, SAMPLE_RECALL, TC15_LISTING, RUN } from './helpers/config';
import { openAddViolation, fillViolation, saveViolation, violationCount, findViolationId } from './helpers/violations';
import { writeState, readState } from './helpers/run-state';

test.describe('REQ-16 Add Violation (Screen 1)', () => {
  test('TC-15 (Acceptable): the Investigator records the WarmWave listing as an Exact Match', async ({ page }) => {
    await loginAsInvestigator(page);

    // Step 1: find recall 20002 and click Add Violation on it (REQ-15 / REQ-16).
    await page.goto(ROUTES.recallDatabase);
    await page.getByLabel('Search recalls').fill(SAMPLE_RECALL.number);
    await page.getByRole('link', { name: `Add violation for recall ${SAMPLE_RECALL.number}` }).click();
    await expect(page).toHaveURL(/\/violations\/add/);
    await expect(page.locator('#recall_display')).toHaveValue(SAMPLE_RECALL.number);

    // Steps 2-3: enter the listing details from the requirements doc and choose Exact Match.
    await fillViolation(page, { match: 'Exact Match' });

    // Step 4: save, then find the new violation on the list.
    await saveViolation(page);
    const id = await findViolationId(page, TC15_LISTING.title);
    expect(id, 'Violation was not saved').toBeTruthy();
    writeState({ tc15ViolationId: id, tc15ListingUrl: TC15_LISTING.url });

    // Step 5: the detail page shows the saved listing + violation with the actor and date-time.
    await page.goto(ROUTES.violation(id!));
    await expect(page.getByText(TC15_LISTING.title)).toBeVisible();
    await expect(page.getByText('$24.99').or(page.getByText('24.99')).first()).toBeVisible();
    await expect(page.getByText('INVESTIGATOR ID')).toBeVisible();
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    await expect(page.getByText(new RegExp(`${today} at`)).first(), 'ViolationDateTime is not today').toBeVisible();

    // No contact yet. The doc's wording is "Notice not sent"; this build says "No contact logged".
    await page.goto(ROUTES.violations);
    const status = page.locator('tbody tr', { hasText: TC15_LISTING.title }).first();
    await expect(status.getByText(/Notice not sent|No contact logged/).first()).toBeVisible();
    test.info().annotations.push({ type: 'Saved', description: `Violation #${id}, listing ${TC15_LISTING.url}` });
  });

  test('TC-16 (Unacceptable): the same listing URL again is refused', async ({ page }) => {
    const url = readState().tc15ListingUrl;
    test.skip(!url, 'TC-15 did not save a listing to repeat');
    await loginAsInvestigator(page);
    const before = await violationCount(page);

    // Only the URL repeats: a new seller name keeps this build's "seller already exists" check
    // (see TC-18) from refusing the form first, so the result shows whether VR-12 itself works.
    await openAddViolation(page);
    await fillViolation(page, { url, seller: `cozyfinds_va_dup_${RUN}`, match: 'Exact Match' });
    await saveViolation(page);

    await expect.soft(page.getByText(/listing is already in the system|listing already exists|duplicate listing/i).first(), 'VR-12: no "This listing is already in the system." error').toBeVisible();
    expect(await violationCount(page), 'VR-12: a violation was saved for the duplicate URL').toBe(before);
  });

  test('TC-17 (Unacceptable): a URL that is not a link is refused', async ({ page }) => {
    await loginAsInvestigator(page);
    const before = await violationCount(page);

    await openAddViolation(page);
    await fillViolation(page, { url: 'ebay blanket listing', title: 'PW-TEST WarmWave throw blanket', match: 'Exact Match' });
    await saveViolation(page);

    await expect(page).toHaveURL(/\/violations\/add/);
    const message = await page.getByLabel('Listing URL *').evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(message, 'No URL error shown').not.toBe('');
    test.info().annotations.push({ type: 'Error shown', description: message });
    expect(await violationCount(page)).toBe(before);
  });

  test('TC-18 (Acceptable): a WT-70 listing recorded as a Possible Match', async ({ page }) => {
    await loginAsInvestigator(page);
    const title = `PW-TEST WarmWave WT-70 Heated Throw ${RUN}`;

    await openAddViolation(page);
    await fillViolation(page, {
      title, url: `https://www.ebay.com/itm/sample-518-${RUN}`, model: 'WT-70', match: 'Possible Match',
      commentary: 'Title says WT-70, which is not in recall 20002, but the photo shows the WT-50 controller.',
    });
    await saveViolation(page);

    // Same seller as TC-15 (REQ-16 step 2: choose the existing seller). This build refuses it.
    await expect.soft(page.getByText('This seller already exists on the selected marketplace.'),
      'REQ-16 step 2: a second listing from TC-15\'s seller was refused ("This seller already exists…") and the form has no way to choose the existing seller').toHaveCount(0);

    // The new violation is on the list and its detail page shows Possible Match.
    const id = await findViolationId(page, title);
    expect(id, 'Violation was not saved').toBeTruthy();
    await expect(page.locator('tbody tr', { hasText: title }).first().getByText('Possible Match')).toBeVisible();
    await page.goto(ROUTES.violation(id!));
    await expect(page.getByText('Possible Match').first()).toBeVisible();
    test.info().annotations.push({ type: 'Saved', description: `Violation #${id}` });
  });

  test('TC-19 (Unacceptable): an Exact Match with blank commentary is refused', async ({ page }) => {
    await loginAsInvestigator(page);
    const before = await violationCount(page);

    await openAddViolation(page);
    await fillViolation(page, {
      title: 'PW-TEST WarmWave WT-50 throw, no commentary', url: `https://www.ebay.com/itm/sample-519-${RUN}`,
      match: 'Exact Match', commentary: '',
    });
    await saveViolation(page);

    await expect(page, 'VR-21: form was submitted with blank commentary').toHaveURL(/\/violations\/add/);
    const message = await page.getByLabel('Match commentary *').evaluate((el: HTMLTextAreaElement) => el.validationMessage);
    expect(message, 'VR-21: no commentary error shown').not.toBe('');
    test.info().annotations.push({ type: 'Error shown', description: `${message} (help text: "Required: 10–500 characters.")` });
    expect(await violationCount(page), 'VR-21: a violation was saved with blank commentary').toBe(before);
  });

  test('TC-20 (Unacceptable): commentary filled but no determination is refused', async ({ page }) => {
    await loginAsInvestigator(page);
    const before = await violationCount(page);

    await openAddViolation(page);
    await fillViolation(page, { title: 'PW-TEST WarmWave WT-50 throw, no determination', url: `https://www.ebay.com/itm/sample-520-${RUN}` });
    await saveViolation(page);

    await expect(page).toHaveURL(/\/violations\/add/);
    const message = await page.getByLabel('Match determination *').evaluate((el: HTMLSelectElement) => el.validationMessage);
    expect(message, 'No determination error shown').not.toBe('');
    test.info().annotations.push({ type: 'Error shown', description: message });
    expect(await violationCount(page)).toBe(before);
  });
});
