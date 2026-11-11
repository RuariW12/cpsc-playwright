import { Page, expect } from '@playwright/test';
import { ROUTES, SAMPLE_RECALL, TC15_LISTING } from './config';

// Total from the "All N" tab on the Violations list (used to prove "nothing saved").
export async function violationCount(page: Page): Promise<number> {
  await page.goto(ROUTES.violations);
  const text = await page.getByRole('button', { name: /^All \d+$/ }).innerText();
  return Number(text.match(/(\d+)/)![1]);
}

// Opens Add violation for recall 20002, the way the "Add Violation" link on its Recall database row does.
export async function openAddViolation(page: Page) {
  await page.goto(ROUTES.addViolationFor(SAMPLE_RECALL.id));
  await expect(page.locator('#recall_display')).toHaveValue(SAMPLE_RECALL.number);
}

export type Listing = Partial<typeof TC15_LISTING> & { match?: string; sellerEmail?: string };

// Fills the Add violation form. Undefined values are left blank; TC-15's data is the default.
export async function fillViolation(page: Page, overrides: Listing = {}) {
  const v: Listing = { ...TC15_LISTING, ...overrides };
  if (v.marketplace) await page.getByLabel('Marketplace *').selectOption({ label: v.marketplace });
  if (v.url !== undefined) await page.getByLabel('Listing URL *').fill(v.url);
  if (v.title !== undefined) await page.getByLabel('Listing title *').fill(v.title);
  if (v.posted !== undefined) await page.getByLabel('Listing posted date and time *').fill(v.posted);
  if (v.price !== undefined) await page.getByLabel('Price *').fill(v.price);
  if (v.manufacturer !== undefined) await page.getByLabel('Manufacturer shown *').fill(v.manufacturer);
  if (v.model !== undefined) await page.getByLabel('Model shown *').fill(v.model);
  if (v.seller !== undefined) await page.getByLabel('Seller username *').fill(v.seller);
  if (v.sellerEmail !== undefined) await page.getByLabel('Seller email').fill(v.sellerEmail);
  if (v.match) await page.getByLabel('Match determination *').selectOption(v.match);
  if (v.commentary !== undefined) await page.getByLabel('Match commentary *').fill(v.commentary);
}

export const saveViolation = (page: Page) => page.getByRole('button', { name: 'Save listing & violation' }).click();

// Finds a violation on the list by listing title and returns its ID (newest match first).
export async function findViolationId(page: Page, title: string): Promise<string | undefined> {
  await page.goto(ROUTES.violations);
  const row = page.locator('tbody tr', { hasText: title }).first();
  if (!(await row.isVisible())) return undefined;
  const href = await row.locator('a[href$="/details"]').getAttribute('href');
  return href?.match(/violations\/(\d+)\/details/)?.[1];
}

// Number of entries in a violation's "Contact history (N)".
export async function contactCount(page: Page, id: string): Promise<number> {
  await page.goto(ROUTES.violation(id));
  const text = await page.getByText(/Contact history \(\d+\)/).innerText();
  return Number(text.match(/\((\d+)\)/)![1]);
}
