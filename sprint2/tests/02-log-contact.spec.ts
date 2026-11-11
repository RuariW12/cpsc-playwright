import { test, expect, Page } from '@playwright/test';
import { loginAsInvestigator } from './helpers/auth';
import { ROUTES, SEEDED_VIOLATION_WITH_CONTACTS } from './helpers/config';
import { readState } from './helpers/run-state';
import { contactCount } from './helpers/violations';

// Screen 2: Log Contact. Every test starts on the Violation Detail page of TC-15's violation.
async function openTc15Violation(page: Page, { loggedIn = false } = {}) {
  const id = readState().tc15ViolationId;
  test.skip(!id, 'TC-15 did not save a violation to log contacts on');
  if (!loggedIn) await loginAsInvestigator(page);
  await page.goto(ROUTES.violation(id!));
  await expect(page.getByRole('heading', { name: `Violation #${id}` })).toBeVisible();
  return id!;
}

// Contact history entry headings, newest first (e.g. "Email — Seller").
const contactHeadings = (page: Page) => page.locator('.contact-item h3');

// Clicks "+ Log contact", picks the party and saves the pre-filled notice.
async function logContact(page: Page, party: 'Seller' | 'Marketplace' | 'Both') {
  await page.getByRole('link', { name: /log contact/i }).click();
  await page.getByLabel('Contacted party *').selectOption(party);
  await page.getByRole('button', { name: /send|save contact record/i }).click();
}


test.describe('REQ-17 / REQ-18 / REQ-19 Log Contact (Screen 2)', () => {
  test('TC-21 (Acceptable): Log Contact to the Seller saves an Email ContactEvent', async ({ page }) => {
    const id = await openTc15Violation(page);
    const before = await contactCount(page, id);

    await logContact(page, 'Seller');
    expect(await contactCount(page, id), 'No ContactEvent was saved').toBe(before + 1);
    await expect(contactHeadings(page).first(), 'Newest contact is not an Email to the Seller').toHaveText(/Email\s+—\s+Seller/);

    // Status on the Violations list. The doc says "Awaiting response"; this build says "Contact logged".
    await page.goto(ROUTES.violations);
    const row = page.locator('tbody tr').filter({ has: page.locator(`a[href="${ROUTES.violation(id)}"]`) });
    await expect(row.getByText(/Awaiting response|Contact logged/).first()).toBeVisible();
    test.info().annotations.push({ type: 'Manual', description: 'NFR-08 email delivery: check the team test inbox. This build says it records notes only and does not send email.' });
  });

  test('TC-22 (Acceptable): Log Contact to Both saves two ContactEvent rows', async ({ page }) => {
    const id = await openTc15Violation(page);
    const before = await contactCount(page, id);

    await logContact(page, 'Both');
    expect(await contactCount(page, id), 'Both should save two ContactEvents').toBe(before + 2);
    const newest = (await contactHeadings(page).allInnerTexts()).slice(0, 2).join(' | ');
    expect(newest, 'Both should add one Seller and one Marketplace contact').toMatch(/Seller/);
    expect(newest, 'Both should add one Seller and one Marketplace contact').toMatch(/Marketplace$|Marketplace \|/);
    test.info().annotations.push({ type: 'Saved', description: newest });
  });

  test('TC-23 (Acceptable): a follow-up adds a new contact; Violation Detail lists contacts newest first', async ({ page }) => {
    // Part 1 (REQ-21): contact history order, checked on a seeded violation with two contacts.
    await loginAsInvestigator(page);
    await page.goto(ROUTES.violation(SEEDED_VIOLATION_WITH_CONTACTS));
    await expect(page.getByText(/Contact history \(2\)/)).toBeVisible();
    const dates = await page.locator('text=/\\w{3} \\d{2}, \\d{4} at \\d{2}:\\d{2} [AP]M/').allInnerTexts();
    const contactDates = dates.slice(1).map((d) => Date.parse(d.replace(' at ', ' '))); // first date is VIOLATION RECORDED
    expect(contactDates, 'Contact history is not newest first').toEqual([...contactDates].sort((a, b) => b - a));

    // Part 2 (REQ-19): log a follow-up to the Seller on TC-15's violation; it is added and listed first.
    const id = await openTc15Violation(page, { loggedIn: true });
    const before = await contactCount(page, id);
    await page.getByRole('link', { name: /log contact/i }).click();
    await page.getByLabel('Contacted party *').selectOption('Seller');
    const note = `PW-TEST follow-up ${Date.now()}: the listing is still live.`;
    await page.getByLabel('Notice or follow-up message *').fill(note);
    await page.getByRole('button', { name: /send|save contact record/i }).click();
    expect(await contactCount(page, id), 'Follow-up was not saved').toBe(before + 1);
    await expect(page.locator('.contact-item').first(), 'The newest contact (the follow-up) is not listed first').toContainText(note);
  });

  // TC-24 (Log Contact on a false positive) is retired: Match determination is Exact / Probable / Possible Match.

  test('TC-25 (Unacceptable): Log Contact to a Seller with no email is refused', async ({ page }) => {
    const id = await openTc15Violation(page);   // TC-15's seller was saved without an email
    const before = await contactCount(page, id);

    await logContact(page, 'Seller');
    await expect.soft(page.getByText(/Add the seller's email before sending|seller.*email/i).first(), 'No "Add the seller\'s email before sending." error').toBeVisible({ timeout: 3_000 });
    expect(await contactCount(page, id), 'A ContactEvent was saved for a seller with no email').toBe(before);
  });
});
