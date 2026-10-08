/*
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
*
* @project: ab-elements-app
* @name: abElements Sitemap
* @file: app/sitemap.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
*/


// NEXT types
import type { MetadataRoute } from 'next';

import { getAbSitemapEntries } from 'ab-nextjs-i18n/server';
import type { AbSitemapPath } from 'ab-nextjs-i18n/server';

import abI18nConfig from '@/i18n/config';
import { APP_URL } from './metadata';


// the public paths (without locale prefix) listed in the sitemap
const SITEMAP_PATHS: readonly AbSitemapPath[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
];


/**
 * `sitemap` - served as `/sitemap.xml`
 *
 * One entry per path and locale (`/`, `/fr`, `/es`, `/ru`), each with hreflang alternates for every locale.
 *
 * @returns { MetadataRoute.Sitemap }
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return getAbSitemapEntries(abI18nConfig, SITEMAP_PATHS, APP_URL);
}
