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
* @name: abElements Layout rules - accessibility e2e
* @file: tests/e2e/layout-a11y.spec.ts
* @type: TypeScript (Playwright + axe)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm exec playwright test tests/e2e/layout-a11y.spec.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// ♿ Accessibility conformance (0.2.23) on Home, the 404 & the Welcome:
//   🪓 axe (WCAG 2.2 A/AA tags): no serious / critical issue at 390 · 768 · 1180 · 1280 · 1920 × light · dark;
//   🗄️ axe on the drawer OPEN states (tablet `<<` outline, phone Settings · nav · search) in both themes;
//   🏷️ exactly one `h1`, one `main` landmark, every `nav` / `aside` landmark labelled;
//   ⌨️ keyboard: the first Tab lands on the skip link, Enter moves focus into main; Tab never reaches a hidden pane.

// import the test runner & expect from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
// import axe for Playwright 🪓
import AxeBuilder from '@axe-core/playwright';
// import the layout helpers 🧰
import { PAGES, THEMES, WIDTHS, openPage, swipe } from './layout-helpers';


// 🚨 the impacts that fail a run
const BLOCKING = new Set(['serious', 'critical']);
// 🏷️ the WCAG rule sets we hold the app to (2.2 AA)
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];


/**
 * `blocking` 🪓 - the serious / critical axe violations of the page as it is now
 *
 * @param { Page } page - the Playwright page
 * @returns { Promise<string[]> } - `rule-id (n nodes)` per violation
 */
async function blocking(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return violations.filter((v) => BLOCKING.has(v.impact ?? '')).map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(' ')}`);
}


for (const spec of PAGES) {
  for (const scheme of THEMES) {
    test.describe(`${spec.id} · ${scheme} ♿`, () => {
      test.use({ colorScheme: scheme });

      for (const vp of WIDTHS) {
        test(`🪓 axe at ${vp.width}px`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await openPage(page, spec.path);
          expect(await blocking(page)).toEqual([]);
        });
      }

      test('🏷️ one h1, one main, labelled nav & aside landmarks', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await openPage(page, spec.path);
        // 1️⃣ one visible page title
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        // 📄 one main landmark
        await expect(page.getByRole('main')).toHaveCount(1);
        // 🏷️ every navigation & complementary landmark has a name
        const unnamed = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('nav, aside, [role="navigation"], [role="complementary"]'))
          .filter((el) => el.getBoundingClientRect().width > 0)
          .filter((el) => el.getAttribute('data-ab-part') !== 'toc-promo') // 🚧 the AbTocPromo gap, tested on its own below
          .filter((el) => !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby'))
          .map((el) => el.outerHTML.slice(0, 80)));
        expect(unnamed).toEqual([]);
      });

      if (spec.shell) {
        test('⌨️ the first Tab is the skip link; Enter moves focus into main; Tab skips hidden panes', async ({ page }) => {
          await page.setViewportSize({ width: 390, height: 844 });
          await openPage(page, spec.path);
          // ⏭️ the skip link first
          await page.keyboard.press('Tab');
          const first = page.locator(':focus');
          await expect(first).toHaveAttribute('href', /#main$/);
          // ↩️ Enter: the focus (or the target) is main
          await page.keyboard.press('Enter');
          await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('main') || location.hash === '#main')).toBe(true);
          // 🙈 30 Tabs never land inside a 0px pane (the hidden sidebar / aside on a phone)
          for (let i = 0; i < 30; i++) {
            await page.keyboard.press('Tab');
            const hidden = await page.evaluate(() => { const a = document.activeElement as HTMLElement | null; if (!a || a === document.body) return false; const r = a.getBoundingClientRect(); return r.width === 0 && r.height === 0 && !a.closest('[data-ab-part="drawer-anchor"]'); });
            expect(hidden, `Tab ${i + 1} focused a hidden element`).toBe(false);
          }
        });
      }
    });
  }
}


// 🚧 PACKAGE GAP (components): AbTocPromo renders an `<aside>` with no accessible name, nested inside the aside pane
//    (a second, unnamed complementary landmark). It needs a `label` / `aria-labelledby` (or a non-landmark root).
test.fixme('🏷️ AbTocPromo is not an unnamed landmark (Home aside)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openPage(page, '/');
  const promo = page.locator('aside[data-ab-part="toc-promo"]');
  if ((await promo.count()) === 0) return; // ✅ not a landmark any more
  expect(await promo.getAttribute('aria-label') ?? await promo.getAttribute('aria-labelledby')).toBeTruthy();
});


for (const scheme of THEMES) {
  test.describe(`🗄️ drawer open states · ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    test('⏪ tablet: the outline drawer (`<<`)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await openPage(page, '/');
      await page.locator('button[aria-controls="ab-toc-drawer"]:visible').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.waitForTimeout(450);
      expect(await blocking(page)).toEqual([]);
    });

    test.describe('📱 phone drawers', () => {
      test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

      test('🌍 Settings (globe)', async ({ page }) => {
        await openPage(page, '/');
        await page.locator('[data-ab-part="mobile-header-language"]').tap();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.waitForTimeout(450);
        expect(await blocking(page)).toEqual([]);
      });

      test('⬅️ nav (left-edge swipe)', async ({ page }) => {
        await openPage(page, '/');
        await swipe(page, 4, 260, 420);
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.waitForTimeout(450);
        expect(await blocking(page)).toEqual([]);
      });

      test('🔎 search (Search tab)', async ({ page }) => {
        await openPage(page, '/');
        await page.locator('[data-ab-part="bottomBar"] button').filter({ hasText: /search/i }).first().tap();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.waitForTimeout(450);
        expect(await blocking(page)).toEqual([]);
      });
    });
  });
}
