import { Page, expect } from '@playwright/test';
import { ROUTES } from './config';

// Recall database rows still shown after the page's search and filters run (they hide rows in the browser).
export const visibleRows = (page: Page) => page.locator('#recallTable tbody tr').filter({ visible: true });

// The row for one recall number (case number is the first column).
export const rowFor = (page: Page, number: string) =>
  page.locator('#recallTable tbody tr').filter({ has: page.locator('td:first-child', { hasText: new RegExp(`^\\s*${number}\\s*$`) }) });

// Reads "Priority: ..." from the Prioritization section of Recall details.
export async function currentPriority(page: Page, id: string) {
  await page.goto(ROUTES.recall(id));
  const line = page.locator('p').filter({ has: page.locator('strong', { hasText: /^Priority:$/ }) });
  return (await line.innerText()).replace(/^Priority:\s*/, '').trim();
}

// Saves a priority through the Prioritize recall form.
export async function setPriority(page: Page, id: string, level: string, why: string) {
  await page.goto(ROUTES.prioritize(id));
  await page.getByLabel('Priority *').selectOption(level);
  await page.getByLabel('Prioritization rationale *').fill(why);
  await page.getByRole('button', { name: 'Save prioritization' }).click();
  await expect(page).toHaveURL(new RegExp(`${ROUTES.recall(id)}$`));
}
