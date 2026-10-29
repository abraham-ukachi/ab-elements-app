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
* @name: abElements Welcome Playground Drawer E2E Tests
* @file: tests/e2e/welcome-drawer.spec.ts
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


// 🚪 Welcome playground drawer e2e (390px): below 768px core 0.2.3 (`asideDrawerAt="mobile"`) turns the ONE aside
// (the active slide's playground) into the RIGHT drawer. "Show playground" opens it (role=dialog + aria-modal, named
// "Live Playground"); Esc, a backdrop tap and a REAL touch swipe to the right (≥ 60px) close it; focus returns to the
// trigger. From 768px the trigger is hidden (the page shows the playground itself).

// import the test helpers from `@playwright/test` 🎭
import { expect, test, type Page } from '@playwright/test';
// import the shared Welcome helpers 🧰
import { MOBILE, openWelcome } from './welcome-helpers';
// import the English messages (the trigger + drawer names) 🌐
import en from '../../messages/en.json';


// the trigger ("Show playground") 🔘
const trigger = (page: Page) => page.getByRole('button', { name: en.Welcome.playground.show }).first();
// the drawer (core names it from AbAsideLayout's `aria-label`) 🚪
const drawer = (page: Page) => page.getByRole('dialog', { name: en.Welcome.playground.title });

// 👆 a REAL touch swipe (CDP touch events), from → to in 12 moves
async function touchSwipe(page: Page, from: [number, number], to: [number, number]): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from[0], y: from[1] }] });
  for (let i = 1; i <= 12; i++) {
    await page.waitForTimeout(15);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from[0] + ((to[0] - from[0]) * i) / 12, y: from[1] + ((to[1] - from[1]) * i) / 12 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

// open the drawer from the trigger and check its role, modality, name + scene 🔓
async function openDrawer(page: Page): Promise<void> {
  await trigger(page).click();
  await expect(drawer(page)).toBeVisible();
  await expect(drawer(page)).toHaveAttribute('aria-modal', 'true');
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
  // 🗺️ the active slide's playground is inside (one image with its alt)
  await expect(drawer(page).getByRole('img').first()).toBeVisible();
}

// closed + focus back on the trigger ↩️
async function expectClosed(page: Page): Promise<void> {
  await expect(drawer(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
}


test.describe('Welcome playground drawer (390px) 🚪', () => {
  test.use({ viewport: MOBILE, hasTouch: true });

  test('no playground on the page; the trigger opens the right drawer (dialog, modal, named) 📱', async ({ page }) => {
    await openWelcome(page, 'en', 2);
    // 🙈 closed: no visible playground image on the page
    await expect(page.locator('[data-ab-part="aside"] [role="img"]:visible')).toHaveCount(0);
    await openDrawer(page);
    // ➡️ it sits on the right edge
    const box = await drawer(page).boundingBox();
    expect(Math.round((box?.x ?? 0) + (box?.width ?? 0))).toBe(MOBILE.width);
  });

  test('the open drawer is really on top: hit-tests land in it, the scrim covers the page 🎯', async ({ page }) => {
    await openWelcome(page, 'en', 3);
    await openDrawer(page);
    const box = (await drawer(page).boundingBox())!;
    const hits = await page.evaluate(({ x, w, h }) => {
      const inDrawer = (px: number, py: number) => !!document.elementFromPoint(px, py)?.closest('[role="dialog"]');
      const left = document.elementFromPoint(Math.max(2, x / 2), h / 2);
      return {
        // 🗺️ 5 points across the panel
        drawer: [[0.5, 0.2], [0.5, 0.5], [0.5, 0.8], [0.15, 0.5], [0.85, 0.5]].every(([fx, fy]) => inDrawer(x + w * fx, h * fy)),
        // 🌫️ left of the panel: the backdrop, not the slide
        backdrop: left?.getAttribute('data-ab-part') === 'aside-backdrop',
      };
    }, { x: box.x, w: box.width, h: MOBILE.height });
    expect(hits).toEqual({ drawer: true, backdrop: true });
  });

  test('Esc closes it and focus returns to the trigger ⎋', async ({ page }) => {
    await openWelcome(page, 'en', 9);
    await openDrawer(page);
    await page.keyboard.press('Escape');
    await expectClosed(page);
  });

  test('a backdrop tap closes it 🌫️', async ({ page }) => {
    await openWelcome(page, 'en', 3);
    await openDrawer(page);
    // 👆 tap the dimmed page left of the drawer
    const box = await drawer(page).boundingBox();
    await page.touchscreen.tap(Math.max(4, Math.floor((box?.x ?? 40) / 2)), 300);
    await expectClosed(page);
  });

  test('a real touch swipe to the right (≥ 60px) closes it 🤏', async ({ page }) => {
    await openWelcome(page, 'en', 1);
    await openDrawer(page);
    const box = await drawer(page).boundingBox();
    const y = Math.round((box?.y ?? 0) + (box?.height ?? 0) / 2);
    const x = Math.round((box?.x ?? 0) + 40);
    await touchSwipe(page, [x, y], [x + 160, y]);
    await expectClosed(page);
  });
});


test.describe('Welcome playground trigger (768px+) 💻', () => {
  for (const viewport of [{ width: 768, height: 1024 }, { width: 1180, height: 820 }]) {
    test(`is hidden at ${viewport.width}px, where the page shows the playground 🙈`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openWelcome(page, 'en', 2);
      await expect(trigger(page)).toBeHidden();
      await expect(page.locator('[data-ab-part="aside"] [role="img"]').first()).toBeVisible(); // 🖼️ scene shown (it nests role=img parts, so no exact count)
    });
  }
});
