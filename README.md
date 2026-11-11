# CPSC Playwright Tests

Automated tests for the CPSC Recall Management System (BIT 4454, Team 2), run with GitHub Actions.
Ruari Whalen, Requirements Analyst.

App under test: Nyle's build at https://recall-management-system.onrender.com

## Latest results

| Sprint | Results |
| --- | --- |
| Sprint 1: Recall Prioritization (TC-01 to TC-14) | [results/sprint1/SUMMARY.md](results/sprint1/SUMMARY.md) |
| Sprint 2: Violation Management (TC-15 to TC-27) | [results/sprint2/SUMMARY.md](results/sprint2/SUMMARY.md) |

Each run updates these files automatically. Each `SUMMARY.md` shows pass or fail for every test case and
the reason for each failure. To see the screenshots, open the run under the **Actions** tab and download the
`sprint1-report` or `sprint2-report` artifact. You can also download `results/<sprint>/report/` and open
`index.html`.

## Running the tests in GitHub Actions

The workflow is [.github/workflows/sprint-tests.yml](.github/workflows/sprint-tests.yml). It runs:

- by hand: go to **Actions**, pick **Sprint tests (Nyle's build)**, click **Run workflow**, then choose both sprints or just one.
- automatically, when a change to `sprint1/`, `sprint2/` or `scripts/` is pushed to `main`.

When a run finishes, the workflow commits the results to `results/`. If any test case failed, the run shows a red ✗.
That's expected while the app still has open bugs.

It doesn't run on a schedule because each Sprint 2 run adds a few `PW-TEST` violations to the live database.

Logins come from the repo's Actions secrets: `CPSC_MANAGER_USER`, `CPSC_MANAGER_PASSWORD`,
`CPSC_INVESTIGATOR_USER` and `CPSC_INVESTIGATOR_PASSWORD`.

## Running locally

```bash
npm ci
npx playwright install chromium
cp sprint1/.env.example sprint1/.env     # fill in the passwords
cp sprint2/.env.example sprint2/.env
npm run test:sprint1                     # or test:sprint2
npm run report:sprint1                   # open the HTML report
```

## Layout

| Folder | What's in it |
| --- | --- |
| `sprint1/` | Sprint 1 suite: login, import, search/filter, prioritize, priority queue, access control, dashboard |
| `sprint2/` | Sprint 2 suite: Add Violation, Log Contact, access control, Violation list. `TEST-PLAN.md` has the steps |
| `results/` | Results from the latest run of each suite (`SUMMARY.md`, `results.json`, HTML `report/`) |
| `scripts/summarize.mjs` | Builds `SUMMARY.md` from Playwright's JSON results |
| `tests/` | Earlier tutorial tests (smoke, TC-02, TC-05), run by `playwright.yml` |

## Notes on the test data

- Sprint 1 uses six `DEMO TEST` recalls, PW-20001 to PW-20006 (`sprint1/test-data/recalls.csv`). They're already in
  the database, so TC-03 confirms they're there and TC-04 checks that re-importing them is refused.
- Sprint 2 uses recall PW-20002. Each run adds new `PW-TEST` listings with a unique URL and seller name, so a run
  never collides with an earlier one.
- TC-11 (email alert) is manual, and TC-28 to TC-30 (Power BI) aren't automated.
