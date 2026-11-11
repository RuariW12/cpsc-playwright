// Shared test settings, read from the .env file.
// Change nothing here day-to-day — edit .env instead (locally) or the repo's Actions secrets (CI).

export const USERS = {
  manager: {
    username: process.env.MANAGER_USER || process.env.CPSC_MANAGER_USER || 'manager',
    password: process.env.MANAGER_PASS || process.env.CPSC_MANAGER_PASSWORD || '',
  },
  investigator: {
    username: process.env.INVESTIGATOR_USER || process.env.CPSC_INVESTIGATOR_USER || 'investigator',
    password: process.env.INVESTIGATOR_PASS || process.env.CPSC_INVESTIGATOR_PASSWORD || '',
  },
};

// Page paths, confirmed against Nyle's deployed Python build on 2026-11-11.
export const ROUTES = {
  login: '/login',
  recallDatabase: '/',                                     // "Recall database" (landing page after login)
  overview: '/overview',                                   // "Operations overview" (Manager dashboard)
  importRecalls: '/import-recalls',                        // "Import recalls" (Preview CSV, then import)
  recall: (id: string) => `/recall/${id}`,                 // "Recall details"
  prioritize: (id: string) => `/recall/${id}/priority`,    // "Prioritize recall" form
};

// The six test recalls in test-data/recalls.csv. They are labelled "DEMO TEST" (the team's
// convention for demonstration records) so they are never mistaken for real CPSC recalls.
// Recall numbers keep the requirements doc's 20001-20006 numbering with a PW- prefix.
// The CSV uses the column headers Nyle's import screen requires.
export const TEST_RECALLS = {
  brightStart: { id: '9000001', number: 'PW-20001', hazard: 'Suffocation' },
  warmWave:    { id: '9000002', number: 'PW-20002', hazard: 'Fire' },        // REQ-04 search target
  pedalPeak:   { id: '9000003', number: 'PW-20003', hazard: 'Impact' },      // REQ-06 prioritize target
  emberGlow:   { id: '9000004', number: 'PW-20004', hazard: 'Fire' },
  snugNest:    { id: '9000005', number: 'PW-20005', hazard: 'Fall' },        // REQ-06/07 validation + reorder target
  blazeAway:   { id: '9000006', number: 'PW-20006', hazard: 'Fire' },
};
export const ALL_TEST_NUMBERS = Object.values(TEST_RECALLS).map((r) => r.number);

// A real seeded CPSC recall with a fire hazard (JKMAX heated blankets, recall 26778).
export const REAL_FIRE_RECALL = { number: '26778' };
