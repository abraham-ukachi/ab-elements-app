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
* @name: abElements Welcome Reduced Motion E2E Tests
* @file: tests/e2e/welcome-motion.spec.ts
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


// 🐢 Welcome reduced-motion e2e: with `prefers-reduced-motion: reduce`, no slide / diagram animation
// runs (≤ 120 ms cross-fades at most), and Get Started is fully visible.

// import the test helpers from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
// import the shared Welcome helpers 🧰
import { LAPTOP, MOBILE, SLIDE_COUNT, expectSlide, nextButton, openWelcome } from './welcome-helpers';


// the longest animation allowed under reduced motion (the brief's 120 ms cross-fade) ⏱️
const MAX_REDUCED_MS = 120;


// the reduced-motion OS setting for every test here 🐢
test.use({ reducedMotion: 'reduce' });


for (const [frame, viewport] of [['laptop', LAPTOP], ['mobile', MOBILE]] as const) {
  test.describe(`Welcome reduced motion (${frame}) 🐢`, () => {
    test.use({ viewport });

    test('no long or looping animation runs, on load or on a slide change', async ({ page }) => {
      // open s01
      await openWelcome(page);
      // the running animations, as `duration|iterations` strings 🎬
      const longAnimations = () => page.evaluate((max) => document.getAnimations()
        .map((animation) => animation.effect?.getComputedTiming())
        .filter((timing) => timing && (timing.iterations === Infinity || Number(timing.duration) > max))
        .map((timing) => `${timing?.duration}|${timing?.iterations}`), MAX_REDUCED_MS);

      // nothing long or infinite on load ✅
      expect(await longAnimations()).toEqual([]);
      // change slide, then check again ⏭️
      await nextButton(page).click();
      await expectSlide(page, 2);
      expect(await longAnimations()).toEqual([]);
    });

    test('Get Started is visible (opacity 1, in the viewport) on s10 🚀', async ({ page }) => {
      // open s10
      await openWelcome(page, 'en', SLIDE_COUNT);
      // the button
      const cta = page.getByRole('button', { name: 'Get Started' });
      // visible, in view & not faded out 👀
      await expect(cta).toBeVisible();
      await expect(cta).toBeInViewport();
      // ⏱️ polled: the short reduced-motion fade (≤ MAX_REDUCED_MS, allowed above) may still be finishing on arrival
      await expect.poll(() => cta.evaluate((el) => {
        // walk up: every ancestor must be fully opaque
        let opacity = 1;
        for (let node: Element | null = el; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
        return opacity;
      }), { timeout: MAX_REDUCED_MS + 1000 }).toBe(1);
    });
  });
}
