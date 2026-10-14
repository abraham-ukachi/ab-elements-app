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
* @name: abElements Proxy (Next.js)
* @file: proxy.ts
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


// Next.js 16 proxy (formerly middleware): locale detection and redirects (it reads NEXT_LOCALE, never writes it),
// plus the Welcome gate 🎬 (first visit of the home page → the localized `/welcome`).
// import the response helper & the request type from `next/server`
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import the i18n proxy factory from `ab-nextjs-i18n`
import { createAbI18nProxy } from 'ab-nextjs-i18n/proxy';
// import the locale helpers from `ab-nextjs-i18n` 🌍
import { getAbLocaleFromPathname, isAbLocale, localizeAbPathname, stripAbLocalePrefix } from 'ab-nextjs-i18n/config';
// import the crawler / preview / headless user-agent pattern (shared with the Splash gate) from `ab-nextjs-components` 🤖
import { AB_SPLASH_BOT_PATTERN } from 'ab-nextjs-components/ab-splash/gate';
// import abElements' i18n config
import abI18nConfig from './i18n/config';


// ===== WELCOME GATE 🎬 ===== //

// the hello cookie written by `toggleAppHello` (`ab-nextjs-hooks/server/useAbApp`) 🍪
export const WELCOME_COOKIE = 'AB_APP_HELLO';
// the (unlocalized) Welcome path 🚪
export const WELCOME_PATH = '/welcome';
// the crawler regex, built once (case-insensitive) 🤖
const botPattern = new RegExp(AB_SPLASH_BOT_PATTERN, 'i');


/**
 * `getRequestLocale` 🌍
 *
 * The locale of a request: URL prefix ?? saved pick (validated) ?? default locale.
 *
 * @param { NextRequest } request - the incoming request
 * @returns { string } - one of our locales
 */
function getRequestLocale(request: NextRequest): string {
  // the locale cookie config (NEXT_LOCALE)
  const { localeCookie } = abI18nConfig;
  // the visitor's saved pick (if any)
  const saved = localeCookie ? request.cookies.get(localeCookie.name)?.value : undefined;
  // prefix first, then the (valid) saved pick, then the default locale
  return (
    getAbLocaleFromPathname(request.nextUrl.pathname, abI18nConfig) ??
    (isAbLocale(abI18nConfig, saved) ? saved : undefined) ??
    abI18nConfig.defaultLocale
  );
}


/**
 * `shouldShowWelcome` 🎬❓
 *
 * True ONLY when every rule holds:
 *  1. the path (after the locale strip) is the home page `/` (deep links never redirect 🔗),
 *  2. it's a document navigation (`sec-fetch-dest: document`, so no RSC / prefetch / fetch),
 *  3. the hello cookie isn't `'true'` 🍪,
 *  4. the user agent isn't a crawler 🤖.
 *
 * @param { NextRequest } request - the incoming request
 * @returns { boolean }
 */
export function shouldShowWelcome(request: NextRequest): boolean {
  // 1. 🏠 the home page only (`/`, `/fr`, `/es/`...)
  if (stripAbLocalePrefix(request.nextUrl.pathname, abI18nConfig) !== '/') return false;
  // 2. 📄 a real document navigation only
  if (request.headers.get('sec-fetch-dest') !== 'document') return false;
  // 3. 🍪 not once the visitor said hello
  if (request.cookies.get(WELCOME_COOKIE)?.value === 'true') return false;
  // 4. 🤖 never for crawlers, previews or headless tools
  if (botPattern.test(request.headers.get('user-agent') ?? '')) return false;
  // ✅ all rules hold: show the Welcome
  return true;
}


/**
 * `welcomeGate` 🚦
 *
 * Redirects (307) to the localized `/welcome` when `shouldShowWelcome` says so, else does nothing.
 * Cookie read only: no DB, no new infrastructure.
 *
 * @param { NextRequest } request - the incoming request
 * @returns { NextResponse | undefined } - the redirect, or `undefined` to let the i18n proxy run
 */
export function welcomeGate(request: NextRequest): NextResponse | undefined {
  // nothing to do ? let the i18n proxy handle it 🙌
  if (!shouldShowWelcome(request)) return undefined;
  // the localized Welcome URL (`/welcome`, `/fr/welcome`...) 🌍
  const target = new URL(localizeAbPathname(WELCOME_PATH, getRequestLocale(request), abI18nConfig), request.url);
  // 307: a temporary redirect (the home page stays the canonical one 🔎)
  return NextResponse.redirect(target, 307);
}


// create and export the i18n proxy (with the Welcome gate first 🎬) as default 🌐
export default createAbI18nProxy(abI18nConfig, { onRequest: welcomeGate });

// create and export the proxy config (where it runs)
export const config = {
  // Everything except API routes, Next.js / Vercel internals and files with an extension.
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
