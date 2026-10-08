// REACT types
import type { ReactNode } from 'react';

import type { Metadata } from '../metadata';
import type { Viewport } from '../viewport';

import { notFound } from 'next/navigation';

// import the Inter font class names from `ab-nextjs-fonts`
import { interStyles } from 'ab-nextjs-fonts';

import { AbI18nProvider } from 'ab-nextjs-i18n';
import { isAbLocale } from 'ab-nextjs-i18n/config';
import { generateAbStaticParams, getAbTranslations } from 'ab-nextjs-i18n/server';

import abI18nConfig from '@/i18n/config';
import { StaticMetadata } from '../metadata';
import { StaticViewport } from '../viewport';

import '../globals.css';


type LocaleLayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>;


// the root metadata, with the title & description of the `Metadata` messages of this locale
// (each page adds its own canonical & hreflang alternates)
export async function generateMetadata({ params }: Pick<LocaleLayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isAbLocale(abI18nConfig, locale)) notFound();
  const t = await getAbTranslations({ locale, namespace: 'Metadata' });

  return {
    ...StaticMetadata,
    title: {
      template: t('titleTemplate'),
      default: t('titleDefault'),
    },
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
 */
const themeScript: string = `(function () {
  try {
    var saved = localStorage.getItem('theme');
    var theme = saved === 'light' || saved === 'dark'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch (e) {}
})();`;


export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isAbLocale(abI18nConfig, locale)) notFound();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={interStyles.regular}>
        <AbI18nProvider config={abI18nConfig}>{children}</AbI18nProvider>
      </body>
    </html>
  );
}
