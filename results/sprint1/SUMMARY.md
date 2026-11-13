# Sprint 1 - Recall Prioritization: test results

App: https://recall-management-system.onrender.com (Nyle's build)
Run: 2026-11-13 17:00 UTC, [GitHub Actions run #1](https://github.com/RuariW12/cpsc-playwright/actions/runs/43468365120)

**9 passed · 4 failed · 1 skipped** (14 test cases)

| Test case | Result | Details |
| --- | --- | --- |
| TC-01 (Acceptable): correct password opens the Manager workspace | ✅ Pass |  |
| TC-02 (Unacceptable): wrong password shows an error and stays on Login | ✅ Pass |  |
| TC-03 (Acceptable): import 6 recalls -> all 6 saved | ✅ Pass | note: Test recalls were already imported by an earlier run. |
| TC-04 (Unacceptable): re-import the same CSV -> duplicates skipped, no duplicates saved | ✅ Pass |  |
| TC-05 (Acceptable): search "WarmWave" shows only recall 20002 | ✅ Pass |  |
| TC-06 (Acceptable): filter Hazard = Fire shows only 20002, 20004, 20006 | ❌ Fail | Error: Real fire-hazard recall 26778 (JKMAX heated blankets) is missing from the Fire filter |
| TC-07 (Acceptable): prioritize 20003 Medium with a valid justification | ✅ Pass |  |
| TC-08 (Unacceptable): no Priority Level -> error, nothing saved | ✅ Pass |  |
| TC-09 (Unacceptable): justification too short -> length error, nothing saved | ❌ Fail | Error: no length error shown for a 3-character justification<br>Error: the priority was saved with a 3-character justification |
| TC-10 (Acceptable): change 20005 from Low to High -> it moves to the High group | ❌ Fail | Error: 40 non-High recalls are listed above PW-20005; the list is not ordered by priority |
| TC-12 (Unacceptable, REQ-10): Investigator cannot reach the Prioritize page | ❌ Fail | Error: expect(locator).toBeVisible() failed |
| TC-13 (Unacceptable, NFR-01): logged-out user is sent to Login | ✅ Pass |  |
| TC-14 (Acceptable): "Recall priorities" chart is shown and matches the database | ✅ Pass |  |
| TC-11 (Acceptable): Investigator receives an email alert (manual only) | ⏭️ Skipped | skip: Manual test: check the Investigator test inbox. |

Full HTML report with a screenshot for every test: download `report/` from this folder and open `index.html`,
or download the `sprint1-report` artifact from the Actions run and run `npx playwright show-report <folder>`.
