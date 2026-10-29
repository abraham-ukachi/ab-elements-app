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
import type { Page } from '@playwright/test';
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


test.describe('Welcome gate (JavaScript disabled) 🚫📜', () => {
  // a real visitor with JavaScript OFF: Get Started is a plain `<form action>` POST ♿
  test.use({ userAgent: REAL_UA, javaScriptEnabled: false });

  test('Get Started POSTs, sets the 1-year cookie and lands on `/` 🍪', async ({ page, context }) => {
    // a first visit of `/` still lands on the Welcome (the gate is server-side) 🎬
    await page.goto('/');
    await expect(page).toHaveURL(/\/welcome$/);

    // open s10 & catch the POST the button sends 📮
    await page.goto(`/welcome?s=${SLIDE_COUNT}`);
    const post = page.waitForRequest((request) => request.method() === 'POST');
    await page.getByRole('button', { name: 'Get Started' }).click();
    expect((await post).method()).toBe('POST');

    // back home ↩️
    await expect(page).toHaveURL(/\/$/);
    // the hello cookie is `true` with ~1 year of life (± 1 day) 📅
    const hello = (await context.cookies()).find((cookie) => cookie.name === 'AB_APP_HELLO');
    expect(hello?.value).toBe('true');
    const lifetime = (hello?.expires ?? 0) - Date.now() / 1000;
    expect(lifetime).toBeGreaterThan(ONE_YEAR - 86_400);
    expect(lifetime).toBeLessThan(ONE_YEAR + 86_400);

    // a revisit of `/` stays home 🏠
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
  });
});


test.describe('Splash & Welcome on a first visit 💦🎬', () => {
  // a real visitor (the Splash gate skips `navigator.webdriver`, so we hide it like a normal browser) 🖥️
  test.use({ userAgent: REAL_UA });

  test.beforeEach(async ({ context }) => {
    // before any page script: hide webdriver & count every time the Splash turns on (across loads) 🔢
    await context.addInitScript(() => {
      // look like a normal browser to the Splash gate 🕶️
      Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false, configurable: true });
      // bump a session counter whenever `<html data-ab-splash="on">` appears 💦
      const bump = () => sessionStorage.setItem('e2e-splash-shows', String(Number(sessionStorage.getItem('e2e-splash-shows') ?? 0) + 1));
      new MutationObserver((records) => {
        for (const record of records) {
          const html = record.target as Element;
          if (record.attributeName === 'data-ab-splash' && html.getAttribute('data-ab-splash') === 'on' && record.oldValue !== 'on') bump();
        }
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-ab-splash'], attributeOldValue: true });
    });
  });

  // read the Splash show count of this tab 📊
  const splashShows = (page: Page) => page.evaluate(() => Number(sessionStorage.getItem('e2e-splash-shows') ?? 0));

  test('the Splash shows once, the Welcome once, and neither comes back 🙅', async ({ page }) => {
    // 1. first visit of `/` → the Welcome, with ONE Splash on top 🎬💦
    await page.goto('/');
    await expect(page).toHaveURL(/\/welcome$/);
    await expect.poll(() => splashShows(page)).toBe(1);
    // the Splash hands over to the Welcome (the attribute goes away) 👋
    await expect(page.locator('html[data-ab-splash]')).toHaveCount(0, { timeout: 5_000 });
    await expect(page.locator('[data-ab-part="carousel"]')).toBeVisible();

    // 2. a reload of the Welcome: no second Splash 🔁
    await page.reload();
    await expect(page.locator('[data-ab-part="carousel"]')).toBeVisible();
    expect(await splashShows(page)).toBe(1);

    // 3. Get Started → home: no Splash and no Welcome again 🏠
    await page.goto(`/welcome?s=${SLIDE_COUNT}`);
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
    expect(await splashShows(page)).toBe(1);
  });
});
