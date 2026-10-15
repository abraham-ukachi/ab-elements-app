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
* @name: abElements Welcome Messages Unit Tests
* @file: tests/unit/welcome-messages.test.ts
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


// 🧪 Welcome messages (fr / es / ru): same keys as en, same ICU arguments & rich tags, brand / code
// names kept untranslated (glossary `doNotTranslate`), and titles that don't balloon past the layout.

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

// the ICU arguments (`{n}`, `{title}`...) & rich tags (`<em>`, `<br>`) of a message, sorted 🔣
const placeholders = (message: string): string[] => [
  ...[...message.matchAll(/\{(\w+)/g)].map((match) => `{${match[1]}}`),
  ...[...message.matchAll(/<\/?(\w+)>/g)].map((match) => `<${match[1]}>`),
].sort();


// the source (en) Welcome messages 🇬🇧
const EN = flatten(readMessages<{ Welcome: Messages }>('en.json').Welcome);
// the glossary's untranslatable terms 📒
const { doNotTranslate } = readMessages<{ doNotTranslate: string[] }>('.ab-i18n-glossary.json');
// the translated locales 🌍
const LOCALES = ['fr', 'es', 'ru'] as const;
// the most a title may grow vs en (the brief flags > 1.4×; 1.5× is the hard stop) 📏
const MAX_TITLE_GROWTH = 1.5;
// reviewed exceptions (`locale:key` → max growth): titles checked on the 390px & laptop frames and kept on purpose 🔍
// - fr s04 "Un thème chaleureux, fondé sur des jetons" reads naturally; the shorter "en jetons" sounded clipped 🇫🇷
const TITLE_GROWTH_EXCEPTIONS: Record<string, number> = { 'fr:slides.s04.title': 1.8 };


describe('messages: the Welcome namespace in fr / es / ru 🌍', () => {
  for (const locale of LOCALES) {
    // this locale's Welcome messages
    const messages = flatten(readMessages<{ Welcome: Messages }>(`${locale}.json`).Welcome);

    it(`${locale}: has exactly the en keys (nothing missing, nothing extra) 🔑`, () => {
      expect(Object.keys(messages).sort()).toEqual(Object.keys(EN).sort());
    });

    it(`${locale}: keeps every ICU argument & rich tag (counter, goTo, slideLabel, titles...) 🔣`, () => {
      for (const key of Object.keys(EN)) expect(placeholders(messages[key] ?? ''), key).toEqual(placeholders(EN[key]));
    });

    it(`${locale}: keeps the brand & code names untranslated 🏷️`, () => {
      for (const [key, source] of Object.entries(EN)) {
        // every glossary term in the en message must still be in the translation
        for (const term of doNotTranslate) if (source.includes(term)) expect(messages[key], `${key} (${term})`).toContain(term);
        // and so must every package / component / hook name (`ab-nextjs-*`, `AbFoo`, `useAbFoo`, `font-*`)
        for (const code of source.match(/\b(?:ab-nextjs-[a-z0-9]+|useAb\w+|Ab[A-Z]\w+|font-\*)/g) ?? []) expect(messages[key], `${key} (${code})`).toContain(code);
      }
    });

    it(`${locale}: slide titles stay within ${MAX_TITLE_GROWTH}× the en length 📏`, () => {
      for (const key of Object.keys(EN).filter((name) => name.startsWith('slides.') && name.endsWith('.title'))) {
        // the cap: the reviewed exception if any, else the default 📏
        const cap = TITLE_GROWTH_EXCEPTIONS[`${locale}:${key}`] ?? MAX_TITLE_GROWTH;
        expect(messages[key].length / EN[key].length, key).toBeLessThanOrEqual(cap);
      }
    });
  }

  it('fr: uses a space before `:` like the rest of the French messages 🇫🇷', () => {
    // the French Welcome messages
    const fr = flatten(readMessages<{ Welcome: Messages }>('fr.json').Welcome);
    // no "word:" without the space (URLs & ICU excluded)
    for (const [key, value] of Object.entries(fr)) expect(value, key).not.toMatch(/[\p{L}}]:(?!\/)/u);
  });
});
