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
* @name: abElements Welcome Accessibility E2E Tests
* @file: tests/e2e/welcome-a11y.spec.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm build && pnpm test:e2e
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// ♿ Welcome accessibility e2e: axe (WCAG 2.x A/AA) on every slide in light & dark with 0 serious
// or critical issues, and the keyboard tab order from the build brief.

// import the file helpers from Node 📁
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
// import the test helpers & the page type from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
// import the axe builder from `@axe-core/playwright` 🪓
import AxeBuilder from '@axe-core/playwright';
// import the shared Welcome helpers 🧰
import { LAPTOP, SLIDE_IDS, openWelcome } from './welcome-helpers';


// where each run drops its axe summary (one JSON per slide × theme; `test-results/` is git-ignored) 📊
const SUMMARY_DIR = join('test-results', 'axe-summary');
// the impacts that fail the test 🚨
const BLOCKING = new Set(['serious', 'critical']);


// laptop frame + reduced motion (axe sees the settled page) 💻
test.use({ viewport: LAPTOP, reducedMotion: 'reduce' });


for (const scheme of ['light', 'dark'] as const) {
  test.describe(`Welcome axe (${scheme}) 🪓`, () => {
    // paint the theme through the OS scheme (System mode is the default) 🌗
    test.use({ colorScheme: scheme });

    SLIDE_IDS.forEach((id, index) => {
      test(`${id} has no serious or critical axe violations`, async ({ page }) => {
        // open the slide
        await openWelcome(page, 'en', index + 1);
        // run axe on WCAG 2.0 / 2.1 / 2.2 A + AA 🪓
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();

        // count by impact for the summary 📊
        const byImpact: Record<string, number> = {};
        for (const violation of results.violations) byImpact[violation.impact ?? 'unknown'] = (byImpact[violation.impact ?? 'unknown'] ?? 0) + violation.nodes.length;
        // save it (summed up after the run) 💾
        mkdirSync(SUMMARY_DIR, { recursive: true });
        writeFileSync(join(SUMMARY_DIR, `${scheme}-${id}.json`), JSON.stringify({
          slide: id, scheme, passes: results.passes.length, violations: byImpact,
          rules: results.violations.map((violation) => `${violation.id} (${violation.impact}, ${violation.nodes.length})`),
        }, null, 2));

        // the blocking violations: none allowed, no exceptions (components 0.1.12 fixed the AbInstallSnippet tabs) 🚫
        const blocking = results.violations.filter((violation) => BLOCKING.has(violation.impact ?? ''));
        expect(blocking.map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length})`)).toEqual([]);
      });
    });
  });
}


/**
 * `focusKey` 🔑
 *
 * A short name for the focused element, so the tab order reads like the brief.
 *
 * @param { Page } page - the Playwright page
 * @returns { Promise<string> } - `theme`, `language`, `skip`, `slide`, `install`, `dot`, `prev`, `next`, `cta`, `github` or `other`
 */
const focusKey = (page: Page): Promise<string> => page.evaluate(() => {
  // the focused element
  const el = document.activeElement as HTMLElement | null;
  // nothing focused
  if (!el) return 'none';
  // its OWN part name (not an ancestor's: everything sits inside a slide) & its accessible name
  const part = el.getAttribute('data-ab-part') ?? '';
  const name = el.getAttribute('aria-label') ?? el.textContent ?? '';
  // map it to the brief's vocabulary 🗺️
  if (part === 'theme-option') return 'theme';
  if (el.getAttribute('aria-haspopup') === 'menu') return 'language';
  if (name.trim() === 'Skip') return 'skip';
  if (el.closest('[data-ab-part="install-snippet"]')) return 'install';
  if (part === 'dot') return 'dot';
  if (part === 'prev') return 'prev';
  if (part === 'next') return 'next';
  if (/Get Started/.test(name)) return 'cta';
  if (/GitHub/.test(name)) return 'github';
  // the slide group / its scrollable region (a stop before the slide's content)
  if (part === 'slide' || el.getAttribute('role') === 'region') return 'slide';
  return 'other';
});

/**
 * `tabOrder` ⌨️
 *
 * Tabs through the page and returns the de-duplicated sequence of focus keys.
 *
 * @param { Page } page - the Playwright page
 * @param { number } presses - how many Tab presses
 * @returns { Promise<string[]> }
 */
async function tabOrder(page: Page, presses: number): Promise<string[]> {
  // the sequence, with consecutive duplicates collapsed (9 dots → one `dot`)
  const order: string[] = [];
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press('Tab');
    const key = await focusKey(page);
    if (order.at(-1) !== key) order.push(key);
  }
  return order;
}


test.describe('Welcome tab order ⌨️', () => {
  test('s02: theme → language → Skip → slide content (install) → dots → back → next', async ({ page }) => {
    // open s02 (it has the install box)
    await openWelcome(page, 'en', 2);
    // tab through the whole frame
    const order = await tabOrder(page, 24);
    // expect the brief's order (the slide group may take a stop before its content) ✅
    expect(order.filter((key) => key !== 'slide').slice(0, 7)).toEqual(['theme', 'language', 'skip', 'install', 'dot', 'prev', 'next']);
  });

  test('s09: theme → language → slide content (Get Started → GitHub) → dots', async ({ page }) => {
    // open s09 (no Skip, no arrows)
    await openWelcome(page, 'en', 9);
    // tab through it
    const order = await tabOrder(page, 20);
    // expect the end-of-walkthrough order ✅
    expect(order.filter((key) => key !== 'slide').slice(0, 5)).toEqual(['theme', 'language', 'cta', 'github', 'dot']);
  });
});
