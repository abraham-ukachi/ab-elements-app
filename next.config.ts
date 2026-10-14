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
* @name: Next Configuration File
* @file: next.config.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> 
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// NEXT types
import type { NextConfig } from 'next';
// import the i18n plugin from `ab-nextjs-i18n`
import { withAbI18n } from 'ab-nextjs-i18n/plugin';


// `true` under `next dev` (React needs `eval` there to rebuild server error stacks in the browser)
const isDev: boolean = process.env.NODE_ENV === 'development';


// create abElements' report-only Content Security Policy as `contentSecurityPolicy`
// NOTE: static tier of PLAN.md D13, no nonce (a nonce would make every page dynamic).
//       `'unsafe-inline'` covers Next.js' inline scripts and the theme script until the
//       policy is enforced (0.2.53); `upgrade-insecure-requests` is added then too
//       (browsers ignore it in a report-only policy).
const contentSecurityPolicy: string = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? ` 'unsafe-eval'` : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self'`,
  `connect-src 'self'`,
  `manifest-src 'self'`,
  `worker-src 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join('; ');


// create abElements' baseline security headers as `securityHeaders` (PLAN.md §3.10)
const securityHeaders: { key: string; value: string }[] = [
  // two years; `preload` waits for the final custom domain
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
];


// create abElements' Next.js config as `nextConfig`
const nextConfig: NextConfig = {
  // the Ab packages ship TypeScript sources, so let Next.js compile them
  // (`withAbI18n` also adds `ab-nextjs-i18n` to this list)
  transpilePackages: [
    'ab-nextjs-fonts',
    'ab-nextjs-icons',
    'ab-nextjs-animations',
    'ab-nextjs-theme',
    'ab-nextjs-hooks',
    'ab-nextjs-core',
    'ab-nextjs-components',
  ],
  // don't send the `X-Powered-By: Next.js` header
  poweredByHeader: false,

  /* Experimental */
  experimental: {
    // root 404 for unmatched URLs when the root layout is under `app/[locale]`
    globalNotFound: true,
  },

  // send the security headers with every response (pages, redirects, robots, sitemap, manifest, assets)
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};


// export the config, wrapped with the i18n plugin, as default 🌐
export default withAbI18n(nextConfig);
