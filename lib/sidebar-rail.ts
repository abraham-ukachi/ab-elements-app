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
* @name: abElements Sidebar Rail Storage
* @file: lib/sidebar-rail.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> const [rail, setRail] = useSidebarRail() // true = collapsed to icons 🗂️
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


'use client';

// 🗂️ The sidebar rail preference (0.2.22): collapsed (icons only) or expanded, saved in localStorage
// under `ab-sidebar-rail` and synced across tabs. It only needs the published `useAbLocalStorage` (hooks 0.1.6);
// the rail UI itself waits for `AbSidebar` v2 (`collapsed` + `onCollapsedChange`, G40).

// import the localStorage hook & its safe reader from `ab-nextjs-hooks` 🗄️
import { readAbLocalStorage, useAbLocalStorage } from 'ab-nextjs-hooks/useAbLocalStorage';


// 🔑 the localStorage key of the rail preference
export const AB_SIDEBAR_RAIL_KEY = 'ab-sidebar-rail';


/**
 * `parseSidebarRail` - raw storage value → collapsed ? 🧮
 *
 * Only the JSON `true` collapses: anything else (null, garbage, `"yes"`) means expanded,
 * which is also the JS-off / first-visit state (§1.4).
 *
 * @param { string | null } raw - the raw localStorage value
 * @returns { boolean }
 */
export function parseSidebarRail(raw: string | null): boolean {
  return raw === 'true'; // ✅ JSON.stringify(true)
}


/**
 * `readSidebarRail` - read the saved preference outside React (e.g. a pre-paint script later) 📖
 *
 * @returns { boolean } - true when the sidebar should start as a rail
 */
export function readSidebarRail(): boolean {
  return parseSidebarRail(readAbLocalStorage(AB_SIDEBAR_RAIL_KEY)); // 🛟 never throws
}


/**
 * `useSidebarRail` - the rail preference as state 🗂️
 *
 * SSR renders expanded (no hydration mismatch), then the saved value applies.
 *
 * @returns { readonly [boolean, (next: boolean | ((prev: boolean) => boolean)) => void, () => void] }
 */
export function useSidebarRail() {
  return useAbLocalStorage<boolean>(AB_SIDEBAR_RAIL_KEY, false); // 🗄️ false = expanded
}
