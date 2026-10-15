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
* @name: abElements Locale - Root Layout
* @file: app/[locale]/layout.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
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


// REACT types
import type { ReactNode } from 'react';

// import the Metadata & Viewport types (re-exported by abElements' metadata & viewport)
import type { Metadata } from '../metadata';
import type { Viewport } from '../viewport';

// import `notFound` to throw a 404 for unknown locales
import { notFound } from 'next/navigation';

// import the Inter font class names from `ab-nextjs-fonts`
import { interStyles } from 'ab-nextjs-fonts';

// import the i18n provider (client translations) from `ab-nextjs-i18n`
import { AbI18nProvider } from 'ab-nextjs-i18n';
// import the locale guard from `ab-nextjs-i18n`
import { isAbLocale } from 'ab-nextjs-i18n/config';
// import the static params & server-side translations helpers from `ab-nextjs-i18n`
import { generateAbStaticParams, getAbTranslations } from 'ab-nextjs-i18n/server';

// import abElements' i18n config (locales, default locale...)
import abI18nConfig from '@/i18n/config';
// import abElements' root static metadata & viewport
import { StaticMetadata } from '../metadata';
import { StaticViewport } from '../viewport';

// import the Splash overlay & its (pre-paint 🚦) gate script
import Splash, { abSplashGateScript } from '@/components/app/splash';

// import the global styles 🎨
import '../globals.css';


// create the props type of the locale layout as `LocaleLayoutProps`
type LocaleLayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>;


// the root metadata, with the title & description of the `Metadata` messages of this locale
// (each page adds its own canonical & hreflang alternates)
export async function generateMetadata({ params }: Pick<LocaleLayoutProps, 'params'>): Promise<Metadata> {
  // get the current `locale` from the params
  const { locale } = await params;
  // unknown locale ? throw a 404 🚫
  if (!isAbLocale(abI18nConfig, locale)) notFound();
  // get the translations of the `Metadata` messages of this locale 🌐
  const t = await getAbTranslations({ locale, namespace: 'Metadata' });

  // return the static metadata + the localized title & description
  return {
    ...StaticMetadata,
    /* App Title */
    title: {
      template: t('titleTemplate'),
      default: t('titleDefault'),
    },
    /* App Description */
    description: t('description'),
  };
}

// export the static viewport
export const viewport: Viewport = StaticViewport;

// Prerender /, /fr, /es and /ru at build time (i18n/request.ts reads the locale from
// next/root-params, so no setAbRequestLocale is needed).
export const generateStaticParams = () => generateAbStaticParams(abI18nConfig);


/**
 * `themeScript`
 *
 * Runs before the first paint to put the right Ab theme (`light` or `dark`) on `<html>`,
 * from the saved `theme` preference or the system's color scheme, so there's no theme flash.
 * A saved `system` mode (the 3-state theme switch 🌗) follows the OS and is kept in `data-theme-mode`.
 */
const themeScript: string = `(function () {
  try {
    var saved = localStorage.getItem('theme');
    var theme = saved === 'light' || saved === 'dark'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.themeMode = saved === 'system' ? 'system' : theme;
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch (e) {}
})();`;


/**
 * `LocaleLayout` - Root Layout 🌍
 *
 * The root layout of abElements (there's no `app/layout.tsx`: `next/root-params` needs this one at the root).
 * It sets `<html lang>`, the theme script, the Inter font and the i18n provider.
 *
 * @param { LocaleLayoutProps } props - the layout props (`children` & the `locale` param)
 * @returns { Promise<ReactElement> }
 */
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // get the current `locale` from the params
  const { locale } = await params;
  // unknown locale ? throw a 404 🚫
  if (!isAbLocale(abI18nConfig, locale)) notFound();

  // return the root layout
  return (
    <html lang={locale} suppressHydrationWarning>
      {/* Head - with the (no flash ⚡️) theme script */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* the Splash gate (standalone launch / first visit 💦) */}
        <script dangerouslySetInnerHTML={{ __html: abSplashGateScript }} />
      </head>
      {/* Body - with the Inter font & the i18n provider */}
      <body className={interStyles.regular}>
        {/* the Splash overlay (CSS-hidden unless the gate turned it on) */}
        <Splash />
        <AbI18nProvider config={abI18nConfig}>{children}</AbI18nProvider>
      </body>
    </html>
  );
}
