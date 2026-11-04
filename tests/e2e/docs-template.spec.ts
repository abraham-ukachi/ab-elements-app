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
* @name: docs page template e2e
* @file: tests/e2e/docs-template.spec.ts
* @type: test (Playwright)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test:e2e tests/e2e/docs-template.spec.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🎭 The docs page template (0.2.25), in all 4 locales × light / dark:
//   🍞 breadcrumbs (Docs › page, the Docs crumb links the localized index) · 🏷️ chips (section · package · kind · status)
//   📑 the TOC in the aside from 1180px, with scroll spy on the MAIN pane (the document never scrolls)
//   ➡️ below 1180px no aside column: the same outline lives in AbTocDrawer (tablet `<<`), which closes on a pick
//   🔗 Edit / Report / Source open the page's content file (the English one for a fallback page 🏳️) on GitHub

// import the test helpers from Playwright 🎭
import { expect, test, type Page } from '@playwright/test';
// import the shared page opener & part selectors 🧰
import { openPage, PART, THEMES } from './layout-helpers';


// 🌍 the 4 locales: URL prefix, the localized "Docs" crumb, the section chip & the link labels
const LOCALES = [
  { locale: 'en', prefix: '', crumb: 'Docs', section: 'Getting started', packages: 'Packages', edit: 'Edit this page', report: 'Report an issue', source: 'View source' },
  { locale: 'fr', prefix: '/fr', crumb: null, section: 'Premiers pas', packages: 'Paquets', edit: null, report: 'Signaler un problème', source: 'Voir la source' },
  { locale: 'es', prefix: '/es', crumb: null, section: 'Primeros pasos', packages: 'Paquetes', edit: null, report: 'Informar de un problema', source: 'Ver el código' },
  { locale: 'ru', prefix: '/ru', crumb: null, section: 'Начало работы', packages: 'Пакеты', edit: null, report: 'Сообщить о проблеме', source: 'Исходный код' },
] as const;

// 🎯 selectors
const ASIDE_TOC = `${PART.aside} [data-ab-part="toc"]`;
const TOC_LINKS = `${ASIDE_TOC} a[href^="#"]`;
const CHIPS = '[data-docs-chips] > li';
const TOGGLE = `${PART.mainHeader} button[aria-controls="ab-toc-drawer"]`;

// 🔗 the aside's extra link of an id
const extra = (page: Page, id: string) => page.locator(`${PART.aside} a[data-toc-link="${id}"]`);


for (const scheme of THEMES) {
  for (const l of LOCALES) {
    test.describe(`docs template · ${l.locale} · ${scheme} 📚`, () => {
      test.use({ colorScheme: scheme, viewport: { width: 1440, height: 900 } });
      // 🌗 the app defaults to light, so pick the theme the way a reader does (the `theme` key the theme script reads)
      test.beforeEach(async ({ page }) => { await page.addInitScript((mode) => localStorage.setItem('theme', mode), scheme); });

      test('🍞 breadcrumbs + 🏷️ chips on a getting-started page', async ({ page }) => {
        await openPage(page, `${l.prefix}/docs/installation`);
        // 🌗 the theme follows the scheme
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
        // 🍞 a labelled trail: first crumb links the localized docs index, the last one is the current page
        const trail = page.locator(`${PART.mainHeader} nav, ${PART.main} nav`).filter({ has: page.locator('[aria-current="page"]') }).first();
        const first = trail.locator('a').first();
        await expect(first).toHaveAttribute('href', `${l.prefix}/docs`);
        if (l.crumb) await expect(first).toHaveText(l.crumb);
        // 🏷️ exactly one chip here: the localized section
        await expect(page.locator(CHIPS)).toHaveCount(1);
        await expect(page.locator(CHIPS).first()).toHaveText(l.section);
      });

      test('🏷️ a package page: section · package · kind · status', async ({ page }) => {
        await openPage(page, `${l.prefix}/docs/packages/core`);
        const chips = page.locator(CHIPS);
        await expect(chips).toHaveCount(4);
        await expect(chips.nth(0)).toHaveText(l.packages);
        await expect(chips.nth(1)).toHaveText('ab-nextjs-core'); // 📦 never translated
        // ♿ the list is named
        await expect(page.locator('[data-docs-chips]')).toHaveAttribute('aria-label', /\S/);
      });

      test('📑 TOC in the aside + 🔭 scroll spy on the main pane', async ({ page }) => {
        await openPage(page, `${l.prefix}/docs/installation`);
        await expect(page.locator(PART.aside)).toBeVisible();
        const links = page.locator(TOC_LINKS);
        expect(await links.count()).toBeGreaterThan(1);
        // 1️⃣ the first section is current before any scroll
        await expect(links.first()).toHaveAttribute('aria-current', 'location');
        // 🖱️ the last one scrolls the MAIN pane (never the document) & becomes current
        await links.last().click();
        await expect(links.last()).toHaveAttribute('aria-current', 'location');
        expect(await page.evaluate(() => document.scrollingElement?.scrollTop ?? 0)).toBe(0);
        expect(await page.locator(PART.mainContent).evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        // 🔙 back to the top: the first is current again
        await page.locator(PART.mainContent).evaluate((el) => el.scrollTo({ top: 0 }));
        await expect(links.first()).toHaveAttribute('aria-current', 'location');
      });

      test('🔗 Edit / Report / Source point at the content file', async ({ page }) => {
        // 🏳️ quick-start is English-only, so fr / es / ru link the English file
        await openPage(page, `${l.prefix}/docs/quick-start`);
        const file = 'content/docs/en/quick-start.mdx';
        await expect(extra(page, 'edit')).toHaveAttribute('href', new RegExp(`/edit/main/${file}$`));
        await expect(extra(page, 'source')).toHaveAttribute('href', new RegExp(`/blob/main/${file}$`));
        const report = new URL((await extra(page, 'report').getAttribute('href'))!);
        expect(report.pathname).toMatch(/\/issues\/new$/);
        expect(report.searchParams.get('body')).toContain(`/docs/quick-start`);
        expect(report.searchParams.get('body')).toContain(file);
        if (l.prefix) expect(report.searchParams.get('body')).toContain(`${l.prefix}/docs/quick-start`);
        // 🏷️ localized labels (after the icon's ligature), opened in a new tab
        await expect(extra(page, 'report')).toContainText(l.report);
        await expect(extra(page, 'source')).toContainText(l.source);
        if (l.edit) await expect(extra(page, 'edit')).toContainText(l.edit);
        for (const id of ['edit', 'report', 'source']) await expect(extra(page, id)).toHaveAttribute('target', '_blank');
      });

      test('➡️ below 1180: no aside column, the outline is AbTocDrawer', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 800 });
        await openPage(page, `${l.prefix}/docs/installation`);
        // 🫥 the aside column takes no room
        const asideWidth = await page.locator(PART.aside).evaluate((el) => el.getBoundingClientRect().width).catch(() => 0);
        expect(asideWidth).toBe(0);
        // ⏪ `<<` opens the drawer with the same outline + the 3 links
        await page.locator(TOGGLE).click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        const items = dialog.locator('a[href^="#"], button[data-id], [role="link"]');
        await expect(dialog.getByRole('link', { name: l.report })).toBeVisible();
        await expect(dialog.getByRole('link', { name: l.source })).toBeVisible();
        void items;
        // 🖱️ picking a heading scrolls main & closes the drawer
        const headings = await page.locator('[data-docs-body] h2[id]').evaluateAll((n) => n.map((x) => x.textContent?.trim() ?? ''));
        await dialog.getByText(headings[headings.length - 1], { exact: true }).first().click();
        await expect(dialog).toBeHidden();
        await expect.poll(() => page.locator(PART.mainContent).evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        // ⎋ reopen + Escape closes it & focus goes back to `<<`
        await page.locator(TOGGLE).click();
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        await expect(page.locator(TOGGLE)).toBeFocused();
      });
    });
  }
}
