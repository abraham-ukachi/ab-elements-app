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
* @name: abElements Search Index
* @file: lib/search-index.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> writeSearchSnapshots() // data/search/{en,fr,es,ru}.json 🔎
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🔎 Build-time search index (0.2.30): one zbsearch snapshot per locale.
//    Every English MDX page is present in fr / es / ru. `contentLocale` and `isFallback` come from whether
//    `content/docs/<locale>/<file>` exists, so a translation drops the English badge with no code change 🏳️.
//    Also indexed: the 8 package cards, exported symbols, prop names and types, and `/changelog` version anchors.
//    No icon rows. The later drawer (Cmd/Ctrl+K included) calls `openSearchSnapshot` and searches; this file does not render UI.

// import the filesystem helpers 📁
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
// import the path helpers 🧭
import { dirname, join } from 'node:path';
// import gzip (the size gate measures the compressed file) 💨
import { gzipSync } from 'node:zlib';
// import zbsearch (the engine already shipped inside fumadocs-core; pinned here so the app can import it) 🔎
import { create, insert, load, save } from 'zbsearch';
// import the snapshot type 📦
import type { RawData } from 'zbsearch';
// import the record shape and the on-disk path 🧾
import {
  SEARCH_DIR,
  SEARCH_LOCALES,
  isSearchLocale,
  searchSnapshotPath,
  type AppLocale,
  type SearchGroup,
  type SearchRecord,
  type SearchRecordType,
  type SearchSnapshotFile,
} from './search-meta.ts';
// import the text helpers (stemmers, headings, suggestions, the tokenizer) ✂️
import {
  SEARCH_LANGUAGES,
  createSearchTokenizer,
  markdownHeadings,
  plainExcerpt,
  suggestionDictionary,
} from './search-text.ts';
// import the package cards and their exported names 📦
import { getAbPackageSymbols, getAbPackages, type AbPackage } from './packages.ts';
// import the parsed changelogs (the same anchors the page renders) 📜
import { loadChangelogs, type ChangelogDocument } from './changelog.ts';


// 🧾 zbsearch schema. Full text is title, content and identifiers.
//    section and description stay on the row for the drawer, but as enums so a repeated lede is not
//    tokenized once per heading. urls and ids are enums for the same reason.
//    Sorting stays off: hits come back by score, and the sorter's copy of every string blew the gzip budget.
export const SEARCH_SCHEMA = {
  id: 'enum', // 🆔 exact id, not tokenized
  url: 'enum', // 🔗 exact path, not tokenized
  title: 'string', // 🏷️
  section: 'string', // 🧭 breadcrumb (tokenized; short)
  description: 'string', // 📝 lede, only filled on page and package rows so it is not repeated per heading
  content: 'string', // 📄 excerpt, prop type, changelog note
  group: 'enum', // 📦
  recordType: 'enum', // 🏷️
  packageName: 'enum', // 📛 exact package name (also listed in `identifiers`)
  kind: 'enum', // 🖥️
  status: 'enum', // 🚦
  contentLocale: 'enum', // 🏳️
  isFallback: 'boolean', // 🏳️
  identifiers: 'string', // 🧩
} as const;

// 🚫 no sort tables (score order is enough, and the tables were most of the gzip)
const SEARCH_CREATE = {
  schema: SEARCH_SCHEMA,
  sort: { enabled: false },
} as const;

// 🔢 the schema version written into every file
const SCHEMA_VERSION = 1 as const;

// 📏 a prop type longer than this is cut (the name is still whole)
const PROP_TYPE_LIMIT = 80;

// 🖥️ frontmatter `kind`
const KINDS = new Set(['client', 'server']);

// 🚦 frontmatter `status`
const STATUSES = new Set(['new', 'beta', 'stable', 'deprecated']);

// 📦 `package: ab-nextjs-…`
const PACKAGE_NAME = /^ab-nextjs-[a-z0-9-]+$/;

// 🧩 code names worth copying into `identifiers`
const CODE_NAME = /\b(?:useAb[A-Za-z0-9]+|Ab[A-Z][A-Za-z0-9]*|AB_[A-Z0-9_]+|ab-nextjs-[a-z0-9-]+)\b/g;


// 📄 one English docs file, and the slug its URL uses
export type DocPageSource = {
  file: string; // 📁 `packages/core/index.mdx`
  slug: string; // 🔗 `packages/core` (`index.mdx` is the folder)
};

// 🏳️ which file a locale actually indexes
export type DocContentChoice = {
  contentLocale: AppLocale; // 🏳️ `fr` when the translation exists, otherwise `en`
  isFallback: boolean; // 🏳️ true when the locale file is missing
  absolute: string; // 📁 the file that was read
};

// 📊 sizes and counts for one locale, printed by the build script
export type SearchLocaleReport = {
  locale: AppLocale; // 🌍
  rawBytes: number; // 📏 the JSON file
  gzipBytes: number; // 💨 gzip
  counts: Record<SearchRecordType, number>; // 🏷️ rows of each kind
  fallbackPages: string[]; // 🏳️ slugs still in English (`quick-start`, …)
  translatedPages: string[]; // ✅ slugs whose locale file exists
};

// 🧾 one prop row, the fields the indexer reads
type PropRow = {
  name?: string; // 🏷️
  type?: string; // 🔤
  description?: string; // 📝
};

// 🧾 one symbol in `data/props/generated.json`
type PropSymbol = {
  id?: string; // 🆔
  name?: string; // 🏷️
  packageName?: string; // 📛
  description?: string; // 📝
  type?: string; // 🔤 unions
  rows?: PropRow[]; // 📋
};

// 📄 a parsed MDX page
type ParsedDoc = {
  title: string; // 🏷️
  description: string; // 📝
  packageName: string; // 📛
  kind: string; // 🖥️
  status: string; // 🚦
  body: string; // 📄 markdown after the frontmatter
};


/**
 * `emptyCounts` - a zeroed count for every record kind 🏷️
 *
 * @returns { Record<SearchRecordType, number> }
 */
function emptyCounts(): Record<SearchRecordType, number> {
  // 0️⃣ start at zero
  return { page: 0, section: 0, package: 0, symbol: 0, prop: 0, changelog: 0 };
}


/**
 * `countRecords` - how many rows of each kind 🏷️
 *
 * @param { readonly SearchRecord[] } records
 * @returns { Record<SearchRecordType, number> }
 */
export function countRecords(records: readonly SearchRecord[]): Record<SearchRecordType, number> {
  // 0️⃣
  const counts = emptyCounts();
  // ➕ one per row
  for (const record of records) counts[record.recordType] += 1;
  // 🏷️
  return counts;
}


/**
 * `docsUrl` - the unprefixed docs path of a slug 🔗
 *
 * @param { string } slug - `''` for the docs index
 * @returns { string }
 */
export function docsUrl(slug: string): string {
  // 🏠 `/docs` or `/docs/installation`
  return slug ? `/docs/${slug}` : '/docs';
}


/**
 * `slugFromDocFile` - `packages/core/index.mdx` → `packages/core` 🔗
 *
 * @param { string } file - path under `content/docs/<locale>/`
 * @returns { string }
 */
export function slugFromDocFile(file: string): string {
  // ✂️ drop the extension
  const noExt = file.replace(/\.mdx$/, '');
  // 🏠 the locale's index
  if (noExt === 'index') return '';
  // 📂 a folder index (`packages/core/index` → `packages/core`)
  if (noExt.endsWith('/index')) return noExt.slice(0, -'/index'.length);
  // 📄 a named page
  return noExt;
}


/**
 * `groupForSlug` - drawer group of a docs slug 📦
 *
 * @param { string } slug
 * @returns { SearchGroup }
 */
export function groupForSlug(slug: string): SearchGroup {
  // 🧭 guides
  if (slug === 'guides' || slug.startsWith('guides/')) return 'guides';
  // 📦 package pages
  if (slug === 'packages' || slug.startsWith('packages/')) return 'packages';
  // 📚 getting started (index, installation, quick start)
  return 'docs';
}


/**
 * `codeNames` - the code tokens in a string, joined for the `identifiers` field 🧩
 *
 * @param { string } value
 * @returns { string }
 */
function codeNames(...values: string[]): string {
  // 🧺 unique names, in first-seen order
  const found = new Set<string>();
  // 🚶 each source string
  for (const value of values) {
    for (const name of value.match(CODE_NAME) ?? []) found.add(name);
  }
  // 🧩 one field
  return [...found].join(' ');
}


/**
 * `docPageSources` - every English `.mdx` page, in path order 📚
 *
 * The English tree is the full list. Other locales index these same files.
 *
 * @param { string } root
 * @returns { DocPageSource[] }
 */
export function docPageSources(root: string): DocPageSource[] {
  // 📁 `content/docs/en`
  const base = join(root, 'content', 'docs', 'en');
  // 🚶 nested folders, names sorted so the snapshot does not depend on filesystem order
  const walk = (dir: string, prefix: string): string[] => {
    // 📂 the entries
    const entries = readdirSync(dir, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name, 'en'));
    // 📃 files under this folder
    const files: string[] = [];
    // 🚶
    for (const entry of entries) {
      // 📁 the path under `en/`
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      // 📂 go deeper
      if (entry.isDirectory()) files.push(...walk(join(dir, entry.name), rel));
      // 📄 an MDX page
      else if (entry.isFile() && entry.name.endsWith('.mdx')) files.push(rel);
    }
    // 📃
    return files;
  };
  // 📚 slug + file
  return walk(base, '').map((file) => ({ file, slug: slugFromDocFile(file) }));
}


/**
 * `resolveDocContent` - the file a locale should index for one page 🏳️
 *
 * A translated MDX file wins. A missing file falls back to English and is marked `isFallback`.
 *
 * @param { string } root
 * @param { AppLocale } locale
 * @param { string } file - path under the locale folder (`quick-start.mdx`)
 * @returns { DocContentChoice }
 */
export function resolveDocContent(root: string, locale: AppLocale, file: string): DocContentChoice {
  // 📁 the locale's own copy
  const localized = join(root, 'content', 'docs', locale, file);
  // 📁 the English source
  const english = join(root, 'content', 'docs', 'en', file);
  // ✅ English is never a fallback of itself
  if (locale === 'en') return { contentLocale: 'en', isFallback: false, absolute: english };
  // ✅ a real translated file (the badge drops off as soon as the file exists)
  if (existsSync(localized)) return { contentLocale: locale, isFallback: false, absolute: localized };
  // 🏳️ English text, flagged so the badge can show
  return { contentLocale: 'en', isFallback: true, absolute: english };
}


/**
 * `parseDoc` - frontmatter + body 🧾
 *
 * @param { string } source - the MDX file
 * @returns { ParsedDoc }
 */
export function parseDoc(source: string): ParsedDoc {
  // 🧾 the frontmatter block, when the file has one
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  // 📋 raw keys
  const data: Record<string, string> = {};
  // 🚶 each frontmatter line
  if (match?.[1]) {
    for (const line of match[1].split('\n')) {
      // ✂️ the first colon separates the key
      const cut = line.indexOf(':');
      // ⏭️ a blank or a comment-like line
      if (cut <= 0) continue;
      // 🏷️ the key
      const key = line.slice(0, cut).trim();
      // 📝 the value, quotes removed
      let value = line.slice(cut + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/\\"/g, '"');
      // 📋 keep it
      data[key] = value;
    }
  }
  // 📦 only a real package name
  const packageName = data.package && PACKAGE_NAME.test(data.package) ? data.package : '';
  // 🖥️ only the two known kinds
  const kind = data.kind && KINDS.has(data.kind) ? data.kind : '';
  // 🚦 only the known statuses
  const status = data.status && STATUSES.has(data.status) ? data.status : '';
  // 📄 the page
  return {
    title: (data.title ?? '').trim(),
    description: (data.description ?? '').trim(),
    packageName,
    kind,
    status,
    body: match ? source.slice(match[0].length) : source,
  };
}


/**
 * `docRecord` - one page or section row 📄
 *
 * @param { SearchRecord } fields
 * @returns { SearchRecord }
 */
function docRecord(fields: SearchRecord): SearchRecord {
  // 📄 the row, already complete
  return fields;
}


/**
 * `collectDocRecords` - every docs page and its h2–h4 headings for one locale 📚
 *
 * @param { string } root
 * @param { AppLocale } locale
 * @returns { SearchRecord[] }
 */
export function collectDocRecords(root: string, locale: AppLocale): SearchRecord[] {
  // 📚 the English list (every locale emits all of them)
  const sources = docPageSources(root);
  // 📃 the rows
  const records: SearchRecord[] = [];
  // 🚶 each page
  for (const source of sources) {
    // 🏳️ translation or English fallback
    const choice = resolveDocContent(root, locale, source.file);
    // 📖 the file that choice named
    const parsed = parseDoc(readFileSync(choice.absolute, 'utf8'));
    // 🔗 `/docs/...`
    const url = docsUrl(source.slug);
    // 📦 drawer group
    const group = groupForSlug(source.slug);
    // 🆔 a stable page id (`index` for the docs root)
    const pageId = source.slug || 'index';
    // 🧩 code names in the title and the lede
    const pageIdentifiers = codeNames(parsed.title, parsed.description, parsed.packageName);
    // 📄 the page row (the h1 is the frontmatter title, not a heading anchor)
    records.push(docRecord({
      id: `page:${pageId}`,
      url,
      title: parsed.title || pageId,
      section: '',
      description: parsed.description,
      content: parsed.description,
      group,
      recordType: 'page',
      packageName: parsed.packageName,
      kind: parsed.kind,
      status: parsed.status,
      contentLocale: choice.contentLocale,
      isFallback: choice.isFallback,
      identifiers: pageIdentifiers,
    }));
    // ⚓ every heading, so a later duplicate still gets the same suffix the page renders
    const headings = markdownHeadings(parsed.body);
    // 🧭 the open h2 / h3, for the breadcrumb
    let h2 = '';
    let h3 = '';
    // 🚶 h1–h6, records only for h2–h4
    for (const heading of headings) {
      // 🧭 track the breadcrumb even when the level is not indexed
      if (heading.level === 2) {
        h2 = heading.text;
        h3 = '';
      } else if (heading.level === 3) {
        h3 = heading.text;
      }
      // ⏭️ the h1 is the page title; h5+ are not in the outline
      if (heading.level < 2 || heading.level > 4) continue;
      // 🧭 `Parent › This heading`
      const section = [heading.level >= 3 ? h2 : '', heading.level >= 4 ? h3 : '', heading.text].filter(Boolean).join(' › ');
      // 📄 the section row
      records.push(docRecord({
        id: `section:${pageId}#${heading.anchor}`,
        url: `${url}#${heading.anchor}`,
        title: heading.text,
        section,
      description: '',
      content: heading.excerpt,
        group,
        recordType: 'section',
        packageName: parsed.packageName,
        kind: parsed.kind,
        status: parsed.status,
        contentLocale: choice.contentLocale,
        isFallback: choice.isFallback,
        identifiers: codeNames(heading.text, heading.excerpt, parsed.packageName),
      }));
    }
  }
  // 📚
  return records;
}


/**
 * `propHeading` - the MDX heading of a props symbol (`AbAppLayoutProps (server)`) 📋
 *
 * Mirrors the extractor: a `server.` id is the server twin; a symbol that has a server twin is marked client.
 *
 * @param { string } id
 * @param { string } name
 * @param { readonly string[] } ids - every symbol id in the JSON
 * @returns { string }
 */
export function propHeading(id: string, name: string, ids: readonly string[]): string {
  // 🖥️ the server twin
  if (id.startsWith('server.')) return `${name} (server)`;
  // 🖥️ the client twin, only when a server copy exists
  if (ids.some((item) => item === `server.${id}`)) return `${name} (client)`;
  // 📋 the name as written
  return name;
}


/**
 * `propLabel` - `'aria-label'` → `aria-label` 🏷️
 *
 * @param { string } name
 * @returns { string }
 */
function propLabel(name: string): string {
  // ✂️ the quotes the extractor keeps around attribute names
  const quoted = /^'(.*)'$/.exec(name);
  // 🏷️
  return quoted?.[1] ? quoted[1] : name;
}


/**
 * `loadPropPages` - symbol id → docs page (`components/drawer`) from the inventory 📋
 *
 * @param { string } root
 * @returns { Map<string, string> }
 */
function loadPropPages(root: string): Map<string, string> {
  // 📖 the inventory the props extractor writes
  const inventory = JSON.parse(readFileSync(join(root, 'data', 'props', 'inventory.json'), 'utf8')) as {
    covered?: { id?: string; page?: string | null }[];
  };
  // 🗺️ id → page
  const pages = new Map<string, string>();
  // 🚶
  for (const item of inventory.covered ?? []) {
    if (item.id && item.page) pages.set(item.id, item.page);
  }
  // 🗺️
  return pages;
}


/**
 * `sectionUrl` - the docs URL of a heading on a props page, or a slug of the heading 🔗
 *
 * @param { readonly SearchRecord[] } docs - the locale's page and section rows
 * @param { string } page - `components/drawer`
 * @param { string } heading
 * @returns { string }
 */
function sectionUrl(docs: readonly SearchRecord[], page: string, heading: string): string {
  // 🔗 `/docs/packages/components/drawer`
  const path = `/docs/packages/${page}`;
  // 🔎 the section row the MDX indexer already named
  const found = docs.find((record) => record.recordType === 'section' && record.title === heading && record.url.startsWith(`${path}#`));
  // ✅ the real anchor
  if (found) return found.url;
  // ⚓ a fresh slug when the heading is not on that page (still a stable link)
  const anchor = markdownHeadings(`## ${heading}`).find((item) => item.level === 2)?.anchor ?? heading;
  // 🔗
  return `${path}#${anchor}`;
}


/**
 * `collectPropRecords` - one row per prop name, plus a union that has a type and no rows 📋
 *
 * @param { string } root
 * @param { AppLocale } locale
 * @param { readonly SearchRecord[] } docs - so the link uses the real heading id
 * @returns { SearchRecord[] }
 */
export function collectPropRecords(root: string, locale: AppLocale, docs: readonly SearchRecord[]): SearchRecord[] {
  // 📖 the generated props
  const generated = JSON.parse(readFileSync(join(root, 'data', 'props', 'generated.json'), 'utf8')) as { symbols?: PropSymbol[] };
  // 📋 the symbols
  const symbols = generated.symbols ?? [];
  // 🗺️ which docs page documents each symbol
  const pages = loadPropPages(root);
  // 🆔 every id, for the client/server heading
  const ids = symbols.map((symbol) => symbol.id ?? '');
  // 🏳️ props are English; fr / es / ru carry the badge
  const isFallback = locale !== 'en';
  // 📃
  const records: SearchRecord[] = [];
  // 🚶 each symbol
  for (const symbol of symbols) {
    // ⏭️ a row without an id cannot be linked
    if (!symbol.id || !symbol.name) continue;
    // 📄 the docs page (`components/drawer`), or skip a symbol the inventory does not place
    const page = pages.get(symbol.id);
    if (!page) continue;
    // 🏷️ the heading on that page
    const heading = propHeading(symbol.id, symbol.name, ids);
    // 🔗 the real `#id`
    const url = sectionUrl(docs, page, heading);
    // 📛
    const packageName = symbol.packageName ?? '';
    // 📋 each prop
    for (const row of symbol.rows ?? []) {
      // ⏭️ a nameless row
      if (!row.name) continue;
      // 🏷️ without the wrapping quotes
      const label = propLabel(row.name);
      // 🔤 the type, capped
      const type = (row.type ?? '').replace(/\s+/g, ' ').trim();
      const typeText = type.length > PROP_TYPE_LIMIT ? `${type.slice(0, PROP_TYPE_LIMIT).trim()}…` : type;
      // 📋 the prop row
      records.push({
        id: `prop:${symbol.id}:${label}`,
        url,
        title: label,
        section: heading,
        description: '',
        content: typeText ? `${label} ${typeText}` : label,
        group: 'props',
        recordType: 'prop',
        packageName,
        kind: '',
        status: '',
        contentLocale: 'en',
        isFallback,
        identifiers: [symbol.name, label, packageName].filter(Boolean).join(' '),
      });
    }
    // 🔤 a union / alias with a type and no rows (the name is the thing you search)
    if ((!symbol.rows || symbol.rows.length === 0) && symbol.type) {
      const type = symbol.type.replace(/\s+/g, ' ').trim();
      const typeText = type.length > PROP_TYPE_LIMIT ? `${type.slice(0, PROP_TYPE_LIMIT).trim()}…` : type;
      records.push({
        id: `prop:${symbol.id}`,
        url,
        title: symbol.name,
        section: heading,
        description: '',
        content: typeText,
        group: 'props',
        recordType: 'prop',
        packageName,
        kind: '',
        status: '',
        contentLocale: 'en',
        isFallback,
        identifiers: [symbol.name, packageName].filter(Boolean).join(' '),
      });
    }
  }
  // 📋
  return records;
}


/**
 * `collectPackageRecords` - the 8 home cards and their exported symbols 📦
 *
 * @param { string } root
 * @param { AppLocale } locale
 * @returns { SearchRecord[] }
 */
export function collectPackageRecords(root: string, locale: AppLocale): SearchRecord[] {
  // 📦 the cards, in home order
  const packages = getAbPackages(root);
  // 🏳️ the npm description is English
  const isFallback = locale !== 'en';
  // 📃
  const records: SearchRecord[] = [];
  // 🚶 each package
  for (const pkg of packages) {
    // 📦 the home card (`/#package-core`)
    records.push(packageOverview(pkg, isFallback));
    // 🧩 each exported `Ab*` / `useAb*` name, linking at the package docs page
    for (const symbol of getAbPackageSymbols(pkg.id, root)) {
      records.push({
        id: `symbol:${pkg.id}:${symbol}`,
        url: `/docs/packages/${pkg.id}`,
        title: symbol,
        section: pkg.title,
        description: '',
        content: `${symbol} ${pkg.name}`,
        group: 'packages',
        recordType: 'symbol',
        packageName: pkg.name,
        kind: '',
        status: pkg.beta ? 'beta' : '',
        contentLocale: 'en',
        isFallback,
        identifiers: `${symbol} ${pkg.name}`,
      });
    }
  }
  // 📦
  return records;
}


/**
 * `packageOverview` - one home-card row 📦
 *
 * @param { AbPackage } pkg
 * @param { boolean } isFallback
 * @returns { SearchRecord }
 */
function packageOverview(pkg: AbPackage, isFallback: boolean): SearchRecord {
  // 📦 the card
  return {
    id: `package:${pkg.id}`,
    url: `/#package-${pkg.id}`,
    title: pkg.title,
    section: '',
    description: pkg.description ?? '',
    content: [pkg.name, pkg.version, pkg.description ?? ''].filter(Boolean).join(' '),
    group: 'packages',
    recordType: 'package',
    packageName: pkg.name,
    kind: '',
    status: pkg.beta ? 'beta' : 'stable',
    contentLocale: 'en',
    isFallback,
    identifiers: `${pkg.name} ${pkg.title}`,
  };
}


/**
 * `collectChangelogRecords` - package headings and released version anchors 📜
 *
 * The id is the same `id` the changelog page puts on the heading (`#components-0.7.0`).
 *
 * @param { string } root
 * @param { AppLocale } locale
 * @returns { SearchRecord[] }
 */
export function collectChangelogRecords(root: string, locale: AppLocale): SearchRecord[] {
  // 📜 app + every installed package
  const docs = loadChangelogs(root);
  // 🏳️ the notes are English on every locale (the page shows the banner)
  const isFallback = locale !== 'en';
  // 📃
  const records: SearchRecord[] = [];
  // 🚶 each file
  for (const doc of docs) {
    // 📦 the package heading (`#components`)
    records.push(changelogRow(doc, {
      id: `changelog:${doc.id}`,
      anchor: doc.id,
      title: doc.title,
      section: '',
      description: '',
      content: `${doc.name} ${doc.installedVersion}`,
      isFallback,
    }));
    // 🔢 each released version (the same anchor the page renders)
    for (const entry of doc.entries) {
      if (entry.kind !== 'version' || !entry.version) continue;
      records.push(changelogRow(doc, {
        id: `changelog:${entry.anchor}`,
        anchor: entry.anchor,
        title: `${doc.title} ${entry.version}`,
        section: doc.title,
        description: '',
        content: [entry.version, entry.date, plainExcerpt(entry.body, 48)].filter(Boolean).join(' '),
        isFallback,
      }));
    }
  }
  // 📜
  return records;
}


// 📜 the fields that differ between a package heading and a version heading
type ChangelogRowInput = {
  id: string;
  anchor: string;
  title: string;
  section: string;
  description: string;
  content: string;
  isFallback: boolean;
};


/**
 * `changelogRow` - one changelog record 📜
 *
 * @param { ChangelogDocument } doc
 * @param { ChangelogRowInput } input
 * @returns { SearchRecord }
 */
function changelogRow(doc: ChangelogDocument, input: ChangelogRowInput): SearchRecord {
  // 📜 the row
  return {
    id: input.id,
    url: `/changelog#${input.anchor}`,
    title: input.title,
    section: input.section,
    description: input.description,
    content: input.content,
    group: 'changelog',
    recordType: 'changelog',
    packageName: doc.name,
    kind: '',
    status: '',
    contentLocale: 'en',
    isFallback: input.isFallback,
    identifiers: `${doc.name} ${input.title}`,
  };
}


/**
 * `collectSearchRecords` - every row for one locale 🔎
 *
 * @param { string } root
 * @param { AppLocale } locale
 * @returns { SearchRecord[] }
 */
export function collectSearchRecords(root: string, locale: AppLocale): SearchRecord[] {
  // 📚 pages and headings first (prop links look these anchors up)
  const docs = collectDocRecords(root, locale);
  // 📦 cards + symbols
  const packages = collectPackageRecords(root, locale);
  // 📋 prop names and types
  const props = collectPropRecords(root, locale, docs);
  // 📜 changelog anchors
  const changelog = collectChangelogRecords(root, locale);
  // 🔎 one list, in that order
  return [...docs, ...packages, ...props, ...changelog];
}


/**
 * `buildSearchFile` - the JSON document for one locale (snapshot + suggestion terms) 📦
 *
 * @param { string } root
 * @param { AppLocale } locale
 * @param { readonly SearchRecord[] } [records] - pass rows already collected, or let this read the repo
 * @returns { SearchSnapshotFile }
 */
export function buildSearchFile(root: string, locale: AppLocale, records: readonly SearchRecord[] = collectSearchRecords(root, locale)): SearchSnapshotFile {
  // 🗣️ the zbsearch language name
  const language = SEARCH_LANGUAGES[locale];
  // 🔎 a fresh database. The tokenizer carries the language; zbsearch rejects a second `language` option.
  const db = create({
    ...SEARCH_CREATE,
    components: { tokenizer: createSearchTokenizer(locale) },
  });
  // ➕ every row
  for (const record of records) insert(db, record);
  // 💡 the short term list
  const suggestions = suggestionDictionary(records);
  // 📦 the file the route will serve
  return {
    locale,
    engine: 'zbsearch',
    engineVersion: '4.0.1',
    language,
    schemaVersion: SCHEMA_VERSION,
    suggestions,
    snapshot: save(db),
  };
}


/**
 * `openSearchSnapshot` - a database a later client can `search`, from a saved snapshot 🔎
 *
 * The tokenizer is not inside the snapshot. Pass the same locale the file was built for.
 * Cmd/Ctrl+K can call this after fetching `/api/search/<locale>`; the opener does not matter.
 *
 * @param { AppLocale } locale
 * @param { RawData } raw - `file.snapshot`
 * @returns the zbsearch database
 */
export function openSearchSnapshot(locale: AppLocale, raw: RawData) {
  // 🔎 the same schema, sorter and tokenizer the build used (the tokenizer owns the language)
  const db = create({
    ...SEARCH_CREATE,
    components: { tokenizer: createSearchTokenizer(locale) },
  });
  // 📥 restore the rows and the index
  load(db, raw);
  // 🔎 ready to search
  return db;
}


/**
 * `snapshotDocuments` - the rows stored inside a zbsearch snapshot 📄
 *
 * @param { unknown } snapshot
 * @returns { SearchRecord[] }
 */
export function snapshotDocuments(snapshot: unknown): SearchRecord[] {
  // 📦 `save()` puts the document store on `docs`
  const store = snapshot && typeof snapshot === 'object' && 'docs' in snapshot ? snapshot.docs : null;
  // 📄 `{ docs, count }`
  const docs = store && typeof store === 'object' && 'docs' in store ? (store as { docs?: unknown }).docs : null;
  // 🫥 not a snapshot we wrote
  if (!docs || typeof docs !== 'object') return [];
  // 📄 each stored row
  return Object.values(docs as Record<string, SearchRecord>);
}


/**
 * `serializeSearchFile` - stable JSON, one trailing newline 📝
 *
 * @param { SearchSnapshotFile } file
 * @returns { string }
 */
export function serializeSearchFile(file: SearchSnapshotFile): string {
  // 📝 compact (the gzip budget is the limit that matters)
  return `${JSON.stringify(file)}\n`;
}


/**
 * `writeSearchSnapshots` - write `data/search/<locale>.json` for every locale 📁
 *
 * @param { string } [root]
 * @param { string } [outDir] - override the output directory (tests)
 * @returns { SearchLocaleReport[] }
 */
export function writeSearchSnapshots(root: string = process.cwd(), outDir: string = join(root, SEARCH_DIR)): SearchLocaleReport[] {
  // 📁 the folder
  mkdirSync(outDir, { recursive: true });
  // 📊 one report per locale
  const reports: SearchLocaleReport[] = [];
  // 🌍 en, fr, es, ru
  for (const locale of SEARCH_LOCALES) {
    // 🔎 the rows (pages first, so fallback slugs are easy to list)
    const records = collectSearchRecords(root, locale);
    // 📦 the snapshot
    const file = buildSearchFile(root, locale, records);
    // 📝 JSON
    const json = serializeSearchFile(file);
    // 📁 `<out>/<locale>.json`
    const path = join(outDir, `${locale}.json`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, json);
    // 🏳️ page slugs still in English, and the ones that have a translation
    const pages = records.filter((record) => record.recordType === 'page');
    // 📊
    reports.push({
      locale,
      rawBytes: Buffer.byteLength(json),
      gzipBytes: gzipSize(json),
      counts: countRecords(records),
      fallbackPages: pages.filter((record) => record.isFallback).map((record) => record.url),
      translatedPages: pages.filter((record) => !record.isFallback).map((record) => record.url),
    });
  }
  // 📊
  return reports;
}


/**
 * `gzipSize` - gzip byte length of a string 💨
 *
 * @param { string } json
 * @returns { number }
 */
export function gzipSize(json: string): number {
  // 💨 the compressed byte length
  return gzipSync(Buffer.from(json)).length;
}


/**
 * `readSearchSnapshot` - one locale file, parsed 📖
 *
 * @param { string } root
 * @param { string } locale
 * @returns { SearchSnapshotFile }
 */
export function readSearchSnapshot(root: string, locale: string): SearchSnapshotFile {
  // 🌍 only a configured locale
  if (!isSearchLocale(locale)) throw new Error(`search-index: unknown locale ${locale}`);
  // 📖 the file prebuild wrote
  const json = readFileSync(searchSnapshotPath(root, locale), 'utf8');
  // 📦
  return JSON.parse(json) as SearchSnapshotFile;
}
