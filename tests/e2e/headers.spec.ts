/*
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
*
* @project: ab-elements-app
* @name: abElements Security Headers E2E Tests
* @file: tests/e2e/headers.spec.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
*
* Example usage:
*   1+|> pnpm build && pnpm test:e2e
*
*/


import { expect, test } from '@playwright/test';
import type { APIResponse } from '@playwright/test';


// the baseline security headers every response must carry (Playwright lower-cases header names)
const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'strict-transport-security': 'max-age=63072000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  'cross-origin-opener-policy': 'same-origin',
  'x-frame-options': 'DENY',
};

// the directives the report-only CSP must contain
const CSP_DIRECTIVES: readonly string[] = [
  `default-src 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
];

// the routes to check, with their expected status & content type
const ROUTES: readonly { path: string; status: number; contentType: RegExp }[] = [
  { path: '/', status: 200, contentType: /text\/html/ },
  { path: '/fr', status: 200, contentType: /text\/html/ },
  { path: '/es', status: 200, contentType: /text\/html/ },
  { path: '/ru', status: 200, contentType: /text\/html/ },
  { path: '/robots.txt', status: 200, contentType: /text\/plain/ },
  { path: '/sitemap.xml', status: 200, contentType: /application\/xml/ },
  { path: '/manifest.webmanifest', status: 200, contentType: /application\/manifest\+json/ },
];


// checks the baseline security headers & the report-only CSP of `response`
const expectSecurityHeaders = (response: APIResponse): void => {
  const headers = response.headers();

  expect(headers).toMatchObject(SECURITY_HEADERS);
  expect(headers).not.toHaveProperty('x-powered-by');
  // report-only for now: violations are collected, nothing is blocked
  expect(headers).not.toHaveProperty('content-security-policy');
  const csp = headers['content-security-policy-report-only'];
  expect(csp).toBeDefined();
  for (const directive of CSP_DIRECTIVES) expect(csp).toContain(directive);
  // production never needs `eval`
  expect(csp).not.toContain('unsafe-eval');
};


test.describe('security headers', () => {
  for (const { path, status, contentType } of ROUTES) {
    test(`${path} sends the security headers`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });

      expect(response.status()).toBe(status);
      expect(response.headers()['content-type']).toMatch(contentType);
      expectSecurityHeaders(response);
    });
  }

  test('/en still redirects to / and sends the security headers', async ({ request }) => {
    const response = await request.get('/en', { maxRedirects: 0 });

    expect(response.status()).toBe(307);
    expect(response.headers()['location']).toBe('/');
    expectSecurityHeaders(response);
  });

  test('the locale pages keep the proxy hreflang Link header & never set NEXT_LOCALE', async ({ request, baseURL }) => {
    for (const path of ['/', '/fr', '/es', '/ru']) {
      const response = await request.get(path, { maxRedirects: 0 });
      const link = response.headers()['link'] ?? '';

      for (const [hreflang, href] of [['en', '/'], ['fr', '/fr'], ['es', '/es'], ['ru', '/ru'], ['x-default', '/']]) {
        expect(link).toContain(`<${new URL(href, baseURL)}>; rel="alternate"; hreflang="${hreflang}"`);
      }
      expect(response.headers()['set-cookie'] ?? '').not.toContain('NEXT_LOCALE=');
    }
  });
});
