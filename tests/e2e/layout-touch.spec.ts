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
* @name: abElements Layout rules - touch e2e
* @file: tests/e2e/layout-touch.spec.ts
* @type: TypeScript (Playwright)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm exec playwright test tests/e2e/layout-touch.spec.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 👆 Touch conformance (0.2.23), Chromium mobile emulation (390×844, `hasTouch`, `isMobile`, real CDP touches):
//   🎯 every control in the mobile header & the bottom bar is a ≥ 44×44 tap target;
//   ➡️ a right-edge swipe opens the aside as the right drawer (Home), a tap on the scrim / a swipe back closes it;
//   ⬅️ a left-edge swipe opens the nav drawer, Escape closes it;
//   🌍 the globe opens the Settings drawer from the bottom, 🔎 the Search tab opens the search drawer, both INSIDE the
//      app, and focus returns to the opener on close;
//   🗄️ every drawer stays inside its scope (the viewport) and is flush with the side it opens from.

// import the test runner & expect from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
// import the layout helpers 🧰
import { PART, openPage, swipe } from './layout-helpers';


// 📱 a phone: the plan's 390×844 frame with touch
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

// 🎯 the WCAG 2.5.5 / Apple HIG tap size we hold the phone chrome to
const TAP = 44;


/**
 * `dialogBox` 🗄️ - the open dialog's box, after its slide-in
 *
 * @param { Page } page - the Playwright page
 * @returns { Promise<{ x: number; y: number; width: number; height: number }> }
 */
async function dialogBox(page: Page) {
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(450); // 🎞️ the slide-in
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  return box!;
}


/**
 * `expectInside` 📦 - the box is inside the 390×844 app scope
 *
 * @param { { x: number; y: number; width: number; height: number } } box - a drawer box
 * @returns { void }
 */
function expectInside(box: { x: number; y: number; width: number; height: number }) {
  expect(box.x).toBeGreaterThanOrEqual(-0.5); // ⬅️
  expect(box.y).toBeGreaterThanOrEqual(-0.5); // ⬆️
  expect(box.x + box.width).toBeLessThanOrEqual(390.5); // ➡️
  expect(box.y + box.height).toBeLessThanOrEqual(844.5); // ⬇️
}


for (const path of ['/', '/nope']) {
  // 👆 components 0.3.2 closed the gap: AbNavbar items are 44px tall, AbMobileHeader's logo link is 44px tall, the
  //    icon AbThemeToggle is 44×44, and the 34px `size="sm"` AbSearchTrigger pill has an invisible 44px hit area.
  //    So a control passes when its box is ≥ 44×44 OR a tap 22px from its centre (all 4 sides) still lands on it.
  // 🚧 PACKAGE GAP (components 0.3.2): on the 404 the `size="sm"` AbSearchTrigger's invisible hit area is
  //    `::after { inset: -5px 0 }`, measured from the PADDING box, so with the pill's 1px border it only reaches
  //    32 + 2 × 5 = 42px (y 7 → 49 on a 34px pill at y 11 → 45), not 44. It needs `inset: -6px 0` (or -5px from the
  //    border box). Home's header has no pill, so it passes. Packages first: no app patch 🧩
  const tapTest = path === '/nope' ? test.fixme : test;
  tapTest(`🎯 ${path}: mobile header & bottom bar controls are ≥ ${TAP}×${TAP} tap targets`, async ({ page }) => {
    await openPage(page, path);
    // 🔍 every visible control of the two phone bars
    const small = await page.evaluate(([parts, min]) => {
      const out: string[] = [];
      for (const part of parts as readonly string[]) {
        for (const el of Array.from(document.querySelectorAll<HTMLElement>(`[data-ab-part="${part}"] :is(a, button, summary, [role="button"], [role="link"], [role="tab"])`))) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue; // 🙈 hidden
          const half = (min as number) / 2 - 0.5; // 📏 21.5px from the centre = a 43px reach (sub-pixel slack)
          const cx = r.x + r.width / 2; const cy = r.y + r.height / 2; // 🎯
          // 👆 every edge of the centred 44×44 square must hit the control (its box or a packaged invisible hit area)
          const reach = [[cx, cy - half], [cx, cy + half], [cx - half, cy], [cx + half, cy]].every(([x, y]) => { const hit = document.elementFromPoint(x, y); return !!hit && (hit === el || el.contains(hit)); });
          if (reach) continue; // ✅ a 44px target
          if (r.width < (min as number) - 0.5 || r.height < (min as number) - 0.5) out.push(`${part}: "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
        }
      }
      return out;
    }, [['mobile-header', 'bottomBar'], TAP] as const);
    expect(small, 'tap targets under 44×44').toEqual([]);
  });
}


test('➡️ a right-edge swipe opens the aside as the right drawer; a scrim tap closes it', async ({ page }) => {
  await openPage(page, '/');
  // 👆 from the right edge, leftwards
  await swipe(page, 386, 200, 420);
  const box = await dialogBox(page);
  // ➡️ flush right, inside the app, narrower than the page
  expect(Math.abs(box.x + box.width - 390)).toBeLessThanOrEqual(1);
  expectInside(box);
  expect(box.width).toBeLessThan(390);
  // 🌫️ a tap on the scrim (left of the drawer) closes it
  await page.touchscreen.tap(Math.max(8, box.x / 2), 420);
  await expect(page.getByRole('dialog')).toBeHidden();
});


test('➡️ the right drawer also closes with a left-to-right swipe 🤏', async ({ page }) => {
  await openPage(page, '/');
  await swipe(page, 386, 200, 420);
  const box = await dialogBox(page);
  // 👉 swipe it back out
  await swipe(page, box.x + 30, 385, 420);
  await expect(page.getByRole('dialog')).toBeHidden();
});


test('⬅️ a left-edge swipe opens the nav drawer flush left; Escape closes it', async ({ page }) => {
  await openPage(page, '/');
  await swipe(page, 4, 260, 420);
  const box = await dialogBox(page);
  expect(Math.abs(box.x)).toBeLessThanOrEqual(1); // ⬅️ flush left
  expectInside(box);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});


test('🌍 the globe opens Settings from the bottom, inside the app; Escape returns focus to the globe', async ({ page }) => {
  await openPage(page, '/');
  const globe = page.locator('[data-ab-part="mobile-header-language"]');
  await globe.tap();
  const box = await dialogBox(page);
  // ⬇️ a bottom SHEET: it rests at a snap point, so its top is on screen and the rest hangs below the fold (by
  //    design: drag it up to see more). It spans the app's width and is never taller than the app 📏
  expect(box.y).toBeGreaterThanOrEqual(0); // ⬆️ never above the app
  expect(box.y).toBeLessThan(844); // 👀 its top is visible
  expect(Math.abs(box.x)).toBeLessThanOrEqual(1); // ⬅️ full width
  expect(Math.abs(box.width - 390)).toBeLessThanOrEqual(1); // ➡️
  expect(box.height).toBeLessThanOrEqual(844.5); // 📏 at most the app's height
  expect(await page.getByRole('dialog').getAttribute('data-side')).toBe('bottom'); // ⬇️ opens from the bottom
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(globe).toBeFocused();
});


test('🔎 the Search tab opens the search drawer inside the app; Escape returns focus to the tab', async ({ page }) => {
  await openPage(page, '/');
  const tab = page.locator(`${PART.bottomBar} button`).filter({ hasText: /search/i }).first();
  await tab.tap();
  const box = await dialogBox(page);
  expectInside(box);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(tab).toBeFocused();
});
