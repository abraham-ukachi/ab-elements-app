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
* @name: abElements Security Headers E2E Tests
* @file: tests/e2e/headers.spec.ts
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


// import the test helpers & the response type from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
import type { APIResponse } from '@playwright/test';


// the baseline security headers every response must carry (Playwright lower-cases header names) 🔒
const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'strict-transport-security': 'max-age=63072000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  'cross-origin-opener-policy': 'same-origin',
  'x-frame-options': 'DENY',
};

// the directives the report-only CSP must contain 🛡️
const CSP_DIRECTIVES: readonly string[] = [
  `default-src 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
];

// the routes to check, with their expected status & content type 🗺️
const ROUTES: readonly { path: string; status: number; contentType: RegExp }[] = [
  { path: '/', status: 200, contentType: /text\/html/ },
  { path: '/fr', status: 200, contentType: /text\/html/ },
  { path: '/es', status: 200, contentType: /text\/html/ },
  { path: '/ru', status: 200, contentType: /text\/html/ },
  { path: '/robots.txt', status: 200, contentType: /text\/plain/ },
  { path: '/sitemap.xml', status: 200, contentType: /application\/xml/ },
  { path: '/manifest.webmanifest', status: 200, contentType: /application\/manifest\+json/ },
];


// checks the baseline security headers, the report-only CSP & the missing X-Powered-By of `response`
const expectSecurityHeaders = (response: APIResponse): void => {
  // get the (lower-cased) response headers
  const headers = response.headers();

  // expect every baseline header with its exact value ✅
  expect(headers).toMatchObject(SECURITY_HEADERS);
  // expect no framework fingerprint 🤫
  expect(headers).not.toHaveProperty('x-powered-by');
  // report-only for now: violations are collected, nothing is blocked
  expect(headers).not.toHaveProperty('content-security-policy');
  // get the report-only policy
  const csp = headers['content-security-policy-report-only'];
  // expect it to exist with its key directives ✅
  expect(csp).toBeDefined();
  for (const directive of CSP_DIRECTIVES) expect(csp).toContain(directive);
  // production never needs `eval`
  expect(csp).not.toContain('unsafe-eval');
};


test.describe('security headers', () => {
  // one test per route 🔁
  for (const { path, status, contentType } of ROUTES) {
    test(`${path} sends the security headers`, async ({ request }) => {
      // request the route without following redirects
      const response = await request.get(path, { maxRedirects: 0 });

      // expect the right status, content type & headers ✅
      expect(response.status()).toBe(status);
      expect(response.headers()['content-type']).toMatch(contentType);
      expectSecurityHeaders(response);
    });
  }

  test('/en still redirects to / and sends the security headers', async ({ request }) => {
    // request `/en` without following the redirect
    const response = await request.get('/en', { maxRedirects: 0 });

    // expect the proxy's redirect to `/` (the default locale has no prefix) ↪️
    expect(response.status()).toBe(307);
    expect(response.headers()['location']).toBe('/');
    // expect the headers on the redirect too ✅
    expectSecurityHeaders(response);
  });

  test('the locale pages keep the proxy hreflang Link header & never set NEXT_LOCALE', async ({ request, baseURL }) => {
    // check every locale page 🌐
    for (const path of ['/', '/fr', '/es', '/ru']) {
      // request the page
      const response = await request.get(path, { maxRedirects: 0 });
      // get its `Link` header
      const link = response.headers()['link'] ?? '';

      // expect one hreflang alternate per locale + x-default ✅
      for (const [hreflang, href] of [['en', '/'], ['fr', '/fr'], ['es', '/es'], ['ru', '/ru'], ['x-default', '/']]) {
        expect(link).toContain(`<${new URL(href, baseURL)}>; rel="alternate"; hreflang="${hreflang}"`);
      }
      // expect no locale cookie on a plain visit 🍪
      expect(response.headers()['set-cookie'] ?? '').not.toContain('NEXT_LOCALE=');
    }
  });
});
