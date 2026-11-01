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
* @name: abElements Layout rules - e2e
* @file: tests/e2e/layout-rules.spec.ts
* @type: TypeScript (Playwright)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm exec playwright test tests/e2e/layout-rules.spec.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📐 Layout-rule conformance (0.2.23) at 390 · 768 · 1180 · 1280 · 1920 × light · dark, on Home, the 404 & the Welcome:
//   1️⃣ the page (document) never scrolls, even when the user scrolls main;
//   2️⃣ header · main · aside are the page's only slots, and only the panes (main, aside, sidebar, a drawer) scroll;
//   3️⃣ main, aside & sidebar scroll independently;
//   4️⃣ an empty header / bar / footer slot measures 0px;
//   5️⃣ shell pages: the aside is a pane from 1180 (beside main, no overlap) and 0px below it (it becomes the right drawer);
//   6️⃣ tablet: the `<<` toggle opens that right drawer inside the app, Escape closes it & focus returns to the toggle;
//   7️⃣ the scroll spy follows main (Home's "On this page");
//   8️⃣ the Splash overlay never makes the document scroll.
// Rules that need a package fix are `test.fixme` with a note (packages first: no app patch) 🧩.

// import the test runner & expect from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
// import the layout helpers 🧰
import { LAPTOP_MIN, PAGES, PART, THEMES, TABLET_MIN, WIDTHS, boxOf, documentScroll, openPage, scrollPane, scrollTopOf } from './layout-helpers';


// 📜 the scrollers the rule allows (the panes & a drawer's body); anything else that scrolls breaks rule 2️⃣
const ALLOWED_SCROLLERS = ['main-content', 'aside-content', 'sidebar', 'drawer-body', 'sidebar-nav', 'sidebar-body'];
// 🧩 the slot parts that must collapse to 0px when they hold nothing (rule 4️⃣)
const SLOT_PARTS = ['header', 'main-header', 'main-bar', 'main-footer', 'aside-header', 'aside-bar', 'aside-footer', 'footer', 'bottomBar'];


for (const spec of PAGES) {
  for (const vp of WIDTHS) {
    for (const scheme of THEMES) {
      test.describe(`${spec.id} · ${vp.name} ${vp.width}px · ${scheme} 📐`, () => {
        // 📏 the viewport & the OS color scheme for every test in this block
        test.use({ viewport: { width: vp.width, height: vp.height }, colorScheme: scheme });

        test('1️⃣ the document never scrolls, even after scrolling main 🚫📜', async ({ page }) => {
          await openPage(page, spec.path);
          // 📏 no extra height or width at rest
          const rest = await documentScroll(page);
          expect(rest.overflow, 'document overflow (px)').toBe(0);
          expect(rest.overflowX, 'document horizontal overflow (px)').toBe(0);
          // 🖱️ wheel over the middle of main, then try the window itself
          const main = await boxOf(page, PART.main);
          await page.mouse.move(main.x + main.width / 2, main.y + main.height / 2);
          await page.mouse.wheel(0, 1200);
          await page.evaluate(() => window.scrollTo(0, 500));
          await page.waitForTimeout(200);
          // ✅ the window never moved
          const after = await documentScroll(page);
          expect(after.scrollY).toBe(0);
          expect(after.scrollX).toBe(0);
        });

        test('2️⃣ header · main · aside are the only page slots, and only the panes scroll 🧱', async ({ page }) => {
          await openPage(page, spec.path);
          // 📄 exactly one main pane, at most one aside pane
          await expect(page.locator(PART.main)).toHaveCount(1);
          expect(await page.locator(PART.aside).count()).toBeLessThanOrEqual(1);
          // 🔍 every element that can scroll right now must be one of the allowed pane scrollers
          // 🎞️ the Welcome's 0.2.21 design: below 1180 the app's content wrapper is its ONE scroller (header, counter,
          //    playground & text scroll together, the aside sits inline), so that wrapper is allowed there only
          const appScroller = spec.id === 'welcome' && vp.width < LAPTOP_MIN;
          const rogue = await page.evaluate(([allowed, app]) => {
            const out: string[] = [];
            for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
              const cs = getComputedStyle(el);
              if (!/(auto|scroll)/.test(cs.overflowY)) continue; // 🙈 not a scroller
              if (el.scrollHeight - el.clientHeight <= 1 || el.clientHeight === 0) continue; // 🙈 nothing to scroll
              const part = el.closest('[data-ab-part]')?.getAttribute('data-ab-part') ?? '';
              const own = el.getAttribute('data-ab-part') ?? '';
              if (allowed.includes(own) || allowed.includes(part)) continue; // ✅ a pane
              if (app && el.classList.contains('ContentWrapper') && !el.closest('main,aside')) continue; // ✅ the Welcome's app scroller
              out.push(`${el.tagName.toLowerCase()}.${el.className.toString().slice(0, 40)} [${own || part}]`);
            }
            return out;
          }, [ALLOWED_SCROLLERS, appScroller] as const);
          expect(rogue, 'scrollers outside the panes').toEqual([]);
        });

        test('3️⃣ main, aside & sidebar scroll independently 🔀', async ({ page }) => {
          await openPage(page, spec.path);
          // 📏 where everything is before
          const asideBefore = await scrollTopOf(page, PART.asideContent);
          const sidebarBefore = await scrollTopOf(page, PART.sidebar);
          const asideBox = await boxOf(page, PART.aside);
          const sidebarBox = await boxOf(page, PART.sidebar);
          // 🖱️ scroll main's own scroller
          const mainTop = await scrollPane(page, PART.mainContent, 300);
          await page.waitForTimeout(150);
          // 📜 main scrolled whenever it has something to scroll
          const canScroll = await page.evaluate((sel) => { const el = document.querySelector<HTMLElement>(sel); return !!el && el.scrollHeight - el.clientHeight > 1; }, PART.mainContent);
          if (canScroll) expect(mainTop).toBeGreaterThan(0);
          // ✅ the aside & the sidebar did not move, neither their scroll nor their box
          expect(await scrollTopOf(page, PART.asideContent)).toBe(asideBefore);
          expect(await scrollTopOf(page, PART.sidebar)).toBe(sidebarBefore);
          expect(await boxOf(page, PART.aside)).toEqual(asideBox);
          expect(await boxOf(page, PART.sidebar)).toEqual(sidebarBox);
          // 🔁 the other way round: scrolling the aside (when it can) leaves main where it is
          const asideCan = await page.evaluate((sel) => { const el = document.querySelector<HTMLElement>(sel); return !!el && el.clientHeight > 0 && el.scrollHeight - el.clientHeight > 1; }, PART.asideContent);
          if (asideCan) {
            await scrollPane(page, PART.asideContent, 120);
            expect(await scrollTopOf(page, PART.mainContent)).toBe(mainTop);
          }
        });

        test('4️⃣ empty header / bar / footer slots measure 0px 🫥', async ({ page }) => {
          await openPage(page, spec.path);
          // 🔍 a visible slot must hold something visible (text, a control or a graphic); else it must be 0px tall
          const offenders = await page.evaluate((parts) => {
            const out: string[] = [];
            for (const part of parts) {
              for (const el of Array.from(document.querySelectorAll<HTMLElement>(`[data-ab-part="${part}"]`))) {
                const h = el.getBoundingClientRect().height;
                if (h === 0) continue; // ✅ collapsed
                const filled = el.innerText.trim() !== '' || Array.from(el.querySelectorAll('svg,img,button,a,input,[role]')).some((c) => c.getBoundingClientRect().width > 0);
                if (!filled) out.push(`${part}: ${h}px`);
              }
            }
            return out;
          }, SLOT_PARTS);
          expect(offenders, 'empty slots with a height').toEqual([]);
          // 📏 and the slots the shell leaves empty at this width are exactly 0px
          if (spec.shell) {
            const header = await boxOf(page, PART.header);
            const mainHeader = await boxOf(page, PART.mainHeader);
            const bottom = await boxOf(page, PART.bottomBar);
            if (vp.width < LAPTOP_MIN) expect(header.height, 'app header below 1180').toBe(0); // 🔝 main's bar instead
            else expect(mainHeader.height, "main's bar from 1180").toBe(0); // 📟 the app bar instead
            if (vp.width >= TABLET_MIN) expect(bottom.height, 'bottom bar from 768').toBe(0); // 📱 phones only
          }
        });

        if (spec.shell) {
          test('5️⃣ the aside is a pane from 1180 and 0px below (it becomes the right drawer) 📑', async ({ page }) => {
            await openPage(page, spec.path);
            const aside = await boxOf(page, PART.aside);
            if (vp.width < LAPTOP_MIN) {
              // 🫥 no aside pane on tablet & mobile
              expect(aside.width).toBe(0);
              return;
            }
            // 📑 a real pane, beside main (never over it), inside the viewport
            const main = await boxOf(page, PART.main);
            expect(aside.width).toBeGreaterThan(0);
            expect(aside.x + 0.5).toBeGreaterThanOrEqual(main.x + main.width);
            expect(aside.x + aside.width).toBeLessThanOrEqual(vp.width + 0.5);
            expect(aside.y + aside.height).toBeLessThanOrEqual(vp.height + 0.5);
          });
        }

        if (spec.shell && vp.width >= TABLET_MIN && vp.width < LAPTOP_MIN) {
          test('6️⃣ tablet: `<<` opens the right drawer inside the app; Escape closes it & focus returns ⏪', async ({ page }) => {
            await openPage(page, spec.path);
            // ⏪ the toggle (the 404 has no outline, so no toggle there)
            const toggle = page.locator(`${PART.mainHeader} button[aria-controls="ab-toc-drawer"]`);
            if (spec.id === 'not-found') { await expect(toggle).toHaveCount(0); return; }
            await expect(toggle).toHaveAttribute('aria-expanded', 'false');
            await toggle.click();
            // 🗄️ the drawer is open, labelled, modal and pinned to the right edge, inside the viewport
            const drawer = page.locator(`#ab-toc-drawer${PART.drawer}, #ab-toc-drawer ${PART.drawer}, ${PART.drawer}#ab-toc-drawer`).first();
            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(toggle).toHaveAttribute('aria-expanded', 'true');
            await page.waitForTimeout(400); // 🎞️ the slide-in
            const box = await page.getByRole('dialog').boundingBox();
            expect(box).not.toBeNull();
            expect(Math.abs(box!.x + box!.width - vp.width)).toBeLessThanOrEqual(1); // ➡️ flush right
            expect(box!.x).toBeGreaterThanOrEqual(0); // ⬅️ inside
            expect(box!.y).toBeGreaterThanOrEqual(0); // ⬆️
            expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height + 0.5); // ⬇️
            expect(box!.width).toBeLessThan(vp.width); // 📏 a drawer, not a page
            // 🎯 focus moved into it
            expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
            void drawer;
            // ⎋ Escape closes it and focus returns to `<<`
            await page.keyboard.press('Escape');
            await expect(page.getByRole('dialog')).toBeHidden();
            await expect(toggle).toHaveAttribute('aria-expanded', 'false');
            await expect(toggle).toBeFocused();
          });
        }

        if (spec.id === 'home' && vp.width >= LAPTOP_MIN && scheme === 'light') {
          test('7️⃣ the scroll spy follows main ("On this page") 🛰️', async ({ page }) => {
            await openPage(page, spec.path);
            // 📑 the outline in the aside & its current entry
            const current = page.locator(`${PART.aside} [aria-current]`);
            const first = await current.first().textContent();
            // 📜 scroll main to its end: the current entry must move with it
            await page.evaluate((sel) => { const el = document.querySelector<HTMLElement>(sel)!; el.scrollTop = el.scrollHeight; }, PART.mainContent);
            await expect.poll(async () => current.first().textContent(), { timeout: 3000 }).not.toBe(first);
            // ✅ the window never scrolled for it
            expect((await documentScroll(page)).scrollY).toBe(0);
          });
        }
      });
    }
  }
}


test.describe('8️⃣ the Splash never makes the document scroll 💦', () => {
  for (const vp of [WIDTHS[0], WIDTHS[2]]) {
    test(`${vp.name} ${vp.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      // 💦 a first visit: the Splash shows (no `ab-splash-seen`)
      await page.goto('/');
      await page.waitForTimeout(300);
      const s = await documentScroll(page);
      expect(s.overflow).toBe(0);
      expect(s.overflowX).toBe(0);
      expect(s.scrollY).toBe(0);
    });
  }
});
