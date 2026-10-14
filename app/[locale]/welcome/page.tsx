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
* @name: abElements Welcome Page
* @file: app/[locale]/welcome/page.tsx
* @type: TypeScript (React)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> /welcome, /fr/welcome ...
*    -|> 
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// NEXT types
import type { Metadata } from 'next';
// import `notFound` to throw a 404 for unknown locales
import { notFound } from 'next/navigation';

// import the locale guard from `ab-nextjs-i18n`
import { isAbLocale } from 'ab-nextjs-i18n/config';
// import the server-side translations helper from `ab-nextjs-i18n`
import { getAbTranslations } from 'ab-nextjs-i18n/server';

// import abElements' i18n config (locales, default locale...)
import abI18nConfig from '@/i18n/config';
// import THE Welcome entry component 🎬
import Welcome from './welcome';


// create the props type of the Welcome page as `WelcomePageProps` (Next.js 16 hands us the `params` as a Promise)
type WelcomePageProps = Readonly<{ params: Promise<{ locale: string }> }>;


/**
 * `generateMetadata` - Welcome Page Metadata 🔎
 *
 * A localized title ("Welcome · abElements") and `noindex`: the Welcome is a first-visit
 * walkthrough, the home page stays the one search engines index 🤖🚫.
 *
 * @param { WelcomePageProps } props - the page props (with the `locale` param)
 * @returns { Promise<Metadata> }
 */
export async function generateMetadata({ params }: WelcomePageProps): Promise<Metadata> {
  // get the current `locale` from the params
  const { locale } = await params;
  // unknown locale ? throw a 404 🚫
  if (!isAbLocale(abI18nConfig, locale)) notFound();
  // get the translations of the `Welcome` messages of this locale 🌐
  const t = await getAbTranslations({ locale, namespace: 'Welcome' });

  // return the Welcome page's metadata
  return {
    // the full title (no "%s | abElements" template: the message already names the app)
    title: { absolute: t('meta.title') },
    // never index the Welcome (but follow its links) 🔎
    robots: { index: false, follow: true },
  };
}


/**
 * `WelcomePage` - Page 🎬
 *
 * Thin page: checks the locale, then renders `<Welcome />`.
 *
 * @param { WelcomePageProps } props - the page props (with the `locale` param)
 * @returns { Promise<ReactElement> }
 */
export default async function WelcomePage({ params }: WelcomePageProps) {
  // get the current `locale` from the params
  const { locale } = await params;
  // unknown locale ? throw a 404 🚫
  if (!isAbLocale(abI18nConfig, locale)) notFound();

  // render THE Welcome 🎬
  return <Welcome locale={locale} />;
}
