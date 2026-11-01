/* 
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2026 Abraham Ukachi. The abElements Project.
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the 'Software'), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*
* @project: ab-elements-app
* @name: abElements Lighthouse checks
* @file: scripts/lighthouse.mjs
* @type: JavaScript (Node, ESM)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm build && pnpm start --port 3020 & pnpm lighthouse
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🚦 Lighthouse checks (0.2.23): Performance · Accessibility · Best Practices · SEO on Home (`/`, `/fr`) and the 404
//    (`/nope`) with the mobile & desktop presets, the MEDIAN of 3 runs per page × preset, against a running
//    `next start` (default http://localhost:3020; `LH_BASE_URL` to change it). Targets (the plan, §6.3, mobile):
//    Perf ≥ 90 · A11y 100 · BP ≥ 95 · SEO 100. The 404 is `noindex` on purpose, so its SEO target is skipped 🙈.
//    Warn mode by default (prints ⚠️ and exits 0, as the plan's P3 step); `--strict` (or `LH_STRICT=1`) exits 1 on a miss.
//    🍪 Every run sends `AB_APP_HELLO=true` (a returning visitor), so `/` is Home and not the Welcome redirect.
//    🤷🏽‍♂️ Lighthouse refuses to audit a document answered with HTTP 404 (ERRORED_DOCUMENT_REQUEST), so the 404 is
//    audited through a tiny local relay that forwards every request unchanged and only turns THAT document's 404
//    into a 200 (same HTML, headers & assets; the real status is covered by the e2e suite).
//    Writes `lighthouse-report/summary.json` (+ one JSON report per page × preset) 📄.

// import Lighthouse & its Chrome launcher 🚦
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';
// import Playwright's Chromium (the same browser the e2e suites use) 🎭
import { chromium } from '@playwright/test';
// import the file helpers 📁
import { mkdir, writeFile } from 'node:fs/promises';
// import the HTTP server & client (the 404 relay) 🔁
import http from 'node:http';


// 🔗 the server under test
const BASE_URL = process.env.LH_BASE_URL || 'http://localhost:3020';
// 🔁 runs per page × preset (the median is kept)
const RUNS = Number(process.env.LH_RUNS) || 3;
// 🚨 strict mode: a miss fails the script
const STRICT = process.argv.includes('--strict') || process.env.LH_STRICT === '1';
// 🗺️ the pages (`seo: false` = intentionally noindex)
const PAGES = [
  { id: 'home', path: '/', seo: true },
  { id: 'home-fr', path: '/fr', seo: true },
  { id: 'not-found', path: '/nope', seo: false, relay: true },
];
// 📱💻 the two presets
const PRESETS = ['mobile', 'desktop'];
// 🎯 the targets (0–100), the plan's §6.3
const TARGETS = { performance: 90, accessibility: 100, 'best-practices': 95, seo: 100 };


/**
 * `median` 📊 - the middle value of a list
 *
 * @param { number[] } xs - the values
 * @returns { number }
 */
function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}


/**
 * `startRelay` 🔁 - a pass-through proxy to BASE_URL that reports the 404 DOCUMENT as 200 (Lighthouse can't audit a 404)
 *
 * @returns { Promise<{ url: string, close: () => void }> }
 */
function startRelay() {
  const target = new URL(BASE_URL);
  const server = http.createServer((req, res) => {
    // ➡️ forward as is (same path, method & headers, the host rewritten)
    const up = http.request({ hostname: target.hostname, port: target.port, path: req.url, method: req.method, headers: { ...req.headers, host: target.host } }, (r) => {
      // 📄 only an HTML document's 404 becomes a 200; assets keep their status
      const html = String(r.headers['content-type'] ?? '').includes('text/html');
      res.writeHead(r.statusCode === 404 && html ? 200 : r.statusCode ?? 502, r.headers);
      r.pipe(res);
    });
    up.on('error', () => { res.writeHead(502); res.end(); }); // 💥
    req.pipe(up);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ url: `http://localhost:${server.address().port}`, close: () => server.close() })));
}


// 🔁 the 404 relay
const relay = await startRelay();
// 🚀 launch one headless Chrome for every run
const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
// 📁 where the reports go
await mkdir('lighthouse-report', { recursive: true });
// 🧾 the summary rows & the misses
const summary = [];
const misses = [];

try {
  for (const page of PAGES) {
    for (const preset of PRESETS) {
      // 🔁 RUNS runs, the median per category
      const scores = { performance: [], accessibility: [], 'best-practices': [], seo: [] };
      let last = null;
      for (let i = 0; i < RUNS; i++) {
        // 🍪 a returning visitor (no Welcome redirect)
        const flags = { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: Object.keys(TARGETS), extraHeaders: { Cookie: 'AB_APP_HELLO=true' } };
        const result = await lighthouse(`${page.relay ? relay.url : BASE_URL}${page.path}`, flags, preset === 'desktop' ? desktopConfig : undefined);
        if (result.lhr.runtimeError) throw new Error(`${page.path} ${preset}: ${result.lhr.runtimeError.code}`); // 💥 never score an error page
        for (const key of Object.keys(scores)) scores[key].push(Math.round((result.lhr.categories[key]?.score ?? 0) * 100));
        last = result;
      }
      // 📊 the medians
      const row = { page: page.id, path: page.path, preset };
      for (const key of Object.keys(scores)) row[key] = median(scores[key]);
      summary.push(row);
      await writeFile(`lighthouse-report/${page.id}-${preset}.json`, last.report); // 📄 the last full report
      // 🎯 compare with the targets
      for (const [key, min] of Object.entries(TARGETS)) {
        if (key === 'seo' && !page.seo) continue; // 🙈 noindex on purpose
        if (row[key] < min) {
          const failing = Object.values(last.lhr.audits).filter((a) => a.score !== null && a.score < 0.9 && last.lhr.categories[key].auditRefs.some((r) => r.id === a.id && r.weight > 0)).map((a) => a.id);
          misses.push(`${page.path} ${preset} ${key} ${row[key]} < ${min} (${failing.slice(0, 6).join(', ')})`);
        }
      }
      console.log(`🚦 ${page.path.padEnd(6)} ${preset.padEnd(7)} perf ${row.performance} · a11y ${row.accessibility} · bp ${row['best-practices']} · seo ${row.seo}`);
    }
  }
} finally {
  // 🧹 always close Chrome
  await chrome.kill();
  relay.close(); // 🔁
}

// 📄 the summary file
await writeFile('lighthouse-report/summary.json', JSON.stringify({ baseUrl: BASE_URL, runs: RUNS, targets: TARGETS, summary, misses }, null, 2));
// 🧾 the verdict
if (misses.length) {
  console.log(`\n${STRICT ? '❌' : '⚠️'} ${misses.length} target(s) missed:\n  ${misses.join('\n  ')}`);
  if (STRICT) process.exit(1);
} else {
  console.log('\n✅ every Lighthouse target met');
}
