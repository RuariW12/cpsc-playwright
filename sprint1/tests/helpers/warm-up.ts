import { request } from '@playwright/test';
import 'dotenv/config';

// Runs once before the suite. The free Render server sleeps when idle and can take a few
// minutes to wake, so wait for the real Login page before any test starts.
export default async function warmUp() {
  const base = process.env.BASE_URL || 'https://recall-management-system.onrender.com';
  const ctx = await request.newContext();
  const deadline = Date.now() + 5 * 60_000;
  while (Date.now() < deadline) {
    const res = await ctx.get(`${base}/login`, { timeout: 60_000 }).catch(() => null);
    if (res?.ok() && (await res.text()).includes('Sign in')) break;
    await new Promise((r) => setTimeout(r, 5_000));
  }
  await ctx.dispose();
}
