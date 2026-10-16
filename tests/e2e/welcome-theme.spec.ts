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
* @name: abElements Welcome Theme E2E Tests
* @file: tests/e2e/welcome-theme.spec.ts
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


// 🌗 Welcome theme e2e: the segmented light / system / dark switch, and the choice persisting
// across reloads (System follows the OS colour scheme).

// import the test helpers & the page type from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
// import the shared Welcome helpers 🧰
import { LAPTOP, openWelcome } from './welcome-helpers';


// laptop frame + reduced motion 💻
test.use({ viewport: LAPTOP, reducedMotion: 'reduce' });


// the theme radio called `name` (Light / System / Dark) 🔘
const themeRadio = (page: Page, name: string) => page.getByRole('radio', { name, exact: true });

/**
 * `expectTheme` ✅
 *
 * Expects `<html>` to carry the resolved theme & the picked mode, and the radio to be checked.
 *
 * @param { Page } page - the Playwright page
 * @param { 'light' | 'dark' } resolved - the theme actually painted
 * @param { 'light' | 'dark' | 'system' } mode - the visitor's pick
 * @returns { Promise<void> }
 */
async function expectTheme(page: Page, resolved: 'light' | 'dark', mode: 'light' | 'dark' | 'system'): Promise<void> {
  // the painted theme 🎨
  await expect(page.locator('html')).toHaveAttribute('data-theme', resolved);
  // the picked mode 🔘
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode', mode);
  // the matching radio is checked ♿
  const label = { light: 'Light', dark: 'Dark', system: 'System' }[mode];
  await expect(themeRadio(page, label)).toHaveAttribute('aria-checked', 'true');
}


test.describe('Welcome theme modes 🌗', () => {
  test('System is the default and follows the OS scheme 🖥️', async ({ page }) => {
    // a dark OS
    await page.emulateMedia({ colorScheme: 'dark' });
    await openWelcome(page);
    await expectTheme(page, 'dark', 'system');

    // the OS turns light: the page follows live ☀️
    await page.emulateMedia({ colorScheme: 'light' });
    await expectTheme(page, 'light', 'system');
  });

  test('Dark is applied and persists across a reload 🌙', async ({ page }) => {
    // a light OS
    await page.emulateMedia({ colorScheme: 'light' });
    await openWelcome(page);
    // pick Dark
    await themeRadio(page, 'Dark').click();
    await expectTheme(page, 'dark', 'dark');
    // reload: still dark (no flash back to light) 🔁
    await page.reload();
    await expectTheme(page, 'dark', 'dark');
  });

  test('Light is applied and persists across a reload, even on a dark OS ☀️', async ({ page }) => {
    // a dark OS
    await page.emulateMedia({ colorScheme: 'dark' });
    await openWelcome(page);
    // pick Light
    await themeRadio(page, 'Light').click();
    await expectTheme(page, 'light', 'light');
    // reload: still light 🔁
    await page.reload();
    await expectTheme(page, 'light', 'light');
  });

  test('going back to System persists and follows the OS again 🔄', async ({ page }) => {
    // a dark OS, the visitor first picks Light...
    await page.emulateMedia({ colorScheme: 'dark' });
    await openWelcome(page);
    await themeRadio(page, 'Light').click();
    await expectTheme(page, 'light', 'light');
    // ...then System again
    await themeRadio(page, 'System').click();
    await expectTheme(page, 'dark', 'system');
    // reload: still System (dark, from the OS) 🔁
    await page.reload();
    await expectTheme(page, 'dark', 'system');
  });
});
