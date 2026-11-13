# Sprint 2 - Violation Management: test results

App: https://recall-management-system.onrender.com (Nyle's build)
Run: 2026-11-13 17:02 UTC, [GitHub Actions run #1](https://github.com/RuariW12/cpsc-playwright/actions/runs/43468365120)

**0 passed · 8 failed · 4 skipped** (12 test cases)

| Test case | Result | Details |
| --- | --- | --- |
| TC-15 (Acceptable): the Investigator records the WarmWave listing as an Exact Match | ❌ Fail | Error: expect(locator).toBeVisible() failed |
| TC-16 (Unacceptable): the same listing URL again is refused | ⏭️ Skipped | skip: TC-15 did not save a listing to repeat |
| TC-17 (Unacceptable): a URL that is not a link is refused | ❌ Fail | Error: expect(locator).toBeVisible() failed |
| TC-18 (Acceptable): a WT-70 listing recorded as a Possible Match | ❌ Fail | Error: expect(locator).toBeVisible() failed |
| TC-19 (Unacceptable): an Exact Match with blank commentary is refused | ❌ Fail | Error: expect(locator).toBeVisible() failed |
| TC-20 (Unacceptable): commentary filled but no determination is refused | ❌ Fail | Error: expect(locator).toBeVisible() failed |
| TC-21 (Acceptable): Log Contact to the Seller saves an Email ContactEvent | ⏭️ Skipped | skip: TC-15 did not save a violation to log contacts on |
| TC-22 (Acceptable): Log Contact to Both saves two ContactEvent rows | ⏭️ Skipped | skip: TC-15 did not save a violation to log contacts on |
| TC-23 (Acceptable): a follow-up adds a new contact; Violation Detail lists contacts newest first | ❌ Fail | Error: expect(locator).toBeVisible() failed |
| TC-25 (Unacceptable): Log Contact to a Seller with no email is refused | ⏭️ Skipped | skip: TC-15 did not save a violation to log contacts on |
| TC-26 (Unacceptable): the Manager types the Add Violation URL and is sent back to the Manager Dashboard | ❌ Fail | Error: Manager was not sent back to the dashboard<br>Response: HTTP 403 at https://recall-management-system.onrender.com/violations/add |
| TC-27 (Acceptable): filter status = Awaiting response | ❌ Fail | Error: expect(locator).toBeVisible() failed |

Full HTML report with a screenshot for every test: download `report/` from this folder and open `index.html`,
or download the `sprint2-report` artifact from the Actions run and run `npx playwright show-report <folder>`.
