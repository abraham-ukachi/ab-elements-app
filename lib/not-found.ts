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
* @name: abElements 404 Data
* @file: lib/not-found.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> closestRoute('/docs/componnets') // → { key: 'components', href: '/#package-components' }
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🤷🏽‍♂️ The 404 page data (0.2.22): the Suggested cards, the Popular pages and the "Did you mean …?" matcher.
// Pure data + pure functions only (no React, no `node:fs`), so the client island and the unit tests share them 🧪.
// Labels are `NotFound.*` message keys (never raw text 🌍). Until the docs pages exist, every link points at a
// section of Home (D26: the 404 never links to another 404 🔁).

// import the package id type (type-only: `lib/packages.ts` reads `node:fs`, which never reaches the client 🚫)
import type { AbPackageId } from '@/lib/packages';


// 🔗 one link of the 404 page (a Suggested card or a Popular page)
export type NotFoundLink = Readonly<{
  id: string; // 🆔 the message key under `NotFound.suggestions` / `NotFound.popularPages`
  href: string; // 🔗 the locale-free path (the locale-aware link adds `/fr`, `/es`... 🌍)
  icon: string; // 🖼️ the AbIcons name (all in ab-nextjs-icons 0.2.4)
}>;

// 🧭 one route the "Did you mean …?" matcher can suggest
export type NotFoundRoute = Readonly<{
  key: string; // 🔑 the word a typo is compared with (e.g. `components`)
  href: string; // 🔗 the locale-free target (e.g. `/#package-components`)
}>;


// 💡 the 3 Suggested cards (mock 44–47: Getting started · Components · Theme tokens)
export const NOT_FOUND_SUGGESTED: readonly NotFoundLink[] = [
  { id: 'gettingStarted', href: '/#install', icon: 'rocket_launch' }, // 🚀 Home's install terminal
  { id: 'components', href: '/#package-components', icon: 'widgets' }, // 🧩 the components card
  { id: 'themeTokens', href: '/#package-theme', icon: 'palette' }, // 🎨 the theme card
];

// 🔥 the 5 Popular pages of the aside (laptop+, mock 46–47)
export const NOT_FOUND_POPULAR: readonly NotFoundLink[] = [
  { id: 'installation', href: '/#install', icon: 'download' }, // ⬇️ Installation · Getting started
  { id: 'button', href: '/#package-components', icon: 'widgets' }, // 🔘 Button · Components
  { id: 'themeTokens', href: '/#package-theme', icon: 'palette' }, // 🎨 Theme tokens · ab-nextjs-theme
  { id: 'useMedia', href: '/#package-hooks', icon: 'webhook' }, // 🪝 useMedia · ab-nextjs-hooks
  { id: 'changelog', href: '/#whats-new', icon: 'check_circle' }, // ✅ Changelog · Home's What's new
];

// 📦 the 8 package ids (kept here, in sync with `AB_PACKAGE_IDS`, so the client never imports `lib/packages.ts`)
const PACKAGE_IDS: readonly AbPackageId[] = ['fonts', 'icons', 'animations', 'theme', 'hooks', 'core', 'components', 'i18n'];

// 🧭 every route a typo can land on: the built pages, Home's sections, then one entry per package
export const NOT_FOUND_ROUTES: readonly NotFoundRoute[] = [
  { key: 'home', href: '/' }, // 🏠
  { key: 'welcome', href: '/welcome' }, // 👋 the walkthrough
  { key: 'install', href: '/#install' }, // ⬇️
  { key: 'installation', href: '/#install' }, // ⬇️ (the sidebar's word)
  { key: 'packages', href: '/#packages' }, // 📦
  { key: 'guides', href: '/#guides' }, // 📚
  { key: 'changelog', href: '/#whats-new' }, // 📰
  ...PACKAGE_IDS.map((id) => ({ key: id, href: `/#package-${id}` })), // 📦 `/docs/componnets` → the components card
];


/**
 * `editDistance` - Levenshtein distance between two words (one row of memory) 📏
 *
 * @param { string } a - one word
 * @param { string } b - the other
 * @returns { number } - the number of single-letter edits from `a` to `b`
 */
export function editDistance(a: string, b: string): number {
  // 🧮 the previous row of the DP table (0, 1, 2… = deleting every letter of `b`)
  const row: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  // 🔁 one row per letter of `a`
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]; // ↖️ the diagonal cell
    row[0] = i; // ⬅️ deleting the first `i` letters of `a`
    for (let j = 1; j <= b.length; j++) {
      const keep = row[j]; // 💾 the cell above, before we overwrite it
      // ✂️ delete · ➕ insert · 🔄 substitute (free when the letters match)
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = keep; // ↘️ move the diagonal along
    }
  }
  // ✅ the bottom-right cell
  return row[b.length];
}


/**
 * `closestRoute` - the route a mistyped path most likely meant, for "Did you mean …?" 💡
 *
 * Every segment of the (locale-free) path is compared with every route key; the smallest distance wins when it
 * is at most a third of the key's length (min 1), so `buton` → nothing but `componnets` → components ✅.
 *
 * @param { string } pathname - the locale-free path that 404'd (e.g. `/docs/componnets`)
 * @param { readonly NotFoundRoute[] } routes - the candidates (default `NOT_FOUND_ROUTES`)
 * @returns { NotFoundRoute | null } - the best route, or `null` when nothing is close enough
 */
export function closestRoute(pathname: string, routes: readonly NotFoundRoute[] = NOT_FOUND_ROUTES): NotFoundRoute | null {
  // ✂️ the lower-cased, decoded segments (`/Docs/Hooks%20` → ['docs', 'hooks'])
  // ✂️ the lower-cased, decoded segments without the query & hash (`/Docs/Hooks?x=1` → ['docs', 'hooks'])
  const words: string[] = safeDecode(pathname.split(/[?#]/)[0]).toLowerCase().split('/').map((word) => word.trim()).filter(Boolean);
  // 🙅 nothing to compare (the bare `/` never 404s anyway)
  if (!words.length) return null;
  // 🥇 the best candidate so far
  let best: { route: NotFoundRoute; distance: number } | null = null;
  // 🔁 every segment × every route
  for (const word of words) {
    for (const route of routes) {
      const distance = editDistance(word, route.key); // 📏
      const limit = Math.max(1, Math.floor(route.key.length / 3)); // 🎯 a third of the key, at least one edit
      // ✅ close enough AND better than what we have (the first one wins a tie: the order above is the priority)
      if (distance <= limit && (!best || distance < best.distance)) best = { route, distance };
    }
  }
  // 💡 the winner (or nothing)
  return best?.route ?? null;
}


/**
 * `safeDecode` - `decodeURIComponent` that never throws on a broken escape (`/%E0%A4%A`) 🛡️
 *
 * @param { string } value - the raw path
 * @returns { string } - the decoded path, or the raw one when it can't be decoded
 */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value); // ✅
  } catch {
    return value; // 🤷🏽‍♂️ keep it as is
  }
}
