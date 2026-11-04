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
* @name: Lighthouse CI config
* @file: lighthouserc.cjs
* @type: config (CommonJS)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm build && pnpm dlx @lhci/cli@0.16.0 autorun  # LHCI_PRESET=desktop for the desktop preset
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🚦 Lighthouse CI (0.2.25, D44): the same pages & targets as `scripts/lighthouse.mjs`, run on every pull request by
//    `.github/workflows/lighthouse.yml`, in WARN MODE: every assertion is `warn`, so a miss is printed (⚠️) but never
//    fails the job. Strict (`error`) comes later, by 1.0 (plan §6.3 / P9) 🔒.
//    📱 mobile by default; `LHCI_PRESET=desktop` switches to the desktop preset (the workflow runs both).
//    🍪 every run sends `AB_APP_HELLO=true` (a returning visitor), so `/` is Home and not the Welcome redirect.
//    🙈 the 404 (`/nope`) is NOT here: Lighthouse refuses an HTTP 404 document (ERRORED_DOCUMENT_REQUEST); the local
//    `pnpm lighthouse` audits it through its relay instead.

// 🖥️ which preset this run uses
const desktop = process.env.LHCI_PRESET === 'desktop';

// 🔢 the port of the local `next start` (same default as Playwright & scripts/lighthouse.mjs)
const PORT = Number(process.env.LHCI_PORT) || 3020;

// 📄 the audited pages: Home, an English docs page & a localized one
const PAGES = ['/', '/docs/installation', '/fr/docs/quick-start'];

// 🎯 the targets (plan §6.3, mobile): Perf ≥ 90 · A11y 100 · BP ≥ 95 · SEO ≥ 90, all as WARN (D44) ⚠️
const ASSERTIONS = {
  'categories:performance': ['warn', { minScore: 0.9 }],
  'categories:accessibility': ['warn', { minScore: 1 }],
  'categories:best-practices': ['warn', { minScore: 0.95 }],
  'categories:seo': ['warn', { minScore: 0.9 }],
};

// 📦 the config
module.exports = {
  ci: {
    collect: {
      // 🚀 LHCI starts the production server itself (after `pnpm build`) & waits for Next's "Ready" line
      startServerCommand: `pnpm start --port ${PORT}`,
      startServerReadyPattern: 'Ready',
      url: PAGES.map((path) => `http://localhost:${PORT}${path}`),
      // 🎲 the median of 3 runs per page (same as the local script)
      numberOfRuns: 3,
      settings: {
        // 🖥️ the desktop preset when asked (mobile is Lighthouse's default)
        ...(desktop ? { preset: 'desktop' } : {}),
        // 🍪 a returning visitor (skips the Welcome redirect on `/`)
        extraHeaders: JSON.stringify({ Cookie: 'AB_APP_HELLO=true' }),
        // 🐧 headless Chrome in a container needs no sandbox
        chromeFlags: '--no-sandbox',
      },
    },
    // ⚠️ warn only (never `error` until strict mode)
    assert: { assertions: ASSERTIONS },
    // 💾 reports stay in the job (an artifact), nothing is uploaded to a public server 🔒
    upload: { target: 'filesystem', outputDir: `.lighthouseci/${desktop ? 'desktop' : 'mobile'}` },
  },
};
