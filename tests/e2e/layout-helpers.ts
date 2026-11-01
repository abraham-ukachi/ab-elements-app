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
* @name: abElements Layout rules - e2e helpers
* @file: tests/e2e/layout-helpers.ts
* @type: TypeScript (Playwright)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> import { openPage, WIDTHS } from './layout-helpers';
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📐 Shared helpers for the layout-rule suites (0.2.23): the widths & themes, the pages under test, a Splash-free
//    `openPage`, and small DOM probes (a pane's box, its scroll state, the document's scroll) 🧰.
// The rule under test (core 0.1.6+): the page never scrolls; header · main · aside are the only page slots; main,
// aside & sidebar scroll on their own; an empty slot measures 0px; drawers open INSIDE their scope 🧱.

// import the expect helper & the page type from `@playwright/test` 🎭
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';


// ===== WIDTHS & THEMES 📏🌗 ===== //

// the five Playwright widths of the plan (mobile · tablet · laptop · laptop+ · desktop), 800px tall
export const WIDTHS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1180, height: 800 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'desktop', width: 1920, height: 1080 },
] as const;
// one entry of `WIDTHS` 📐
export type Width = (typeof WIDTHS)[number];
// both color schemes (the theme engine follows the OS until a pick) 🌗
export const THEMES = ['light', 'dark'] as const;
// the core breakpoints (core 0.2.x: 768 / 1180 / 1920) 🧱
export const TABLET_MIN = 768;
export const LAPTOP_MIN = 1180;


// ===== PAGES 🗺️ ===== //

// the screens of 0.2.23: Home, the 404 (in the shell) and the Welcome (its own panes); the Splash is tested apart
export const PAGES = [
  { id: 'home', path: '/', shell: true },
  { id: 'not-found', path: '/nope', shell: true },
  { id: 'welcome', path: '/welcome', shell: false },
] as const;
// one entry of `PAGES` 🗺️
export type PageSpec = (typeof PAGES)[number];


// ===== SELECTORS 🎯 ===== //

// the packaged pane parts (ab-nextjs-core) 🧱
export const PART = {
  header: '[data-ab-part="header"]', // 🔝 the app header slot (app bar from 1180)
  sidebar: '[data-ab-part="sidebar"]', // 🗂️ the sidebar (tablet+)
  main: 'main[data-ab-part="main"]', // 📄 the main pane
  mainHeader: '[data-ab-part="main-header"]', // 📟 main's own header (tablet / mobile bar)
  mainContent: '[data-ab-part="main-content"]', // 📜 main's scroller
  aside: 'aside[data-ab-part="aside"]', // 📑 the aside pane
  asideContent: '[data-ab-part="aside-content"]', // 📜 the aside's scroller
  bottomBar: '[data-ab-part="bottomBar"]', // 📱 the bottom nav (mobile)
  drawer: '[data-ab-part="drawer"]', // 🗄️ an open drawer panel
  scrim: '[data-ab-part="drawer-scrim"]', // 🌫️ a drawer's backdrop
} as const;


/**
 * `openPage` 🚪
 *
 * Opens a page with the Splash already seen and the given color scheme, then waits for hydration & fonts.
 *
 * @param { Page } page - the Playwright page
 * @param { string } path - the URL path
 * @returns { Promise<void> }
 */
export async function openPage(page: Page, path: string): Promise<void> {
  // 💦 skip the Splash overlay (first visit) so the page itself is what we test
  await page.addInitScript(() => sessionStorage.setItem('ab-splash-seen', '1'));
  // 🧭 navigate
  await page.goto(path);
  // 🌗 the theme script stamped `<html>` (the client ran)
  await expect(page.locator('html[data-theme]')).toHaveCount(1);
  // 🔤 final text metrics
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  // 💧 one frame for the pane providers to settle (breakpoint state, aside open at ≥ 1180)
  await page.waitForTimeout(300);
}


// a box (CSS px) 📦
export type Box = { x: number; y: number; width: number; height: number };


/**
 * `boxOf` 📦 - the bounding box of the first match, or a 0×0 box when it is missing / `display: none`
 *
 * @param { Page } page - the Playwright page
 * @param { string } selector - a CSS selector
 * @returns { Promise<Box> }
 */
export async function boxOf(page: Page, selector: string): Promise<Box> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { x: 0, y: 0, width: 0, height: 0 }; // 🫥 missing = 0px
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, selector);
}


/**
 * `documentScroll` 📜 - how far the document can scroll & has scrolled (both must stay 0)
 *
 * @param { Page } page - the Playwright page
 * @returns { Promise<{ overflow: number; scrollX: number; scrollY: number }> }
 */
export async function documentScroll(page: Page): Promise<{ overflow: number; overflowX: number; scrollX: number; scrollY: number }> {
  return page.evaluate(() => {
    const root = document.scrollingElement ?? document.documentElement;
    return {
      overflow: Math.max(0, root.scrollHeight - innerHeight), // ↕️ extra height the document could scroll
      overflowX: Math.max(0, root.scrollWidth - innerWidth), // ↔️ extra width
      scrollX: scrollX, // ↔️
      scrollY: scrollY, // ↕️
    };
  });
}


/**
 * `scrollPane` 🖱️ - scrolls a pane's scroller by `dy` (as a user would: the element, not the window)
 *
 * @param { Page } page - the Playwright page
 * @param { string } selector - the scroller
 * @param { number } dy - pixels down
 * @returns { Promise<number> } - the scroller's new scrollTop
 */
export async function scrollPane(page: Page, selector: string, dy: number): Promise<number> {
  return page.evaluate(([sel, by]) => {
    const el = document.querySelector<HTMLElement>(sel as string);
    if (!el) return -1; // 🫥
    el.scrollTop += by as number;
    return el.scrollTop;
  }, [selector, dy] as const);
}


/**
 * `scrollTopOf` 📏 - a scroller's scrollTop (-1 when missing)
 *
 * @param { Page } page - the Playwright page
 * @param { string } selector - the scroller
 * @returns { Promise<number> }
 */
export async function scrollTopOf(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => document.querySelector<HTMLElement>(sel)?.scrollTop ?? -1, selector);
}


/**
 * `swipe` 👆 - a real touch swipe (CDP touch events, Chromium only) from (x1, y) to (x2, y)
 *
 * @param { Page } page - the Playwright page (a `hasTouch` context)
 * @param { number } x1 - start x
 * @param { number } x2 - end x
 * @param { number } y - the row
 * @returns { Promise<void> }
 */
export async function swipe(page: Page, x1: number, x2: number, y: number): Promise<void> {
  // 🔌 raw touch input, so pointer + touch listeners both see a real finger
  const cdp = await page.context().newCDPSession(page);
  const steps = 8; // 🪜
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y }] });
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + ((x2 - x1) * i) / steps, y }] });
    await page.waitForTimeout(16); // 🎞️ ~one frame per step
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}
