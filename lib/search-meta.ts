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
* @name: abElements Search Meta
* @file: lib/search-meta.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> searchSnapshotPath(process.cwd(), 'fr') // data/search/fr.json 🔎
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🔎 Shared search-index facts (0.2.30): locales, groups, the on-disk snapshot path and the record shape.
//    No zbsearch import here, so the static route can read a snapshot without pulling the engine into the server bundle.
//    A later drawer (and a global Cmd/Ctrl+K) fetches `/api/search/<locale>` and opens the same file. Nothing here
//    assumes which button opened search ⌨️.

// import the path joiner 🧭
import { join } from 'node:path';
// import the locale list (the single source of truth; a new locale has to grow a snapshot too) 🌍
import abI18nConfig, { type AppLocale } from '../i18n/config.ts';


// 🌍 re-export the locale union (`'en' | 'fr' | 'es' | 'ru'`)
export type { AppLocale };

// 🌍 the locales, in config order (en, fr, es, ru)
export const SEARCH_LOCALES: readonly AppLocale[] = [...abI18nConfig.locales];

// 📁 where prebuild writes one JSON file per locale (gitignored; the route reads it at build time)
export const SEARCH_DIR = 'data/search';

// 📦 the drawer groups a hit can belong to (icons wait for a later version, so they are not a group yet)
export const SEARCH_GROUPS = ['docs', 'guides', 'packages', 'props', 'changelog'] as const;

// 🏷️ what kind of row a document is (counts and the gate read this; `group` is the drawer bucket)
export const SEARCH_RECORD_TYPES = ['page', 'section', 'package', 'symbol', 'prop', 'changelog'] as const;

// 🔎 a drawer group
export type SearchGroup = (typeof SEARCH_GROUPS)[number];

// 🏷️ a record kind
export type SearchRecordType = (typeof SEARCH_RECORD_TYPES)[number];

// 📄 one indexed row. URLs stay unprefixed (`/docs/...`, `/changelog#...`, `/#package-...`) so a localized link can add the prefix.
export type SearchRecord = {
  id: string; // 🆔 unique inside one locale snapshot
  url: string; // 🔗 unprefixed path, optional `#anchor`
  title: string; // 🏷️ the hit title
  section: string; // 🧭 heading breadcrumb (`Layout › Slots`), or empty on a page / package row
  description: string; // 📝 lede, prop blurb, or version date
  content: string; // 📄 plain excerpt, prop `name type`, or changelog note (code fences already removed)
  group: SearchGroup; // 📦 drawer group
  recordType: SearchRecordType; // 🏷️ page, section, package, symbol, prop, changelog
  packageName: string; // 📛 `ab-nextjs-*`, or empty
  kind: string; // 🖥️ `client` / `server`, or empty
  status: string; // 🚦 `new` / `beta` / `stable` / `deprecated`, or empty
  contentLocale: AppLocale; // 🏳️ the language of the indexed text
  isFallback: boolean; // 🏳️ true when a fr/es/ru hit is still English
  identifiers: string; // 🧩 code names (`AbButton`, `ab-nextjs-core`) kept whole for the normalizer
};

// 📬 the file `/api/search/<locale>` serves. `snapshot` is zbsearch `save()` output; the type stays open so this file does not import the engine.
export type SearchSnapshotFile = {
  locale: AppLocale; // 🌍
  engine: 'zbsearch'; // 🔎 the only engine (the one fumadocs-core already ships)
  engineVersion: string; // 🔢 the zbsearch version the snapshot was built with
  language: string; // 🗣️ zbsearch language name (`english`, `french`, `spanish`, `russian`)
  schemaVersion: 1; // 🧾 bump when the record shape changes
  suggestions: string[]; // 💡 "Did you mean …?" terms for this locale
  snapshot: unknown; // 📦 zbsearch `save()` payload (`load` restores it)
};

// 🔑 document keys the gate requires on every row
export const SEARCH_REQUIRED_KEYS = [
  'id',
  'url',
  'title',
  'section',
  'description',
  'content',
  'group',
  'recordType',
  'packageName',
  'kind',
  'status',
  'contentLocale',
  'isFallback',
  'identifiers',
] as const satisfies readonly (keyof SearchRecord)[];

// 💨 hard cap: one locale file, gzipped (the gate fails the build above this)
export const SEARCH_GZIP_LIMIT = 150 * 1024;

// 🚬 words that must hit in every locale (English fallback pages keep them present before a translation lands)
export const SEARCH_SMOKE_TERMS = ['button', 'layout', 'install'] as const;


/**
 * `isSearchLocale` - whether `value` is one of the configured locales 🌍
 *
 * @param { string } value
 * @returns { value is AppLocale }
 */
export function isSearchLocale(value: string): value is AppLocale {
  // ✅ a member of the config list
  return (SEARCH_LOCALES as readonly string[]).includes(value);
}


/**
 * `searchSnapshotPath` - `data/search/<locale>.json` under `root` 📁
 *
 * @param { string } root - the app root
 * @param { string } locale - `en` / `fr` / `es` / `ru`
 * @returns { string }
 */
export function searchSnapshotPath(root: string, locale: string): string {
  // 📁 one file per locale
  return join(root, SEARCH_DIR, `${locale}.json`);
}
