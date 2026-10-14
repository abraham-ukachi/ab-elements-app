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
* @name: abElements i18n Request Config
* @file: i18n/request.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
*
* Example usage:
*   1+|> 
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// next-intl request config (found automatically by `withAbI18n` / next-intl's plugin).
import { createAbRequestConfig } from 'ab-nextjs-i18n/server';
// import the root params (the `locale` of the root layout) from `next`
import * as rootParams from 'next/root-params';
// import abElements' i18n config
import abI18nConfig from './config';

// create and export the request config as default 🌐
export default createAbRequestConfig({
  /* i18n Config */
  config: abI18nConfig,
  // Keep this `import()` here so next-intl's (opt-in) precompile loader can see the JSON files.
  loadMessages: async (locale) => (await import(`../messages/${locale}.json`)).default,
  // The locale of `app/[locale]/layout.tsx` (it must be the root layout: no `app/layout.tsx`).
  // Pages render statically without `setAbRequestLocale`. Server Actions and Route Handlers
  // (no root params yet) fall back to the locale the proxy detected.
  rootParam: () => rootParams.locale(),
});
