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
* @name: abElements Welcome Gate E2E Tests
* @file: tests/e2e/welcome-gate.spec.ts
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


// 🚦 Welcome gate e2e: who lands on `/welcome` (first visits), and who never does
// (returning visitors, deep links, bots / webdriver, non-document requests).

// import the test helpers from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
// import the shared Welcome helpers 🧰
import { BOT_UA, HEADLESS_UA, REAL_UA, SLIDE_COUNT } from './welcome-helpers';


// a first-visit document navigation, as a real browser sends it 📄
const DOCUMENT_HEADERS = { 'user-agent': REAL_UA, 'sec-fetch-dest': 'document' } as const;
// one year, in seconds (the Get Started cookie lifetime) 📅
const ONE_YEAR = 60 * 60 * 24 * 365;


test.describe('Welcome gate (HTTP) 🚦', () => {
  // the home page of every locale → its localized Welcome 🌍
  for (const [path, target] of [['/', '/welcome'], ['/fr', '/fr/welcome'], ['/es', '/es/welcome'], ['/ru', '/ru/welcome']]) {
    test(`a first visit to ${path} redirects 307 to ${target}`, async ({ request }) => {
      // request the home page like a first-time browser (no redirect following)
      const response = await request.get(path, { headers: DOCUMENT_HEADERS, maxRedirects: 0 });

      // expect a temporary redirect to the localized Welcome ↪️
      expect(response.status()).toBe(307);
      expect(new URL(response.headers()['location'], 'http://x').pathname).toBe(target);
    });
  }

  test('returning visitors (`AB_APP_HELLO=true`) are never redirected 🍪', async ({ request }) => {
    // check every locale's home page
    for (const path of ['/', '/fr', '/es', '/ru']) {
      // same first-visit request, plus the hello cookie
      const response = await request.get(path, { headers: { ...DOCUMENT_HEADERS, cookie: 'AB_APP_HELLO=true' }, maxRedirects: 0 });
      // expect the home page itself ✅
      expect(response.status(), path).toBe(200);
    }
  });

  test('deep links never redirect 🔗', async ({ request }) => {
    // deep links (existing or not) & the Welcome itself
    for (const path of ['/docs', '/fr/docs/button', '/welcome', '/ru/welcome', '/robots.txt']) {
      // a first-visit document request
      const response = await request.get(path, { headers: DOCUMENT_HEADERS, maxRedirects: 0 });
      // expect no redirect at all (a page or a 404, never a 307 to the Welcome) 🙅
      expect(response.status(), path).not.toBe(307);
      expect(response.headers()['location'] ?? '', path).not.toContain('/welcome');
    }
  });

  test('bots & headless browsers are never redirected 🤖', async ({ request }) => {
    // crawler + headless user agents
    for (const ua of [BOT_UA, HEADLESS_UA]) {
      // a document request with that user agent
      const response = await request.get('/', { headers: { ...DOCUMENT_HEADERS, 'user-agent': ua }, maxRedirects: 0 });
      // expect the home page ✅
      expect(response.status(), ua).toBe(200);
    }
  });

  test('requests without `sec-fetch-dest: document` are never redirected 📄', async ({ request }) => {
    // RSC / fetch (`empty`), an iframe, and no header at all
    for (const dest of ['empty', 'iframe', null]) {
      // build the headers (omit `sec-fetch-dest` for `null`)
      const headers: Record<string, string> = { 'user-agent': REAL_UA };
      if (dest) headers['sec-fetch-dest'] = dest;
      // request the home page
      const response = await request.get('/', { headers, maxRedirects: 0 });
      // expect the home page ✅
      expect(response.status(), String(dest)).toBe(200);
    }
  });
});


test.describe('Welcome gate (browser) 🌐', () => {
  // a real (non-headless) user agent, so the gate treats the browser as a visitor 🖥️
  test.use({ userAgent: REAL_UA });

  test('first visit → Welcome → Get Started sets a 1-year cookie → home, and stays home 🍪', async ({ page, context }) => {
    // 1. a first visit of `/` lands on the Welcome 🎬
    await page.goto('/');
    await expect(page).toHaveURL(/\/welcome$/);

    // 2. jump to the last slide & press Get Started 🚀
    await page.goto(`/welcome?s=${SLIDE_COUNT}`);
    await page.getByRole('button', { name: 'Get Started' }).click();

    // 3. back home ↩️
    await expect(page).toHaveURL(/\/$/);
    // the hello cookie is `true` with ~1 year of life (± 1 day) 📅
    const hello = (await context.cookies()).find((cookie) => cookie.name === 'AB_APP_HELLO');
    expect(hello?.value).toBe('true');
    const lifetime = (hello?.expires ?? 0) - Date.now() / 1000;
    expect(lifetime).toBeGreaterThan(ONE_YEAR - 86_400);
    expect(lifetime).toBeLessThan(ONE_YEAR + 86_400);

    // 4. a revisit of `/` stays on the home page 🏠
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
  });

  test('Get Started keeps the locale (`/fr/welcome` → `/fr`) 🌍', async ({ page }) => {
    // the French last slide
    await page.goto(`/fr/welcome?s=${SLIDE_COUNT}`);
    // press "Commencer"
    await page.getByRole('button', { name: 'Commencer' }).click();
    // expect the French home page ✅
    await expect(page).toHaveURL(/\/fr$/);
  });

  test('a deep link opened in the browser never redirects 🔗', async ({ page }) => {
    // open a deep link on a first visit
    await page.goto('/fr/docs');
    // expect to stay on it (whatever it renders) 🙅
    await expect(page).toHaveURL(/\/fr\/docs$/);
  });
});


test.describe('Welcome gate (webdriver / headless) 👻', () => {
  // Playwright's default headless user agent + `navigator.webdriver` (no `userAgent` override)
  test('a headless webdriver browser is never sent to the Welcome', async ({ page }) => {
    // make sure we really are an automated browser 🤖
    await page.goto('/robots.txt');
    expect(await page.evaluate(() => navigator.webdriver)).toBe(true);
    // open the home page
    await page.goto('/');
    // expect to stay home ✅
    await expect(page).toHaveURL(/\/$/);
  });
});
