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
* @name: abElements Install Package Manager
* @file: lib/install-pm.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <AbInstallSnippet pkg="ab-nextjs-core" storageKey={AB_PM_STORAGE_KEY} />
*    -|> <script dangerouslySetInnerHTML={{ __html: abPmMigrationScript }} />
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📦 The ONE package-manager choice (pnpm / npm / yarn / bun) shared by every install box in the app (D27).
// The Welcome used its own `ab-welcome-pm` key up to 0.2.19: we move that choice to `ab-pm` once, before the first paint 🎨.

// import the safe localStorage helpers from `ab-nextjs-hooks` 🗄️
import { readAbLocalStorage, writeAbLocalStorage } from 'ab-nextjs-hooks/useAbLocalStorage';


// 🔑 the shared localStorage key of the package-manager choice (Welcome, Home, Docs...)
export const AB_PM_STORAGE_KEY = 'ab-pm';

// 🧓 the old keys we migrate from (the Welcome's own key, 0.2.18 → 0.2.19)
export const AB_PM_LEGACY_KEYS: readonly string[] = ['ab-welcome-pm'];


// 🗄️ the tiny storage shape the migration needs (localStorage, or a Map-backed fake in tests 🧪)
export type AbPmStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;


/**
 * `migrateAbPm` - one-time key migration 🚚
 *
 * Copies the first legacy choice into `ab-pm` when `ab-pm` is still empty,
 * then removes every legacy key (so the old key never wins again 🧹).
 * A choice already saved under `ab-pm` always wins.
 *
 * @param { AbPmStorage } storage - the storage to migrate (localStorage in the browser)
 * @returns { string | null } - the raw `ab-pm` value after the migration (or null)
 */
export function migrateAbPm(storage: AbPmStorage): string | null {
  // 📖 the current shared choice
  let current = storage.getItem(AB_PM_STORAGE_KEY);
  // 🔁 for every old key...
  for (const key of AB_PM_LEGACY_KEYS) {
    // 📖 ...read its value
    const legacy = storage.getItem(key);
    // 🚫 nothing there ? next one
    if (legacy === null) continue;
    // ✍️ no shared choice yet ? the legacy one becomes it
    if (current === null) { storage.setItem(AB_PM_STORAGE_KEY, legacy); current = legacy; }
    // 🧹 drop the legacy key either way
    storage.removeItem(key);
  }
  // 📦 the (maybe migrated) shared choice
  return current;
}


/**
 * `migrateAbPmInBrowser` - the same migration on the real localStorage 🌐
 *
 * Never throws: blocked storage (private mode, sandboxed iframes...) just skips it 🛟.
 *
 * @returns { string | null } - the raw `ab-pm` value (or null)
 */
export function migrateAbPmInBrowser(): string | null {
  // 🛡️ safe storage wrapper on top of the hooks' helpers (they swallow every error)
  const storage: AbPmStorage = {
    getItem: (key) => readAbLocalStorage(key), // 📖
    setItem: (key, value) => { writeAbLocalStorage(key, value); }, // ✍️
    removeItem: (key) => { writeAbLocalStorage(key, null); }, // 🧹
  };
  // 🚚 migrate
  return migrateAbPm(storage);
}


/**
 * `abPmMigrationScript` 🚦
 *
 * The pre-paint version of `migrateAbPm` for the root layout's `<head>`: it runs before React
 * hydrates, so every `AbInstallSnippet` reads the migrated `ab-pm` on its first render (no flash ⚡️).
 * Plain ES5 + try/catch, like the theme script.
 */
export const abPmMigrationScript: string = `(function () {
  try {
    var key = ${JSON.stringify(AB_PM_STORAGE_KEY)};
    var legacy = ${JSON.stringify(AB_PM_LEGACY_KEYS)};
    var current = localStorage.getItem(key);
    for (var i = 0; i < legacy.length; i++) {
      var value = localStorage.getItem(legacy[i]);
      if (value === null) continue;
      if (current === null) { localStorage.setItem(key, value); current = value; }
      localStorage.removeItem(legacy[i]);
    }
  } catch (e) {}
})();`;
