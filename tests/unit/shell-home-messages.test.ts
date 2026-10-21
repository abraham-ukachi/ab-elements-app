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
* @name: abElements Shell & Home Messages Tests
* @file: tests/unit/shell-home-messages.test.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 Shell + Home messages (0.2.21–0.2.23 scaffolding): same keys as en, same ICU arguments & rich tags,
// brand names untranslated, short bottom-bar labels (360px, no ellipsis 📱) and no casing baked into section labels.

// import the file helpers from Node 📁
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';


// a nested messages object 🌳
type Messages = { [key: string]: string | Messages };

// read a JSON file from `messages/` 📖
const readMessages = <T>(file: string): T => JSON.parse(readFileSync(join(process.cwd(), 'messages', file), 'utf8')) as T;

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

// the Shell + Home messages of a locale 🗂️
const load = (locale: string) => {
  // the whole file
  const all = readMessages<{ Shell: Messages; Home: Messages }>(`${locale}.json`);
  // just our two namespaces, flattened
  return { ...flatten(all.Shell, 'Shell.'), ...flatten(all.Home, 'Home.') };
};

// the source (en) messages 🇬🇧
const EN = load('en');
// the glossary's untranslatable terms 📒
const { doNotTranslate } = readMessages<{ doNotTranslate: string[] }>('.ab-i18n-glossary.json');
// every locale 🌍
const LOCALES = ['en', 'fr', 'es', 'ru'] as const;
// the bottom-bar labels must fit a 90px tab at 360px (one line, no ellipsis) 📱
const MAX_BOTTOM_BAR_CHARS = 10;


describe('messages: the Shell & Home namespaces 🧭', () => {
  it('en: says "Eight" packages and includes i18n (D21) 8️⃣', () => {
    expect(EN['Home.lead']).toMatch(/^Eight /);
    expect(EN['Home.lead']).toContain('i18n');
  });

  for (const locale of LOCALES.filter((name) => name !== 'en')) {
    // this locale's messages
    const messages = load(locale);

    it(`${locale}: has exactly the en keys 🔑`, () => {
      expect(Object.keys(messages).sort()).toEqual(Object.keys(EN).sort());
    });

    it(`${locale}: keeps every ICU argument & rich tag 🔣`, () => {
      for (const key of Object.keys(EN)) expect(placeholders(messages[key] ?? ''), key).toEqual(placeholders(EN[key]));
    });

    it(`${locale}: keeps the brand & package names untranslated 🏷️`, () => {
      for (const [key, source] of Object.entries(EN)) {
        for (const term of doNotTranslate) if (source.includes(term)) expect(messages[key], `${key} (${term})`).toContain(term);
        for (const code of source.match(/\b(?:ab-nextjs-[a-z0-9]+|useAb\w+|Ab[A-Z]\w+|next\/font)/g) ?? []) expect(messages[key], `${key} (${code})`).toContain(code);
      }
    });
  }

  for (const locale of LOCALES) {
    // this locale's messages
    const messages = load(locale);

    it(`${locale}: bottom-bar labels stay ≤ ${MAX_BOTTOM_BAR_CHARS} characters 📱`, () => {
      for (const key of ['home', 'packages', 'search', 'profile']) expect(messages[`Shell.bottomBar.${key}`].length, key).toBeLessThanOrEqual(MAX_BOTTOM_BAR_CHARS);
    });

    it(`${locale}: section labels aren't uppercased in the messages (CSS does it) 🔠`, () => {
      for (const [key, value] of Object.entries(messages).filter(([name]) => name.startsWith('Shell.sidebar.sections.'))) expect(value, key).not.toBe(value.toUpperCase());
    });
  }

  it('fr: uses a non-breaking space before `…` 🇫🇷', () => {
    const fr = load('fr');
    for (const [key, value] of Object.entries(fr)) if (value.includes('…')) expect(value, key).toMatch(/\u00a0…/);
  });
});
