// Turns results/<sprint>/results.json (Playwright's JSON reporter) into results/<sprint>/SUMMARY.md,
// a pass/fail table that GitHub shows right in the repo. In GitHub Actions it is also added to the
// run's summary page.  Usage: node scripts/summarize.mjs sprint1 "Sprint 1 - Recall Prioritization"
import fs from 'fs';

const [sprint, title = sprint] = process.argv.slice(2);
const dir = `results/${sprint}`;
const data = JSON.parse(fs.readFileSync(`${dir}/results.json`, 'utf8'));

const rows = [];
(function walk(suite) {
  for (const s of suite.suites || []) walk(s);
  for (const spec of suite.specs || []) {
    for (const t of spec.tests) {
      const r = t.results[t.results.length - 1] || {};
      const status = t.status === 'skipped' || r.status === 'skipped' ? 'skipped' : r.status === 'passed' ? 'passed' : 'failed';
      const errors = (r.errors || []).map((e) => (e.message || '').replace(/\x1b\[[0-9;]*m/g, '').split('\n')[0].trim()).filter(Boolean);
      const notes = (t.annotations || []).map((a) => `${a.type}: ${a.description}`);
      rows.push({ title: spec.title, file: spec.file, status, detail: [...new Set(errors)].concat(notes).join('<br>') });
    }
  }
})({ suites: data.suites });

const icon = { passed: '✅ Pass', failed: '❌ Fail', skipped: '⏭️ Skipped' };
const count = (s) => rows.filter((r) => r.status === s).length;
const when = new Date(data.stats?.startTime || Date.now());
const app = process.env.BASE_URL || 'https://recall-management-system.onrender.com';
const run = process.env.GITHUB_RUN_ID
  ? `[GitHub Actions run #${process.env.GITHUB_RUN_NUMBER}](${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})`
  : 'local run';
const esc = (s) => s.replace(/\|/g, '\\|');

const md = `# ${title}: test results

App: ${app} (Nyle's build)
Run: ${when.toISOString().replace('T', ' ').slice(0, 16)} UTC, ${run}

**${count('passed')} passed · ${count('failed')} failed · ${count('skipped')} skipped** (${rows.length} test cases)

| Test case | Result | Details |
| --- | --- | --- |
${rows.map((r) => `| ${esc(r.title)} | ${icon[r.status]} | ${esc(r.detail)} |`).join('\n')}

Full HTML report with a screenshot for every test: download \`report/\` from this folder and open \`index.html\`,
or download the \`${sprint}-report\` artifact from the Actions run and run \`npx playwright show-report <folder>\`.
`;
fs.writeFileSync(`${dir}/SUMMARY.md`, md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
console.log(md);
