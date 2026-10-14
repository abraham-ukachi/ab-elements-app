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
* @name: abElements Splash - Unit Tests
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
import { afterEach, describe, expect, it, vi } from 'vitest';

// import the Splash gate & helpers 🚦
import {
  AB_SPLASH_ATTRIBUTE,
  AB_SPLASH_FADE_MS,
  AB_SPLASH_MAX_MS,
  AB_SPLASH_SESSION_KEY,
  AB_SPLASH_VISITED_KEY,
  abSplashGateScript,
  getAbSplashFadeMs,
  getAbSplashRemainingMs,
  waitForAbSplashReady,
} from '@/components/app/splash/splash-gate';


// a tiny in-memory Storage 🗄️
const createStorage = (init: Record<string, string> = {}) => {
  // the stored values
  const data = new Map(Object.entries(init));
  // the Storage-like API
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};

// run the gate script against a fake browser 🌐 and return the `<html>` flag + storages
const runGate = ({ standalone = false, pathname = '/', local = {}, session = {} }: {
  standalone?: boolean; pathname?: string; local?: Record<string, string>; session?: Record<string, string>;
}) => {
  // the fake `<html>` attributes
  const attrs = new Map<string, string>();
  // the fake storages
  const localStorage = createStorage(local);
  const sessionStorage = createStorage(session);
  // the fake `window`
  const window = {
    matchMedia: (q: string) => ({ matches: standalone && q.includes('standalone') }),
    navigator: {},
    location: { pathname },
    localStorage,
    sessionStorage,
  };
  // the fake `document`
  const document = { documentElement: { setAttribute: (k: string, v: string) => void attrs.set(k, v) } };
  // run the inline script with our fakes 🏃
  new Function('window', 'document', abSplashGateScript)(window, document);
  // return what we need to check
  return { flag: attrs.get(AB_SPLASH_ATTRIBUTE), localStorage, sessionStorage };
};


describe('components/app/splash gate', () => {
  it('shows on the first ever visit to a root page & remembers it', () => {
    const { flag, localStorage } = runGate({ pathname: '/fr' });
    expect(flag).toBe('on');
    expect(localStorage.getItem(AB_SPLASH_VISITED_KEY)).toBe('1');
  });

  it('shows on the first ever visit to /welcome', () => {
    expect(runGate({ pathname: '/welcome' }).flag).toBe('on');
  });

  it('never blocks a deep link in a normal tab (even on the first visit)', () => {
    const { flag, localStorage } = runGate({ pathname: '/docs/button' });
    expect(flag).toBeUndefined();
    expect(localStorage.getItem(AB_SPLASH_VISITED_KEY)).toBe('1');
  });

  it('stays hidden on later visits in a normal tab', () => {
    expect(runGate({ local: { [AB_SPLASH_VISITED_KEY]: '1' } }).flag).toBeUndefined();
  });

  it('shows on a standalone launch (even on a deep link) & marks the session', () => {
    const { flag, sessionStorage } = runGate({ standalone: true, pathname: '/docs', local: { [AB_SPLASH_VISITED_KEY]: '1' } });
    expect(flag).toBe('on');
    expect(sessionStorage.getItem(AB_SPLASH_SESSION_KEY)).toBe('1');
  });

  it('shows at most once per standalone session', () => {
    const flag = runGate({ standalone: true, local: { [AB_SPLASH_VISITED_KEY]: '1' }, session: { [AB_SPLASH_SESSION_KEY]: '1' } }).flag;
    expect(flag).toBeUndefined();
  });
});


describe('components/app/splash timing', () => {
  // restore the real timers after each test ⏰
  afterEach(() => void vi.useRealTimers());

  it('caps the wait at 1.2 s from the navigation start', () => {
    expect(AB_SPLASH_MAX_MS).toBe(1200);
    expect(getAbSplashRemainingMs(0)).toBe(1200);
    expect(getAbSplashRemainingMs(500)).toBe(700);
    expect(getAbSplashRemainingMs(5000)).toBe(0);
  });

  it('skips the fade when the user prefers reduced motion', () => {
    expect(getAbSplashFadeMs(true)).toBe(0);
    expect(getAbSplashFadeMs(false)).toBe(AB_SPLASH_FADE_MS);
  });

  it('hides as soon as the fonts are ready', async () => {
    await expect(waitForAbSplashReady(Promise.resolve(), 1200)).resolves.toBe('fonts');
  });

  it('hides on timeout when the fonts never load', async () => {
    vi.useFakeTimers();
    const ready = waitForAbSplashReady(new Promise(() => {}), 1200);
    await vi.advanceTimersByTimeAsync(1200);
    await expect(ready).resolves.toBe('timeout');
  });

  it('hides on timeout without the Font Loading API', async () => {
    vi.useFakeTimers();
    const ready = waitForAbSplashReady(undefined, 300);
    await vi.advanceTimersByTimeAsync(300);
    await expect(ready).resolves.toBe('timeout');
  });
});
