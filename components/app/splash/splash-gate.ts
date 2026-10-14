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
* @name: abElements Splash - Gate
* @file: components/app/splash/splash-gate.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> import { abSplashGateScript, waitForAbSplashReady } from '@/components/app/splash/splash-gate';
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// the `<html>` data attribute that turns the Splash on (set by the gate script, before the first paint ⚡️)
export const AB_SPLASH_ATTRIBUTE = 'data-ab-splash';
// the localStorage key that remembers the first ever visit 👣
export const AB_SPLASH_VISITED_KEY = 'ab-splash-visited';
// the sessionStorage key that remembers the Splash was shown in this (standalone) session 📱
export const AB_SPLASH_SESSION_KEY = 'ab-splash-session';
// the Splash never stays longer than this (in ms) ⏱️
export const AB_SPLASH_MAX_MS = 1200;
// the fade-out duration (in ms), when motion is allowed 🌫️
export const AB_SPLASH_FADE_MS = 200;


/**
 * `abSplashGateScript` 🚦
 *
 * An inline script for the `<head>` (next to the theme script) that decides, before the first paint,
 * whether the Splash shows. It shows on:
 *   - a **standalone** (installed PWA) launch, once per session 📱
 *   - the **first ever visit**, but only on a root page (`/`, `/fr`, `/welcome`...), so deep links are never blocked 🔗
 * With JS off it never runs, so the Splash stays hidden (CSS default) 🙈
 */
export const abSplashGateScript: string = `(function () {
  try {
    var root = document.documentElement;
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    var isRootPage = /^(\\/[a-z]{2}(-[A-Za-z]{2})?)?(\\/welcome)?\\/?$/.test(window.location.pathname);
    var show = false;
    if (isStandalone) {
      if (!window.sessionStorage.getItem('${AB_SPLASH_SESSION_KEY}')) show = true;
      window.sessionStorage.setItem('${AB_SPLASH_SESSION_KEY}', '1');
    }
    if (!window.localStorage.getItem('${AB_SPLASH_VISITED_KEY}')) {
      if (isRootPage) show = true;
      window.localStorage.setItem('${AB_SPLASH_VISITED_KEY}', '1');
    }
    if (show) root.setAttribute('${AB_SPLASH_ATTRIBUTE}', 'on');
  } catch (e) {}
})();`;


/**
 * `getAbSplashRemainingMs` ⏳
 *
 * How long the Splash may still wait, given the time already spent since the navigation started.
 *
 * @param { number } elapsedMs - the time since the navigation started (e.g. `performance.now()`)
 * @param { number } [maxMs] - the max Splash duration (defaults to `AB_SPLASH_MAX_MS`)
 * @returns { number } - the remaining time in ms (never negative)
 */
export function getAbSplashRemainingMs(elapsedMs: number, maxMs: number = AB_SPLASH_MAX_MS): number {
  // never below 0, never above the max 😉
  return Math.min(maxMs, Math.max(0, maxMs - elapsedMs));
}


/**
 * `getAbSplashFadeMs` 🌫️
 *
 * The fade-out duration: none when the user prefers reduced motion ♿️.
 *
 * @param { boolean } prefersReducedMotion - whether `(prefers-reduced-motion: reduce)` matches
 * @returns { number } - the fade duration in ms
 */
export function getAbSplashFadeMs(prefersReducedMotion: boolean): number {
  // reduced motion => hide at once 🚫🎞️
  return prefersReducedMotion ? 0 : AB_SPLASH_FADE_MS;
}


/**
 * `waitForAbSplashReady` ✅
 *
 * Resolves when the fonts are ready, or when the timeout runs out (whichever comes first).
 *
 * @param { Promise<unknown> | undefined } fontsReady - e.g. `document.fonts.ready` (may be missing)
 * @param { number } timeoutMs - the max wait (see `getAbSplashRemainingMs`)
 * @returns { Promise<'fonts' | 'timeout'> } - why the wait ended
 */
export function waitForAbSplashReady(fontsReady: Promise<unknown> | undefined, timeoutMs: number): Promise<'fonts' | 'timeout'> {
  // the timeout racer ⏱️
  const timeout = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), timeoutMs));
  // no Font Loading API? just wait for the timeout 🤷
  if (!fontsReady) return timeout;
  // the fonts racer 🔤 (a failing font load counts as "ready" too)
  const fonts = fontsReady.then(() => 'fonts' as const, () => 'fonts' as const);
  // first one wins 🏁
  return Promise.race([fonts, timeout]);
}
