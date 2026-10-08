/*
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
*
* @project: ab-elements-app
* @name: abElements Robots
* @file: app/robots.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
*/


// NEXT types
import type { MetadataRoute } from 'next';

import { localizeAbPathname } from 'ab-nextjs-i18n/config';

import abI18nConfig from '@/i18n/config';
import { APP_URL } from './metadata';


// the paths (without locale prefix) crawlers should skip: the welcome screen and the account routes
const PRIVATE_PATHS: readonly string[] = ['/welcome', '/profile', '/settings', '/bookmarks'];


/**
 * `robots` - served as `/robots.txt`
 *
 * Allows everything except the API, the welcome screen and the account routes (in every locale),
 * and points crawlers at the sitemap.
 *
 * @returns { MetadataRoute.Robots }
 */
export default function robots(): MetadataRoute.Robots {
  const localizedPrivatePaths = PRIVATE_PATHS.flatMap((path) =>
    abI18nConfig.locales.map((locale) => localizeAbPathname(path, locale, abI18nConfig)),
  );

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', ...new Set(localizedPrivatePaths)],
    },
    sitemap: new URL('/sitemap.xml', APP_URL).toString(),
  };
}
