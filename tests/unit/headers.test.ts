/*
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
*
* @project: ab-elements-app
* @name: abElements Security Headers Tests
* @file: tests/unit/headers.test.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
*
* Example usage:
*   1+|> pnpm test
*
*/


import { describe, expect, it } from 'vitest';

import nextConfig from '@/next.config';
import { StaticMetadata } from '@/app/metadata';


// the `headers()` rules of next.config.ts (the config is wrapped by `withAbI18n`)
const getRules = async () => {
  expect(nextConfig.headers).toBeTypeOf('function');
  return nextConfig.headers!();
};

// the headers of the catch-all rule as a `{ name: value }` record
const getSecurityHeaders = async (): Promise<Record<string, string>> => {
  const rule = (await getRules()).find(({ source }) => source === '/:path*');
  expect(rule).toBeDefined();
  return Object.fromEntries(rule!.headers.map(({ key, value }) => [key, value]));
};


describe('next.config headers()', () => {
  it('sends one rule for every path', async () => {
    const rules = await getRules();

    expect(rules).toHaveLength(1);
    expect(rules[0].source).toBe('/:path*');
  });

  it('matches the baseline security headers snapshot', async () => {
    expect(await getSecurityHeaders()).toMatchInlineSnapshot(`
      {
        "Content-Security-Policy-Report-Only": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      }
    `);
  });

  it('only reports CSP violations (no enforced policy yet)', async () => {
    const headers = await getSecurityHeaders();

    expect(headers).not.toHaveProperty('Content-Security-Policy');
    expect(headers['Content-Security-Policy-Report-Only']).not.toContain('unsafe-eval');
  });

  it('turns off the X-Powered-By header', () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it('keeps the metadata referrer in line with the Referrer-Policy header', async () => {
    const headers = await getSecurityHeaders();

    expect(StaticMetadata.referrer).toBe(headers['Referrer-Policy']);
  });
});
