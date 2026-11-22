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
* @name: abElements Search Index Gate
* @file: lib/search-gate.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> assertSearchIndex() // throws when a snapshot is missing, invalid, or over 150 KB gzip 🚦
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🚦 The search-index gate (0.2.30): every locale file must be valid zbsearch JSON, with the required
//    fields, unique ids, a hit for the smoke terms, and a gzip size of at most 150 KB.
//    prebuild runs this after the indexer. A failure stops `pnpm build`.

// import the file reader 📁
import { readFileSync } from 'node:fs';
// import the path joiner 🧭
import { join } from 'node:path';
// import search (the smoke terms have to hit the restored snapshot) 🔎
import { search } from 'zbsearch';
// import the snapshot type 📦
import type { RawData } from 'zbsearch';
// import the limits, locales and required keys 🧾
import {
  SEARCH_DIR,
  SEARCH_GZIP_LIMIT,
  SEARCH_GROUPS,
  SEARCH_LOCALES,
  SEARCH_RECORD_TYPES,
  SEARCH_REQUIRED_KEYS,
  SEARCH_SMOKE_TERMS,
  type AppLocale,
  type SearchRecord,
} from './search-meta.ts';
// import the snapshot opener and the row reader 🔎
import { gzipSize, openSearchSnapshot, snapshotDocuments } from './search-index.ts';


// 🚦 one locale that passed
export type SearchGateLocale = {
  locale: AppLocale; // 🌍
  documents: number; // 📄
  gzipBytes: number; // 💨
};

// 🚦 the gate's report when every locale passes
export type SearchGateReport = {
  locales: SearchGateLocale[]; // ✅
};


/**
 * `assertSearchIndex` - fail unless every locale snapshot is valid and small enough 🚦
 *
 * @param { string } [root] - the app root (the files live in `data/search/`)
 * @param { number } [gzipLimit] - byte cap (tests pass a tiny cap to prove the size check fails)
 * @returns { SearchGateReport }
 */
export function assertSearchIndex(root: string = process.cwd(), gzipLimit: number = SEARCH_GZIP_LIMIT): SearchGateReport {
  // 📁 the snapshot folder
  const dir = join(root, SEARCH_DIR);
  // ✅ one pass per locale
  const locales: SearchGateLocale[] = [];
  // 🌍 en, fr, es, ru
  for (const locale of SEARCH_LOCALES) {
    locales.push(assertLocaleFile(dir, locale, gzipLimit));
  }
  // ✅
  return { locales };
}


/**
 * `assertLocaleFile` - one `data/search/<locale>.json` 🚦
 *
 * @param { string } dir
 * @param { AppLocale } locale
 * @param { number } gzipLimit
 * @returns { SearchGateLocale }
 */
function assertLocaleFile(dir: string, locale: AppLocale, gzipLimit: number): SearchGateLocale {
  // 📁 the file
  const path = join(dir, `${locale}.json`);
  // 📖 the bytes, or a missing-locale failure
  let json = '';
  try {
    json = readFileSync(path, 'utf8');
  } catch {
    throw new Error(`search-index: missing locale snapshot: ${locale}`);
  }
  // 📦 parse
  let file: unknown;
  try {
    file = JSON.parse(json);
  } catch {
    throw new Error(`search-index: invalid JSON in ${locale}.json`);
  }
  // 🧾 the envelope
  if (!file || typeof file !== 'object') throw new Error(`search-index: ${locale}.json is not an object`);
  const envelope = file as { locale?: unknown; engine?: unknown; suggestions?: unknown; snapshot?: unknown };
  // 🌍 the file must name its own locale
  if (envelope.locale !== locale) throw new Error(`search-index: ${locale}.json has locale ${String(envelope.locale)}`);
  // 🔎 zbsearch only
  if (envelope.engine !== 'zbsearch') throw new Error(`search-index: ${locale}.json engine is not zbsearch`);
  // 💡 the suggestion list
  if (!Array.isArray(envelope.suggestions) || envelope.suggestions.some((term) => typeof term !== 'string')) {
    throw new Error(`search-index: ${locale}.json is missing suggestions`);
  }
  // 📄 the stored rows
  const documents = snapshotDocuments(envelope.snapshot);
  // 🫥 an empty or unreadable snapshot
  if (documents.length === 0) throw new Error(`search-index: ${locale}.json has no documents`);
  // 🔑 fields and ids
  assertDocuments(locale, documents);
  // 💨 the whole file, gzipped
  const gzipBytes = gzipSize(json);
  // 🚨 over the cap
  if (gzipBytes > gzipLimit) {
    throw new Error(`search-index: ${locale} snapshot is ${gzipBytes} bytes gzip, over the ${gzipLimit} byte limit`);
  }
  // 🚬 button, layout, install
  assertSmoke(locale, envelope.snapshot);
  // ✅
  return { locale, documents: documents.length, gzipBytes };
}


/**
 * `assertDocuments` - required fields, known groups, unique ids 🔑
 *
 * @param { AppLocale } locale
 * @param { readonly SearchRecord[] } documents
 * @returns { void }
 */
function assertDocuments(locale: AppLocale, documents: readonly SearchRecord[]): void {
  // 🆔 seen ids
  const ids = new Set<string>();
  // 🚶 each row
  for (let index = 0; index < documents.length; index += 1) {
    // 📄 the row
    const document = documents[index];
    // 🔑 every required key
    for (const key of SEARCH_REQUIRED_KEYS) {
      if (document == null || !Object.hasOwn(document, key)) {
        throw new Error(`search-index: ${locale} document ${index} is missing ${key}`);
      }
    }
    // 🆔 a non-empty string id
    if (typeof document.id !== 'string' || !document.id.trim()) {
      throw new Error(`search-index: ${locale} document ${index} is missing id`);
    }
    // 🔁 a repeated id
    if (ids.has(document.id)) throw new Error(`search-index: duplicate id ${document.id} in ${locale}`);
    ids.add(document.id);
    // 🔗 a site path
    if (typeof document.url !== 'string' || !document.url.startsWith('/')) {
      throw new Error(`search-index: ${locale} document ${document.id} is missing url`);
    }
    // 🏷️ a title
    if (typeof document.title !== 'string' || !document.title.trim()) {
      throw new Error(`search-index: ${locale} document ${document.id} is missing title`);
    }
    // 📝 the text fields may be empty, but they must be strings
    for (const key of ['section', 'description', 'content', 'packageName', 'kind', 'status', 'identifiers'] as const) {
      if (typeof document[key] !== 'string') throw new Error(`search-index: ${locale} document ${document.id} is missing ${key}`);
    }
    // 📦 a known drawer group
    if (!(SEARCH_GROUPS as readonly string[]).includes(document.group)) {
      throw new Error(`search-index: ${locale} document ${document.id} has group ${String(document.group)}`);
    }
    // 🏷️ a known record kind
    if (!(SEARCH_RECORD_TYPES as readonly string[]).includes(document.recordType)) {
      throw new Error(`search-index: ${locale} document ${document.id} has recordType ${String(document.recordType)}`);
    }
    // 🏳️ a known content locale
    if (!(SEARCH_LOCALES as readonly string[]).includes(document.contentLocale)) {
      throw new Error(`search-index: ${locale} document ${document.id} has contentLocale ${String(document.contentLocale)}`);
    }
    // 🏳️ a real boolean
    if (typeof document.isFallback !== 'boolean') {
      throw new Error(`search-index: ${locale} document ${document.id} is missing isFallback`);
    }
  }
}


/**
 * `assertSmoke` - `button`, `layout` and `install` each return a hit 🚬
 *
 * @param { AppLocale } locale
 * @param { unknown } snapshot
 * @returns { void }
 */
function assertSmoke(locale: AppLocale, snapshot: unknown): void {
  // 🔎 restore the index with the same tokenizer the build used
  const db = openSearchSnapshot(locale, snapshot as RawData);
  // 🚬 each smoke term
  for (const term of SEARCH_SMOKE_TERMS) {
    // 🔎 exact tokens (prefix matching would hide a stemmer miss)
    const result = search(db, { term, prefix: false });
    // ⏳ the installed engine is synchronous; a promise would mean a different build
    if (result instanceof Promise) throw new Error(`search-index: ${locale} search returned a promise`);
    // 🚨 no hit
    if (!result.count) throw new Error(`search-index: ${locale} has no hit for "${term}"`);
  }
}
