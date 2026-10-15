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
* @name: abElements Welcome Visual E2E Tests
* @file: tests/e2e/welcome-visual.spec.ts
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


// 📸 Welcome visual e2e: snapshot baselines of the 4 Welcome states (laptop / mobile × light / dark)
// on s01 & s09 (≤ 1 % pixel diff), plus a few localized review captures.

// import the test helpers from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
// import the shared Welcome helpers 🧰
import { LAPTOP, MOBILE, openWelcome } from './welcome-helpers';


// frozen motion: reduced motion + disabled CSS animations (the diagrams' static frame) 🧊
test.use({ reducedMotion: 'reduce' });

// the 4 states of the plan: frame × scheme 🗂️
const STATES = [
  ['laptop', LAPTOP, 'light'], ['laptop', LAPTOP, 'dark'],
  ['mobile', MOBILE, 'light'], ['mobile', MOBILE, 'dark'],
] as const;


for (const [frame, viewport, scheme] of STATES) {
  test.describe(`Welcome ${frame} ${scheme} 📸`, () => {
    // the frame & the OS scheme (System mode paints it) 🌗
    test.use({ viewport, colorScheme: scheme });

    for (const slide of [1, 9]) {
      test(`s0${slide} matches its baseline`, async ({ page }) => {
        // open the slide
        await openWelcome(page, 'en', slide);
        // compare with the committed baseline (≤ 1 % of the pixels may differ) 🔍
        await expect(page).toHaveScreenshot(`welcome-${frame}-${scheme}-s0${slide}.png`, {
          animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.01,
        });
      });
    }
  });
}


// localized review captures (attached to the run, not compared) 🌍
const REVIEW = [
  ['fr', 9, MOBILE, 'dark', 'fr-s09-mobile-dark.png'],
  ['es', 5, LAPTOP, 'dark', 'es-s05-laptop-dark.png'],
] as const;

for (const [locale, slide, viewport, scheme, file] of REVIEW) {
  test.describe(`Welcome review ${file} 🖼️`, () => {
    // the frame & the OS scheme
    test.use({ viewport, colorScheme: scheme });

    test(`captures ${locale} s0${slide}`, async ({ page }, testInfo) => {
      // open the localized slide
      await openWelcome(page, locale, slide);
      // capture it next to the test's output 💾
      await page.screenshot({ path: testInfo.outputPath(file), animations: 'disabled' });
    });
  });
}
