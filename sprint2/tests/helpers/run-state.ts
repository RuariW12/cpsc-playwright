import fs from 'fs';

// TC-15 saves a violation that later test files reuse (TC-16, TC-21..TC-23, NFR-10).
// Each spec file runs in its own worker, so the IDs are passed through a small JSON file.
const FILE = 'test-data/run-state.json';

type State = { tc15ViolationId?: string; tc15ListingUrl?: string };

export function readState(): State {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; }
}

export function writeState(patch: State) {
  fs.mkdirSync('test-data', { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify({ ...readState(), ...patch }, null, 2));
}
