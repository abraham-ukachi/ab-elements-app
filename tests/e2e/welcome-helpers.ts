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
* @name: abElements Welcome E2E Helpers
* @file: tests/e2e/welcome-helpers.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm build && pnpm test:e2e
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧰 Shared helpers for the Welcome e2e specs: real-browser user agents, slide navigation & waits.

// import the page & expect types from `@playwright/test` 🎭
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';


// ===== USER AGENTS 🕵️ ===== //

// a plain desktop Chrome user agent (NOT headless): the Welcome gate treats it as a real visitor 🖥️
export const REAL_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
// Googlebot's user agent: the gate must never redirect it 🤖
export const BOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
// headless Chrome (what Playwright sends by default): treated like a bot too 👻
export const HEADLESS_UA = REAL_UA.replace('Chrome/', 'HeadlessChrome/');


// ===== VIEWPORTS 📐 ===== //

// the laptop frame used by the README shots (16:9) 💻
export const LAPTOP = { width: 1280, height: 720 } as const;
// the mobile frame of the v6 mocks (390×844) 📱
export const MOBILE = { width: 390, height: 844 } as const;


// ===== SLIDES 🎞️ ===== //

// the number of Welcome slides (s01 → s09)
export const SLIDE_COUNT = 9;
// the slide ids, in order 🆔
export const SLIDE_IDS = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09'] as const;
// the two-digit counter text of slide `n` (1-based), e.g. `03 / 09` 🔢
export const counterText = (n: number): string => `${String(n).padStart(2, '0')} / ${String(SLIDE_COUNT).padStart(2, '0')}`;


/**
 * `welcomePath` 🗺️
 *
 * The localized Welcome path, with an optional `?s=` slide.
 *
 * @param { string } locale - `en` (no prefix), `fr`, `es` or `ru`
 * @param { number } [slide] - the 1-based slide to open (omit for s01)
 * @returns { string } - e.g. `/fr/welcome?s=9`
 */
export function welcomePath(locale = 'en', slide?: number): string {
  // the default locale has no prefix 🌍
  const prefix = locale === 'en' ? '' : `/${locale}`;
  // add `?s=` only past s01
  return `${prefix}/welcome${slide && slide > 1 ? `?s=${slide}` : ''}`;
}


/**
 * `openWelcome` 🚪
 *
 * Opens the Welcome on a slide and waits until the carousel is hydrated & showing that slide.
 *
 * @param { Page } page - the Playwright page
 * @param { string } [locale] - the locale (default `en`)
 * @param { number } [slide] - the 1-based slide (default 1)
 * @returns { Promise<void> }
 */
export async function openWelcome(page: Page, locale = 'en', slide = 1): Promise<void> {
  // navigate 🧭
  await page.goto(welcomePath(locale, slide));
  // wait for the theme script to stamp `<html>` (proves the client ran) 🌗
  await expect(page.locator('html[data-theme]')).toHaveCount(1);
  // wait until the counter shows the slide (the `?s=` sync runs after hydration) 🔢
  await expect(counter(page)).toHaveText(counterText(slide));
  // wait for the web fonts, so text metrics are final 🔤
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}


// the counter (`02 / 09`) 🔢
// 📱 0.2.3: the counter row lives in AbMobileHeader's `row` below 768px and atop the slides at 768px+ (one is
//    display:none), so target the VISIBLE one
export const counter = (page: Page) => page.locator('[data-ab-part="counter"]:visible');
// the carousel region 🎠
export const carousel = (page: Page) => page.locator('[data-ab-part="carousel"]');
// the dots (one button per slide) ⚫
export const dots = (page: Page) => page.locator('[data-ab-part="dot"]');
// the back arrow ⏮️
export const prevButton = (page: Page) => page.locator('[data-ab-part="prev"]');
// the next arrow ⏭️
export const nextButton = (page: Page) => page.locator('[data-ab-part="next"]');
// the title of slide `id` (`h1` on s01, `h2` elsewhere) 🏷️
export const slideTitle = (page: Page, id: string) => page.locator(`#welcome-${id}-title`);


/**
 * `expectSlide` ✅
 *
 * Expects slide `n` (1-based) to be the current one: counter + `?s=` in the URL.
 *
 * @param { Page } page - the Playwright page
 * @param { number } n - the expected 1-based slide
 * @returns { Promise<void> }
 */
export async function expectSlide(page: Page, n: number): Promise<void> {
  // the counter says so 🔢
  await expect(counter(page)).toHaveText(counterText(n));
  // the URL says so too (s01 drops `?s=`) 🔗
  await expect.poll(() => new URL(page.url()).searchParams.get('s')).toBe(n === 1 ? null : String(n));
}
