# Sprint 2 Test Plan

> The Results and Bugs sections below are from the Nov 5–6 manual and automated runs. Nyle's build has changed since then (new Add Violation fields, Log Contact). The latest automated results are in [results/sprint2/SUMMARY.md](../results/sprint2/SUMMARY.md).

BIT 4454 · CPSC Team 2 · Ruari Whalen, Requirements Analyst

Nyle's Python build, https://recall-management-system.onrender.com

### Scope

1. Add Violation (TC-15 to TC-20). This is the Investigator's main task and creates the records OKR 2.1 counts.
2. Log Contact (TC-21 to TC-25). Contacting the seller or marketplace, plus follow-ups.
3. Violation List (TC-27). Filtering by status.
4. Access control (TC-26). Only Investigators can add violations.

The Power BI charts (TC-28 to TC-30) were not tested.

### Approach

- Automated tests use Playwright (Chromium). Run `npm test` from `cpsc-playwright-sprint2/`. It takes about 2 minutes. `npm run report` opens the HTML report, which has a screenshot for every test.
- TC-21 also needs a manual check of the team test inbox (NFR-08). It is blocked until Log Contact is built.
- Test data uses recall PW-20002 (WarmWave Electric Throw Blanket), imported in Sprint 1. Test listings are titled `PW-TEST …` and each run uses a new listing URL so VR-12 doesn't block a re-run.

### Changes for this build

- There's no Add Violation button on Recall Detail, so the tests go through Violation management → Add violation.
- Sellers can only be picked from a list. cozyfinds_va doesn't exist, so TC-15 uses whitaker_wholesale.
- Match determination is Exact Match, Probable Match or Possible Match, as in Nyle's build (team decision, Nov 6, 2026). This replaces True positive / False positive in REQ-16 and VR-20, so there is no "Closed – not a match" status. TC-15 uses Exact Match, TC-18 uses Possible Match, and TC-24 (Log Contact on a false positive) is retired.

### Bugs
**BUG-S2-01: no way to log contact with the seller or marketplace (REQ-17 to REQ-19).** The Log Contact screen doesn't exist, so the Investigator can't notify a seller or marketplace or log a follow-up. This causes TC-21, 22, 23 and 25 to fail.
**BUG-S2-02: the Add Violation form is missing fields (REQ-16 Listing details, VR-15 to VR-18).** It has no Price, Manufacturer/Model or Listing posted date fields, and no seller email or profile link. You also can't add a new seller, only pick an existing one (REQ-16 step 2). This causes TC-15 to fail.
**BUG-S2-03: duplicate listings are accepted (VR-12).** Entering a listing URL that's already in the system should show "This listing is already in the system." and save nothing. Instead it saves a second violation (TC-16).
**BUG-S2-04: match commentary can be left blank (REQ-16, VR-21).** Commentary is required (10–500 characters), so the form should flag a blank one before it's submitted, with "Add commentary (10–500 characters)." It matters because the commentary is the Investigator's reason for the decision, and the user story says each violation is recorded "with commentary". Right now it saves a violation as "No commentary provided" (TC-19).

## Test Cases

Acceptable = good input. Unacceptable = bad input the system should reject. *Italics* are the field or button, <u>underlined</u> text is the data entered.

### Add Violation

File: `tests/01-add-violation.spec.ts`

**TC-15 (Acceptable): record the WarmWave listing as an Exact Match**
1. Log in as *investigator*, type <u>PW-20002</u> in *Search recalls*, then click *Open Recall* on the PW-20002 row.
2. Click *Add Violation*.
3. Select <u>Enter a new listing</u> in *Listing source*.
4. Choose <u>eBay</u> in *Marketplace*, then type <u>https://www.ebay.com/itm/sample-501</u> in *Listing URL*.
5. Type <u>WarmWave WT-50 Heated Throw Blanket, used once</u> in *Listing title*.
6. Type <u>24.99</u> in *Price*, <u>WarmWave</u> in *Manufacturer*, and <u>WT-50</u> in *Model*.
7. Type <u>2026-10-20 14:05</u> in *Posted date*, then type <u>cozyfinds_va</u> in *Seller username*.
8. Choose <u>WarmWave Electric Throw Blanket</u> in *Recalled product*.
9. Choose <u>Exact Match</u> in *Match determination*.
10. Type <u>Title and photo show model WT-50, the recalled model.</u> in *Match commentary*.
11. Click *Save violation*.

Expected: the listing and violation are saved with the investigator and date-time, ImportMethod is "Manual", and the screen shows "Notice not sent".

**TC-16 (Unacceptable): same listing URL again**
1. Log in as *investigator* and note the total on the *Violations* list.
2. Repeat TC-15 steps 2–11 with the same <u>Listing URL</u>.
3. Go back to the *Violations* list and compare the total.

Expected: "This listing is already in the system." and the total doesn't change.

**TC-17 (Unacceptable): URL that isn't a link**
1. Log in as *investigator* and note the *Violations* total.
2. Open *Add violation* and select <u>Enter a new listing</u>.
3. Fill the form as in TC-15, but type <u>ebay blanket listing</u> in *Listing URL*.
4. Click *Save violation*.

Expected: a URL error next to Listing URL, and the total doesn't change.

**TC-18 (Acceptable): WT-70 listing recorded as a Possible Match**
1. Log in as *investigator* and open *Add violation*.
2. Type <u>WarmWave WT-70 Heated Throw</u> in *Listing title* and fill the other fields as in TC-15 with a new <u>Listing URL</u>.
3. Choose <u>Possible Match</u> in *Match determination*.
4. Type <u>Title says WT-70, which is not in recall 20002, but the photo shows the WT-50 controller.</u> in *Match commentary*, then click *Save violation*.

Expected: the violation is saved and shows "Possible Match" on the *Violations* list and on *Violation Detail*.

**TC-19 (Unacceptable): Exact Match with blank commentary**
1. Log in as *investigator* and note the *Violations* total.
2. Fill *Add violation* as in TC-15 with a new <u>Listing URL</u> and leave *Match commentary* blank.
3. Click *Save violation*.

Expected: "Add commentary (10–500 characters)." and the total doesn't change.

**TC-20 (Unacceptable): commentary but no determination**
1. Log in as *investigator* and note the *Violations* total.
2. Fill *Add violation* as in TC-15 with a new <u>Listing URL</u> and leave *Match determination* on <u>Select match</u>.
3. Click *Save violation*.

Expected: a determination error, and the total doesn't change.

### Log Contact

File: `tests/02-log-contact.spec.ts`

**TC-21 (Acceptable): contact the seller**
1. Log in as *investigator* and open the *Violation Detail* for TC-15's violation.
2. Click *Log Contact*.
3. Choose <u>Seller</u> in *Contacted party*, then click *Send*.
4. Check the team test inbox within 5 minutes (manual).

Expected: a ContactEvent is saved (Seller, Email, investigator, date-time), the violation shows "Awaiting response", and the email arrives.

**TC-22 (Acceptable): contact both**
1. Open TC-15's *Violation Detail* and click *Log Contact*.
2. Choose <u>Both</u> in *Contacted party*.
3. Click *Send*, then click *Confirm* after filing the marketplace report.

Expected: two ContactEvent rows are saved: Seller / Email and Marketplace / Marketplace report.

**TC-23 (Acceptable): follow-up, history newest first**
1. Open the *Violation Detail* for violation <u>#10</u>, which has two contacts.
2. Check that *Contact history* lists <u>Mar 16, 2026</u> above <u>Mar 13, 2026</u>.
3. Open TC-15's *Violation Detail* and click *Log Contact* to send a follow-up to the <u>Seller</u>.

Expected: a new ContactEvent is saved, and contacts are listed newest first.

**TC-24: retired.** It checked that a false positive has no Log Contact button. Match determination is now Exact / Probable / Possible Match, so there are no false positives.

**TC-25 (Unacceptable): seller with no email**
1. Open TC-15's *Violation Detail*. The seller has no email.
2. Click *Log Contact*, choose <u>Seller</u>, then click *Send*.

Expected: "Add the seller's email before sending." and no ContactEvent is saved.

### Access Control

File: `tests/03-access-control.spec.ts`

**TC-26 (Unacceptable): Manager types the Add Violation URL**
1. Log in as *manager*.
2. Type <u>/violations/add</u> after the site address in the *address bar* and press Enter.

Expected: the Manager is sent back to the Manager Dashboard.

### Violation List

File: `tests/04-violation-list.spec.ts`

**TC-27 (Acceptable): filter by Awaiting response**
1. Log in as *investigator* and open *Violation management*.
2. Choose <u>Awaiting response</u> in the *Status* filter.

Expected: only violations with at least one contact are shown.

### Manager Charts (not tested)

**TC-28 (Acceptable): per week and by Investigator (OKR 2.1)**
1. Run TC-15 and TC-18 first.
2. Log in as *manager*, open *Overview*, then click *Open report in a new tab* under Sprint 2 analytics.
3. Find the *Violations recorded per week* and *Violations by Investigator* charts.

Expected: this week's bar and the investigator's bar each go up by 2.

**TC-29 (Acceptable): by Priority Level (OKR 2.2)**
1. Run TC-15 first, then open the report as in TC-28.
2. Find the *Violations by Priority Level* and *High share vs 50%* charts.

Expected: the High bar goes up by 1 and the High share is recalculated.

**TC-30 (Acceptable): by Hazard Category (OKR 2.2)**
1. Run TC-15 first, then open the report as in TC-28.
2. Find the *Violations by Hazard Category* chart.

Expected: the Fire/Burn bar goes up by 1 and the bars stay sorted largest first.

## Results

Nyle's build, Nov 5, 2026, with TC-18 re-run on Nov 6 after the match determination change. 12 tests: 3 pass, 9 fail. TC-24 retired. TC-28 to TC-30 not tested.

| TC | Result | Notes |
| --- | --- | --- |
| TC-15 | Fail | Violation #23 saved as Exact Match with the investigator and date-time, but no Price, Model or Posted date fields, can't enter a new seller, and shows "No contact logged" instead of "Notice not sent". BUG-S2-02. |
| TC-16 | Fail | Duplicate URL accepted, second violation (#24) saved. BUG-S2-03. |
| TC-17 | Pass | Browser blocked the save ("Please enter a URL."). |
| TC-18 | Pass | Violation #31 saved and shows "Possible Match" (Nov 6). |
| TC-19 | Fail | Blank commentary accepted. Violation #25 saved as "No commentary provided". BUG-S2-04. |
| TC-20 | Pass | Browser blocked the save ("Please select an item in the list."). |
| TC-21 | Fail | No Log Contact button or screen. BUG-S2-01. |
| TC-22 | Fail | No Log Contact button or screen. BUG-S2-01. |
| TC-23 | Fail | Can't log a follow-up (BUG-S2-01). #10's history is newest first, so that part passed. |
| TC-24 | Retired | No false positives with Exact / Probable / Possible Match. |
| TC-25 | Fail | No Log Contact button or screen. BUG-S2-01. |
| TC-26 | Fail (minor) | Manager is blocked but gets a 403 page instead of the dashboard. Not logged as a bug. |
| TC-27 | Fail (minor) | No Status filter on the list. Not logged as a bug. |
| TC-28–30 | Not tested | Power BI. |

Screenshots: run `npm run report` and click a test. The images are also in `test-results/<test name>/`.

## Traceability

### By page

✓ = done · ◐ = partly done · ✗ = missing · blank = doesn't apply

| Requirement | Recall Detail | Add violation | Violation List | Violation Detail | Edit violation |
| --- | --- | --- | --- | --- | --- |
| REQ-15 Open a recall, Add Violation | ◐ no button | | | | |
| REQ-16 Add Violation form | | ◐ BUG-S2-02/03/04 | ◐ entry point | ◐ no status | ✗ overwrites |
| REQ-17 Log Contact | | | | ✗ | |
| REQ-18 ContactEvent, Awaiting response | | | ✗ | ✗ | |
| REQ-19 Follow-ups | | | | ✗ | |
| REQ-20 List and filters | | | ◐ no status filter | | |
| REQ-21 Detail and contact history | | | | ✓ | |
| REQ-22 Manager read-only | | ✓ | ✓ | ✓ | ✓ |
| REQ-24–26 Notices | | | | ✗ | |
| VR-11 URL is a link | | ✓ | | | |
| VR-12 URL not a duplicate | | ✗ | | | |
| VR-13–18 Listing and seller fields | | ✗ | | | |
| VR-19 Product required | | ✓ | | | |
| VR-20 Determination required (Exact / Probable / Possible) | | ✓ | | | |
| VR-21 Commentary 10–500 | | ✗ | | | |
| VR-23–25 Contact rules | | | | ✗ | |
| NFR-09 Investigators only | | ◐ 403 | | | ◐ 403 |
| NFR-10 Never overwritten | | | | | ✗ |

### By test

| Requirement | Test cases | File | Result |
| --- | --- | --- | --- |
| REQ-16, VR-11–21 | TC-15 to TC-20 | `01-add-violation.spec.ts` | 3 pass, 3 fail |
| REQ-17, 18, 24, 25, VR-23–25 | TC-21, 22, 25 | `02-log-contact.spec.ts` | 3 fail (TC-24 retired) |
| REQ-19, REQ-21 | TC-23 | `02-log-contact.spec.ts` | Fail |
| NFR-09 | TC-26 | `03-access-control.spec.ts` | Fail (minor) |
| REQ-20 | TC-27 | `04-violation-list.spec.ts` | Fail (minor) |
| REQ-23 | TC-28 to TC-30 | Not automated | Not tested |
| REQ-24, NFR-08 (email) | TC-21 step 4 | Manual | Blocked |
