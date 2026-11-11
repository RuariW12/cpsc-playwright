import { test } from '@playwright/test';

// Listed so the HTML report shows every test case. Playwright can't read an inbox,
// so TC-11 is run manually and recorded in the Manual Test Results.
test('TC-11 (Acceptable): Investigator receives an email alert (manual only)', async () => {
  test.skip(true, 'Manual test: check the Investigator test inbox.');
});
