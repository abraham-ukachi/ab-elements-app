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
* @name: docs.test
* @file: tests/unit/docs.test.ts
* @type: test
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm vitest run tests/unit/docs.test.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 The docs pipeline (0.2.24): the pure helpers of lib/docs (slug ⇄ path, TOC mapping, prev / next, edit URL,
// content locale) & the content itself (every page's frontmatter, the meta.json orders, the translations' slugs).

// import the file helpers from Node 📁
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';
// import fumadocs' frontmatter parser & base schema (what the build validates with) 🧾
import { frontmatter } from 'fumadocs-core/content/md/frontmatter';
import { frontmatterSchema } from 'fumadocs-mdx/config';

// import the helpers under test 📚
import {
  DOCS_BASE, docsContentFile, docsUnprefixed, docsEditUrl, docsFrontmatterExtra, docsNeighbours, docsPath, docsSlugs, docsTocItems,
  flattenDocsTree, nodeText, type DocsTreeNode,
} from '@/lib/docs';
import abI18nConfig from '@/i18n/config';


// 📂 the content root
const ROOT = join(process.cwd(), 'content/docs');
// 📄 every file under a folder (recursive)
const walk = (dir: string): string[] => readdirSync(dir).flatMap((name) => (statSync(join(dir, name)).isDirectory() ? walk(join(dir, name)) : [join(dir, name)]));
// 🔗 the slug of a content file (`packages/core/index.mdx` → `packages/core`)
const slugOf = (file: string): string => file.replace(/\.mdx$/, '').replace(/(^|\/)index$/, '');
// 📚 the mdx files of a locale (relative to its folder)
const pagesOf = (locale: string): string[] => walk(join(ROOT, locale)).filter((file) => file.endsWith('.mdx')).map((file) => relative(join(ROOT, locale), file));
// 🧾 the full page schema (= source.config.ts)
const schema = frontmatterSchema.extend(docsFrontmatterExtra.shape);


describe('lib/docs: paths 🧭', () => {
  it('docsPath joins the slugs under /docs', () => {
    expect(DOCS_BASE).toBe('/docs');
    expect(docsPath()).toBe('/docs');
    expect(docsPath([])).toBe('/docs');
    expect(docsPath(['installation'])).toBe('/docs/installation');
    expect(docsPath(['packages', 'core'])).toBe('/docs/packages/core');
    expect(docsPath(['', 'quick-start'])).toBe('/docs/quick-start');
  });

  it('docsSlugs is the inverse (and rejects non-docs paths) ↩️', () => {
    expect(docsSlugs('/docs')).toEqual([]);
    expect(docsSlugs('/docs/')).toEqual([]);
    expect(docsSlugs('/docs/packages/core')).toEqual(['packages', 'core']);
    expect(docsSlugs('/documents')).toBeNull();
    expect(docsSlugs('/')).toBeNull();
    for (const slugs of [[], ['a'], ['a', 'b']]) expect(docsSlugs(docsPath(slugs))).toEqual(slugs);
  });

  it('docsContentFile reads the locale folder of a page (the English fallback) 🏳️', () => {
    expect(docsContentFile('fr/installation.mdx', 'fr')).toEqual({ contentLocale: 'fr', file: 'installation.mdx' });
    expect(docsContentFile('en/quick-start.mdx', 'fr')).toEqual({ contentLocale: 'en', file: 'quick-start.mdx' });
    expect(docsContentFile('en/packages/core/index.mdx', 'ru')).toEqual({ contentLocale: 'en', file: 'packages/core/index.mdx' });
    expect(docsContentFile('index.mdx', 'es')).toEqual({ contentLocale: 'es', file: 'index.mdx' });
  });

  it('docsUnprefixed drops a locale prefix only ✂️', () => {
    const locales = ['en', 'fr', 'es', 'ru'];
    expect(docsUnprefixed('/fr/docs/quick-start', locales)).toBe('/docs/quick-start');
    expect(docsUnprefixed('/ru/docs', locales)).toBe('/docs');
    expect(docsUnprefixed('/docs/installation', locales)).toBe('/docs/installation');
    expect(docsUnprefixed('/fr', locales)).toBe('/');
    expect(docsUnprefixed('/frx/docs', locales)).toBe('/frx/docs');
  });

  it('docsEditUrl points at the content file on GitHub ✏️', () => {
    expect(docsEditUrl('en', 'packages/core/index.mdx')).toBe('https://github.com/abraham-ukachi/ab-elements-app/edit/main/content/docs/en/packages/core/index.mdx');
    expect(docsEditUrl('fr', '/installation.mdx')).toMatch(/\/content\/docs\/fr\/installation\.mdx$/);
  });
});


describe('lib/docs: TOC 📑', () => {
  it('keeps h2–h4, strips the #, flattens the titles', () => {
    const items = docsTocItems([
      { title: 'Intro', url: '#intro', depth: 2 },
      { title: ['Use ', { props: { children: 'AbToc' } }] as never, url: '#use-abtoc', depth: 3 },
      { title: 'Deep', url: '#deep', depth: 4 },
      { title: 'Too deep', url: '#too-deep', depth: 5 },
      { title: 'Title', url: '#title', depth: 1 },
      { title: 'External', url: 'https://example.com', depth: 2 },
      { title: 'Encoded', url: '#caf%C3%A9', depth: 2 },
    ]);
    expect(items).toEqual([
      { id: 'intro', label: 'Intro', level: 2 },
      { id: 'use-abtoc', label: 'Use AbToc', level: 3 },
      { id: 'deep', label: 'Deep', level: 4 },
      { id: 'café', label: 'Encoded', level: 2 },
    ]);
  });

  it('nodeText handles strings, numbers, arrays, elements & empties 🔤', () => {
    expect(nodeText('a')).toBe('a');
    expect(nodeText(3)).toBe('3');
    expect(nodeText(['a', ['b', 1]])).toBe('ab1');
    expect(nodeText(null)).toBe('');
    expect(nodeText(false)).toBe('');
  });
});


describe('lib/docs: prev / next ⬅️➡️', () => {
  // 🌳 a tree like fumadocs': pages, a separator, a folder with an index & children
  const tree: DocsTreeNode[] = [
    { type: 'page', name: 'Introduction', url: '/docs' },
    { type: 'page', name: 'Installation', url: '/docs/installation' },
    { type: 'separator', name: 'Packages' },
    { type: 'folder', name: 'Core', index: { type: 'page', name: 'Core', url: '/docs/packages/core' }, children: [{ type: 'page', name: 'Layouts', url: '/docs/packages/core/layouts' }] },
    { type: 'folder', name: 'Guides', children: [{ type: 'page', name: 'Theming', url: '/docs/guides/theming' }] },
  ];
  const flat = flattenDocsTree(tree);

  it('flattens in reading order (folder index first, no separators)', () => {
    expect(flat.map((page) => page.url)).toEqual(['/docs', '/docs/installation', '/docs/packages/core', '/docs/packages/core/layouts', '/docs/guides/theming']);
  });

  it('gives the neighbours (none at the ends, none off-tree)', () => {
    expect(docsNeighbours(flat, '/docs')).toEqual({ previous: undefined, next: { title: 'Installation', url: '/docs/installation' } });
    expect(docsNeighbours(flat, '/docs/packages/core').previous?.url).toBe('/docs/installation');
    expect(docsNeighbours(flat, '/docs/packages/core').next?.url).toBe('/docs/packages/core/layouts');
    expect(docsNeighbours(flat, '/docs/guides/theming').next).toBeUndefined();
    expect(docsNeighbours(flat, '/nope')).toEqual({});
  });
});


describe('content/docs 📚', () => {
  // 🇬🇧 the English pages = the full list
  const en = pagesOf('en');

  it('has a folder per locale, and nothing else 🌍', () => {
    expect(readdirSync(ROOT).sort()).toEqual([...abI18nConfig.locales].sort());
  });

  it('English has the PLAN.md pages (index, installation, quick start, 8 packages, guides)', () => {
    for (const file of ['index.mdx', 'installation.mdx', 'quick-start.mdx']) expect(en).toContain(file);
    expect(en.filter((file) => /^packages\/[a-z0-9-]+\/index\.mdx$/.test(file))).toHaveLength(8);
    expect(en.some((file) => file.startsWith('guides/'))).toBe(true);
  });

  it('every translated page has an English original (fr / es / ru only translate) 🏳️', () => {
    for (const locale of abI18nConfig.locales) for (const file of pagesOf(locale)) expect(en, `${locale}/${file}`).toContain(file);
  });

  it('every page has a valid frontmatter (title, description, package / kind / status) 🧾', () => {
    for (const locale of abI18nConfig.locales) {
      for (const file of pagesOf(locale)) {
        const { data } = frontmatter(readFileSync(join(ROOT, locale, file), 'utf8'));
        const parsed = schema.safeParse(data);
        expect(parsed.success, `${locale}/${file}: ${parsed.error?.message}`).toBe(true);
        expect(typeof (data as { description?: unknown }).description, `${locale}/${file}`).toBe('string');
      }
    }
  });

  it('the extra fields reject bad values ❌', () => {
    expect(docsFrontmatterExtra.safeParse({ kind: 'edge' }).success).toBe(false);
    expect(docsFrontmatterExtra.safeParse({ status: 'alpha' }).success).toBe(false);
    expect(docsFrontmatterExtra.safeParse({ package: 'react' }).success).toBe(false);
    expect(docsFrontmatterExtra.safeParse({ package: 'ab-nextjs-core', kind: 'server', status: 'beta' }).success).toBe(true);
  });

  it('every page is unique per slug (no `a.mdx` + `a/index.mdx`) 🔗', () => {
    const slugs = en.map(slugOf);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every meta.json lists real pages / folders, in every locale 🗂️', () => {
    for (const locale of abI18nConfig.locales) {
      for (const file of walk(join(ROOT, locale)).filter((path) => path.endsWith('meta.json'))) {
        const dir = relative(join(ROOT, locale), file).replace(/\/?meta\.json$/, '');
        const { pages = [] } = JSON.parse(readFileSync(file, 'utf8')) as { pages?: string[] };
        for (const entry of pages.filter((name) => !name.startsWith('---'))) {
          const name = entry.replace(/^\.\.\./, '');
          const target = [dir, name].filter(Boolean).join('/');
          // ✅ an English page or folder (a translation may rely on the English fallback)
          expect(en.some((page) => page.replace(/\.mdx$/, '') === target || page.startsWith(`${target}/`)), `${locale}: ${target}`).toBe(true);
        }
      }
    }
  });

  it('the Docs messages have the same keys in every locale 🌐', () => {
    const keys = (node: unknown, prefix = ''): string[] => (node && typeof node === 'object'
      ? Object.entries(node).flatMap(([key, value]) => keys(value, `${prefix}${key}.`))
      : [prefix]);
    const docsKeys = (locale: string) => keys(JSON.parse(readFileSync(join(process.cwd(), `messages/${locale}.json`), 'utf8')).Docs).sort();
    for (const locale of abI18nConfig.locales) expect(docsKeys(locale), locale).toEqual(docsKeys('en'));
  });
});
