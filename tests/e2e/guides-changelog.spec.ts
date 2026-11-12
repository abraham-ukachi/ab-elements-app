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
* @name: guides and changelog e2e
* @file: tests/e2e/guides-changelog.spec.ts
* @type: TypeScript (Playwright)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm exec playwright test tests/e2e/guides-changelog.spec.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🎭 The three guides and /changelog (0.2.29), at 390 · 768 · 1180 · 1920 × light · dark × en · fr · es · ru:
//   📐 the 0.2.23 rules that fit a shell page (the document never scrolls; the aside is a pane from 1180);
//   🏳️ the English-fallback banner in es / fr / ru;
//   🪓 axe (serious / critical);
//   🔭 scroll spy on the main pane from 1180;
//   ⚓ an anchor deep link scrolls that pane, not the document.

// import the test runner 🎭
import { expect, test, type Page } from '@playwright/test';
// import axe 🪓
import AxeBuilder from '@axe-core/playwright';
// import the layout probes 🧰
import { LAPTOP_MIN, PART, THEMES, boxOf, documentScroll, openPage } from './layout-helpers';


// 📏 the four review widths
const WIDTHS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1180, height: 800 },
  { name: 'desktop', width: 1920, height: 1080 },
] as const;

// 🌍 the four locales. Guide titles stay English. The changelog title is translated.
const LOCALES = [
  { locale: 'en', prefix: '', changelog: 'Changelog' },
  { locale: 'fr', prefix: '/fr', changelog: 'Journal des modifications' },
  { locale: 'es', prefix: '/es', changelog: 'Registro de cambios' },
  { locale: 'ru', prefix: '/ru', changelog: 'Изменения' },
] as const;

// 📚 the pages
const PAGES = [
  { id: 'theming', path: '/docs/guides/theming-dark-mode', title: 'Theming & dark mode', kind: 'guide' },
  { id: 'icons', path: '/docs/guides/icons-fonts', title: 'Icons & fonts', kind: 'guide' },
  { id: 'layout', path: '/docs/guides/layout-rule', title: 'Layout rule', kind: 'guide' },
  { id: 'changelog', path: '/changelog', title: '', kind: 'changelog' },
] as const;

// 🪓 impacts that fail
const BLOCKING = new Set(['serious', 'critical']);
// 🏷️ WCAG tags
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
// 📑 the outline links
const TOC_LINKS = `${PART.aside} [data-ab-part="toc"] a[href^="#"]`;


/**
 * `axeBlocking` - serious and critical violations 🪓
 *
 * @param { Page } page
 * @returns { Promise<string[]> }
 */
async function axeBlocking(page: Page): Promise<string[]> {
  // 🪓 WCAG 2.2 AA
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  // 🚨 the ones that fail the run
  return violations.filter((item) => BLOCKING.has(item.impact ?? '')).map((item) => `${item.id} (${item.nodes.length})`);
}


for (const scheme of THEMES) {
  for (const vp of WIDTHS) {
    for (const loc of LOCALES) {
      for (const doc of PAGES) {
        test.describe(`${doc.id} · ${loc.locale} · ${vp.name} ${vp.width}px · ${scheme} 📚`, () => {
          // 📏 this block's viewport and color scheme
          test.use({ viewport: { width: vp.width, height: vp.height }, colorScheme: scheme });
          // 🌗 pin the theme the script reads, so it matches the color scheme
          test.beforeEach(async ({ page }) => { await page.addInitScript((mode) => localStorage.setItem('theme', mode), scheme); });

          test('layout, banner, axe, scroll spy and deep link 📐', async ({ page }) => {
            // 🧭 the localized URL
            const url = `${loc.prefix}${doc.path}`;
            await openPage(page, url);
            // 🌗 the picked theme
            await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
            // 1️⃣ one h1
            const h1 = doc.kind === 'changelog' ? loc.changelog : doc.title;
            await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
            await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
            // 🏳️ English notes in es / fr / ru (skip each code block's copy status)
            const banner = page.locator('article [role="status"]:not([data-ab-part="code-block-copy"] *)');
            await expect(banner).toHaveCount(loc.locale === 'en' ? 0 : 1);
            if (doc.kind === 'guide' && loc.locale !== 'en') await expect(page.locator('article[data-docs-page]')).toHaveAttribute('lang', 'en');
            if (doc.kind === 'changelog') await expect(page.locator('[data-changelog-body]')).toHaveAttribute('lang', 'en');
            // 🚫 the document does not scroll
            const rest = await documentScroll(page);
            expect(rest.overflow).toBe(0);
            expect(rest.scrollY).toBe(0);
            // 📑 the aside is a pane from 1180 and 0px below
            const aside = await boxOf(page, PART.aside);
            if (vp.width < LAPTOP_MIN) expect(aside.width).toBe(0);
            else expect(aside.width).toBeGreaterThan(0);
            // 🪓 no serious or critical issues
            expect(await axeBlocking(page)).toEqual([]);
            // 🔭 from 1180 the outline follows the main pane
            if (vp.width >= LAPTOP_MIN) {
              const links = page.locator(TOC_LINKS);
              expect(await links.count()).toBeGreaterThan(1);
              await expect(links.first()).toHaveAttribute('aria-current', 'location');
              await links.last().click();
              await expect(links.last()).toHaveAttribute('aria-current', 'location');
              expect(await page.evaluate(() => document.scrollingElement?.scrollTop ?? 0)).toBe(0);
              expect(await page.locator(PART.mainContent).evaluate((el) => (el as HTMLElement).scrollTop)).toBeGreaterThan(0);
              // ⚓ a direct hash scrolls the same pane
              const hash = doc.kind === 'changelog'
                ? 'components-0.7.0'
                : await page.locator('[data-docs-body] h2[id]').last().getAttribute('id');
              expect(hash).toBeTruthy();
              await page.goto(`${url}#${hash}`);
              await expect(page.locator(`[id="${hash}"]`)).toBeVisible();
              expect(await page.evaluate(() => document.scrollingElement?.scrollTop ?? 0)).toBe(0);
              expect(await page.locator(PART.mainContent).evaluate((el) => (el as HTMLElement).scrollTop)).toBeGreaterThan(0);
            }
          });
        });
      }
    }
  }
}
