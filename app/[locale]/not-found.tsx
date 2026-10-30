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
* @name: abElements 404 - Page
* @file: app/[locale]/not-found.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> /fr/nope → 404 inside the shell (Page introuvable)
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🤷🏽‍♂️ The localized 404 (0.2.22, mocks 44–47): unknown paths (via `[...rest]`) and every `notFound()` inside
// `app/[locale]` render here, INSIDE the docs shell (sidebar, app bar, bottom bar, drawers) 🧭, in the visitor's locale.

// REACT types
import type { ReactElement } from 'react';
// NEXT types
import type { Metadata } from 'next';

// import the root params (the `locale` segment of the root layout) from `next` 🌱
import * as rootParams from 'next/root-params';
// import the locale guard from `ab-nextjs-i18n` 🛂
import { isAbLocale } from 'ab-nextjs-i18n/config';
// import the server-side translations & request-locale helpers from `ab-nextjs-i18n` 🌐
import { getAbTranslations, setAbRequestLocale } from 'ab-nextjs-i18n/server';

// import abElements' i18n config (locales, default locale...) & the locale type 🌍
import abI18nConfig, { type AppLocale } from '@/i18n/config';

// import the shared (server) docs shell frame 🧭
import DocsShellFrame from '@/components/app/docs-shell/frame';
// import the 404 body 🤷🏽‍♂️
import NotFoundView from '@/components/app/not-found';


/**
 * `getNotFoundLocale` - the locale of this 404, ALWAYS one of ours 🌍
 *
 * The root param, when it's a known locale, else the default one. An unknown segment (e.g. `/foo.bar`, which the
 * proxy never rewrites) must not fall through to next-intl's header lookup: that turned the 404 into a 500 💥.
 *
 * @returns { Promise<AppLocale> }
 */
async function getNotFoundLocale(): Promise<AppLocale> {
  // 🌱 the `[locale]` segment (may be anything the visitor typed)
  const value = await rootParams.locale();
  // 🛂 ours ? keep it : the default locale
  const locale: AppLocale = isAbLocale(abI18nConfig, value) ? value : abI18nConfig.defaultLocale;
  // 📌 pin it for every next-intl call of this render (no request headers → stays static-friendly)
  setAbRequestLocale(locale);
  // ✅
  return locale;
}


// the 404 page's own metadata (uses the root title template: "Page introuvable | abElements") 🔎
export async function generateMetadata(): Promise<Metadata> {
  // get the translations of the `Metadata` messages, in a known locale 🌐
  const t = await getAbTranslations({ locale: await getNotFoundLocale(), namespace: 'Metadata' });
  // return the (localized) 404 title, never indexed 🙈
  return {
    title: t('notFoundTitle'),
    robots: { index: false, follow: true },
  };
}


/**
 * `NotFound` / 404 - Page 🤷🏽‍♂️
 *
 * @returns { Promise<ReactElement> }
 */
export default async function NotFoundPage(): Promise<ReactElement> {
  // 🌍 the current locale (from the root params of `app/[locale]/layout.tsx`, validated)
  const locale = await getNotFoundLocale();

  // return the 404 body inside the shell 🧩
  return (
    <DocsShellFrame locale={locale}>
      <NotFoundView locale={locale} />
    </DocsShellFrame>
  );
}
