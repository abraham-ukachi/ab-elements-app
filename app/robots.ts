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
* @name: abElements Robots
* @file: app/robots.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
*
* Example usage:
*   1+|> // served as `/robots.txt`
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

// import the pathname localizer from `ab-nextjs-i18n`
import { localizeAbPathname } from 'ab-nextjs-i18n/config';

// import abElements' i18n config & public URL
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
  // localize every private path in every locale (e.g. `/welcome`, `/fr/welcome`...) 🌐
  const localizedPrivatePaths = PRIVATE_PATHS.flatMap((path) =>
    abI18nConfig.locales.map((locale) => localizeAbPathname(path, locale, abI18nConfig)),
  );

  // return the robots rules 🤖
  return {
    /* Rules - for every crawler */
    rules: {
      userAgent: '*',
      allow: '/',
      // no API & no private paths (deduped) 🚫
      disallow: ['/api/', ...new Set(localizedPrivatePaths)],
    },
    /* Sitemap - absolute URL */
    sitemap: new URL('/sitemap.xml', APP_URL).toString(),
  };
}
