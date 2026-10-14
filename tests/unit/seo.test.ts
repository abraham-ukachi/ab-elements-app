/* 
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElments Project.
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
* @name: abElements SEO Tests
* @file: tests/unit/seo.test.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
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


// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';

// import the robots, the sitemap & abElements' public URL
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { APP_URL } from '@/app/metadata';


// a little helper that turns a pathname into an absolute URL of abElements 🔗
const url = (pathname: string): string => new URL(pathname, APP_URL).toString();

// the hreflang alternates expected for `/` (one per locale) 🌐
const LANGUAGES = {
  en: url('/'),
  fr: url('/fr'),
  es: url('/es'),
  ru: url('/ru'),
};


describe('app/sitemap', () => {
  it('lists every locale of `/` with hreflang alternates', () => {
    // get the sitemap entries
    const entries = sitemap();

    // expect `/`, `/fr`, `/es` & `/ru` (in that order) ✅
    expect(entries.map((entry) => entry.url)).toEqual([url('/'), url('/fr'), url('/es'), url('/ru')]);
    // expect every entry to have the alternates, a weekly frequency & the top priority ✅
    for (const entry of entries) {
      expect(entry.alternates?.languages).toEqual(LANGUAGES);
      expect(entry.changeFrequency).toBe('weekly');
      expect(entry.priority).toBe(1);
    }
  });
});


describe('app/robots', () => {
  it('allows `/` and points at the absolute sitemap URL', () => {
    // get the rules & the sitemap URL
    const { rules, sitemap: sitemapUrl } = robots();

    expect(rules).toMatchObject({ userAgent: '*', allow: '/' });
    expect(sitemapUrl).toBe(url('/sitemap.xml'));
  });

  it('disallows the API, the welcome screen and the account routes in every locale', () => {
    const { rules } = robots();
    // get the disallowed paths (`rules` is a single object here)
    const disallow = Array.isArray(rules) ? [] : rules.disallow;

    // expect the API + every private path in every locale 🚫
    expect(disallow).toEqual([
      '/api/',
      '/welcome', '/fr/welcome', '/es/welcome', '/ru/welcome',
      '/profile', '/fr/profile', '/es/profile', '/ru/profile',
      '/settings', '/fr/settings', '/es/settings', '/ru/settings',
      '/bookmarks', '/fr/bookmarks', '/es/bookmarks', '/ru/bookmarks',
    ]);
  });
});
