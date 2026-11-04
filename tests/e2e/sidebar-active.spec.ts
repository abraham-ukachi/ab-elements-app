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
* @name: sidebar active item e2e
* @file: tests/e2e/sidebar-active.spec.ts
* @type: test (Playwright)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test:e2e tests/e2e/sidebar-active.spec.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🎯 One active item (0.2.25, components 0.5.0 `activeMatch="best"`): on `/docs` and on `/docs/installation`, in all
// 4 locales, exactly ONE row of the desktop sidebar and ONE row of the mobile nav drawer is current (`aria-current`),
// and it's the page itself, so Introduction no longer lights up next to Installation 🐛→✅.

// import the test helpers from Playwright 🎭
import { expect, test } from '@playwright/test';
// import the shared page opener, the part selectors & the touch swipe 🧰
import { openPage, PART, swipe } from './layout-helpers';


// 🌍 the 4 locale prefixes (as-needed: none for English)
const PREFIXES = ['', '/fr', '/es', '/ru'] as const;
// 📄 the routes under test
const ROUTES = ['/docs', '/docs/installation'] as const;
// 🎯 the current rows
const CURRENT = 'a[aria-current="page"]';


for (const prefix of PREFIXES) {
  test.describe(`one active item · ${prefix || '/'} 🎯`, () => {
    test.describe('🖥️ sidebar (1440)', () => {
      test.use({ viewport: { width: 1440, height: 900 } });
      for (const route of ROUTES) {
        test(`${prefix}${route}: one current row, its own`, async ({ page }) => {
          await openPage(page, `${prefix}${route}`);
          const current = page.locator(`${PART.sidebar} ${CURRENT}`);
          await expect(current).toHaveCount(1);
          await expect(current).toHaveAttribute('href', `${prefix}${route}`);
          // 🎨 and only one row is drawn active
          await expect(page.locator(`${PART.sidebar} [data-active="true"]`)).toHaveCount(1);
        });
      }
    });

    test.describe('📱 nav drawer (390)', () => {
      test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
      for (const route of ROUTES) {
        test(`${prefix}${route}: one current row in the drawer, its own`, async ({ page }) => {
          await openPage(page, `${prefix}${route}`);
          // ⬅️ the left-edge swipe opens the nav drawer
          await swipe(page, 4, 260, 420);
          const dialog = page.getByRole('dialog');
          await expect(dialog).toBeVisible();
          const current = dialog.locator(CURRENT);
          await expect(current).toHaveCount(1);
          await expect(current).toHaveAttribute('href', `${prefix}${route}`);
        });
      }
    });
  });
}
