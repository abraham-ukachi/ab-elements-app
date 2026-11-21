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
* @name: search locale route
* @file: app/api/search/[locale]/route.ts
* @type: route
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> GET /api/search/fr  # → the French zbsearch snapshot 🔎
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🔎 Static per-locale search snapshots (0.2.30). prebuild writes `data/search/<locale>.json`.
//    This route only reads that file. It does not import zbsearch, so the engine stays out of the client bundle
//    and out of the server function. Same-origin `fetch('/api/search/<locale>')` matches `connect-src 'self'`.
//    A later Cmd/Ctrl+K handler uses this same URL; nothing here depends on which control opened search ⌨️.

// import the file reader 📁
import { readFileSync } from 'node:fs';
// import the locale guard and the snapshot path (no zbsearch) 🌍
import { SEARCH_LOCALES, isSearchLocale, searchSnapshotPath } from '@/lib/search-meta';


// 🧊 one static JSON file per locale, generated at build time
export const dynamic = 'force-static';

// 🚫 a locale outside the four is an unmatched URL
export const dynamicParams = false;

// 🧊 never revalidate (the next build writes a new file)
export const revalidate = false;


// 🧾 the route params (Next.js 16: a Promise)
type SearchRouteParams = Readonly<{ params: Promise<{ locale: string }> }>;


/**
 * `generateStaticParams` - `/api/search/en|fr|es|ru` 🌍
 *
 * @returns { { locale: string }[] }
 */
export function generateStaticParams(): { locale: string }[] {
  // 🌍 one param per configured locale
  return SEARCH_LOCALES.map((locale) => ({ locale }));
}


/**
 * `GET` - the locale snapshot 🔎
 *
 * @param { Request } _request
 * @param { SearchRouteParams } context
 * @returns { Promise<Response> }
 */
export function GET(_request: Request, context: SearchRouteParams): Promise<Response> {
  // 🌍 the locale, then the file
  return context.params.then(({ locale }) => {
    // 🚫 not one of the four
    if (!isSearchLocale(locale)) return new Response('Not found', { status: 404 });
    // 📖 the snapshot prebuild wrote
    let body = '';
    try {
      body = readFileSync(searchSnapshotPath(process.cwd(), locale), 'utf8');
    } catch {
      // 🚫 `pnpm search:index` has not run (prebuild writes the file before `next build`)
      return new Response('Not found', { status: 404 });
    }
    // 📦 JSON. A short cache: the URL is stable across deploys, so it is not immutable.
    return new Response(body, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
        'x-content-type-options': 'nosniff',
      },
    });
  });
}
