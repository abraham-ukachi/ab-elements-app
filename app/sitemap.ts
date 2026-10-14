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
* @name: abElements Sitemap
* @file: app/sitemap.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
*
* Example usage:
*   1+|> // served as `/sitemap.xml`
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// NEXT types
import type { MetadataRoute } from 'next';

// import the sitemap entries helper & the sitemap path type from `ab-nextjs-i18n`
import { getAbSitemapEntries } from 'ab-nextjs-i18n/server';
import type { AbSitemapPath } from 'ab-nextjs-i18n/server';

// import abElements' i18n config & public URL
import abI18nConfig from '@/i18n/config';
import { APP_URL } from './metadata';


// the public paths (without locale prefix) listed in the sitemap
const SITEMAP_PATHS: readonly AbSitemapPath[] = [
  // the home page 🏠
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
  // return the localized sitemap entries 🗺️
  return getAbSitemapEntries(abI18nConfig, SITEMAP_PATHS, APP_URL);
}
