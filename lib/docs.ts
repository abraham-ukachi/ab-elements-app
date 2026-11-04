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
* @name: docs
* @file: lib/docs.ts
* @type: lib
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> import { docsPath, docsTocItems, docsNeighbours } from '@/lib/docs';
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📚 The docs helpers (0.2.24): the extra frontmatter fields, the slug ⇄ path helpers, the TOC mapping (fumadocs
// TOC → AbToc items), the prev/next neighbours of a page (from the page tree, meta.json order) & the GitHub edit URL.
// Pure functions only (no MDX, no fumadocs runtime), so `tests/unit/docs.test.ts` covers them all 🧪.

// REACT types (a fumadocs TOC title is a ReactNode)
import type { ReactNode } from 'react';
// import the packaged TOC item type 📑
import type { AbTocItem } from 'ab-nextjs-components/ab-toc';
// import the repo URL (Edit this page) 🐙
import { GITHUB_URL } from '@/lib/nav';


// 🏠 the docs base path (no locale prefix)
export const DOCS_BASE = '/docs';

// 📂 the content folder (relative to the repo root), for the "Edit this page" links ✏️
export const DOCS_CONTENT_DIR = 'content/docs';


// 🧾 the extra frontmatter fields live in `lib/docs-frontmatter.ts` (source.config.ts imports them) ↪️
export { docsFrontmatterExtra, type DocsFrontmatterExtra } from '@/lib/docs-frontmatter';


/**
 * `docsPath` - the locale-less path of a docs page 🧭
 *
 * @param { readonly string[] } [slugs] - the slug segments (`[]` = the docs index)
 * @returns { string } e.g. `/docs`, `/docs/packages/core`
 */
export function docsPath(slugs: readonly string[] = []): string {
  // 🧹 drop empty segments (`[[...slug]]` hands `undefined` for the index)
  const clean = slugs.filter(Boolean);
  // return the base, plus the joined segments 🔗
  return clean.length ? `${DOCS_BASE}/${clean.join('/')}` : DOCS_BASE;
}


/**
 * `docsSlugs` - the slug segments of a locale-less docs path (the inverse of `docsPath`) ↩️
 *
 * @param { string } path - e.g. `/docs/quick-start` (a trailing slash is ignored)
 * @returns { string[] | null } the segments, or `null` when the path is not a docs path 🚫
 */
export function docsSlugs(path: string): string[] | null {
  // ✂️ no trailing slash
  const trimmed = path.replace(/\/+$/, '') || '/';
  // 🚫 not under /docs
  if (trimmed !== DOCS_BASE && !trimmed.startsWith(`${DOCS_BASE}/`)) return null;
  // return the segments after `/docs` 🧩
  return trimmed.slice(DOCS_BASE.length).split('/').filter(Boolean);
}


// 🧾 a fumadocs TOC entry (fumadocs-core `TOCItemType`): `#id` url, a title & a heading depth
export type DocsTocEntry = Readonly<{ title: ReactNode; url: string; depth: number }>;


/**
 * `docsTocItems` - fumadocs' TOC → the packaged AbToc items 📑
 *
 * Keeps the h2–h4 headings (AbToc indents levels 2–4), turns `#id` into `id` & the title into plain text.
 *
 * @param { readonly DocsTocEntry[] } toc - the page's TOC (from the MDX compiler)
 * @returns { AbTocItem[] }
 */
export function docsTocItems(toc: readonly DocsTocEntry[]): AbTocItem[] {
  return toc
    // 📏 only h2 / h3 / h4 (the h1 is the page title)
    .filter((entry) => entry.depth >= 2 && entry.depth <= 4 && entry.url.startsWith('#'))
    // 🔁 `#id` → id, ReactNode → text, depth → level
    .map((entry) => ({ id: decodeURIComponent(entry.url.slice(1)), label: nodeText(entry.title), level: entry.depth as 2 | 3 | 4 }));
}


/**
 * `nodeText` - the plain text of a (simple) React node 🔤 (headings with inline code / emphasis)
 *
 * @param { ReactNode } node
 * @returns { string }
 */
export function nodeText(node: ReactNode): string {
  // 🔤 strings & numbers as they are
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  // 📚 arrays: join their texts
  if (Array.isArray(node)) return node.map(nodeText).join('');
  // 🧩 elements: their children's text
  if (node && typeof node === 'object' && 'props' in node) return nodeText((node.props as { children?: ReactNode }).children);
  // 🫥 null / booleans
  return '';
}


// 🌳 the page-tree nodes we read (fumadocs-core `PageTree`): pages, folders (with an optional index) & separators
export type DocsTreeNode =
  | Readonly<{ type: 'page'; name: ReactNode; url: string }>
  | Readonly<{ type: 'folder'; name: ReactNode; index?: Readonly<{ type: 'page'; name: ReactNode; url: string }>; children: readonly DocsTreeNode[] }>
  | Readonly<{ type: 'separator'; name?: ReactNode }>;

// 🔗 a prev / next link
export type DocsNeighbour = Readonly<{ title: string; url: string }>;


/**
 * `flattenDocsTree` - the pages of a page tree, in reading order (meta.json order, folder index first) 📜
 *
 * @param { readonly DocsTreeNode[] } nodes - the tree's `children`
 * @returns { DocsNeighbour[] }
 */
export function flattenDocsTree(nodes: readonly DocsTreeNode[]): DocsNeighbour[] {
  return nodes.flatMap((node): DocsNeighbour[] => {
    // 📄 a page
    if (node.type === 'page') return [{ title: nodeText(node.name), url: node.url }];
    // 📂 a folder: its index page, then its children
    if (node.type === 'folder') return [...(node.index ? [{ title: nodeText(node.index.name), url: node.index.url }] : []), ...flattenDocsTree(node.children)];
    // ➖ separators have no page
    return [];
  });
}


/**
 * `docsNeighbours` - the previous & next pages of `url` (reading order) ⬅️➡️
 *
 * @param { readonly DocsNeighbour[] } pages - the flat reading order (`flattenDocsTree`)
 * @param { string } url - the current page's url
 * @returns { { previous?: DocsNeighbour; next?: DocsNeighbour } }
 */
export function docsNeighbours(pages: readonly DocsNeighbour[], url: string): { previous?: DocsNeighbour; next?: DocsNeighbour } {
  // 🔎 where we are
  const at = pages.findIndex((page) => page.url === url);
  // 🫥 not in the tree: no neighbours
  if (at < 0) return {};
  // return the pages around it (none before the first / after the last) 🔗
  return { previous: pages[at - 1], next: pages[at + 1] };
}


/**
 * `docsEditUrl` - the GitHub "Edit this page" URL of a content file ✏️
 *
 * @param { string } locale - the content locale (the folder the file lives in)
 * @param { string } file - the file path inside that locale folder (e.g. `packages/core/index.mdx`)
 * @returns { string }
 */
export function docsEditUrl(locale: string, file: string): string {
  // return the GitHub edit URL on main 🐙
  return `${GITHUB_URL}/edit/main/${DOCS_CONTENT_DIR}/${locale}/${file.replace(/^\/+/, '')}`;
}


/**
 * `docsContentFile` - the locale folder & the file of a page's virtual path (`parser: 'dir'`) 📂
 *
 * fumadocs returns the English page for an untranslated one but keeps the requested locale on it, so the folder
 * of its path (`en/quick-start.mdx`) is the only reliable "which language is this text in" 🏳️.
 *
 * @param { string } path - the page's virtual path, e.g. `fr/installation.mdx` or `en/quick-start.mdx`
 * @param { string } fallback - the locale to assume when the path has no locale folder
 * @returns { { contentLocale: string; file: string } }
 */
export function docsContentFile(path: string, fallback: string): { contentLocale: string; file: string } {
  // ✂️ the first folder & the rest
  const [head, ...rest] = path.replace(/^\/+/, '').split('/');
  // 🌍 a locale folder (2 lowercase letters, our locales) → that locale + the rest of the path
  if (rest.length && /^[a-z]{2}$/.test(head)) return { contentLocale: head, file: rest.join('/') };
  // 🫥 no locale folder: the whole path, in the given locale
  return { contentLocale: fallback, file: path.replace(/^\/+/, '') };
}


/**
 * `docsUnprefixed` - a fumadocs URL without its locale prefix (`/fr/docs/x` → `/docs/x`) ✂️
 *
 * fumadocs' page-tree URLs carry the locale, but the packaged links (AbLink / AbCard) add it themselves.
 *
 * @param { string } url - a page URL
 * @param { readonly string[] } locales - the app's locales
 * @returns { string }
 */
export function docsUnprefixed(url: string, locales: readonly string[]): string {
  // 🔎 the first segment
  const [, first = '', ...rest] = url.split('/');
  // ✂️ drop it when it's a locale (`/fr` alone → `/`)
  return locales.includes(first) ? `/${rest.join('/')}` : url;
}


// ───────────────────────────── 0.2.25 · the docs page template ─────────────────────────────


/**
 * `docsSourceUrl` - the GitHub "View source" URL of a content file (read-only blob on main) 🧾
 *
 * @param { string } locale - the content locale (the folder the file lives in)
 * @param { string } file - the file path inside that locale folder (e.g. `installation.mdx`)
 * @returns { string }
 */
export function docsSourceUrl(locale: string, file: string): string {
  // return the GitHub blob URL on main 🐙
  return `${GITHUB_URL}/blob/main/${DOCS_CONTENT_DIR}/${locale}/${file.replace(/^\/+/, '')}`;
}


/**
 * `docsReportUrl` - a prefilled GitHub "new issue" URL for a docs page 🐛
 *
 * The title names the page, the body carries its public URL & its content file, so a report is actionable without
 * a back-and-forth. Everything goes through `URLSearchParams`, so any title (quotes, `&`, emoji…) stays safe 🔒.
 *
 * @param { { title: string; url: string; file: string } } page - the page title, its public URL & its repo file
 * @returns { string }
 */
export function docsReportUrl({ title, url, file }: Readonly<{ title: string; url: string; file: string }>): string {
  // 🧾 the prefilled issue (title + body + the `docs` label)
  const query = new URLSearchParams({ title: `Docs: ${title}`, body: `Page: ${url}\nFile: ${file}\n\nWhat's wrong?\n`, labels: 'docs' });
  // return the GitHub new-issue URL 🐙
  return `${GITHUB_URL}/issues/new?${query.toString()}`;
}


// 🏷️ one chip of the page header: a message key (translated by the page) or a code name (kept as is)
export type DocsChip = Readonly<{ id: string; key?: string; text?: string; tone: 'neutral' | 'accent' | 'sage'; mono?: boolean; dot?: 'sage' | 'bronze' }>;

// 🗂️ the top folders of the docs tree → their section message key (anything else is "Getting started")
const DOCS_SECTIONS: Readonly<Record<string, string>> = { guides: 'guides', packages: 'packages' };


/**
 * `docsChips` - the chips under a docs page's title: section · package · Client/Server · status 🏷️
 *
 * Pure data (no React), so the order & tones are unit-tested; the page translates `key` and renders AbChip 🧩.
 *
 * @param { readonly string[] } slugs - the page slugs (`['packages', 'core']`)
 * @param { { package?: string; kind?: 'client' | 'server'; status?: string } } data - the frontmatter extras
 * @returns { DocsChip[] }
 */
export function docsChips(slugs: readonly string[], data: Readonly<{ package?: string; kind?: 'client' | 'server'; status?: string }>): DocsChip[] {
  // 🗂️ the section (always first)
  const chips: DocsChip[] = [{ id: 'section', key: `chips.section.${DOCS_SECTIONS[slugs[0] ?? ''] ?? 'gettingStarted'}`, tone: 'neutral' }];
  // 📦 the documented package (a code name, mono, never translated)
  if (data.package) chips.push({ id: 'package', text: data.package, tone: 'accent', mono: true });
  // 🖥️ where it runs
  if (data.kind) chips.push({ id: 'kind', key: `chips.kind.${data.kind}`, tone: 'neutral' });
  // 🚦 how mature it is (stable = sage dot, the rest bronze)
  if (data.status) chips.push({ id: 'status', key: `chips.status.${data.status}`, tone: data.status === 'stable' ? 'sage' : 'neutral', dot: data.status === 'stable' ? 'sage' : 'bronze' });
  // return them in reading order 🏷️
  return chips;
}
