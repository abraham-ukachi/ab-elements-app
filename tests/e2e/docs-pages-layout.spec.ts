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
* @name: docs-pages-layout.spec
* @file: tests/e2e/docs-pages-layout.spec.ts
* @type: TypeScript (Playwright)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm exec playwright test tests/e2e/docs-pages-layout.spec.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📐 The 0.2.23 layout rules on every docs page in the 0.2.27 scope (getting started + the eight
// package overviews), at 390 · 768 · 1180 · 1280 · 1920 × light · dark:
//   1️⃣ the document never scrolls;
//   2️⃣ only the panes scroll;
//   3️⃣ main, aside and sidebar scroll independently;
//   4️⃣ an empty slot measures 0px;
//   5️⃣ the aside is a pane from 1180px and 0px below it;
//   6️⃣ on tablet the outline toggle opens a drawer inside the viewport.

// import the test runner 🎭
import { expect, test } from '@playwright/test';
// import the shared layout probes 🧰
import { LAPTOP_MIN, PART, TABLET_MIN, THEMES, WIDTHS, boxOf, documentScroll, openPage, scrollPane, scrollTopOf } from './layout-helpers';


// 📚 the eleven pages (English). French fallbacks use the same article, so the rules are the same.
const DOCS = [
  { id: 'intro', path: '/docs' },
  { id: 'install', path: '/docs/installation' },
  { id: 'quick-start', path: '/docs/quick-start' },
  { id: 'fonts', path: '/docs/packages/fonts' },
  { id: 'icons', path: '/docs/packages/icons' },
  { id: 'animations', path: '/docs/packages/animations' },
  { id: 'theme', path: '/docs/packages/theme' },
  { id: 'hooks', path: '/docs/packages/hooks' },
  { id: 'core', path: '/docs/packages/core' },
  { id: 'components', path: '/docs/packages/components' },
  { id: 'i18n', path: '/docs/packages/i18n' },
] as const;

// 📜 scrollers the rule allows
const ALLOWED_SCROLLERS = ['main-content', 'aside-content', 'sidebar', 'drawer-body', 'sidebar-nav', 'sidebar-body'];
// 🧩 slots that must be 0px when they hold nothing
const SLOT_PARTS = ['header', 'main-header', 'main-bar', 'main-footer', 'aside-header', 'aside-bar', 'aside-footer', 'footer', 'bottomBar'];


for (const doc of DOCS) {
  for (const vp of WIDTHS) {
    for (const scheme of THEMES) {
      test.describe(`${doc.id} · ${vp.name} ${vp.width}px · ${scheme} 📐`, () => {
        test.use({ viewport: { width: vp.width, height: vp.height }, colorScheme: scheme });

        test('1️⃣–6️⃣ layout rules hold on this docs page', async ({ page }) => {
          await openPage(page, doc.path);

          // 1️⃣ the document never scrolls
          const rest = await documentScroll(page);
          expect(rest.overflow, 'document overflow').toBe(0);
          expect(rest.overflowX, 'document horizontal overflow').toBe(0);
          const mainBox = await boxOf(page, PART.main);
          await page.mouse.move(mainBox.x + mainBox.width / 2, mainBox.y + Math.min(mainBox.height / 2, 200));
          await page.mouse.wheel(0, 800);
          await page.evaluate(() => window.scrollTo(0, 400));
          const after = await documentScroll(page);
          expect(after.scrollY).toBe(0);
          expect(after.scrollX).toBe(0);
          expect(after.overflow).toBe(0);

          // 2️⃣ one main, and only the panes scroll
          await expect(page.locator(PART.main)).toHaveCount(1);
          const rogue = await page.evaluate((allowed) => {
            const out: string[] = [];
            for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
              const cs = getComputedStyle(el);
              if (!/(auto|scroll)/.test(cs.overflowY)) continue;
              if (el.scrollHeight - el.clientHeight <= 1 || el.clientHeight === 0) continue;
              const part = el.closest('[data-ab-part]')?.getAttribute('data-ab-part') ?? '';
              const own = el.getAttribute('data-ab-part') ?? '';
              if (allowed.includes(own) || allowed.includes(part)) continue;
              out.push(`${el.tagName.toLowerCase()} [${own || part}]`);
            }
            return out;
          }, ALLOWED_SCROLLERS);
          expect(rogue, 'scrollers outside the panes').toEqual([]);

          // 3️⃣ scrolling main leaves the aside and the sidebar where they were
          const asideBefore = await scrollTopOf(page, PART.asideContent);
          const sidebarBefore = await scrollTopOf(page, PART.sidebar);
          const mainTop = await scrollPane(page, PART.mainContent, 240);
          const canScroll = await page.evaluate((sel) => {
            const el = document.querySelector<HTMLElement>(sel);
            return !!el && el.scrollHeight - el.clientHeight > 1;
          }, PART.mainContent);
          if (canScroll) expect(mainTop).toBeGreaterThan(0);
          expect(await scrollTopOf(page, PART.asideContent)).toBe(asideBefore);
          expect(await scrollTopOf(page, PART.sidebar)).toBe(sidebarBefore);

          // 4️⃣ empty slots are 0px, and the shell hides the unused bar at this width
          const offenders = await page.evaluate((parts) => {
            const out: string[] = [];
            for (const part of parts) {
              for (const el of Array.from(document.querySelectorAll<HTMLElement>(`[data-ab-part="${part}"]`))) {
                const h = el.getBoundingClientRect().height;
                if (h === 0) continue;
                const filled = el.innerText.trim() !== '' || Array.from(el.querySelectorAll('svg,img,button,a,input,[role]')).some((c) => c.getBoundingClientRect().width > 0);
                if (!filled) out.push(`${part}: ${h}px`);
              }
            }
            return out;
          }, SLOT_PARTS);
          expect(offenders, 'empty slots with a height').toEqual([]);
          if (vp.width < LAPTOP_MIN) expect((await boxOf(page, PART.header)).height, 'app header below 1180').toBe(0);
          else expect((await boxOf(page, PART.mainHeader)).height, 'main bar from 1180').toBe(0);
          if (vp.width >= TABLET_MIN) expect((await boxOf(page, PART.bottomBar)).height, 'bottom bar from 768').toBe(0);

          // 5️⃣ aside pane from 1180, gone below it
          const aside = await boxOf(page, PART.aside);
          if (vp.width < LAPTOP_MIN) {
            expect(aside.width).toBe(0);
          } else {
            const main = await boxOf(page, PART.main);
            expect(aside.width).toBeGreaterThan(0);
            expect(aside.x + 0.5).toBeGreaterThanOrEqual(main.x + main.width);
            expect(aside.x + aside.width).toBeLessThanOrEqual(vp.width + 0.5);
          }

          // 6️⃣ tablet: the outline control opens a drawer that stays inside the viewport
          if (vp.width >= TABLET_MIN && vp.width < LAPTOP_MIN) {
            const toggle = page.locator(`${PART.mainHeader} button[aria-controls="ab-toc-drawer"]`);
            await expect(toggle).toHaveAttribute('aria-expanded', 'false');
            await toggle.click();
            await expect(page.getByRole('dialog')).toBeVisible();
            await page.waitForTimeout(400);
            const box = await page.getByRole('dialog').boundingBox();
            expect(box).not.toBeNull();
            expect(box!.x).toBeGreaterThanOrEqual(0);
            expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width + 1);
            expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height + 0.5);
            await page.keyboard.press('Escape');
            await expect(page.getByRole('dialog')).toBeHidden();
            await expect(toggle).toBeFocused();
          }
        });
      });
    }
  }
}
