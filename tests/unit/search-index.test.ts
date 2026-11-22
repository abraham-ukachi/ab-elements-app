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
* @name: search-index.test
* @file: tests/unit/search-index.test.ts
* @type: test
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm vitest run tests/unit/search-index.test.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 The 0.2.30 search index: headings match the rendered anchors, fallback follows the file on disk,
//    stemmers fold inflections, and code names stay findable inside a non-English index.

// import the test helpers 🧪
import { describe, expect, it } from 'vitest';
// import the filesystem helpers 📁
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
// import `createRequire` to read the installed zbsearch version the same way the indexer does 📦
import { createRequire } from 'node:module';
// import the path helpers 🧭
import { join } from 'node:path';
// import the temp directory 📁
import { tmpdir } from 'node:os';
// import search (the restored snapshot must answer) 🔎
import { search } from 'zbsearch';
// import the snapshot type 📦
import type { RawData } from 'zbsearch';
// import the docs TOC mapper (the same ids the outline renders) ⚓
import { docsTocItems } from '@/lib/docs';
// import the compiled docs source 📚
import { source } from '@/lib/source';
// import the parsed changelogs (anchors must match the page) 📜
import { loadChangelogs } from '@/lib/changelog';
// import the locale list 🌍
import { SEARCH_LOCALES, type AppLocale } from '@/lib/search-meta';
// import the indexer 🔎
import {
  buildSearchFile,
  collectChangelogRecords,
  collectDocRecords,
  collectPackageRecords,
  collectPropRecords,
  collectSearchRecords,
  docPageSources,
  docsUrl,
  installedZbsearchVersion,
  openSearchSnapshot,
  resolveDocContent,
} from '@/lib/search-index';
// import the text helpers ✂️
import {
  identifierForms,
  markdownHeadings,
  stemSearchWord,
  suggestSearchTerms,
  tokenizeSearchText,
} from '@/lib/search-text';


// 📁 the app root
const root = process.cwd();


/**
 * `titlesFor` - the top hit titles for a term 🔎
 *
 * @param { ReturnType<typeof openSearchSnapshot> } db
 * @param { string } term
 * @returns { string[] }
 */
function titlesFor(db: ReturnType<typeof openSearchSnapshot>, term: string): string[] {
  // 🔎 exact tokens (no prefix expansion)
  const result = search(db, { term, prefix: false, limit: 8 });
  // ⏳ the build uses the sync engine
  if (result instanceof Promise) throw new Error('search returned a promise');
  // 🏷️
  return result.hits.map((hit) => String(hit.document?.title ?? ''));
}


describe('search text 🔎', () => {
  it('splits code names into an exact form and parts', () => {
    // 🧩 AbButton
    expect(identifierForms('AbButton')).toEqual(expect.arrayContaining(['abbutton', 'button']));
    // 🪝 the hook, exact and by a part
    expect(identifierForms('useAbScrollSpy')).toEqual(expect.arrayContaining(['useabscrollspy', 'scroll', 'spy']));
    // 📦 the package, exact compact form and by a part
    expect(identifierForms('ab-nextjs-core')).toEqual(expect.arrayContaining(['ab-nextjs-core', 'abnextjscore', 'core']));
  });

  it('stems inflections per locale', () => {
    // 🇫🇷 boutons and bouton share a stem, and the plural actually changes
    expect(stemSearchWord('fr', 'boutons')).toBe(stemSearchWord('fr', 'bouton'));
    expect(stemSearchWord('fr', 'boutons')).not.toBe('boutons');
    // 🇪🇸 botones and botón
    expect(stemSearchWord('es', 'botones')).toBe(stemSearchWord('es', 'botón'));
    expect(stemSearchWord('es', 'botones')).not.toBe('botones');
    // 🇷🇺 кнопки and кнопка
    expect(stemSearchWord('ru', 'кнопки')).toBe(stemSearchWord('ru', 'кнопка'));
    expect(stemSearchWord('ru', 'кнопки')).not.toBe('кнопки');
    // 🇬🇧 buttons and button
    expect(stemSearchWord('en', 'buttons')).toBe(stemSearchWord('en', 'button'));
  });

  it('keeps a code name raw when the stemmer would rewrite it', () => {
    // 🇫🇷 the french stemmer rewrites `core` to `cor`; the raw token has to stay
    expect(stemSearchWord('fr', 'core')).toBe('cor');
    expect(tokenizeSearchText('ab-nextjs-core', 'fr')).toEqual(expect.arrayContaining(['core', 'abnextjscore']));
  });

  it('drops fenced code from a section excerpt', () => {
    // 📝 prose around a fence
    const headings = markdownHeadings('## Install\n\nBefore the sample.\n\n```ts\nsecret-token-not-indexed\n```\n\nAfter the sample.\n');
    // ⚓ the heading
    expect(headings[0]?.anchor).toBe('install');
    // 🧹 the fence body is gone, the prose stays
    expect(headings[0]?.excerpt).toContain('Before the sample');
    expect(headings[0]?.excerpt).toContain('After the sample');
    expect(headings[0]?.excerpt).not.toContain('secret-token-not-indexed');
  });
});


describe('search documents 📚', () => {
  it('indexes all 17 docs pages in every locale', () => {
    // 📚 the English list is the full set
    expect(docPageSources(root)).toHaveLength(17);
    // 🌍 each locale emits every page
    for (const locale of SEARCH_LOCALES) {
      const pages = collectDocRecords(root, locale).filter((record) => record.recordType === 'page');
      expect(pages, locale).toHaveLength(17);
    }
  });

  it('marks a page as fallback only when its locale file is missing', () => {
    // 🚶 fr, es, ru (English is never a fallback of itself)
    for (const locale of ['fr', 'es', 'ru'] as const) {
      const records = collectDocRecords(root, locale);
      // 📄 each source file
      for (const sourcePage of docPageSources(root)) {
        // 🔗 the page row
        const page = records.find((record) => record.recordType === 'page' && record.url === docsUrl(sourcePage.slug));
        // 🏳️ the file on disk decides
        const choice = resolveDocContent(root, locale, sourcePage.file);
        expect(page?.isFallback, `${locale} ${sourcePage.file}`).toBe(choice.isFallback);
        expect(page?.contentLocale, `${locale} ${sourcePage.file}`).toBe(choice.contentLocale);
        // 📄 the sections of that page share the flag
        const sections = records.filter((record) => record.recordType === 'section' && record.url.startsWith(`${docsUrl(sourcePage.slug)}#`));
        expect(sections.every((record) => record.isFallback === choice.isFallback && record.contentLocale === choice.contentLocale)).toBe(true);
      }
    }
    // ✅ the translated pages: introduction, installation, the quick start and the three guides
    const translated = [
      'index.mdx',
      'installation.mdx',
      'quick-start.mdx',
      'guides/theming-dark-mode.mdx',
      'guides/icons-fonts.mdx',
      'guides/layout-rule.mdx',
    ];
    for (const locale of ['fr', 'es', 'ru'] as const) {
      const pages = collectDocRecords(root, locale).filter((record) => record.recordType === 'page');
      // 🏳️ 17 pages, 6 translated: 11 still fall back to English (was 15 before these four files)
      expect(pages.filter((record) => record.isFallback), locale).toHaveLength(11);
      for (const file of translated) {
        expect(existsSync(join(root, 'content/docs', locale, file)), `${locale} ${file}`).toBe(true);
        expect(resolveDocContent(root, locale, file).isFallback, `${locale} ${file}`).toBe(false);
      }
    }
  });

  it('flips isFallback when a translated file appears', () => {
    // 📁 a tiny tree: English quick start only
    const dir = mkdtempSync(join(tmpdir(), 'search-fallback-'));
    try {
      mkdirSync(join(dir, 'content/docs/en'), { recursive: true });
      writeFileSync(join(dir, 'content/docs/en/quick-start.mdx'), '---\ntitle: Quick start\ndescription: "A first page"\n---\n\n## Create the layout\n\nHello\n');
      // 🏳️ missing fr file
      const before = collectDocRecords(dir, 'fr');
      expect(before.find((record) => record.recordType === 'page')?.isFallback).toBe(true);
      expect(before.find((record) => record.recordType === 'page')?.contentLocale).toBe('en');
      expect(before.find((record) => record.recordType === 'section')?.title).toBe('Create the layout');
      // 🇫🇷 the translation lands, no indexer change
      mkdirSync(join(dir, 'content/docs/fr'), { recursive: true });
      writeFileSync(join(dir, 'content/docs/fr/quick-start.mdx'), '---\ntitle: Démarrage\ndescription: "Une page"\n---\n\n## Créer la page\n\nBonjour\n');
      const after = collectDocRecords(dir, 'fr');
      const page = after.find((record) => record.recordType === 'page');
      expect(page?.isFallback).toBe(false);
      expect(page?.contentLocale).toBe('fr');
      expect(page?.title).toBe('Démarrage');
      expect(after.find((record) => record.recordType === 'section')?.title).toBe('Créer la page');
      expect(after.find((record) => record.recordType === 'section')?.isFallback).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('keeps the sample heading ids in every locale', () => {
    // ⚓ the ids the code samples and links use, pinned with `[#id]` outside English
    const pinned = {
      'quick-start': ['create-the-layout', 'add-a-main-pane'],
      'guides/layout-rule': ['anatomy-and-slots', 'what-scrolls'],
    } as const;
    for (const locale of SEARCH_LOCALES) {
      const records = collectDocRecords(root, locale);
      for (const [slug, ids] of Object.entries(pinned)) {
        const prefix = `${docsUrl(slug)}#`;
        const anchors = records
          .filter((record) => record.recordType === 'section' && record.url.startsWith(prefix))
          .map((record) => record.url.slice(prefix.length));
        const page = source.getPage(slug.split('/'), locale);
        const toc = docsTocItems(page!.data.toc).map((item) => item.id);
        for (const id of ids) {
          expect(anchors, `${locale} ${slug}`).toContain(id);
          expect(toc, `${locale} ${slug}`).toContain(id);
        }
      }
    }
  });

  it('uses the same heading anchors as the rendered outline', () => {
    // 🌍 every locale, every page
    for (const locale of SEARCH_LOCALES) {
      const records = collectDocRecords(root, locale);
      for (const sourcePage of docPageSources(root)) {
        // 📚 the page the app renders (fallback included)
        const page = source.getPage(sourcePage.slug ? sourcePage.slug.split('/') : [], locale);
        expect(page, `${locale} ${sourcePage.slug}`).toBeTruthy();
        // ⚓ h2–h4, in outline order
        const toc = docsTocItems(page!.data.toc);
        const prefix = `${docsUrl(sourcePage.slug)}#`;
        const anchors = records.filter((record) => record.recordType === 'section' && record.url.startsWith(prefix)).map((record) => record.url.slice(prefix.length));
        expect(anchors, `${locale} ${sourcePage.slug}`).toEqual(toc.map((item) => item.id));
      }
    }
  });

  it('links prop names at the real props-page heading', () => {
    // 📋 English props
    const docs = collectDocRecords(root, 'en');
    const props = collectPropRecords(root, 'en', docs);
    // 🚪 `open` on AbDrawerProps
    const open = props.find((record) => record.title === 'open' && record.section === 'AbDrawerProps');
    expect(open?.url.startsWith('/docs/packages/components/drawer#')).toBe(true);
    expect(open?.content).toContain('boolean');
    expect(open?.isFallback).toBe(false);
    // 🏳️ the same prop is English on the French index
    const french = collectPropRecords(root, 'fr', collectDocRecords(root, 'fr'));
    expect(french.find((record) => record.id === open?.id)?.isFallback).toBe(true);
  });

  it('indexes package cards, exported symbols and changelog anchors', () => {
    // 📦 the home cards and the symbols
    const packages = collectPackageRecords(root, 'en');
    expect(packages.some((record) => record.recordType === 'package' && record.url === '/#package-core' && record.packageName === 'ab-nextjs-core')).toBe(true);
    expect(packages.some((record) => record.recordType === 'symbol' && record.title === 'AbButton')).toBe(true);
    expect(packages.some((record) => record.recordType === 'symbol' && record.title === 'useAbScrollSpy')).toBe(true);
    // 📜 every released heading the page renders
    const notes = loadChangelogs(root);
    const rows = collectChangelogRecords(root, 'en');
    for (const doc of notes) {
      expect(rows.some((record) => record.url === `/changelog#${doc.id}`)).toBe(true);
      for (const entry of doc.entries) {
        if (entry.kind === 'version' && entry.version) expect(rows.some((record) => record.url === `/changelog#${entry.anchor}`)).toBe(true);
      }
    }
    // 🏳️ the French changelog is still English
    expect(collectChangelogRecords(root, 'fr').every((record) => record.isFallback && record.contentLocale === 'en')).toBe(true);
  });

  it('does not index icons', () => {
    // 🚫 no icon-browser rows (`/docs/packages/icons` is the package page, and it stays)
    const records = collectSearchRecords(root, 'en');
    expect(records.some((record) => record.url === '/icons' || record.url.startsWith('/icons?') || record.url.startsWith('/icons#'))).toBe(false);
    expect(records.some((record) => record.url === '/docs/packages/icons')).toBe(true);
  });
});


describe('search snapshots 📦', () => {
  // 📦 build each locale once
  const files = Object.fromEntries(SEARCH_LOCALES.map((locale) => [locale, buildSearchFile(root, locale)])) as Record<AppLocale, ReturnType<typeof buildSearchFile>>;

  it('finds code names by exact name and by a part', () => {
    // 🇫🇷 a non-English stemmer must not hide the English API
    const db = openSearchSnapshot('fr', files.fr.snapshot as RawData);
    expect(titlesFor(db, 'AbButton')[0]).toBe('AbButton');
    expect(titlesFor(db, 'button')).toContain('AbButton');
    expect(titlesFor(db, 'useAbScrollSpy')[0]).toBe('useAbScrollSpy');
    expect(titlesFor(db, 'scroll')).toContain('useAbScrollSpy');
    expect(titlesFor(db, 'ab-nextjs-core').some((title) => title === 'Core' || title.startsWith('Core '))).toBe(true);
    expect(titlesFor(db, 'core').some((title) => title === 'Core' || title.startsWith('Core '))).toBe(true);
  });

  it('matches inflections in the locale snapshot', () => {
    // 🇫🇷 installer / installation
    const french = openSearchSnapshot('fr', files.fr.snapshot as RawData);
    expect(titlesFor(french, 'installer').length).toBeGreaterThan(0);
    expect(titlesFor(french, 'installation').length).toBeGreaterThan(0);
    // 🇪🇸 instalar / instalación
    const spanish = openSearchSnapshot('es', files.es.snapshot as RawData);
    expect(titlesFor(spanish, 'instalar').length).toBeGreaterThan(0);
    expect(titlesFor(spanish, 'instalación').length).toBeGreaterThan(0);
    // 🇷🇺 установки meets Установка
    const russian = openSearchSnapshot('ru', files.ru.snapshot as RawData);
    expect(titlesFor(russian, 'установки').length).toBeGreaterThan(0);
    expect(titlesFor(russian, 'установка').length).toBeGreaterThan(0);
  });

  it('records the installed zbsearch version', () => {
    // 📦 the version field of the package that is actually installed
    const pkgPath = createRequire(import.meta.url).resolve('zbsearch/package.json');
    const version = (JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string }).version;
    // 🔢 the helper and every snapshot agree with that file
    expect(installedZbsearchVersion()).toBe(version);
    for (const locale of SEARCH_LOCALES) expect(files[locale].engineVersion).toBe(version);
  });

  it('suggests a near miss and stays quiet on an exact term', () => {
    // 💡 buton → button, layot → layout
    expect(suggestSearchTerms('buton', files.en.suggestions).map((term) => term.toLowerCase())).toContain('button');
    expect(suggestSearchTerms('layot', files.en.suggestions).map((term) => term.toLowerCase())).toContain('layout');
    // ✅ already a term
    expect(suggestSearchTerms('button', files.en.suggestions)).toEqual([]);
    // 🌍 every locale has a dictionary
    for (const locale of SEARCH_LOCALES) expect(files[locale].suggestions.length).toBeGreaterThan(10);
  });
});
