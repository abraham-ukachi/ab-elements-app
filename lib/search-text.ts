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
* @name: abElements Search Text
* @file: lib/search-text.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> tokenizeSearchText('useAbScrollSpy', 'fr') // parts + the exact name, unstemmed 🧩
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// ✂️ Text for the search index (0.2.30): per-locale stemmers, a code-identifier normalizer, plain excerpts
//    (code-fence bodies dropped) and the small "Did you mean …?" dictionary.
//    The same tokenizer runs at index time and, later, at query time (`openSearchSnapshot`). Snapshots do not
//    store the function, so both sides import this file. No `eval`, no `new Function` 🛡️.

// import the locale union 🌍
import type { AppLocale } from './search-meta.ts';
// import the stemmers that match the installed zbsearch 4.0.1 (one function per language) 🌱
import { stemmer as englishStemmer } from '@zbsearch/stemmers/english';
import { stemmer as frenchStemmer } from '@zbsearch/stemmers/french';
import { stemmer as spanishStemmer } from '@zbsearch/stemmers/spanish';
import { stemmer as russianStemmer } from '@zbsearch/stemmers/russian';
// import the heading slugger fumadocs uses, so `#id` matches the rendered heading ⚓
import GithubSlugger from 'github-slugger';


// 🌱 `(word) => stem`. Input is already lowercased.
type SearchStemmer = (word: string) => string;

// 🗣️ zbsearch's language name for each app locale (the tokenizer reports this name)
export const SEARCH_LANGUAGES: Readonly<Record<AppLocale, string>> = {
  en: 'english', // 🇬🇧
  fr: 'french', // 🇫🇷
  es: 'spanish', // 🇪🇸
  ru: 'russian', // 🇷🇺
};

// 🌱 the stemmer for each locale, from `@zbsearch/stemmers`
const STEMMERS: Readonly<Record<AppLocale, SearchStemmer>> = {
  en: englishStemmer, // 🇬🇧 buttons → button
  fr: frenchStemmer, // 🇫🇷 boutons → bouton
  es: spanishStemmer, // 🇪🇸 botones → boton
  ru: russianStemmer, // 🇷🇺 кнопки → кнопк
};

// 🧩 a camelCase / PascalCase / kebab / snake span worth splitting (`AbButton`, `useAbScrollSpy`, `ab-nextjs-core`)
const IDENTIFIER_SPAN = /\b[A-Za-z][A-Za-z0-9]*(?:[_-][A-Za-z0-9]+)+\b|\b(?:useAb[A-Za-z0-9]+|Ab[A-Z][A-Za-z0-9]*|AB_[A-Z0-9_]+)\b/g;

// 📝 how long a section or changelog excerpt may be (code fences are already gone).
//    Short on purpose: the gzip budget is 150 KB per locale, and the inverted index grows with every extra word.
export const SEARCH_EXCERPT_LIMIT = 80;

// 💡 suggestion terms stay short; a whole sentence is not a "did you mean"
const SUGGESTION_MAX = 48;


/**
 * `stemSearchWord` - the locale stem of one word 🌱
 *
 * @param { AppLocale } locale
 * @param { string } word
 * @returns { string }
 */
export function stemSearchWord(locale: AppLocale, word: string): string {
  // 🔡 the stemmer expects lower case
  const lower = word.toLowerCase();
  // 🌱 french / spanish / russian / english
  return STEMMERS[locale](lower);
}


/**
 * `splitIdentifier` - `useAbScrollSpy` → `use`, `ab`, `scroll`, `spy` 🧩
 *
 * @param { string } name
 * @returns { string[] }
 */
export function splitIdentifier(name: string): string[] {
  // ✂️ hyphens and underscores become spaces, then a capital starts a new word
  const spaced = name
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  // 🔡 parts of at least three characters (`ab` alone matches every package name)
  return spaced.toLowerCase().split(/\s+/).filter((part) => part.length >= 3);
}


/**
 * `identifierForms` - the exact name, the compact name, and the parts 🧩
 *
 * `AbButton` → `abbutton`, `ab`, `button`. `ab-nextjs-core` → `ab-nextjs-core`, `abnextjscore`, `ab`, `nextjs`, `core`.
 *
 * @param { string } name
 * @returns { string[] }
 */
export function identifierForms(name: string): string[] {
  // 🧹 the raw token
  const exact = name.trim();
  // 🫥 nothing to index
  if (!exact) return [];
  // 🔡 lower case keeps the hyphens (`ab-nextjs-core` stays findable as typed)
  const lower = exact.toLowerCase();
  // 🔗 the same name with separators removed (`abnextjscore`, `abbutton`)
  const compact = lower.replace(/[^a-z0-9]+/g, '');
  // 🧩 unique forms, shortest noise (`a`) dropped
  return [...new Set([lower, compact, ...splitIdentifier(exact)])].filter((token) => token.length >= 3);
}


/**
 * `tokenizeSearchText` - words for one field 🔎
 *
 * Every word is stored raw AND stemmed, so a French stemmer cannot hide `core` (it would become `cor`)
 * and `boutons` still meets `bouton`. Identifier spans also add their parts and the exact name.
 *
 * @param { string } raw
 * @param { AppLocale } locale
 * @returns { string[] }
 */
export function tokenizeSearchText(raw: string, locale: AppLocale): string[] {
  // 🫥 not text
  if (typeof raw !== 'string' || !raw) return [];
  // 🌱 this locale's stemmer
  const stem = STEMMERS[locale];
  // 🧺 unique tokens
  const tokens = new Set<string>();
  // 🔤 letters and numbers (Latin, Cyrillic, accents). A hyphen splits, which is what package names need.
  const words = raw.match(/[\p{L}\p{N}]+/gu) ?? [];
  // 🚶 each word
  for (const word of words) {
    // 🔡 lower case (`AbButton` → `abbutton`, the exact name)
    const lower = word.toLowerCase();
    // ⏭️ one or two letters (`ab`, `id`) match too much of the catalog
    if (lower.length < 3) continue;
    // 📎 the raw form, so a stemmer that rewrites `core` to `cor` cannot hide the name
    tokens.add(lower);
    // 🌱 the stem (`boutons` → `bouton`), only when it differs
    const stemmed = stem(lower);
    if (stemmed && stemmed.length >= 2 && stemmed !== lower) tokens.add(stemmed);
    // 🧩 mixed case is a code name: index the parts (`use`, `ab`, `scroll`, `spy`)
    if (/[A-Z]/.test(word) && /[a-z]/.test(word)) {
      for (const part of splitIdentifier(word)) tokens.add(part);
    }
  }
  // 🧩 kebab / snake spans also keep a compact exact form (`ab-nextjs-core` → `abnextjscore`)
  for (const span of raw.match(IDENTIFIER_SPAN) ?? []) {
    if (/[_-]/.test(span)) {
      const compact = span.toLowerCase().replace(/[^a-z0-9]+/g, '');
      if (compact.length >= 3) tokens.add(compact);
    }
    for (const part of splitIdentifier(span)) tokens.add(part);
  }
  // 📃 a stable list
  return [...tokens];
}


// 🔎 the tokenizer zbsearch calls (`tokenize(value, language, prop)`)
export type SearchTokenizer = {
  language: string; // 🗣️ zbsearch language name
  normalizationCache: Map<string, string>; // 🗄️ required by the tokenizer interface (unused; we do not cache)
  tokenize: (raw: string, language?: string, prop?: string) => string[]; // ✂️
};


/**
 * `createSearchTokenizer` - the tokenizer for one locale snapshot 🔎
 *
 * Build time and the later client must both use this. `load()` does not restore it.
 *
 * @param { AppLocale } locale
 * @returns { SearchTokenizer }
 */
export function createSearchTokenizer(locale: AppLocale): SearchTokenizer {
  // 🗣️ the name zbsearch stores on the database
  const language = SEARCH_LANGUAGES[locale];
  // 🔎 the object `create({ components: { tokenizer } })` expects
  return {
    language, // 🗣️
    normalizationCache: new Map(), // 🗄️ interface field
    // ✂️ language and property are the engine's; the locale is already closed over
    tokenize(raw: string): string[] {
      return tokenizeSearchText(raw, locale);
    },
  };
}


/**
 * `stripCodeFences` - drop fenced code bodies, keep the surrounding prose 🧹
 *
 * @param { string } markdown
 * @returns { string }
 */
export function stripCodeFences(markdown: string): string {
  // 🧹 a fence runs from an opening ``` line to the next closing ``` line
  return markdown.replace(/^[ \t]{0,3}```[^\n]*\n[\s\S]*?^[ \t]{0,3}```[ \t]*$/gm, '');
}


/**
 * `plainExcerpt` - markdown → one line of plain text, capped 📝
 *
 * @param { string } markdown
 * @param { number } [limit]
 * @returns { string }
 */
export function plainExcerpt(markdown: string, limit: number = SEARCH_EXCERPT_LIMIT): string {
  // 🧹 fences first, so a sample does not become the excerpt
  const withoutFences = stripCodeFences(markdown);
  // 🔤 links and images become their label, inline code loses its backticks, tags drop
  const plain = withoutFences
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<\/?[A-Za-z][^>\n]*>/g, ' ')
    .replace(/[*_~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // ✂️ cap the stored excerpt
  return plain.length > limit ? plain.slice(0, limit).trim() : plain;
}


// ⚓ one heading after the slugger has named it
export type SearchHeading = {
  level: number; // 📏 1–6 (only 2–4 become records; 1 and 5+ still advance the slugger)
  text: string; // 🏷️ the heading text
  anchor: string; // ⚓ the `#id` without the hash
  excerpt: string; // 📝 the prose under it, fences removed
};


/**
 * `headingAnchor` - the id fumadocs would write for this heading text ⚓
 *
 * A custom `[#id]` suffix wins, and it does not consume a generated slug (same rule as fumadocs' remark heading).
 *
 * @param { GithubSlugger } slugger - one slugger per file, in document order
 * @param { string } text - the heading text, hashes already removed
 * @returns { { text: string; anchor: string } }
 */
export function headingAnchor(slugger: GithubSlugger, text: string): { text: string; anchor: string } {
  // ⚓ an explicit `[#id]` at the end of the heading
  const custom = /\s*\[#([^\]]+)]\s*$/.exec(text);
  // ✅ use that id and do not advance the generated-slug counter
  if (custom?.[1]) return { text: text.slice(0, custom.index).trim(), anchor: custom[1] };
  // ⚓ github-slugger, the same one the MDX pipeline uses
  return { text: text.trim(), anchor: slugger.slug(text.trim()) };
}


/**
 * `markdownHeadings` - h1–h6 in order, with the anchors the page will render ⚓
 *
 * @param { string } body - markdown without the frontmatter
 * @returns { SearchHeading[] }
 */
export function markdownHeadings(body: string): SearchHeading[] {
  // 🧹 fences can contain a fake `##` line; drop them before scanning
  const source = stripCodeFences(body).replace(/\r\n/g, '\n');
  // ⚓ one slugger for this file (a repeated heading becomes `title-1`)
  const slugger = new GithubSlugger();
  // 📃 the lines
  const lines = source.split('\n');
  // 📍 heading line indexes
  const at: { index: number; level: number; text: string }[] = [];
  // 🚶 each line
  for (let index = 0; index < lines.length; index += 1) {
    // 🔎 a heading at the start of the line
    const match = /^(#{1,6})[ \t]+(.+?)[ \t]*$/.exec(lines[index] ?? '');
    // ⏭️ prose
    if (!match?.[1] || !match[2]) continue;
    // 📍 remember it
    at.push({ index, level: match[1].length, text: match[2] });
  }
  // ⚓ name them in order, then take the prose until the next heading
  return at.map((heading, position) => {
    // ⚓ the id
    const named = headingAnchor(slugger, heading.text);
    // 📍 the next heading line, or the end of the file
    const next = at[position + 1]?.index ?? lines.length;
    // 📝 the lines under this heading
    const excerpt = plainExcerpt(lines.slice(heading.index + 1, next).join('\n'));
    // 📄 the heading
    return { level: heading.level, text: named.text, anchor: named.anchor, excerpt };
  });
}


/**
 * `levenshtein` - edit distance, for "Did you mean …?" 💡
 *
 * @param { string } left
 * @param { string } right
 * @returns { number }
 */
export function levenshtein(left: string, right: string): number {
  // 📏 the widths
  const rows = left.length;
  const cols = right.length;
  // 🟰 a shortcut when one side is empty
  if (rows === 0) return cols;
  if (cols === 0) return rows;
  // 🧮 one row of distances, previous word on the left
  let previous = Array.from({ length: cols + 1 }, (_, index) => index);
  // 🚶 each character of `left`
  for (let row = 1; row <= rows; row += 1) {
    // 🧮 the next row starts with a deletion of `row` characters
    const current = [row];
    // 🚶 each character of `right`
    for (let col = 1; col <= cols; col += 1) {
      // 💰 a match costs nothing; a substitution costs one
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      // 🧮 insert, delete, or substitute
      current[col] = Math.min(
        current[col - 1]! + 1,
        previous[col]! + 1,
        previous[col - 1]! + cost,
      );
    }
    // ➡️ slide the window
    previous = current;
  }
  // 🔢 the distance
  return previous[cols] ?? 0;
}


/**
 * `suggestionDictionary` - the short term list for one locale 💡
 *
 * Titles, code names and heading words. Not the whole prose vocabulary.
 *
 * @param { readonly { title: string; identifiers: string }[] } records
 * @returns { string[] }
 */
export function suggestionDictionary(records: readonly { title: string; identifiers: string }[]): string[] {
  // 🧺 unique terms
  const terms = new Set<string>();
  // ➕ keep a short term
  const add = (value: string): void => {
    const trimmed = value.trim();
    if (trimmed.length >= 3 && trimmed.length <= SUGGESTION_MAX) terms.add(trimmed);
  };
  // 🚶 each row
  for (const record of records) {
    // 🏷️ the hit title (`AbButton`, `Installation`, `Установка`)
    add(record.title);
    // 🧩 code parts of four letters or more (`button`, `scroll`, `layout`)
    for (const part of splitIdentifier(record.identifiers)) {
      if (part.length >= 4) terms.add(part);
    }
    // 🔤 words of the title (a multi-word heading still suggests each word)
    for (const word of record.title.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? []) terms.add(word);
  }
  // 🔤 stable order
  return [...terms].sort((left, right) => left.localeCompare(right, 'en'));
}


/**
 * `suggestSearchTerms` - up to `limit` dictionary terms within edit distance 2 💡
 *
 * An exact dictionary hit returns nothing: the query is already a term.
 *
 * @param { string } query
 * @param { readonly string[] } dictionary
 * @param { number } [limit]
 * @returns { string[] }
 */
export function suggestSearchTerms(query: string, dictionary: readonly string[], limit: number = 3): string[] {
  // 🔡 the folded query
  const needle = query.trim().toLowerCase();
  // ⏭️ too short to suggest
  if (needle.length < 3) return [];
  // ✅ already a known term
  if (dictionary.some((term) => term.toLowerCase() === needle)) return [];
  // 🧮 candidates
  const ranked: { term: string; distance: number }[] = [];
  // 🚶 the dictionary
  for (const term of dictionary) {
    // 🔡 folded form
    const folded = term.toLowerCase();
    // ⏭️ a very different length cannot be distance ≤ 2
    if (Math.abs(folded.length - needle.length) > 2) continue;
    // 🧮 the distance
    const distance = levenshtein(needle, folded);
    // 💡 a near miss
    if (distance > 0 && distance <= 2) ranked.push({ term, distance });
  }
  // 🥇 closest first, then alphabetical
  ranked.sort((left, right) => left.distance - right.distance || left.term.localeCompare(right.term, 'en'));
  // 🧺 unique folded forms, original spelling kept
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of ranked) {
    const key = item.term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item.term);
    if (out.length >= limit) break;
  }
  // 💡 the suggestions
  return out;
}
