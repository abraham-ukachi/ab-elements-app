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
* @name: search-gate.test
* @file: tests/unit/search-gate.test.ts
* @type: test
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm vitest run tests/unit/search-gate.test.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🚦 The search-index gate: a real snapshot passes, and each failure mode (missing locale, bad JSON,
//    a missing field, a duplicate id, the gzip cap, an empty smoke search) fails the build.

// import the test helpers 🧪
import { afterAll, describe, expect, it } from 'vitest';
// import the filesystem helpers 📁
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
// import the path helpers 🧭
import { join } from 'node:path';
// import the temp directory 📁
import { tmpdir } from 'node:os';
// import random bytes (a pad that gzip cannot shrink under the cap) 💨
import { randomBytes } from 'node:crypto';
// import the gate and the cap 🚦
import { assertSearchIndex } from '@/lib/search-gate';
// import the locales, the cap and a record 🧾
import { SEARCH_GZIP_LIMIT, SEARCH_LOCALES, type SearchRecord } from '@/lib/search-meta';
// import the snapshot writer 🔎
import { buildSearchFile, serializeSearchFile, writeSearchSnapshots } from '@/lib/search-index';


// 📁 one real snapshot set, reused by the passing case and as a base for the failures
const dir = mkdtempSync(join(tmpdir(), 'search-gate-'));
const snapshots = join(dir, 'data', 'search');
writeSearchSnapshots(process.cwd(), snapshots);

// 🧹 the temp tree
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});


/**
 * `copySnapshots` - a fresh copy of the good snapshots 📁
 *
 * @param { string } name
 * @returns { string } the root whose `data/search` the gate reads
 */
function copySnapshots(name: string): string {
  // 📁 a sibling folder
  const root = join(dir, name);
  mkdirSync(join(root, 'data'), { recursive: true });
  cpSync(snapshots, join(root, 'data', 'search'), { recursive: true });
  // 📁
  return root;
}


/**
 * `writeTiny` - four locale files that parse, but whose text is `zzzz` 📄
 *
 * @param { string } root
 * @returns { void }
 */
function writeTiny(root: string): void {
  // 📄 one row, no smoke-term vocabulary
  const record: SearchRecord = {
    id: 'page:index',
    url: '/docs',
    title: 'zzzz',
    section: '',
    description: '',
    content: 'zzzz',
    group: 'docs',
    recordType: 'page',
    packageName: '',
    kind: '',
    status: '',
    contentLocale: 'en',
    isFallback: false,
    identifiers: '',
  };
  // 📁 the folder
  const folder = join(root, 'data', 'search');
  mkdirSync(folder, { recursive: true });
  // 🌍 the same tiny index for every locale (the smoke check is what should fail)
  for (const locale of SEARCH_LOCALES) {
    const file = buildSearchFile(root, locale, [{ ...record, contentLocale: locale }]);
    writeFileSync(join(folder, `${locale}.json`), serializeSearchFile(file));
  }
}


describe('search index gate 🚦', () => {
  it('passes the real snapshots', () => {
    // ✅ under the cap, with a hit for every smoke term
    const report = assertSearchIndex(dir);
    expect(report.locales.map((item) => item.locale)).toEqual([...SEARCH_LOCALES]);
    for (const item of report.locales) expect(item.gzipBytes).toBeLessThanOrEqual(SEARCH_GZIP_LIMIT);
  });

  it('fails when a locale file is missing', () => {
    // 📁 drop Russian
    const root = copySnapshots('missing');
    rmSync(join(root, 'data/search/ru.json'));
    expect(() => assertSearchIndex(root)).toThrow(/missing locale snapshot: ru/);
  });

  it('fails when the JSON is invalid', () => {
    // 📁 break English
    const root = copySnapshots('invalid');
    writeFileSync(join(root, 'data/search/en.json'), '{');
    expect(() => assertSearchIndex(root)).toThrow(/invalid JSON in en\.json/);
  });

  it('fails when a document is missing a required field', () => {
    // 📁 remove a title
    const root = copySnapshots('field');
    const path = join(root, 'data/search/en.json');
    const file = JSON.parse(readFileSync(path, 'utf8')) as { snapshot: { docs: { docs: Record<string, SearchRecord> } } };
    const first = Object.values(file.snapshot.docs.docs)[0];
    expect(first).toBeTruthy();
    delete (first as { title?: string }).title;
    writeFileSync(path, JSON.stringify(file));
    expect(() => assertSearchIndex(root)).toThrow(/missing title/);
  });

  it('fails when two documents share an id', () => {
    // 📁 copy the first id onto the second row
    const root = copySnapshots('duplicate');
    const path = join(root, 'data/search/fr.json');
    const file = JSON.parse(readFileSync(path, 'utf8')) as { snapshot: { docs: { docs: Record<string, SearchRecord> } } };
    const rows = Object.values(file.snapshot.docs.docs);
    expect(rows.length).toBeGreaterThan(1);
    rows[1]!.id = rows[0]!.id;
    writeFileSync(path, JSON.stringify(file));
    expect(() => assertSearchIndex(root)).toThrow(/duplicate id/);
  });

  it('fails when a snapshot is over 150 KB gzip', () => {
    // 📁 a valid file, plus a pad gzip cannot hide
    const root = copySnapshots('size');
    const path = join(root, 'data/search/en.json');
    const file = JSON.parse(readFileSync(path, 'utf8')) as { padding?: string };
    file.padding = randomBytes(220_000).toString('base64');
    writeFileSync(path, JSON.stringify(file));
    expect(() => assertSearchIndex(root)).toThrow(new RegExp(`${SEARCH_GZIP_LIMIT} byte limit`));
    // 💨 the same check with a tiny cap, so a normal file fails too
    const small = copySnapshots('cap');
    expect(() => assertSearchIndex(small, 1)).toThrow(/byte limit/);
  });

  it('fails when a smoke term has no hit', () => {
    // 📁 four valid files that never mention button, layout or install
    const root = join(dir, 'smoke');
    writeTiny(root);
    expect(() => assertSearchIndex(root)).toThrow(/no hit for "button"/);
  });
});
