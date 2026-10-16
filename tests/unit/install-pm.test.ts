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
* @name: abElements Install Package Manager Tests
* @file: tests/unit/install-pm.test.ts
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


// 🧪 D27: one `ab-pm` key for every install box, migrated from the Welcome's `ab-welcome-pm` before the first paint.

// import the file helpers from Node 📁
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';

// import the migration under test 🚚
import { AB_PM_LEGACY_KEYS, AB_PM_STORAGE_KEY, abPmMigrationScript, migrateAbPm } from '@/lib/install-pm';


// a Map-backed fake localStorage 🗄️
const fakeStorage = (entries: Record<string, string> = {}) => {
  // the stored values
  const map = new Map(Object.entries(entries));
  // the Storage-like API (+ the map, to inspect it)
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { map.set(key, value); },
    removeItem: (key: string) => { map.delete(key); },
  };
};

// run the pre-paint script against a fake localStorage 🚦
const runScript = (storage: ReturnType<typeof fakeStorage>) => new Function('localStorage', abPmMigrationScript)(storage);


describe('lib/install-pm: the shared ab-pm key (D27) 📦', () => {
  it('uses `ab-pm` and migrates from `ab-welcome-pm` 🔑', () => {
    expect(AB_PM_STORAGE_KEY).toBe('ab-pm');
    expect(AB_PM_LEGACY_KEYS).toEqual(['ab-welcome-pm']);
  });

  for (const [name, migrate] of [
    ['migrateAbPm', (s: ReturnType<typeof fakeStorage>) => { migrateAbPm(s); }],
    ['abPmMigrationScript', runScript],
  ] as const) {
    describe(name, () => {
      it('moves the Welcome choice to ab-pm and drops the old key 🚚', () => {
        const storage = fakeStorage({ 'ab-welcome-pm': '"bun"' });
        migrate(storage);
        expect(Object.fromEntries(storage.map)).toEqual({ 'ab-pm': '"bun"' });
      });

      it('keeps an existing ab-pm choice (it wins) and still cleans up 🏆', () => {
        const storage = fakeStorage({ 'ab-pm': '"npm"', 'ab-welcome-pm': '"yarn"' });
        migrate(storage);
        expect(Object.fromEntries(storage.map)).toEqual({ 'ab-pm': '"npm"' });
      });

      it('does nothing when there is nothing to migrate 💤', () => {
        const storage = fakeStorage({ theme: 'dark' });
        migrate(storage);
        expect(Object.fromEntries(storage.map)).toEqual({ theme: 'dark' });
      });
    });
  }

  it('the script never throws on blocked storage 🛟', () => {
    const blocked = { getItem: () => { throw new Error('SecurityError'); } };
    expect(() => new Function('localStorage', abPmMigrationScript)(blocked)).not.toThrow();
  });

  it('the Welcome install box uses the shared key (no hard-coded ab-welcome-pm) 🤝', () => {
    const welcome = readFileSync(join(process.cwd(), 'app/[locale]/welcome/welcome.tsx'), 'utf8');
    expect(welcome).toContain('storageKey={AB_PM_STORAGE_KEY}');
    expect(welcome).not.toContain('"ab-welcome-pm"');
  });

  it('the root layout runs the migration before the first paint 🚦', () => {
    const layout = readFileSync(join(process.cwd(), 'app/[locale]/layout.tsx'), 'utf8');
    expect(layout).toContain('__html: abPmMigrationScript');
  });
});
