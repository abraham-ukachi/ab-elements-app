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
* @name: abElements 404 - e2e
* @file: tests/e2e/not-found.spec.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm build && pnpm test:e2e tests/e2e/not-found.spec.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🤷🏽‍♂️ 404 e2e (0.2.22): an unknown path in every locale gets a translated 404 INSIDE the shell (status 404, noindex),
// a URL outside the locale tree gets the global (English) one, "Did you mean …?" links to the closest route, the
// search field opens the search drawer, the document never scrolls, and axe finds nothing serious or critical 🪓.

// import the test helpers & the page type from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
// import the axe builder from `@axe-core/playwright` 🪓
import AxeBuilder from '@axe-core/playwright';
// import the shared viewports 📐
import { LAPTOP, MOBILE } from './welcome-helpers';


// 🌍 one unknown path per locale + what its 404 must say (title, h1, Back to home + its localized href)
const LOCALES = [
  { locale: 'en', path: '/this-page-does-not-exist', title: 'Page not found | abElements', h1: 'Page not found', home: 'Back to home', homeHref: '/' },
  { locale: 'fr', path: '/fr/page-inconnue/deep', title: 'Page introuvable | abElements', h1: 'Page introuvable', home: 'Retour à l’accueil', homeHref: '/fr' },
  { locale: 'es', path: '/es/pagina-desconocida', title: 'Página no encontrada | abElements', h1: 'Página no encontrada', home: 'Volver al inicio', homeHref: '/es' },
  { locale: 'ru', path: '/ru/neizvestnaya', title: 'Страница не найдена | abElements', h1: 'Страница не найдена', home: 'На главную', homeHref: '/ru' },
] as const;

// 🚨 the axe impacts that fail a test
const BLOCKING = new Set(['serious', 'critical']);


/**
 * `open404` - go to a 404 with the Splash already seen, and return the document response 🚪
 *
 * @param { Page } page - the Playwright page
 * @param { string } path - the URL path
 * @returns { Promise<import('@playwright/test').Response | null> }
 */
async function open404(page: Page, path: string) {
  // 💦 skip the Splash overlay (first visit) so the 404 is what we test
  await page.addInitScript(() => sessionStorage.setItem('ab-splash-seen', '1'));
  // 🚪 navigate & hand back the response (its status is the 404)
  return page.goto(path);
}


test.describe('404 per locale, inside the shell 🌍', () => {
  for (const { locale, path, title, h1, home, homeHref } of LOCALES) {
    test(`${locale}: ${path} → translated 404 with the shell`, async ({ page }) => {
      // 🚪 the unknown path
      const response = await open404(page, path);
      // 🔢 a real 404 status, never a soft 200
      expect(response?.status()).toBe(404);
      // 🌍 the right language & the localized title
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page).toHaveTitle(title);
      // 🙈 never indexed
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
      // ♿ exactly one visible h1, translated
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
      // 🧭 the shell is there: the sidebar's "Documentation" nav (laptop default viewport is 1280)
      await expect(page.locator('[data-ab-part="main-content"]').first()).toBeVisible();
      // ⬅️ Back to home points at this locale's Home
      await expect(page.getByRole('link', { name: home })).toHaveAttribute('href', homeHref);
    });
  }

  test('a nested unknown path is a 404 too (no soft 404 on deep links) 🕳️', async ({ request }) => {
    // 📡 a plain request: status only
    const response = await request.get('/docs/a/b/c', { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });
});


test.describe('global 404 (outside the locale tree) 🌐', () => {
  test('/foo.bar → the English 404 with the shell, status 404 (not a 500)', async ({ page }) => {
    // 🚪 a first segment that is no locale & that the proxy never rewrites (it has a dot)
    const response = await open404(page, '/foo.bar');
    // 🔢 404, never the old 500
    expect(response?.status()).toBe(404);
    // 🇬🇧 English, with the same page as the locale tree
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('Page not found | abElements');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await expect(page.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
  });
});


test.describe('404 behaviour 🧪', () => {
  test.use({ viewport: LAPTOP });

  test('"Did you mean …?" links to the closest route, in the locale 💡', async ({ page }) => {
    // 🪝 a typo of a package name, in French
    await open404(page, '/fr/docs/hoks');
    // 💡 the suggestion is a link to Home's hooks card, with the /fr prefix
    const suggestion = page.getByRole('link', { name: '/#package-hooks' });
    await expect(suggestion).toBeVisible();
    await expect(suggestion).toHaveAttribute('href', /^\/fr\/?#package-hooks$/);
  });

  test('no suggestion when nothing is close 🙅', async ({ page }) => {
    await open404(page, '/zzzzzzzz');
    await expect(page.getByText('Did you mean')).toHaveCount(0);
  });

  test('the search field opens the search drawer 🔎', async ({ page }) => {
    await open404(page, '/nope');
    // 🔎 the big field in the main pane (the app bar has its own, so scope to #main)
    await page.locator('#main').getByRole('button', { name: /Search docs/ }).click();
    // 🗄️ the drawer's search box gets the focus
    await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
  });

  test('the document never scrolls; the main pane does 📜', async ({ page }) => {
    await open404(page, '/nope');
    // 📏 the page itself is exactly one viewport tall
    const overflow = await page.evaluate(() => document.scrollingElement!.scrollHeight - window.innerHeight);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('Popular pages show in the aside on laptop 🔥', async ({ page }) => {
    await open404(page, '/nope');
    await expect(page.getByRole('complementary', { name: 'Popular pages' })).toBeVisible();
    await expect(page.getByRole('link', { name: /useMedia/ })).toHaveAttribute('href', '/#package-hooks');
  });
});


test.describe('404 on mobile 📱', () => {
  test.use({ viewport: MOBILE });

  test('the suggested rows and the bottom bar are there, no aside 📱', async ({ page }) => {
    await open404(page, '/es/nada');
    // 💡 the three suggestion rows (list), not the laptop cards
    await expect(page.getByRole('list', { name: 'Sugerencias' }).getByRole('link')).toHaveCount(3);
    // 🔥 no Popular pages pane below 1180
    await expect(page.getByRole('complementary', { name: 'Páginas populares' })).toBeHidden();
  });
});


for (const scheme of ['light', 'dark'] as const) {
  for (const [name, viewport] of [['mobile', MOBILE], ['laptop', LAPTOP]] as const) {
    test(`axe: no serious or critical issues on the 404 (${name}, ${scheme}) 🪓`, async ({ page }) => {
      // 🌗 the theme through the OS scheme + the viewport, reduced motion so axe sees the settled page
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.setViewportSize(viewport);
      await open404(page, '/docs/componnets');
      // 🪓 WCAG 2.0 / 2.1 / 2.2 A + AA
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const blocking = results.violations.filter((violation) => BLOCKING.has(violation.impact ?? ''));
      expect(blocking.map((violation) => `${violation.id} ×${violation.nodes.length}`)).toEqual([]);
    });
  }
}
