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
* @name: abElements Welcome Gate Tests
* @file: tests/unit/welcome-gate.test.ts
* @type: TypeScript (Vitest)
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


// 🧪 Welcome gate (proxy.ts): who gets redirected to `/welcome`, and who never does.

// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';
// import the request class from `next/server`
import { NextRequest } from 'next/server';
// import the gate pieces from our proxy 🚦
import proxy, { WELCOME_COOKIE, shouldShowWelcome, welcomeGate } from '../../proxy';


// a normal desktop browser's user agent 🖥️
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
// Googlebot's user agent 🤖
const BOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

// build a request: a first-visit document navigation by default 🧱
const request = (path: string, {
  dest = 'document', cookie, ua = UA, locale,
}: { dest?: string | null; cookie?: string; ua?: string; locale?: string } = {}): NextRequest => {
  // the request headers
  const headers = new Headers({ 'user-agent': ua });
  // the fetch destination (omitted for `null`)
  if (dest) headers.set('sec-fetch-dest', dest);
  // the cookies (hello + saved locale pick)
  const cookies = [cookie !== undefined ? `${WELCOME_COOKIE}=${cookie}` : '', locale ? `NEXT_LOCALE=${locale}` : ''].filter(Boolean);
  // set them, if any 🍪
  if (cookies.length) headers.set('cookie', cookies.join('; '));
  // the request 📨
  return new NextRequest(new URL(path, 'https://ab-elements.test'), { headers });
};


describe('proxy.ts: the Welcome gate 🎬', () => {
  it('redirects (307) a first visit of `/` to `/welcome`', () => {
    const res = welcomeGate(request('/'));
    expect(res?.status).toBe(307);
    expect(new URL(res!.headers.get('location')!).pathname).toBe('/welcome');
  });

  it('keeps the locale of the URL prefix (`/fr` → `/fr/welcome`, `/es/` → `/es/welcome`) 🌍', () => {
    expect(new URL(welcomeGate(request('/fr'))!.headers.get('location')!).pathname).toBe('/fr/welcome');
    expect(new URL(welcomeGate(request('/es/'))!.headers.get('location')!).pathname).toBe('/es/welcome');
  });

  it('uses the saved locale pick on `/` (NEXT_LOCALE=ru → `/ru/welcome`)', () => {
    expect(new URL(welcomeGate(request('/', { locale: 'ru' }))!.headers.get('location')!).pathname).toBe('/ru/welcome');
  });

  it('never redirects deep links (`/docs`, `/fr/docs/button`) or the Welcome itself 🔗', () => {
    for (const path of ['/docs', '/fr/docs/button', '/welcome', '/fr/welcome']) expect(shouldShowWelcome(request(path))).toBe(false);
  });

  it('never redirects RSC / prefetch / fetch requests (not `sec-fetch-dest: document`) 📄', () => {
    expect(shouldShowWelcome(request('/', { dest: 'empty' }))).toBe(false);
    expect(shouldShowWelcome(request('/', { dest: null }))).toBe(false);
  });

  it('never redirects once the visitor said hello (`AB_APP_HELLO=true`) 🍪', () => {
    expect(shouldShowWelcome(request('/', { cookie: 'true' }))).toBe(false);
    expect(shouldShowWelcome(request('/fr', { cookie: 'true' }))).toBe(false);
  });

  it('still redirects when the cookie is anything but `true`', () => {
    expect(shouldShowWelcome(request('/', { cookie: 'false' }))).toBe(true);
  });

  it('never redirects crawlers or headless tools 🤖', () => {
    expect(shouldShowWelcome(request('/', { ua: BOT }))).toBe(false);
    expect(shouldShowWelcome(request('/', { ua: UA.replace('Chrome', 'HeadlessChrome') }))).toBe(false);
  });

  it('runs first in the default proxy (and lets the i18n proxy handle everything else)', async () => {
    const first = await proxy(request('/'));
    expect(first.status).toBe(307);
    expect(new URL(first.headers.get('location')!).pathname).toBe('/welcome');
    const deep = await proxy(request('/docs'));
    expect(new URL(deep.headers.get('location') ?? 'https://x/none').pathname).not.toBe('/welcome');
  });
});
