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
* @name: abElements Splash - Unit Tests (thin wrapper)
* @file: tests/unit/splash.test.ts
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

// import the packaged gate builder & CSP helper from `ab-nextjs-components` 📦
import { AB_SPLASH_ATTRIBUTE, buildAbSplashGateScript } from 'ab-nextjs-components/ab-splash/gate';
import { getAbSplashGateSha256 } from 'ab-nextjs-components/ab-splash/csp';
// import our thin wrapper 💦
import Splash, { abSplashGateScript } from '@/components/app/splash';
// import our i18n config 🌐
import { abI18nConfig } from '@/i18n/config';
// import our Next.js config (for the headers) ⚙️
import nextConfig from '../../next.config';

// NOTE: the gate's path / storage / timing tests live in ab-nextjs-components/__tests__/ab-splash.test.ts 😉

// a normal desktop browser's user agent 🖥️
const AB_TEST_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

// a tiny in-memory Storage 🗄️ (shared between visits when passed in)
const createStorage = () => {
  // the stored values
  const data = new Map<string, string>();
  // the Storage-like API
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};

// run the gate script against a fake browser 🌐 and return the `<html>` flag
const runGate = (pathname: string, {
  userAgent = AB_TEST_UA, webdriver = false, localStorage = createStorage(),
}: { userAgent?: string; webdriver?: boolean; localStorage?: ReturnType<typeof createStorage> } = {}): string | undefined => {
  // the fake `<html>` attributes
  const attrs = new Map<string, string>();
  // the fake `window` (a normal tab, not standalone)
  const window = { matchMedia: () => ({ matches: false }), navigator: { userAgent, webdriver }, location: { pathname }, localStorage, sessionStorage: createStorage() };
  // the fake `document`
  const document = { documentElement: { setAttribute: (k: string, v: string) => void attrs.set(k, v) } };
  // run the inline script with our fakes 🏃
  new Function('window', 'document', 'navigator', abSplashGateScript)(window, document, window.navigator);
  // return the flag
  return attrs.get(AB_SPLASH_ATTRIBUTE);
};

// get the main Content-Security-Policy-Report-Only value from our Next.js config 🛡️
const getMainCsp = async (): Promise<string[]> => {
  // all the header groups
  const groups = (await nextConfig.headers?.()) ?? [];
  // every CSP report-only value
  return groups.flatMap((g) => g.headers).filter((h) => h.key === 'Content-Security-Policy-Report-Only').map((h) => h.value);
};


describe('components/app/splash (thin wrapper)', () => {
  it('re-exports the packaged AbSplash as the default', () => {
    expect(typeof Splash).toBe('function');
  });

  it('builds the gate from the app locales (minus the default)', () => {
    expect(abSplashGateScript).toBe(buildAbSplashGateScript({ locales: abI18nConfig.locales, defaultLocale: abI18nConfig.defaultLocale }));
  });

  it('shows on the first visit to `/` and every non-default locale root', () => {
    for (const path of ['/', '/fr', '/es/', '/ru', '/welcome']) expect(runGate(path)).toBe('on');
  });

  it('never blocks a deep link on the first visit', () => {
    expect(runGate('/docs/button')).toBeUndefined();
  });

  it('never shows on the default locale prefix (`/en`, `/en/welcome`) 🇬🇧', () => {
    for (const path of ['/en', '/en/', '/en/welcome']) expect(runGate(path)).toBeUndefined();
  });

  it('never shows for bots or automation (crawler UA, headless, `navigator.webdriver`) 🤖', () => {
    expect(runGate('/', { userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' })).toBeUndefined();
    expect(runGate('/', { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36' })).toBeUndefined();
    expect(runGate('/', { webdriver: true })).toBeUndefined();
  });

  it('shows on the first visit only, not on the second (same localStorage) 👣', () => {
    const localStorage = createStorage();
    expect(runGate('/', { localStorage })).toBe('on');
    expect(runGate('/', { localStorage })).toBeUndefined();
    expect(runGate('/fr', { localStorage })).toBeUndefined();
  });

  it('keeps the gate hash OUT of the main CSP (`unsafe-inline` must keep working) 🔐', async () => {
    const policies = await getMainCsp();
    expect(policies).toHaveLength(1);
    expect(policies[0]).toContain(`script-src 'self' 'unsafe-inline'`);
    expect(policies[0]).not.toContain(getAbSplashGateSha256(abSplashGateScript));
    expect(policies[0]).not.toContain('sha256-');
  });
});
