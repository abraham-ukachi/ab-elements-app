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
* @name: props-table.spec
* @file: tests/e2e/props-table.spec.ts
* @type: Playwright
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm exec playwright test tests/e2e/props-table.spec.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 Props tables (0.2.28): the packaged table scrolls inside itself at 390px, its headers are real
//    column and row headers, and a French visit of an English-only page shows the fallback banner.

// import the test helpers from Playwright 🎭
import { expect, test } from '@playwright/test';
// import the shared opener 🧰
import { openPage } from './layout-helpers';

// 📄 the three API pages, and the English heading a French visit still shows
const PAGES = [
  { path: '/docs/packages/components/drawer', title: 'Drawer' },
  { path: '/docs/packages/core/layouts', title: 'Layout slots' },
  { path: '/docs/packages/hooks/scroll-spy', title: 'Scroll spy' },
] as const;
// 🏷️ the shipped column labels (AbPropsTable's English defaults)
const COLUMN_LABELS = ['Name', 'Type', 'Default', 'Description'];


test.describe('props tables 📋', () => {
  for (const doc of PAGES) {
    test(`♿ ${doc.path} headers, scope, and the keyboard scroll region`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openPage(page, doc.path);
      const table = page.locator('[data-ab-part="props-table"]').first();
      // ⌨️ one tab stop for the overflow region (arrow keys scroll it natively)
      await expect(table).toHaveAttribute('tabindex', '0');
      await expect(table).toHaveAttribute('role', 'region');
      await table.focus();
      await expect(table).toBeFocused();
      // 🏷️ the four real column names, each a column header
      await expect(table.locator('thead th[scope="col"]')).toHaveText(COLUMN_LABELS);
      await expect(table.locator('tbody th[scope="row"]').first()).toBeVisible();
    });

    test(`↔️ ${doc.path} at 390px the table scrolls and the document does not`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openPage(page, doc.path);
      const table = page.locator('[data-ab-part="props-table"]').first();
      const overflow = await table.evaluate((el) => ({ x: el.scrollWidth - el.clientWidth, doc: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
      expect(overflow.x).toBeGreaterThan(0);
      expect(overflow.doc).toBe(0);
    });

    test(`🏳️ ${doc.path} French falls back to the English article`, async ({ page }) => {
      await openPage(page, `/fr${doc.path}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(doc.title);
      await expect(page.getByText('Pas encore traduite')).toBeVisible();
      await expect(page.locator('[data-ab-part="props-table"]').first()).toBeVisible();
      // 📜 the scroller helper stays on this page, and the heading says it is not a core export
      if (doc.path.endsWith('/scroll-spy')) await expect(page.getByRole('heading', { name: 'getAbMainScroller' })).toBeVisible();
    });

    test(`✅ ${doc.path} renders a props table`, async ({ page }) => {
      await openPage(page, doc.path);
      await expect(page.locator('[data-ab-part="props-table"]').first()).toBeVisible();
    });
  }
});
