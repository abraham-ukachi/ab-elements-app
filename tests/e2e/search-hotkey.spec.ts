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
* @name: abElements Search Hotkey - e2e
* @file: tests/e2e/search-hotkey.spec.ts
* @type: TypeScript (Playwright)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm build && pnpm test:e2e tests/e2e/search-hotkey.spec.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// ⌨️ hooks 0.1.9: the docs shell opens search on ⌘K / Ctrl+K, including while a text field is focused
//    (`allowInInputs: true`). A bare key, Shift added to the combo, and the wrong platform modifier do not.
//    The Welcome is outside the shell, so the same keys do nothing there. The 404 field still shows its key cap.

// import the test helpers and the page type from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
// import the shared opener (Splash already seen, fonts ready) 🧰
import { openPage } from './layout-helpers';


// 🗄️ the search drawer (English title; other locales pass their own)
const searchDialog = (page: Page, name = 'Search') => page.getByRole('dialog', { name });

// 🧱 one focused field, appended for this press and removed afterwards ✍️
type Probe = 'input' | 'textarea' | 'select' | 'contenteditable' | 'textbox' | 'checkbox';

/**
 * `focusProbe` - put a real field on the page and focus it 🎯
 *
 * The closed shell has no text field of its own (the search box mounts with the drawer), so the
 * shortcut is pressed on a field we add. The listener is on `window` and reads the event target.
 *
 * @param { Page } page - the Playwright page
 * @param { Probe } kind - which editable (or not) element to focus
 * @returns { Promise<import('@playwright/test').Locator> }
 */
async function focusProbe(page: Page, kind: Probe) {
  // 🧱 create it in the page, then let Playwright focus the same node
  await page.evaluate((probe) => {
    document.getElementById('hotkey-probe')?.remove(); // 🧹 one probe at a time
    const el = probe === 'textarea'
      ? document.createElement('textarea')
      : probe === 'select'
        ? document.createElement('select')
        : document.createElement(probe === 'input' || probe === 'checkbox' ? 'input' : 'div');
    el.id = 'hotkey-probe'; // 🆔
    if (probe === 'checkbox' && el instanceof HTMLInputElement) el.type = 'checkbox'; // ☑️ not text
    if (probe === 'contenteditable') el.setAttribute('contenteditable', 'true'); // ✏️
    if (probe === 'textbox') { el.setAttribute('role', 'textbox'); el.tabIndex = 0; } // ♿
    if (el instanceof HTMLSelectElement) el.append(new Option('a')); // 📋 a select needs an option to focus cleanly
    el.setAttribute('aria-label', 'Hotkey probe'); // 🏷️
    document.body.append(el); // 📌
  }, kind);
  // 🎯 focus, so the key event's target is the field
  const probe = page.locator('#hotkey-probe');
  await probe.focus();
  return probe;
}

/**
 * `closeSearch` - Escape, and wait until the drawer is gone 🚪
 *
 * @param { Page } page - the Playwright page
 * @param { string } name - the dialog's accessible name
 * @returns { Promise<void> }
 */
async function closeSearch(page: Page, name = 'Search') {
  await page.keyboard.press('Escape'); // ⎋
  await expect(searchDialog(page, name)).toBeHidden(); // 🚪
}


test.describe('search shortcut inside fields ⌨️', () => {
  test('Ctrl+K opens search from a text field and leaves what was typed', async ({ page }) => {
    await openPage(page, '/'); // 🏠 the shell, whose bar fields do not listen themselves
    const probe = await focusProbe(page, 'input');
    await probe.fill('theme'); // 🔤
    await probe.press('Control+K'); // ⌃K
    await expect(searchDialog(page)).toBeVisible(); // 🗄️
    await expect(probe).toHaveValue('theme'); // ✍️ the combo did not type a "k"
  });

  test('Ctrl+K opens search from a textarea, a select, contenteditable and a textbox', async ({ page }) => {
    await openPage(page, '/docs/installation'); // 📚 another shell page
    for (const kind of ['textarea', 'select', 'contenteditable', 'textbox'] as const) {
      const probe = await focusProbe(page, kind); // 🎯
      await probe.press('Control+K'); // ⌃K
      await expect(searchDialog(page)).toBeVisible(); // 🗄️
      await closeSearch(page); // ⎋ ready for the next field
    }
  });

  test('a bare key, Ctrl+Shift+K and Meta+K do not open search from an input', async ({ page }) => {
    await openPage(page, '/'); // 🏠 Linux / the CI browser: `mod` is Ctrl, not Meta
    const probe = await focusProbe(page, 'input');
    await probe.press('k'); // 🔤 a character, not a shortcut
    await expect(searchDialog(page)).toBeHidden();
    await expect(probe).toHaveValue('k'); // ✍️ it was typed
    await probe.press('Control+Shift+K'); // ⇧ a different combo
    await expect(searchDialog(page)).toBeHidden();
    await probe.press('Meta+K'); // ⌘ not `mod+k` on this platform
    await expect(searchDialog(page)).toBeHidden();
  });

  test('Ctrl+K inside the search box keeps the query and the drawer', async ({ page }) => {
    await openPage(page, '/'); // 🏠
    const probe = await focusProbe(page, 'input');
    await probe.press('Control+K'); // ⌃K opens it; focus moves to the drawer's field
    const box = searchDialog(page).getByRole('combobox'); // 🔎 the real search input (type="search")
    await box.fill('layout'); // 🔤
    await box.press('Control+K'); // ⌃K again, now from inside the field
    await expect(searchDialog(page)).toBeVisible(); // 🗄️ still open
    await expect(box).toHaveValue('layout'); // ✍️ the letters stay
  });

  test('a checkbox still opens search (it is not a text field)', async ({ page }) => {
    await openPage(page, '/'); // 🏠
    const probe = await focusProbe(page, 'checkbox');
    await probe.press('Control+K'); // ⌃K
    await expect(searchDialog(page)).toBeVisible(); // 🗄️
  });
});


test.describe('the same shortcut on other screens 🌍', () => {
  test('Ctrl+K from an input opens the French search drawer', async ({ page }) => {
    await openPage(page, '/fr'); // 🇫🇷 the shell, in French
    const probe = await focusProbe(page, 'input');
    await probe.fill('bouton'); // 🔤
    await probe.press('Control+K'); // ⌃K
    await expect(searchDialog(page, 'Rechercher')).toBeVisible(); // 🗄️
    await expect(probe).toHaveValue('bouton'); // ✍️
  });

  test('the 404 still opens search from an input, and the field keeps its key cap', async ({ page }) => {
    await openPage(page, '/nope'); // 🤷🏽‍♂️ the shell, plus the field that shows the cap
    const field = page.locator('#main').getByRole('button', { name: /Search docs/ });
    await expect(field.locator('kbd')).toBeVisible(); // ⌨️ the mock's key cap
    const probe = await focusProbe(page, 'input');
    await probe.fill('hooks'); // 🔤
    await probe.press('Control+K'); // ⌃K
    await expect(searchDialog(page)).toBeVisible(); // 🗄️
    await expect(probe).toHaveValue('hooks'); // ✍️
  });

  test('the Welcome does not bind the shortcut', async ({ page }) => {
    await openPage(page, '/welcome'); // 🚪 outside the docs shell
    const probe = await focusProbe(page, 'input');
    await probe.press('Control+K'); // ⌃K
    await expect(searchDialog(page)).toHaveCount(0); // 🙅 no search drawer here
  });
});
