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
* @name: abElements Welcome Slides E2E Tests
* @file: tests/e2e/welcome-slides.spec.ts
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


// 🎞️ Welcome slides e2e: next / back / dots / ←→ keys / `?s=` sync, Skip → s09 (+ focus),
// and the globe (locale switch) keeping the current slide.

// import the test helpers from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
// import the shared Welcome helpers 🧰
import {
  LAPTOP, MOBILE, SLIDE_COUNT, dots, expectSlide, nextButton, openWelcome, prevButton, slideTitle,
} from './welcome-helpers';


// laptop frame + reduced motion (no transition timing in the way) 💻
test.use({ viewport: LAPTOP, reducedMotion: 'reduce' });


test.describe('Welcome slides 🎞️', () => {
  test('next & back move one slide and keep `?s=` in sync ⏭️⏮️', async ({ page }) => {
    // start on s01
    await openWelcome(page);
    // back is disabled on s01 ♿
    await expect(prevButton(page)).toHaveAttribute('aria-disabled', 'true');

    // next → s02 → s03 ⏭️
    await nextButton(page).click();
    await expectSlide(page, 2);
    await nextButton(page).click();
    await expectSlide(page, 3);

    // back → s02 ⏮️
    await prevButton(page).click();
    await expectSlide(page, 2);
  });

  test('dots jump to any slide and mark the current one ⚫', async ({ page }) => {
    // start on s01
    await openWelcome(page);
    // one dot per slide
    await expect(dots(page)).toHaveCount(SLIDE_COUNT);

    // jump to s06, then back to s01
    await dots(page).nth(5).click();
    await expectSlide(page, 6);
    await expect(dots(page).nth(5)).toHaveAttribute('aria-current', 'step');
    await dots(page).nth(0).click();
    await expectSlide(page, 1);
  });

  test('the ← / → keys move the slides when focus is inside the carousel ⌨️', async ({ page }) => {
    // start on s01 and put the focus on the first dot (inside the region)
    await openWelcome(page);
    await dots(page).first().focus();

    // → twice, ← once
    await page.keyboard.press('ArrowRight');
    await expectSlide(page, 2);
    await page.keyboard.press('ArrowRight');
    await expectSlide(page, 3);
    await page.keyboard.press('ArrowLeft');
    await expectSlide(page, 2);
  });

  test('the arrow keys do nothing when focus is outside the carousel (no global hijack) 🙅', async ({ page }) => {
    // start on s02 with the focus on the body
    await openWelcome(page, 'en', 2);
    await page.locator('body').focus();
    // press →
    await page.keyboard.press('ArrowRight');
    // expect to stay on s02 ✅
    await expectSlide(page, 2);
  });

  test('`?s=` opens the right slide on load (and survives a reload) 🔗', async ({ page }) => {
    // open s04 straight from the URL
    await openWelcome(page, 'en', 4);
    await expectSlide(page, 4);
    // reload: still s04 🔁
    await page.reload();
    await expectSlide(page, 4);
  });

  test('Skip jumps to s09 and focuses its title ⏩', async ({ page }) => {
    // start on s02
    await openWelcome(page, 'en', 2);
    // press Skip
    await page.getByRole('button', { name: 'Skip', exact: true }).click();

    // expect s09, its title focused, and no Skip / arrows left 🎯
    await expectSlide(page, SLIDE_COUNT);
    await expect(slideTitle(page, 's09')).toBeFocused();
    await expect(page.getByRole('button', { name: 'Skip', exact: true })).toHaveCount(0);
    await expect(nextButton(page)).toHaveCount(0);
  });

  test('s09 shows Get Started & the disabled "Continue with GitHub · coming soon" 🚀', async ({ page }) => {
    // open s09
    await openWelcome(page, 'en', SLIDE_COUNT);
    // Get Started is there
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    // GitHub is disabled, focusable & says "coming soon" ♿
    const github = page.getByRole('button', { name: /Continue with GitHub/ });
    await expect(github).toHaveAttribute('aria-disabled', 'true');
    await expect(github).toContainText(/coming soon/i);
  });

  test('the globe switches the locale and keeps `?s=` (keyboard) 🌍', async ({ page }) => {
    // start on s03 in English
    await openWelcome(page, 'en', 3);
    // open the globe menu
    await page.getByRole('button', { name: /^Language/ }).click();
    // pick French with the keyboard (focus the item + Enter) ⌨️
    const french = page.getByRole('menuitemradio', { name: 'Français' });
    await french.focus();
    await page.keyboard.press('Enter');

    // expect the French Welcome, still on s03 🇫🇷
    await expect(page).toHaveURL(/\/fr\/welcome\?s=3$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expectSlide(page, 3);
  });

  // TODO(theme 0.3.3): flip `test.fail` → `test` once the bare `main { z-index: 99 }` is scoped in the theme 🧹
  // ⚠️ KNOWN PACKAGE GAP (ab-nextjs-theme 0.3.2 `css/styles.css:552-557`): the bare `main { position: relative;
  // z-index: 99 }` rule lifts the carousel above the header, so the open globe menu sits UNDER the counter row and
  // can't be clicked. Packages-first: fixed by scoping that rule in the theme, not patched here. Flip to `test` then 🧹
  test.fail('the globe menu items can be clicked with a pointer 🖱️ (theme `main` z-index gap)', async ({ page }) => {
    // start on s03 in English
    await openWelcome(page, 'en', 3);
    // open the globe menu & click French
    await page.getByRole('button', { name: /^Language/ }).click();
    await page.getByRole('menuitemradio', { name: 'Français' }).click({ timeout: 3_000 });
    // expect the French Welcome
    await expect(page).toHaveURL(/\/fr\/welcome\?s=3$/);
  });
});


test.describe('Welcome slides on mobile (390px) 📱', () => {
  // the 390×844 frame of the v6 mocks, as a touch device 👆
  test.use({ viewport: MOBILE, hasTouch: true, isMobile: true });

  /**
   * `swipe` 👆
   *
   * Swipes the carousel track horizontally with real touch pointer events (what `useAbSwipe` listens to).
   *
   * @param { Page } page - the Playwright page
   * @param { number } dx - the horizontal distance in px (negative = to the left → next)
   * @param { number } [ms] - how long the finger stays down (slow drags aren't flicks) ⏱️
   * @returns { Promise<void> }
   */
  async function swipe(page: Page, dx: number, ms = 120): Promise<void> {
    // the track & its center 🎯
    const track = page.locator('[data-ab-part="track"]');
    const box = await track.boundingBox();
    if (!box) throw new Error('no carousel track');
    const y = box.y + box.height / 2;
    const x0 = box.x + box.width / 2 - dx / 2;
    // fire down → a few moves → up, as a touch pointer 🖐️
    await track.evaluate(async (el, { x0, y, dx, ms }) => {
      const fire = (type: string, x: number) => el.dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y,
      }));
      fire('pointerdown', x0);
      for (let i = 1; i <= 5; i++) {
        // spread the moves over `ms` 🐢
        await new Promise((resolve) => setTimeout(resolve, ms / 5));
        fire('pointermove', x0 + (dx * i) / 5);
      }
      fire('pointerup', x0 + dx);
    }, { x0, y, dx, ms });
  }

  test('a left swipe goes to the next slide, a right swipe goes back 👈👉', async ({ page }) => {
    // start on s02
    await openWelcome(page, 'en', 2);
    // swipe left (well past the 48px threshold) → s03 ⏭️
    await swipe(page, -160);
    await expectSlide(page, 3);
    // swipe right → s02 ⏮️
    await swipe(page, 160);
    await expectSlide(page, 2);
  });

  test('a short drag (under the threshold) keeps the slide 🙅', async ({ page }) => {
    // start on s02
    await openWelcome(page, 'en', 2);
    // a slow 20px nudge over 400ms (neither past 48px nor a 0.35px/ms flick) 🐢
    await swipe(page, -20, 400);
    // still s02 ✅
    await expectSlide(page, 2);
  });
});
