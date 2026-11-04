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
* @name: Live previews (e2e)
* @file: tests/e2e/live-preview.spec.ts
* @type: Playwright
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test:e2e tests/e2e/live-preview.spec.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🎭 Live previews (0.2.26) on the Components page, in all 4 locales × light / dark:
//   🗂️ the Preview / Code tabs (localized), 🖱️ click & ⌨️ keyboard (←/→/Home/End, one tab stop)
//   👀 both panels render (the preview's real components, the build-time Shiki code)
//   🪞 the code matches the preview · 🌗 the theme follows · 🛡️ no CSP eval violation & no eval in the bundle

// import the test helpers from Playwright 🎭
import { expect, test, type Locator } from '@playwright/test';
// import the shared page opener 🧰
import { openPage, THEMES } from './layout-helpers';
// import the process runner (the bundle check) ⚙️
import { execFileSync } from 'node:child_process';


// 🌍 the 4 locales: URL prefix & the tab labels
const LOCALES = [
  { locale: 'en', prefix: '', preview: 'Preview', code: 'Code' },
  { locale: 'fr', prefix: '/fr', preview: 'Aperçu', code: 'Code' },
  { locale: 'es', prefix: '/es', preview: 'Vista previa', code: 'Código' },
  { locale: 'ru', prefix: '/ru', preview: 'Превью', code: 'Код' },
] as const;

// 📄 the page with previews
const PAGE = '/docs/packages/components';
const EXAMPLE = '[data-docs-example]';

// 🔤 the strings a code sample shows (labels, titles, text children, quoted array items)
const stringsOf = (src: string) => [...src.matchAll(/(?:label|title)="([^"]+)"/g), ...src.matchAll(/>\s*([^<>{}\s][^<>{}]*?)\s*</g), ...src.matchAll(/'([^']+)'/g)].map((m) => m[1]);

// 🗂️ an example's parts
const parts = (ex: Locator) => ({ tabs: ex.getByRole('tab'), panels: ex.locator('[role="tabpanel"]') });


for (const scheme of THEMES) {
  for (const l of LOCALES) {
    test.describe(`live previews · ${l.locale} · ${scheme} 🧪`, () => {
      test.use({ colorScheme: scheme, viewport: { width: 1440, height: 900 } });
      test.beforeEach(async ({ page }) => { await page.addInitScript((mode) => localStorage.setItem('theme', mode), scheme); });

      test('🗂️ localized Preview / Code tabs, both panels render & the code matches', async ({ page }) => {
        await openPage(page, `${l.prefix}${PAGE}`);
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme); // 🌗
        const examples = page.locator(EXAMPLE);
        expect(await examples.count()).toBeGreaterThanOrEqual(4);
        for (let i = 0; i < await examples.count(); i++) {
          const ex = examples.nth(i);
          const { tabs, panels } = parts(ex);
          await expect(tabs).toHaveText([l.preview, l.code]); // 🌍
          // 👀 Preview first: real package components, visible
          await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
          await expect(panels.nth(0)).toBeVisible();
          await expect(panels.nth(0).locator('[class*="Ab"]').first()).toBeVisible();
          const previewText = await panels.nth(0).innerText();
          // 💻 Code: the Shiki block of the same source
          await tabs.nth(1).click();
          await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
          await expect(panels.nth(0)).toBeHidden();
          await expect(panels.nth(1)).toBeVisible();
          const pre = panels.nth(1).locator('pre.shiki');
          await expect(pre).toBeVisible();
          const src = await pre.innerText();
          expect(src).toMatch(/^<Ab[A-Z]/);
          // 🪞 every label / text in the code is in the preview
          for (const s of stringsOf(src)) expect(previewText, s).toContain(s);
        }
      });

      test('⌨️ keyboard: one tab stop, ←/→ wrap, Home / End', async ({ page }) => {
        await openPage(page, `${l.prefix}${PAGE}`);
        const { tabs, panels } = parts(page.locator(EXAMPLE).first());
        await expect(tabs.nth(0)).toHaveAttribute('tabindex', '0');
        await expect(tabs.nth(1)).toHaveAttribute('tabindex', '-1');
        await tabs.nth(0).focus();
        await page.keyboard.press('ArrowRight');
        await expect(tabs.nth(1)).toBeFocused();
        await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
        await expect(panels.nth(1)).toBeVisible();
        await page.keyboard.press('ArrowRight'); // 🔁 wraps
        await expect(tabs.nth(0)).toBeFocused();
        await page.keyboard.press('End');
        await expect(tabs.nth(1)).toBeFocused();
        await page.keyboard.press('Home');
        await expect(tabs.nth(0)).toBeFocused();
        await expect(panels.nth(0)).toBeVisible();
        // ⇥ Tab leaves the tablist straight for the panel's first control (the preview toolbar): a panel with
        //    focusable content is no tab stop of its own (components 0.6.0)
        await expect(panels.nth(0)).not.toHaveAttribute('tabindex', '0');
        await page.keyboard.press('Tab');
        await expect(panels.nth(0).locator('[data-ab-tool="scheme"]')).toBeFocused();
        // 💻 on the Code tab: the code WRAPPER (the code block's one stop), then the copy button; no separate
        //    panel stop, and the Shiki <pre> is never a stop of its own
        await tabs.nth(1).click();
        const wrapper = panels.nth(1).locator('[data-ab-part="code-block-code"]');
        await expect(wrapper).toHaveAttribute('tabindex', '0');
        await expect(panels.nth(1).locator('pre.shiki')).not.toHaveAttribute('tabindex', /.*/);
        await expect(panels.nth(1)).not.toHaveAttribute('tabindex', '0');
        await page.keyboard.press('Tab');
        await expect(wrapper).toBeFocused();
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => ({ tag: document.activeElement?.tagName, pre: !!document.activeElement?.closest('pre') }));
        expect(focused).toEqual({ tag: 'BUTTON', pre: false }); // 📋 the copy button
      });
    });
  }

  test(`🧰 toolbar · ${scheme}: the light/dark toggle & reload change ONLY this preview`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.addInitScript((mode) => localStorage.setItem('theme', mode), scheme);
    await openPage(page, PAGE);
    const ex = page.locator(EXAMPLE).first();
    const toolbar = ex.getByRole('toolbar');
    const toggle = toolbar.locator('[data-ab-tool="scheme"]');
    const box = ex.locator('[data-ab-part="demo-box"]');
    // 🌗 the toggle flips this preview's scheme (aria-pressed = dark) & never the page's
    const start = await toggle.getAttribute('aria-pressed');
    await toggle.click();
    const flipped = start === 'true' ? 'false' : 'true';
    await expect(toggle).toHaveAttribute('aria-pressed', flipped);
    await expect(box).toHaveAttribute('data-theme', flipped === 'true' ? 'dark' : 'light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', start ?? 'false');
    // 🔄 reload remounts the preview: a marked node is replaced by a fresh one, same content
    await box.locator('button').first().evaluate((el) => el.setAttribute('data-e2e-old', '1'));
    await toolbar.locator('[data-ab-tool="reload"]').click();
    await expect(box.locator('[data-e2e-old]')).toHaveCount(0);
    await expect(box.getByRole('button', { name: 'Save' })).toBeVisible();
    // ↗️ no open link (no standalone page yet)
    await expect(toolbar.locator('[data-ab-tool="open"]')).toHaveCount(0);
  });

  test(`⌨️↔️ 390px · ${scheme}: arrow keys scroll a long code line & the copy button never covers code`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.addInitScript((mode) => localStorage.setItem('theme', mode), scheme);
    await openPage(page, PAGE);
    const ex = page.locator(EXAMPLE).first();
    await ex.getByRole('tab').nth(1).click();
    const wrapper = ex.locator('[data-ab-part="code-block-code"]');
    // ↔️ the long line overflows, and the focused wrapper scrolls with →
    expect(await wrapper.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    await wrapper.focus();
    for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
    await expect.poll(() => wrapper.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    // 📋 the copy button sits in its gutter: it never intersects the code scroller's visible box
    const copy = ex.locator('[role="tabpanel"]').nth(1).getByRole('button');
    const [c, w] = [await copy.boundingBox(), await wrapper.boundingBox()];
    const overlap = Math.max(0, Math.min(c!.x + c!.width, w!.x + w!.width) - Math.max(c!.x, w!.x)) * Math.max(0, Math.min(c!.y + c!.height, w!.y + w!.height) - Math.max(c!.y, w!.y));
    expect(overlap).toBe(0);
  });

  test(`📱 390px · ${scheme}: tabs work & nothing overflows the page`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.addInitScript((mode) => localStorage.setItem('theme', mode), scheme);
    await openPage(page, PAGE);
    const { tabs, panels } = parts(page.locator(EXAMPLE).first());
    await tabs.nth(1).click();
    await expect(panels.nth(1).locator('pre.shiki')).toBeVisible();
    const box = await page.locator(EXAMPLE).first().boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(390 + 1);
  });
}


test('🛡️ no CSP eval violation while the previews hydrate & switch', async ({ page }) => {
  const violations: string[] = [];
  page.on('console', (m) => { if (/unsafe-eval|Refused to evaluate/i.test(m.text())) violations.push(m.text()); });
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => { (window as unknown as { __csp: string[] }).__csp = [...((window as unknown as { __csp?: string[] }).__csp ?? []), `${e.violatedDirective} ${e.blockedURI}`]; });
  });
  await openPage(page, PAGE);
  for (const tab of await page.locator(`${EXAMPLE} [role="tab"]`).all()) await tab.click();
  const csp = await page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []);
  expect(csp.filter((v) => /eval/.test(v))).toEqual([]);
  expect(violations).toEqual([]);
});


test('🛡️ the client bundle has no eval / new Function', () => {
  // ⚙️ scripts/check-no-eval.mjs exits 1 on a hit (throws here)
  const out = execFileSync('node', ['scripts/check-no-eval.mjs'], { encoding: 'utf8' });
  expect(out).toContain('no eval');
});
