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
* @name: abElements Changelog
* @file: lib/changelog.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> const docs = loadChangelogs() // app + every installed ab-nextjs-* changelog 📜
*    -|> enforceChangelogGate() // throws unless AB_CHANGELOG_GATE=warn 🚦
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📜 Build-time changelog (0.2.29): read each installed `ab-nextjs-*` CHANGELOG.md plus the app's own file,
//    accept both `##` and `###` version headings, and fail the build when the installed version has no released entry.
//    The page renders the parsed blocks as React elements. Raw HTML in the markdown stays text. It is never a node 🚫.
//    Gitmoji shortcodes (`:memo:`) become emoji here, from a fixed table, and only in text runs. The CHANGELOG files stay as written.

// import the file reader 📁
import { readFileSync } from 'node:fs';
// import the path joiner 🧭
import { join } from 'node:path';
// import the eight package ids (the gate walks these, in card order) 📦
//    a relative `.ts` import so `node --experimental-strip-types` can load this file from prebuild (no `@/` alias there)
import { AB_PACKAGE_IDS, type AbPackageId } from './packages.ts';


// 🚦 the review-only switch. Unset (and any other value) keeps the build strict. `warn` prints and continues.
//    CI does not set it. A local review build may: `AB_CHANGELOG_GATE=warn pnpm build`.
export const AB_CHANGELOG_GATE = 'AB_CHANGELOG_GATE';

// 🔢 a released semver, optional pre-release, no leading `v` (the heading may still write `v`)
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/;

// 🚦 why an installed version does not count as a released entry
export type ChangelogGateReason = 'missing' | 'unreleased' | 'heading-format';

// 🔤 one inline run (text is escaped by React; there is no HTML inline)
export type ChangelogInline =
  | { type: 'text'; text: string }
  | { type: 'code'; text: string }
  | { type: 'em'; children: ChangelogInline[] }
  | { type: 'strong'; children: ChangelogInline[] }
  | { type: 'link'; href: string; children: ChangelogInline[] };

// 🧱 one block of an entry. A heading inside an entry is an h4, under the version's h3.
export type ChangelogBlock =
  | { type: 'p'; children: ChangelogInline[] }
  | { type: 'h'; text: string }
  | { type: 'ul'; items: ChangelogInline[][] }
  | { type: 'ol'; items: ChangelogInline[][] }
  | { type: 'pre'; lang: string; code: string }
  | { type: 'quote'; children: ChangelogInline[] };

// 🏷️ one version (or Unreleased) section
export type ChangelogEntry = {
  level: 2 | 3; // 📏 the heading that opened it (`##` or `###`)
  kind: 'version' | 'unreleased'; // 🚦 released notes, or an Unreleased heading
  version: string | null; // 🔢 semver, or null for a bare Unreleased heading
  date: string | null; // 📅 the parenthetical, including the word Unreleased
  compareUrl: string | null; // 🔗 the compare link, when the heading has one
  anchor: string; // ⚓ `#components-0.7.0`
  body: string; // 📝 the markdown under the heading
};

// ⚠️ a heading that mentions a version but is not a clean `##` / `###` version heading
export type ChangelogMalformed = {
  level: number; // 📏 1–6
  text: string; // 🔤 the heading text
  versions: string[]; // 🔢 semver tokens found in it
};

// 📦 one changelog file, parsed
export type ChangelogDocument = {
  id: string; // 🆔 `components`, or `app`
  name: string; // 📛 `ab-nextjs-components` or `ab-elements-app`
  title: string; // 🏷️ the h2
  installedVersion: string; // 🔢 package.json version
  entries: ChangelogEntry[]; // 📜 top to bottom
  malformed: ChangelogMalformed[]; // ⚠️ bad headings (the gate reads these)
  source: string; // 📁 path, for the report
};

// 🚨 one package whose installed version has no released entry
export type ChangelogFailure = {
  id: string; // 🆔
  name: string; // 📛
  version: string; // 🔢 the installed version
  reason: ChangelogGateReason; // 🚦 missing, unreleased, or heading-format
  detail: string; // 📝 the exact why
};

// 🧾 the gate's full report (failures and the packages that passed)
export type ChangelogAudit = {
  failures: ChangelogFailure[]; // 🚨
  passed: { name: string; version: string }[]; // ✅
};


/**
 * `changelogGateMode` - `warn` only when the review flag is exactly `warn` 🚦
 *
 * @returns { 'strict' | 'warn' }
 */
export function changelogGateMode(): 'strict' | 'warn' {
  // ✅ the one review spelling. Anything else, including empty, stays strict.
  return process.env[AB_CHANGELOG_GATE] === 'warn' ? 'warn' : 'strict';
}


/**
 * `semverOf` - the canonical version (`v0.7.0` → `0.7.0`), or null 🔢
 *
 * @param { string } value
 * @returns { string | null }
 */
function semverOf(value: string): string | null {
  // ✂️ the optional v
  const bare = value.replace(/^v/, '');
  // ✅ a version, or not
  return SEMVER.test(bare) ? bare : null;
}


/**
 * `versionTokens` - every semver written in a heading 🔎
 *
 * @param { string } text
 * @returns { string[] }
 */
function versionTokens(text: string): string[] {
  // 🔎 word-bounded versions (a compare URL's versions count too; the caller uses the label first)
  return [...text.matchAll(/\b\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?\b/g)].map((match) => match[0]);
}


/**
 * `isUnreleasedWord` - the heading or its date says Unreleased 🚧
 *
 * @param { string | null } value
 * @returns { boolean }
 */
function isUnreleasedWord(value: string | null): boolean {
  // 🚧 the whole token, any case
  return value != null && /^unreleased$/i.test(value.trim());
}


// 🏷️ a classified `##` / `###` line
type ClassifiedHeading = {
  kind: 'version' | 'unreleased' | 'section'; // 🚦 a real entry, or a subsection that stays in the body
  version: string | null; // 🔢
  date: string | null; // 📅
  compareUrl: string | null; // 🔗
};


/**
 * `classifyHeading` - a `##` / `###` line → a version entry, an Unreleased entry, or a subsection 🏷️
 *
 * Clean forms: `## [0.7.0](url) (2026-11-06)`, `### 0.1.7 (2026-10-16)`, `## 0.3.7 (Unreleased)`, `### Unreleased`.
 * Anything else that is still a heading (`### Changes`, `### BREAKING`) stays in the current entry.
 *
 * @param { string } text - the heading text, hashes already removed
 * @returns { ClassifiedHeading }
 */
export function classifyHeading(text: string): ClassifiedHeading {
  // 🔗 `[label](url)` then an optional `(date)`
  const linked = /^\[([^\]]+)\]\(([^)\s]*)\)\s*(.*)$/.exec(text.trim());
  // 🔤 the label, the compare URL, and whatever follows the link
  const label = linked ? linked[1].trim() : text.trim();
  const compareUrl = linked && /^https?:\/\//.test(linked[2]) ? linked[2] : null;
  const rest = (linked ? linked[3] : '').trim();
  // 📅 a single trailing parenthetical is the date (or the word Unreleased)
  const dated = /^(.*?)(?:\s+\(([^)]*)\))?\s*$/.exec(linked ? `${label} ${rest}`.trim() : text.trim());
  // 🧭 when the line is a link, the label is the version and the parenthetical is only the rest
  const paren = linked ? (/^\(([^)]*)\)$/.exec(rest)?.[1] ?? (rest || null)) : (dated?.[2] ?? null);
  const token = linked ? label : (dated?.[1] ?? text).trim().split(/\s+/)[0] ?? '';
  // 🚧 the label or the date is the word Unreleased, and nothing else is hanging off a linked heading
  const unreleased = isUnreleasedWord(token) || isUnreleasedWord(paren);
  const version = semverOf(token);
  // ⚠️ a linked heading whose tail is not a single parenthetical is not a clean version heading
  const linkedTailOk = !linked || rest === '' || /^\([^)]*\)$/.test(rest);
  // ⚠️ a plain heading whose first token is a version may only be followed by the date parenthetical
  const plainTailOk = linked || text.trim() === token || text.trim() === `${token} (${paren ?? ''})`;
  // ✅ a released version
  if (version && !unreleased && linkedTailOk && plainTailOk) return { kind: 'version', version, date: paren, compareUrl };
  // 🚧 Unreleased, with or without a version in the same heading
  if (unreleased && linkedTailOk && (version != null || isUnreleasedWord(token))) return { kind: 'unreleased', version, date: paren ?? (isUnreleasedWord(token) ? 'Unreleased' : null), compareUrl };
  // 📎 a subsection (`### Changes`, a breaking banner). It stays in the entry body.
  return { kind: 'section', version: null, date: null, compareUrl: null };
}


/**
 * `parseChangelog` - one CHANGELOG.md → entries + malformed headings 📜
 *
 * `##` and `###` open a version. `#` is the document title and is skipped. A `###` that is not a version
 * (for example `### Changes`) stays inside the version above it.
 *
 * @param { string } markdown
 * @param { string } id - the anchor prefix (`components`, `app`)
 * @returns { { entries: ChangelogEntry[]; malformed: ChangelogMalformed[] } }
 */
export function parseChangelog(markdown: string, id: string): { entries: ChangelogEntry[]; malformed: ChangelogMalformed[] } {
  // 📜 the entries, in file order
  const entries: ChangelogEntry[] = [];
  // ⚠️ headings that mention a version but are not a clean version heading
  const malformed: ChangelogMalformed[] = [];
  // 🏷️ the entry currently collecting lines
  let current: Omit<ChangelogEntry, 'anchor' | 'body'> | null = null;
  // 📝 that entry's body lines
  let body: string[] = [];
  // 🔢 how many times each anchor base has been used (a second Unreleased gets `-2`)
  const seen = new Map<string, number>();

  /**
   * `flush` - close the open entry 📥
   */
  const flush = (): void => {
    // 🙅 nothing open
    if (!current) return;
    // ⚓ `components-0.7.0`, or `hooks-unreleased`, then `-2` when it repeats
    const base = current.version ? `${id}-${current.version}` : `${id}-unreleased`;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    // 📜 keep it
    entries.push({ ...current, anchor: count === 1 ? base : `${base}-${count}`, body: body.join('\n').trim() });
    // 🧹 ready for the next heading
    current = null;
    body = [];
  };

  // 🚶 every line (keep the body intact, including blanks)
  for (const line of markdown.split(/\r?\n/)) {
    // 🔎 a markdown heading
    const heading = /^(#{1,6})[ \t]+(.+?)\s*$/.exec(line);
    // 📝 not a heading: it belongs to the open entry
    if (!heading) {
      if (current) body.push(line); // 📝
      continue;
    }
    const level = heading[1].length; // 📏
    const text = heading[2].trim(); // 🔤
    const versions = versionTokens(text); // 🔢
    // 📰 `# Changelog` is the document title. A level-1 heading that names a version is a bad heading, not an entry.
    if (level === 1) {
      if (versions.length) malformed.push({ level, text, versions }); // ⚠️ `# 2.0.0`
      continue;
    }
    // 🏷️ only ## and ### can open a version. A deeper heading stays in the body.
    if (level !== 2 && level !== 3) {
      if (versions.length) malformed.push({ level, text, versions }); // ⚠️ `# 0.2.3` or `#### 0.2.3`
      if (current) body.push(line); // 📝
      continue;
    }
    const classified = classifyHeading(text); // 🏷️
    // ⚠️ the line mentions a version but is not a clean version / Unreleased heading
    if (classified.kind === 'section') {
      if (versions.length) malformed.push({ level, text, versions }); // ⚠️
      if (current) body.push(line); // 📎 subsection, still this entry
      continue;
    }
    // 📥 the previous version ends here
    flush();
    // 🆕 this heading opens the next entry
    current = { level: level as 2 | 3, kind: classified.kind, version: classified.version, date: classified.date, compareUrl: classified.compareUrl };
  }
  // 📥 the last entry
  flush();
  // 📜 both lists
  return { entries, malformed };
}


/**
 * `parseChangelogBlocks` - an entry body → blocks, with any HTML left as text 🧱
 *
 * @param { string } markdown
 * @returns { ChangelogBlock[] }
 */
export function parseChangelogBlocks(markdown: string): ChangelogBlock[] {
  // 🧱 the blocks
  const blocks: ChangelogBlock[] = [];
  // 🚶 the lines
  const lines = markdown.split(/\r?\n/);
  // 📍 the cursor
  let index = 0;

  /**
   * `pushParagraph` - consecutive plain lines become one paragraph 📝
   *
   * @param { string[] } chunk
   */
  const pushParagraph = (chunk: string[]): void => {
    // 🔤 join wrapped lines
    const text = chunk.join(' ').trim();
    // 🙅 a blank chunk
    if (!text) return;
    // 📝 one paragraph of inlines
    blocks.push({ type: 'p', children: parseChangelogInlines(text) });
  };

  // 🚶 until the body ends
  while (index < lines.length) {
    const line = lines[index] ?? '';
    // ⬜ a blank line separates blocks
    if (!line.trim()) { index += 1; continue; }
    // 💻 a fenced block, language optional. The fence is not HTML.
    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().slice(3).trim(); // 🏷️
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? '').trimStart().startsWith('```')) {
        code.push(lines[index] ?? ''); // 💻
        index += 1;
      }
      index += 1; // ⏭️ the closing fence
      blocks.push({ type: 'pre', lang, code: code.join('\n') });
      continue;
    }
    // 📰 a subsection heading inside the entry (rendered as an h4 by the page)
    const sub = /^(#{2,6})[ \t]+(.+?)\s*$/.exec(line);
    if (sub) {
      blocks.push({ type: 'h', text: expandGitmojiText(sub[2].trim()) }); // 📰 emoji in a subsection heading, still plain text
      index += 1;
      continue;
    }
    // 💬 a block quote (one or more `>` lines)
    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index] ?? '')) {
        quote.push((lines[index] ?? '').replace(/^\s*>\s?/, '')); // 💬
        index += 1;
      }
      blocks.push({ type: 'quote', children: parseChangelogInlines(quote.join(' ')) });
      continue;
    }
    // 📋 a list. `*`, `-`, or `1.` Items may be indented. Nested markers stay one list.
    if (/^\s*(?:[-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line); // 🔢
      const items: ChangelogInline[][] = [];
      while (index < lines.length && /^\s*(?:[-*+]|\d+\.)\s+/.test(lines[index] ?? '')) {
        items.push(parseChangelogInlines((lines[index] ?? '').replace(/^\s*(?:[-*+]|\d+\.)\s+/, ''))); // 📋
        index += 1;
      }
      blocks.push(ordered ? { type: 'ol', items } : { type: 'ul', items });
      continue;
    }
    // 📝 a paragraph, stopped by a blank line or the next structural line. A line of HTML is just text.
    const chunk: string[] = [];
    while (index < lines.length && (lines[index] ?? '').trim() && !/^\s*```/.test(lines[index] ?? '') && !/^(#{2,6})\s/.test(lines[index] ?? '') && !/^\s*>\s?/.test(lines[index] ?? '') && !/^\s*(?:[-*+]|\d+\.)\s+/.test(lines[index] ?? '')) {
      chunk.push(lines[index] ?? ''); // 📝
      index += 1;
    }
    pushParagraph(chunk);
  }
  // 🧱 the blocks
  return blocks;
}


/**
 * `markdownLinkEnd` - the `)` that closes a markdown link, allowing one balanced pair inside the URL 🔗
 *
 * `[text](https://example.com/Foo_(bar))` keeps the parenthesis. An unclosed `(` is not a link.
 *
 * @param { string } input
 * @param { number } openParen - the index of the `(` after `]`
 * @returns { number } the index of the matching `)`, or -1
 */
function markdownLinkEnd(input: string, openParen: number): number {
  // 📏 depth 1: that `(` is already open
  let depth = 1;
  // 🚶 the characters after it
  for (let cursor = openParen + 1; cursor < input.length; cursor += 1) {
    const char = input[cursor]; // 🔤
    if (char === '(') depth += 1; // ➕ a parenthesis inside the URL
    else if (char === ')') {
      depth -= 1; // ➖
      if (depth === 0) return cursor; // ✅ the link's own close
    }
  }
  // 🚫 never closed
  return -1;
}


/**
 * `isSafeChangelogHref` - whether a markdown destination may become an anchor 🔒
 *
 * A backslash, any whitespace, or a control character fails first, before a scheme is trusted.
 * That rejects `/\evil.com`, `/\/evil.com`, and `/` + a tab + `javascript:`.
 * The same check covers `#` fragments and `mailto:` links. Anything rejected stays plain text.
 *
 * @param { string } href - the raw destination, not trimmed
 * @returns { boolean }
 */
function isSafeChangelogHref(href: string): boolean {
  // 🚫 \, space, tab, newline, or a C0 control — before any scheme check
  if (/[\s\\\u0000-\u001f]/.test(href)) return false;
  // 🏠 one leading slash, then no second slash (`//host` is not a site path)
  if (href.startsWith('/')) return /^\/(?!\/)[^\s\\]*$/.test(href);
  // ⚓ `#components-0.7.0` (the character check above already ran)
  if (href.startsWith('#')) return true;
  // ✉️ mailto, same character check
  if (/^mailto:/i.test(href)) return true;
  // 🌐 http and https only. `javascript:` and every other scheme stay text.
  return /^https?:\/\//i.test(href);
}


// 😀 gitmoji shortcodes that appear in this app's CHANGELOG or an installed package CHANGELOG.
//    A name that is not in this table stays the literal `:name:` text. Nothing here is HTML.
export const CHANGELOG_GITMOJI: Readonly<Record<string, string>> = {
  arrow_up: '⬆️',
  art: '🎨',
  bento: '🍱',
  bookmark_tabs: '📑',
  bug: '🐛',
  building_construction: '🏗️',
  bulb: '💡',
  card_file_box: '🗃️',
  chart_with_upwards_trend: '📈',
  construction_worker: '👷',
  fire: '🔥',
  globe_with_meridians: '🌐',
  heavy_plus_sign: '➕',
  iphone: '📱',
  lipstick: '💄',
  lock: '🔒',
  memo: '📝',
  passport_control: '🛂',
  pencil2: '✏️',
  pushpin: '📌',
  recycle: '♻️',
  shield: '🛡️',
  sparkles: '✨',
  wheelchair: '♿',
  white_check_mark: '✅',
  wrench: '🔧',
};

// 😀 `:name:` when `name` is one token. A digit-leading match (`:40:` inside a timestamp) is not a shortcode we map.
const GITMOJI_SHORTCODE = /:([a-z][a-z0-9_+-]*):/g;


/**
 * `expandGitmojiText` - replace allow-listed `:shortcode:` tokens with their emoji 😀
 *
 * Unknown names stay as typed. This is plain text, not HTML.
 *
 * @param { string } text
 * @returns { string }
 */
function expandGitmojiText(text: string): string {
  // 😀 one pass. An emoji has no `:name:` in it, so a second pass would change nothing.
  return text.replace(GITMOJI_SHORTCODE, (full, name: string) => CHANGELOG_GITMOJI[name] ?? full);
}


// 😀 a `:slug:` at this index. Underscores inside the name are part of the token, not emphasis.
const SHORTCODE_AT = /^:([a-z][a-z0-9_+-]*):/;


/**
 * `markerEnd` - the next emphasis marker, skipping `:slug:` tokens and code spans 🔤
 *
 * `:white_check_mark:` must not close an italic span on the underscore before `check`.
 *
 * @param { string } input
 * @param { number } from - the first index to look at
 * @param { string } mark - `*`, `_`, `**` or `__`
 * @returns { number } - the index of the marker, or -1
 */
function markerEnd(input: string, from: number, mark: string): number {
  // 📍 the cursor
  let index = from;
  // 🚶 until the marker, or the end
  while (index < input.length) {
    // 😀 a whole shortcode, underscores included
    const shortcode = SHORTCODE_AT.exec(input.slice(index));
    if (shortcode) { index += shortcode[0].length; continue; }
    // 💻 a code span is not a place to close emphasis
    if (input[index] === '`') {
      const end = input.indexOf('`', index + 1); // 💻
      index = end === -1 ? input.length : end + 1;
      continue;
    }
    // 🔤 the marker
    if (input.startsWith(mark, index)) return index;
    index += 1;
  }
  // 🙅 no closer
  return -1;
}


/**
 * `parseChangelogInlines` - emphasis, code, and safe links. A `<tag>` stays text. 🔤
 *
 * @param { string } input
 * @returns { ChangelogInline[] }
 */
export function parseChangelogInlines(input: string): ChangelogInline[] {
  // 🔤 the runs
  const out: ChangelogInline[] = [];

  /**
   * `pushText` - append literal text, merging with the previous text run 🔤
   *
   * @param { string } text
   */
  const pushText = (text: string): void => {
    // 🙅 nothing
    if (!text) return;
    const last = out[out.length - 1];
    // 🧵 merge neighbours so `<` `script` stays one string when we add char by char
    if (last && last.type === 'text') last.text += text;
    else out.push({ type: 'text', text });
  };

  // 📍 the cursor
  let index = 0;
  // 🚶 each character, longest marker first
  while (index < input.length) {
    // 💪 `**bold**` or `__bold__`. The closer is found past any `:slug:`, so a shortcode's underscores are not the marker.
    if (input.startsWith('**', index) || input.startsWith('__', index)) {
      const mark = input.slice(index, index + 2); // 💪
      const end = markerEnd(input, index + 2, mark);
      if (end !== -1) {
        out.push({ type: 'strong', children: parseChangelogInlines(input.slice(index + 2, end)) }); // 💪
        index = end + 2;
        continue;
      }
    }
    // 💻 `code`
    if (input[index] === '`') {
      const end = input.indexOf('`', index + 1);
      if (end !== -1) {
        out.push({ type: 'code', text: input.slice(index + 1, end) }); // 💻
        index = end + 1;
        continue;
      }
    }
    // 🔗 `[label](href)` — http(s), mailto, a site path, or a hash. Unsafe destinations stay text.
    if (input[index] === '[') {
      const close = input.indexOf(']', index + 1); // 🏷️ the end of the label
      if (close !== -1 && input[close + 1] === '(') {
        const end = markdownLinkEnd(input, close + 1); // 📏 the matching close, parentheses inside the URL included
        if (end !== -1) {
          const href = input.slice(close + 2, end); // 🔗 raw, so a tab or a backslash is still visible
          if (isSafeChangelogHref(href)) {
            out.push({ type: 'link', href, children: parseChangelogInlines(input.slice(index + 1, close)) }); // 🔗
            index = end + 1;
            continue;
          }
        }
      }
    }
    // 😀 `:memo:` before emphasis, so the underscores in `:white_check_mark:` are not an italic span.
    //    A code span was already taken above, so a shortcode in backticks stays typed.
    const shortcode = SHORTCODE_AT.exec(input.slice(index));
    if (shortcode) {
      const name = shortcode[1] ?? ''; // 🏷️
      pushText(CHANGELOG_GITMOJI[name] ?? shortcode[0]); // 😀 known → emoji, unknown → the literal `:name:`
      index += shortcode[0].length;
      continue;
    }
    // 🔤 `*em*` or `_em_` (not the strong marker). A `:slug:` between the markers stays one token.
    if ((input[index] === '*' || input[index] === '_') && input[index + 1] !== input[index]) {
      const mark = input[index] as string; // 🔤
      const end = markerEnd(input, index + 1, mark);
      if (end !== -1 && end > index + 1) {
        out.push({ type: 'em', children: parseChangelogInlines(input.slice(index + 1, end)) }); // 🔤
        index = end + 1;
        continue;
      }
    }
    // 🚫 a raw tag is text, through the closing `>` when there is one
    if (input[index] === '<') {
      const end = input.indexOf('>', index + 1);
      const chunk = end === -1 ? input.slice(index) : input.slice(index, end + 1); // 🚫
      pushText(chunk);
      index += chunk.length;
      continue;
    }
    // 🔤 one character
    pushText(input[index] ?? '');
    index += 1;
  }
  // 🔤 the runs. Shortcodes were swapped while scanning, and only outside code spans.
  return out;
}


/**
 * `readPackageVersion` - `version` from a package.json on disk 🔢
 *
 * @param { string } file
 * @returns { string }
 */
function readPackageVersion(file: string): string {
  // 📖 the json
  const pkg = JSON.parse(readFileSync(file, 'utf8')) as { version?: string };
  // 🔢 the version, or empty when the field is missing (the gate then reports missing)
  return String(pkg.version ?? '');
}


/**
 * `documentFromMarkdown` - one file's text → a document 📦
 *
 * @param { { id: string; name: string; title: string; version: string; source: string; markdown: string } } spec
 * @returns { ChangelogDocument }
 */
function documentFromMarkdown(spec: { id: string; name: string; title: string; version: string; source: string; markdown: string }): ChangelogDocument {
  // 📜 parse
  const parsed = parseChangelog(spec.markdown, spec.id);
  // 📦 the document
  return { id: spec.id, name: spec.name, title: spec.title, installedVersion: spec.version, entries: parsed.entries, malformed: parsed.malformed, source: spec.source };
}


/**
 * `loadChangelogs` - the app changelog, then the eight installed packages 📚
 *
 * Does not throw when a version is missing. The gate does that.
 *
 * @param { string } root - the app root
 * @returns { ChangelogDocument[] }
 */
export function loadChangelogs(root: string = process.cwd()): ChangelogDocument[] {
  // 📖 the app's own file and its package.json version (gated like the packages: the released version needs an entry)
  const appVersion = readPackageVersion(join(root, 'package.json'));
  const appFile = join(root, 'CHANGELOG.md');
  const docs: ChangelogDocument[] = [
    documentFromMarkdown({
      id: 'app',
      name: 'ab-elements-app',
      title: 'ab-elements-app',
      version: appVersion,
      source: 'CHANGELOG.md',
      markdown: readFileSync(appFile, 'utf8'),
    }),
  ];
  // 📦 each installed package, in the sidebar's order
  for (const id of AB_PACKAGE_IDS) {
    const name = `ab-nextjs-${id}`; // 📛
    const dir = join(root, 'node_modules', name); // 📁
    const version = readPackageVersion(join(dir, 'package.json')); // 🔢
    const source = `node_modules/${name}/CHANGELOG.md`; // 📁
    let markdown = '';
    try {
      markdown = readFileSync(join(dir, 'CHANGELOG.md'), 'utf8'); // 📖
    } catch {
      markdown = ''; // 🚫 no file: the gate reports the version missing
    }
    docs.push(documentFromMarkdown({ id, name, title: id === 'i18n' ? 'i18n' : id[0].toUpperCase() + id.slice(1), version, source, markdown }));
  }
  // 📚 app first, then the packages
  return docs;
}


/**
 * `newestHeading` - the first version heading, for a missing-entry explanation 📰
 *
 * @param { ChangelogDocument } doc
 * @returns { string }
 */
function newestHeading(doc: ChangelogDocument): string {
  // 📰 the first entry
  const entry = doc.entries[0];
  // 🙅 the file has no version heading at all
  if (!entry) return 'the file has no ## or ### version heading';
  // 🏷️ how it would be written back
  const label = entry.version ?? 'Unreleased';
  const date = entry.date ? ` (${entry.date})` : '';
  return `${'#'.repeat(entry.level)} ${label}${date}`;
}


/**
 * `auditChangelogs` - which installed package versions have no released entry 🚦
 *
 * The app is gated on `package.json`'s version, the same way each installed package is. A draft heading
 * for the next version does not replace that entry.
 *
 * A clean `##` / `###` heading for the exact installed version passes.
 * The same heading marked Unreleased fails as `unreleased`.
 * A heading that only mentions the version in the wrong shape fails as `heading-format`.
 * No heading at all fails as `missing`.
 *
 * @param { readonly ChangelogDocument[] } docs
 * @returns { ChangelogAudit }
 */
export function auditChangelogs(docs: readonly ChangelogDocument[]): ChangelogAudit {
  // 🚨 the failures, in package order
  const failures: ChangelogFailure[] = [];
  // ✅ the ones that passed
  const passed: { name: string; version: string }[] = [];
  // 📦 the app (its package.json version) and every installed package
  for (const doc of docs) {
    const version = doc.installedVersion; // 🔢
    const released = doc.entries.some((entry) => entry.kind === 'version' && entry.version === version); // ✅
    const unreleased = doc.entries.some((entry) => entry.kind === 'unreleased' && entry.version === version); // 🚧
    const malformed = doc.malformed.filter((heading) => heading.versions.includes(version)); // ⚠️
    // ✅ a real released heading wins
    if (released) { passed.push({ name: doc.name, version }); continue; }
    // 🚧 the heading exists and says Unreleased
    if (unreleased) {
      const entry = doc.entries.find((item) => item.kind === 'unreleased' && item.version === version);
      failures.push({ id: doc.id, name: doc.name, version, reason: 'unreleased', detail: `the ## / ### heading for ${version} is Unreleased (${'#'.repeat(entry?.level ?? 2)} ${version} (${entry?.date ?? 'Unreleased'})).` });
      continue;
    }
    // ⚠️ the version is mentioned, but not as a clean ## / ### version heading
    if (malformed.length) {
      const sample = malformed[0];
      failures.push({ id: doc.id, name: doc.name, version, reason: 'heading-format', detail: `a heading mentions ${version} but is not a ## or ### version heading: ${'#'.repeat(sample?.level ?? 1)} ${sample?.text ?? ''}.` });
      continue;
    }
    // 🚫 no entry
    failures.push({ id: doc.id, name: doc.name, version, reason: 'missing', detail: `no ## or ### heading for ${version}. Newest version heading: ${newestHeading(doc)}.` });
  }
  // 🚦 the report
  return { failures, passed };
}


/**
 * `formatChangelogAudit` - the text the build prints 📝
 *
 * @param { ChangelogAudit } audit
 * @param { 'strict' | 'warn' } mode
 * @returns { string }
 */
export function formatChangelogAudit(audit: ChangelogAudit, mode: 'strict' | 'warn'): string {
  // 📝 the header names the flag, so a review log shows whether the gate was downgraded
  const lines = [
    `changelog gate (${mode}): ${audit.failures.length} installed package version(s) have no released ## / ### entry.`,
    `Flag: ${AB_CHANGELOG_GATE}=${mode === 'warn' ? 'warn' : '(unset, strict)'}.`,
  ];
  // 🚨 each failure, reason first
  for (const failure of audit.failures) {
    lines.push(`- ${failure.name}@${failure.version} ${failure.reason}: ${failure.detail}`);
  }
  // ✅ the rest, so the log shows icons and components when they do have an entry
  if (audit.passed.length) lines.push(`Passed: ${audit.passed.map((item) => `${item.name}@${item.version}`).join(', ')}.`);
  // 📝 one block
  return lines.join('\n');
}


/**
 * `enforceChangelogGate` - throw in strict mode, warn in review mode 🚦
 *
 * @param { string } root
 * @returns { ChangelogAudit }
 */
export function enforceChangelogGate(root: string = process.cwd()): ChangelogAudit {
  // 📚 read the files
  const audit = auditChangelogs(loadChangelogs(root));
  // ✅ nothing to say
  if (!audit.failures.length) return audit;
  // 📝 the same text either way
  const message = formatChangelogAudit(audit, changelogGateMode());
  // 🟡 review builds print it and keep going
  if (changelogGateMode() === 'warn') {
    console.warn(message); // 🟡
    return audit;
  }
  // 🚨 the build stops
  throw new Error(message);
}


/**
 * `assertChangelogGateDuringBuild` - the page calls this, so `next build` fails even if prebuild is skipped 🏗️
 *
 * `next start` does not set `NEXT_PHASE`, so a review build can be served without the flag still exported.
 *
 * @param { string } root
 * @returns { void }
 */
export function assertChangelogGateDuringBuild(root: string = process.cwd()): void {
  // 🏗️ only while Next is producing the production build
  if (process.env.NEXT_PHASE !== 'phase-production-build') return;
  // 🚦 the same gate as the prebuild script
  enforceChangelogGate(root);
}


/**
 * `changelogToc` - package h2s and version h3s, the same shape as the docs outline 📑
 *
 * @param { readonly ChangelogDocument[] } docs
 * @returns { { id: string; label: string; level: 2 | 3 }[] }
 */
export function changelogToc(docs: readonly ChangelogDocument[]): { id: string; label: string; level: 2 | 3 }[] {
  // 📑 the items
  const items: { id: string; label: string; level: 2 | 3 }[] = [];
  // 📦 each file
  for (const doc of docs) {
    items.push({ id: doc.id, label: doc.title, level: 2 }); // 📦
    let bare = 0; // 🔢 repeated Unreleased labels
    for (const entry of doc.entries) {
      const label = entry.version ?? (bare++ === 0 ? 'Unreleased' : `Unreleased ${bare}`); // 🏷️
      items.push({ id: entry.anchor, label, level: 3 }); // 🔢
    }
  }
  // 📑 the outline
  return items;
}


// 📰 one Home "What's new" row, taken from a package's latest released changelog entry
export type WhatsNewItem = {
  id: AbPackageId; // 🆔 core, hooks, components
  version: string; // 🔢 that entry's semver
  date: string; // 📅 the heading's date, or empty when the heading has none
  title: string; // 📝 the first bullet, as plain text
  href: string; // 🔗 `/changelog#id-version`
};


/**
 * `inlinePlain` - the text of an inline run, including code spans as their characters 🔤
 *
 * @param { readonly ChangelogInline[] } runs
 * @returns { string }
 */
function inlinePlain(runs: readonly ChangelogInline[]): string {
  // 🔤 text and code contribute characters; emphasis and links contribute their children
  return runs.map((run) => (run.type === 'text' || run.type === 'code' ? run.text : inlinePlain(run.children))).join('');
}


/**
 * `firstNote` - the first bullet of an entry, or its first paragraph 📝
 *
 * @param { string } body
 * @returns { string }
 */
function firstNote(body: string): string {
  // 🧱 the same blocks the page renders
  const blocks = parseChangelogBlocks(body);
  // 🚶 the first list or paragraph
  for (const block of blocks) {
    if ((block.type === 'ul' || block.type === 'ol') && block.items[0]) return inlinePlain(block.items[0]).replace(/\s+/g, ' ').trim();
    if (block.type === 'p') return inlinePlain(block.children).replace(/\s+/g, ' ').trim();
  }
  // 🙅 an empty entry
  return '';
}


/**
 * `whatsNewItems` - Home's What's new rows, from the latest released entry of each package 📰
 *
 * The title is that entry's first bullet. The date is the date on its heading. Nothing here is typed by hand.
 *
 * @param { readonly ChangelogDocument[] } docs
 * @param { readonly AbPackageId[] } ids
 * @returns { WhatsNewItem[] }
 */
export function whatsNewItems(docs: readonly ChangelogDocument[], ids: readonly AbPackageId[]): WhatsNewItem[] {
  // 📰 one row per id, in the order the page asked for
  return ids.map((id) => {
    // 📦 that package's file
    const doc = docs.find((item) => item.id === id);
    // 🆕 the newest released heading (entries are in file order)
    const entry = doc?.entries.find((item) => item.kind === 'version' && item.version);
    // 🔢 the semver, when there is one
    const version = entry?.version ?? '';
    // 📝 the first bullet, or the version when the entry has no prose
    const title = entry ? firstNote(entry.body) : '';
    // 📰 the row
    return {
      id,
      version,
      date: entry?.date ?? '',
      title: title || version,
      href: entry ? `/changelog#${entry.anchor}` : '/changelog',
    };
  });
}


/**
 * `changelogHref` - `/changelog#id-version` when that installed version has a released entry, else `/changelog` 🔗
 *
 * @param { readonly ChangelogDocument[] } docs
 * @param { AbPackageId } id
 * @returns { string }
 */
export function changelogHref(docs: readonly ChangelogDocument[], id: AbPackageId): string {
  // 📦 that package
  const doc = docs.find((item) => item.id === id);
  // 🔗 the page, when the package was not loaded
  if (!doc) return '/changelog';
  // ✅ the released heading for the installed version
  const entry = doc.entries.find((item) => item.kind === 'version' && item.version === doc.installedVersion);
  // ⚓ the stable anchor, or the top of the page when the version has no entry
  return entry ? `/changelog#${entry.anchor}` : '/changelog';
}
