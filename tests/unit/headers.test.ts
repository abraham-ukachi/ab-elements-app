/* 
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
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
* @name: abElements Security Headers Tests
* @file: tests/unit/headers.test.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';

// import abElements' Next.js config & root static metadata
import nextConfig from '@/next.config';
import { StaticMetadata } from '@/app/metadata';


// get the `headers()` rules of next.config.ts (the config is wrapped by `withAbI18n`)
const getRules = async () => {
  // expect `headers()` to survive the i18n plugin ✅
  expect(nextConfig.headers).toBeTypeOf('function');
  // return its rules
  return nextConfig.headers!();
};

// get the headers of the catch-all rule as a `{ name: value }` record 🔒
const getSecurityHeaders = async (): Promise<Record<string, string>> => {
  // find the rule for every path
  const rule = (await getRules()).find(({ source }) => source === '/:path*');
  // expect it to exist ✅
  expect(rule).toBeDefined();
  // turn its `{ key, value }` list into a record
  return Object.fromEntries(rule!.headers.map(({ key, value }) => [key, value]));
};


describe('next.config headers()', () => {
  it('sends one rule for every path', async () => {
    // get the rules
    const rules = await getRules();

    // expect a single catch-all rule ✅
    expect(rules).toHaveLength(1);
    expect(rules[0].source).toBe('/:path*');
  });

  it('matches the baseline security headers snapshot', async () => {
    // expect the exact header values 📸
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
    // get the security headers
    const headers = await getSecurityHeaders();

    // expect no enforced CSP & no `eval` outside dev ✅
    expect(headers).not.toHaveProperty('Content-Security-Policy');
    expect(headers['Content-Security-Policy-Report-Only']).not.toContain('unsafe-eval');
  });

  it('turns off the X-Powered-By header', () => {
    // expect `poweredByHeader: false` 🤫
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it('keeps the metadata referrer in line with the Referrer-Policy header', async () => {
    // get the security headers
    const headers = await getSecurityHeaders();

    // expect the `<meta name="referrer">` to match the header (the meta tag wins in the browser) ✅
    expect(StaticMetadata.referrer).toBe(headers['Referrer-Policy']);
  });
});
