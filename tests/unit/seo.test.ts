/*
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
*
* @project: ab-elements-app
* @name: abElements SEO Tests
* @file: tests/unit/seo.test.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
*
* Example usage:
*   1+|> pnpm test
*
*/


import { describe, expect, it } from 'vitest';

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { APP_URL } from '@/app/metadata';


const url = (pathname: string): string => new URL(pathname, APP_URL).toString();

const LANGUAGES = {
  en: url('/'),
  fr: url('/fr'),
  es: url('/es'),
  ru: url('/ru'),
};


describe('app/sitemap', () => {
  it('lists every locale of `/` with hreflang alternates', () => {
    const entries = sitemap();

    expect(entries.map((entry) => entry.url)).toEqual([url('/'), url('/fr'), url('/es'), url('/ru')]);
    for (const entry of entries) {
      expect(entry.alternates?.languages).toEqual(LANGUAGES);
      expect(entry.changeFrequency).toBe('weekly');
      expect(entry.priority).toBe(1);
    }
  });
});


describe('app/robots', () => {
  it('allows `/` and points at the absolute sitemap URL', () => {
    const { rules, sitemap: sitemapUrl } = robots();

    expect(rules).toMatchObject({ userAgent: '*', allow: '/' });
    expect(sitemapUrl).toBe(url('/sitemap.xml'));
  });

  it('disallows the API, the welcome screen and the account routes in every locale', () => {
    const { rules } = robots();
    const disallow = Array.isArray(rules) ? [] : rules.disallow;

    expect(disallow).toEqual([
      '/api/',
      '/welcome', '/fr/welcome', '/es/welcome', '/ru/welcome',
      '/profile', '/fr/profile', '/es/profile', '/ru/profile',
      '/settings', '/fr/settings', '/es/settings', '/ru/settings',
      '/bookmarks', '/fr/bookmarks', '/es/bookmarks', '/ru/bookmarks',
    ]);
  });
});
