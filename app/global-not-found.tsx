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
* @name: abElements Global 404 - Page
* @file: app/global-not-found.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> // any URL outside app/[locale] → this 404 (English), inside the shell
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


// 🌐 The 404 for every unmatched URL (0.2.22, experimental.globalNotFound): `/fr/nope`, `/docs/typo`, `/foo.bar`…
// It bypasses the locale layout, so it brings its own html/body, the packaged no-flash theme script (hooks 0.1.7),
// the Inter font, the global styles and an i18n provider, then renders the 404 view INSIDE the docs shell 🧭.
// 🌍 Translated: the locale comes from the header the i18n proxy (next-intl) stamps on every request it handles
//    (`/fr/nope` → fr, `/nope` → the saved pick or en); URLs the proxy skips (`/foo.bar`) fall back to English 🇬🇧.
// ⚠️ Why not a `[...rest]` catch-all + `notFound()`: Next.js 16.3 serves an EMPTY `__next_error__` shell (no `lang`,
//    no markup until JS runs) for a `notFound()` thrown in a matched route (vercel/next.js#99793). This file is
//    server-rendered in full, with the 404 status ✅.

// NEXT types
import type { Metadata } from 'next';
// import the request headers (the proxy's locale stamp) from `next` 📨
import { headers } from 'next/headers';
// REACT types
import type { ReactElement } from 'react';

// import the Inter font class names from `ab-nextjs-fonts` 🔤
import { interStyles } from 'ab-nextjs-fonts';
// import the (pre-paint 🚦) theme script builder from `ab-nextjs-hooks` (0.1.7) 🌗
import { getAbThemeScript } from 'ab-nextjs-hooks/abThemeScript';
// import the i18n provider (client translations) from `ab-nextjs-i18n` 🌐
import { AbI18nProvider } from 'ab-nextjs-i18n';
// import the locale guard from `ab-nextjs-i18n` 🛂
import { isAbLocale } from 'ab-nextjs-i18n/config';
// import the server-side translations helper from `ab-nextjs-i18n` (explicit locale: no root params here) 🌐
import { getAbTranslations, setAbRequestLocale } from 'ab-nextjs-i18n/server';

// import abElements' i18n config (locales, default locale...) 🌍
import abI18nConfig, { type AppLocale } from '@/i18n/config';
// import the shared (server) docs shell frame 🧭
import DocsShellFrame from '@/components/app/docs-shell/frame';
// import the 404 body 🤷🏽‍♂️
import NotFoundView from '@/components/app/not-found';
// import abElements' root static metadata & viewport (manifest, icons, colors) 📱
import { StaticMetadata } from './metadata';
import { StaticViewport } from './viewport';

// import the global styles 🎨
import './globals.css';


// 📨 the header next-intl's proxy sets on every request it handles (the resolved locale)
const LOCALE_HEADER = 'x-next-intl-locale';


/**
 * `getNotFoundLocale` - the locale of this 404, ALWAYS one of ours, pinned for next-intl 🌍
 *
 * @returns { Promise<AppLocale> }
 */
async function getNotFoundLocale(): Promise<AppLocale> {
  // 📨 the proxy's stamp (missing for URLs the proxy skips, e.g. `/foo.bar`)
  const stamped = (await headers()).get(LOCALE_HEADER);
  // 🛂 ours ? keep it : the default locale (en)
  const locale: AppLocale = isAbLocale(abI18nConfig, stamped) ? stamped : abI18nConfig.defaultLocale;
  // 📌 pin it: there are no root params here, so every next-intl call of this render uses it
  setAbRequestLocale(locale);
  // ✅
  return locale;
}


// the 404's own (localized) metadata, never indexed 🔎🙈
export async function generateMetadata(): Promise<Metadata> {
  // 🌍 the 404's locale
  const locale = await getNotFoundLocale();
  // get the `Metadata` messages of that locale 🌐
  const t = await getAbTranslations({ locale, namespace: 'Metadata' });
  // return the static metadata + "Page introuvable | abElements" + the description
  return {
    ...StaticMetadata,
    /* App Title */
    title: t('titleTemplate').replace('%s', t('notFoundTitle')),
    /* App Description */
    description: t('description'),
    /* Robots */
    robots: { index: false, follow: true },
  };
}

// export the static viewport (theme colors) 📱
export const viewport = StaticViewport;


// 🌗 the packaged no-flash theme script, the same as the locale layout's (`system` by default)
const themeScript: string = getAbThemeScript({ defaultTheme: 'system' });


/**
 * `GlobalNotFound` - Page 🌐🤷🏽‍♂️
 *
 * @returns { Promise<ReactElement> }
 */
export default async function GlobalNotFound(): Promise<ReactElement> {
  // 🌍 the 404's locale (pinned for next-intl)
  const locale = await getNotFoundLocale();
  // 💬 that locale's messages, for the client islands & the shell
  const messages = (await import(`@/messages/${locale}.json`)).default;

  // return the 404 page (with its own html & body) inside the shell 🧭
  return (
    <html lang={locale} suppressHydrationWarning>
      {/* Head - with the (no flash ⚡️) theme script */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* Body - with the Inter font & the i18n provider of this locale */}
      <body className={interStyles.regular}>
        <AbI18nProvider config={abI18nConfig} locale={locale} messages={messages}>
          <DocsShellFrame locale={locale}>
            <NotFoundView locale={locale} />
          </DocsShellFrame>
        </AbI18nProvider>
      </body>
    </html>
  );
}
