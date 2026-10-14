/* 
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
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
* @name: abElements i18n Config
* @file: i18n/config.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> import abI18nConfig from '@/i18n/config';
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// i18n config: the single source of truth for locales (used by the app, the proxy and the ab-nextjs-i18n CLI).
// Keep this file free of TypeScript-only runtime syntax (enums, namespaces): the CLI imports it with Node's type stripping.
import { defineAbI18n } from 'ab-nextjs-i18n/config';

// create and export abElements' i18n config as `abI18nConfig` 🌐
export const abI18nConfig = defineAbI18n({
  /* Locales - English, French, Spanish & Russian */
  locales: ['en', 'fr', 'es', 'ru'],
  /* Default Locale */
  defaultLocale: 'en',
  // 'as-needed': the default locale lives at `/`, the others at `/fr`, `/es`...
  localePrefix: 'as-needed',
  // Only written when the user picks a locale (switchLocale / createAbLocaleCookieAction), for maxAge (one year).
  localeCookie: { name: 'NEXT_LOCALE', maxAge: 60 * 60 * 24 * 365 },
  /* Messages Directory - `messages/<locale>.json` */
  messagesDir: 'messages',
});

// create and export the locale type as `AppLocale` (`'en' | 'fr' | 'es' | 'ru'`)
export type AppLocale = (typeof abI18nConfig.locales)[number];

// export the i18n config as default
export default abI18nConfig;
