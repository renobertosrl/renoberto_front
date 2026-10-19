// Saves the public API state into the bundle at build time, so the site can
// render immediately while the (possibly sleeping) server wakes up.
// Never fails the build: without a snapshot the app simply waits for the API.
import { writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/snapshot.json', import.meta.url);
const API = process.env.VITE_API_URL;
const ATTEMPTS = 3;

if (!API || /localhost|127\.0\.0\.1/.test(API)) {
  console.log('[snapshot] skipped: VITE_API_URL is not a production URL');
  process.exit(0);
}

for (let i = 1; i <= ATTEMPTS; i++) {
  try {
    // A sleeping Render instance can take a minute to answer
    const res = await fetch(`${API}/state`, { signal: AbortSignal.timeout(90_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    await writeFile(OUT, JSON.stringify({ at: Date.now(), data }));
    console.log(`[snapshot] saved ${data.projects?.length ?? 0} projects`);
    process.exit(0);
  } catch (e) {
    console.warn(`[snapshot] attempt ${i}/${ATTEMPTS} failed: ${e.message}`);
  }
}

console.warn('[snapshot] giving up, building without a fresh snapshot');
