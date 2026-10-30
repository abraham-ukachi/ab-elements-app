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
* @name: abElements 404 - Unit Tests
* @file: tests/unit/not-found.test.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test tests/unit/not-found.test.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 The 404 page (0.2.22): the "Did you mean …?" matcher, the NotFound messages in all 4 locales, the wiring of both
// 404 entry points inside the shell, and the packages-only rule (no app-local UI) 🧩.

// import the file helpers from Node 📁
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';

// import the 404 data & matcher 💡
import { NOT_FOUND_POPULAR, NOT_FOUND_ROUTES, NOT_FOUND_SUGGESTED, closestRoute, editDistance } from '@/lib/not-found';


// a nested messages object 🌳
type Messages = { [key: string]: string | Messages };

// read a file of the repo 📖
const read = (path: string): string => readFileSync(join(process.cwd(), path), 'utf8');
// flatten a namespace into `a.b.c → value` pairs 🧹
const flatten = (messages: Messages, prefix = ''): Record<string, string> => Object.fromEntries(
  Object.entries(messages).flatMap(([key, value]) => (typeof value === 'string'
    ? [[`${prefix}${key}`, value]]
    : Object.entries(flatten(value, `${prefix}${key}.`)))),
);
// the ICU arguments & rich tags of a message, sorted 🔣
const placeholders = (message: string): string[] => [
  ...[...message.matchAll(/\{(\w+)/g)].map((match) => `{${match[1]}}`),
  ...[...message.matchAll(/<\/?(\w+)>/g)].map((match) => `<${match[1]}>`),
].sort();
// the flattened NotFound namespace of a locale 🗂️
const load = (locale: string): Record<string, string> => flatten((JSON.parse(read(`messages/${locale}.json`)) as { NotFound: Messages }).NotFound);

// 🇬🇧 the source messages & every locale 🌍
const EN = load('en');
const LOCALES = ['en', 'fr', 'es', 'ru'] as const;


describe('404: the "Did you mean …?" matcher 💡', () => {
  it('measures edits like Levenshtein 📏', () => {
    expect(editDistance('kitten', 'sitting')).toBe(3); // 🐱 the classic
    expect(editDistance('', 'abc')).toBe(3); // ➕ three inserts
    expect(editDistance('hooks', 'hooks')).toBe(0); // ✅ same word
  });

  it('suggests the closest route for a typo, from any segment ✅', () => {
    expect(closestRoute('/docs/componnets')?.href).toBe('/#package-components'); // 🧩 2 edits ≤ 3
    expect(closestRoute('/hoks')?.href).toBe('/#package-hooks'); // 🪝 1 edit
    expect(closestRoute('/Welcom')?.href).toBe('/welcome'); // 👋 case-insensitive
    expect(closestRoute('/changelg?ref=x#top')?.href).toBe('/#whats-new'); // 📰 query & hash ignored
  });

  it('suggests nothing when nothing is close (no wild guesses) 🙅', () => {
    expect(closestRoute('/')).toBeNull(); // 🏠 nothing typed
    expect(closestRoute('/zzzzzzzz/qqqq')).toBeNull(); // 🎲 noise
    expect(closestRoute('/%E0%A4%A')).toBeNull(); // 🛡️ a broken escape never throws
  });

  it('only links to pages that exist (Home sections or /welcome, D26: no 404 → 404) 🔁', () => {
    for (const { href } of [...NOT_FOUND_ROUTES, ...NOT_FOUND_SUGGESTED, ...NOT_FOUND_POPULAR]) expect(href, href).toMatch(/^\/(#[a-z0-9-]+|welcome)?$/);
  });
});


describe('404: the NotFound messages 🌐', () => {
  it('en has every key the page uses 🔑', () => {
    for (const key of ['code', 'title', 'lede', 'crumb', 'didYouMean', 'requested', 'search', 'backHome', 'browseDocs', 'suggested', 'popular', 'reportLink', 'openIssue']) expect(EN[key], key).toBeTruthy();
    for (const { id } of NOT_FOUND_SUGGESTED) for (const part of ['title', 'desc']) expect(EN[`suggestions.${id}.${part}`], `${id}.${part}`).toBeTruthy();
    for (const { id } of NOT_FOUND_POPULAR) for (const part of ['title', 'meta']) expect(EN[`popularPages.${id}.${part}`], `${id}.${part}`).toBeTruthy();
  });

  for (const locale of LOCALES.filter((name) => name !== 'en')) {
    // this locale's messages
    const messages = load(locale);

    it(`${locale}: has exactly the en keys, the same ICU args & rich tags, and is translated 🔣`, () => {
      expect(Object.keys(messages).sort()).toEqual(Object.keys(EN).sort()); // 🔑
      for (const key of Object.keys(EN)) expect(placeholders(messages[key]), key).toEqual(placeholders(EN[key])); // 🔣
      for (const key of ['title', 'lede', 'backHome', 'browseDocs', 'suggested', 'popular']) expect(messages[key], key).not.toBe(EN[key]); // 🌍
    });
  }

  it('fr: non-breaking spaces before `…` and `?` 🇫🇷', () => {
    for (const [key, value] of Object.entries(load('fr'))) {
      if (value.includes('…')) expect(value, key).toMatch(/\u00a0…/);
      if (value.includes('?')) expect(value, key).toMatch(/\u00a0\?/);
    }
  });
});


describe('404: both entry points render inside the shell 🧭', () => {
  it('unmatched URLs reach the global 404, translated from the proxy\'s locale stamp 🌍', () => {
    const global = read('app/global-not-found.tsx');
    expect(global).toContain(`'x-next-intl-locale'`); // 📨 next-intl's header
    expect(global).toContain('setAbRequestLocale(locale)'); // 📌 no root params here
    expect(global).toMatch(/<html lang=\{locale\}/); // ♿ the right language, server-rendered
    // 🚫 only our 4 locales match `[locale]`, so `/foo.bar` is unmatched too (not a blank 404 or a 500)
    expect(read('app/[locale]/layout.tsx')).toContain('export const dynamicParams = false;');
    // 🕳️ no catch-all (Next 16.3 serves an empty shell for a `notFound()` in a matched route, vercel/next.js#99793)
    expect(existsSync(join(process.cwd(), 'app/[locale]/[...rest]'))).toBe(false);
  });

  it('[locale]/not-found & the global 404 wrap the same view in the shell frame 🤷🏽‍♂️', () => {
    for (const file of ['app/[locale]/not-found.tsx', 'app/global-not-found.tsx']) {
      expect(read(file), file).toMatch(/<DocsShellFrame locale=\{\w+\}>\s*<NotFoundView locale=\{\w+\} \/>/);
    }
    expect(read('app/global-not-found.tsx')).toContain('<AbI18nProvider'); // 🌐 the client islands need messages
    expect(read('next.config.ts')).toContain('globalNotFound: true'); // ⚙️
  });

  it('the main pane is the #main skip target, with no dead `<<` toggle 📟', () => {
    const view = read('components/app/not-found/index.tsx');
    expect(view).toMatch(/<AbMainLayout\s+id="main"\s+orientation="vertical"/);
    expect(view).toContain('asideToggle={false}');
  });
});


describe('404: packages only (no app-local UI) 🧩', () => {
  // the 404 files
  const FILES = ['components/app/not-found/index.tsx', 'components/app/not-found/islands.tsx', 'app/[locale]/not-found.tsx', 'app/global-not-found.tsx', 'lib/not-found.ts'];

  it('every 404 file exists and starts with the license header 📜', () => {
    for (const file of FILES) {
      expect(existsSync(join(process.cwd(), file)), file).toBe(true);
      const source = read(file);
      expect(source, file).toContain('Copyright (c) 2026 Abraham Ukachi. The abElements Project.');
      expect(source, file).toContain('@authors: Abraham Ukachi <abrahamukachi@gmail.com>');
    }
  });

  it('UI comes only from ab-nextjs-* (local imports are data, i18n or the shell) 📦', () => {
    for (const file of FILES) {
      for (const [, from] of read(file).matchAll(/from '([^']+)'/g)) {
        if (from.startsWith('@/')) expect(from, `${file} → ${from}`).toMatch(/^@\/(lib\/|i18n\/|messages\/|components\/app\/(docs-shell|not-found))/);
        else if (!from.startsWith('.')) expect(from, `${file} → ${from}`).toMatch(/^(ab-nextjs-|next(\/|$)|react$)/);
      }
    }
  });
});
