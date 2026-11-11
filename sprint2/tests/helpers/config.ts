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
  recallDatabase: '/',                                     // "Recall database" (landing page)
  overview: '/overview',                                   // "Operations overview" (Manager dashboard)
  recall: (id: string) => `/recall/${id}`,                 // "Recall details"
  violations: '/violations',                               // "Violation management" (Screen 3 list)
  addViolation: '/violations/add',                         // "Add violation" (Screen 1)
  addViolationFor: (recallId: string) => `/violations/add?recall_id=${recallId}`, // opened from a recall row
  violation: (id: string) => `/violations/${id}/details`,  // Violation Detail
  editViolation: (id: string) => `/violations/${id}/edit`, // "Update violation"
  logContact: (id: string) => `/violations/${id}/log-contact`, // "Log contact" (Screen 2)
};

// The requirements doc's sample recall 20002. It exists in this database from the Sprint 1
// import as PW-20002 (labelled "DEMO TEST"), recall ID 9000002, product ID 16.
export const SAMPLE_RECALL = {
  id: '9000002',
  number: 'PW-20002',
  product: 'WarmWave Electric Throw Blanket',
};

// A seeded violation with two logged contacts (Mar 13 and Mar 16, 2026), used to check
// that contact history is listed newest first (REQ-21).
export const SEEDED_VIOLATION_WITH_CONTACTS = '10';

// Each run gets a stamp so listing URLs stay unique (VR-12 would refuse a repeat run).
// Test listings are labelled "PW-TEST" so they are never mistaken for real investigations.
export const RUN = Date.now().toString(36);
export const TC15_LISTING = {
  marketplace: 'eBay',
  url: `https://www.ebay.com/itm/sample-501-${RUN}`,
  title: 'PW-TEST WarmWave WT-50 Heated Throw Blanket, used once',
  price: '24.99',
  manufacturer: 'WarmWave',
  model: 'WT-50',
  posted: '2026-10-20T14:05',
  // This build can't pick an existing seller ("This seller already exists… Choose the existing
  // seller instead." with no way to choose one), so each run adds the doc's seller with the run stamp.
  seller: `cozyfinds_va_${RUN}`,
  commentary: 'Title and photo show model WT-50, the recalled model.',
};
