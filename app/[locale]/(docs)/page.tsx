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
* @name: abElements Home - Page
* @file: app/[locale]/(docs)/page.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> // e.g. visit `/`, `/fr`, `/es` or `/ru`
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🏠 Home (0.2.23): hero, install, the 8 package cards & the guides, inside the packaged shell panes.
// Composition only: AbMainLayout + AbAsideLayout (core), AbChip / AbButton / AbInstallSnippet / AbPackageCard / AbCard (components).

// NEXT types
import type { Metadata } from 'next';
// import `notFound` to throw a 404 for unknown locales
import { notFound } from 'next/navigation';

// import the server main pane from `ab-nextjs-core` 🧱 (core 0.1.6 publishes its scroller on
// `useAbPage().mainScrollElement` via a tiny client island, inside the shell's AbPageProvider 📜)
import AbMainLayout from 'ab-nextjs-core/server/ab-main-layout';
// import the packaged UI from `ab-nextjs-components` 🧩
import AbChip from 'ab-nextjs-components/ab-chip';
import AbButton from 'ab-nextjs-components/ab-button';
import AbInstallSnippet from 'ab-nextjs-components/ab-install-snippet';
import AbPackageCard from 'ab-nextjs-components/ab-package-card';
import AbCard from 'ab-nextjs-components/ab-card';
// import the server AbIcon (full icon map, no JS shipped) 🔣
import AbIcon from 'ab-nextjs-components/server/ab-icon';
// import the locale guard from `ab-nextjs-i18n`
import { isAbLocale } from 'ab-nextjs-i18n/config';
// import the hreflang alternates & server-side translations helpers from `ab-nextjs-i18n`
import { getAbAlternates, getAbTranslations } from 'ab-nextjs-i18n/server';

// import abElements' i18n config (locales, default locale...)
import abI18nConfig from '@/i18n/config';
// import abElements' public URL (for the canonical & hreflang URLs)
import { APP_URL } from '@/app/metadata';
// import the package data (real installed versions, D22) & their icons 📦
import { getAbPackages, type AbPackageId } from '@/lib/packages';
import { PACKAGE_ICONS } from '@/lib/shell-icons';
// import the shared package-manager key (D27) 📦
import { AB_PM_STORAGE_KEY } from '@/lib/install-pm';
// import Home's "On this page" pane 📑
import HomeAside from '@/components/app/home-aside';


// create the props type of the home page as `HomeProps` (Next.js 16 hands us the `params` as a Promise)
type HomeProps = Readonly<{ params: Promise<{ locale: string }> }>;

// 📚 the 4 guide rows (no pages yet, D26: plain cards without links)
const GUIDES = ['install', 'theming', 'iconsFonts', 'pwaShell'] as const;


/**
 * `generateMetadata` - Home Page Metadata 🔎
 *
 * @param { HomeProps } props - the page props (with the `locale` param)
 * @returns { Promise<Metadata> }
 */
export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  // get the current `locale` from the params
  const { locale } = await params;
  // unknown locale ? throw a 404 🚫
  if (!isAbLocale(abI18nConfig, locale)) notFound();
  // the Home messages 🌐
  const t = await getAbTranslations({ locale, namespace: 'Home' });

  // return the localized title, description & alternates of `/`
  return {
    title: { absolute: t('meta.title') },
    description: t('meta.description'),
    alternates: getAbAlternates(abI18nConfig, '/', { locale, baseUrl: APP_URL }),
  };
}


/**
 * `Home` - Page 🏠
 *
 * @returns { Promise<ReactElement> }
 */
export default async function Home() {
  // get the translations of the `Home` messages of the current locale 🌐
  const t = await getAbTranslations('Home');
  // the install box labels still live in `Welcome.install` 💻
  const tw = await getAbTranslations('Welcome');
  // the aside title lives in `Shell.aside` 📑
  const ts = await getAbTranslations('Shell');
  // 📦 the 8 installed packages
  const packages = getAbPackages();

  // return the main pane + the aside pane (direct children of the panes, G17)
  return (
    <>
      {/* 🧱 the main pane */}
      {/* `id="main"` = the skip link's target ♿; no mainHeader / mainBar = 0px (layout rule, core 0.1.6) 🫥 */}
      <AbMainLayout id="main" orientation="vertical" pageName="home">
        <div className="flex flex-col gap-12 p-6 lg:p-10 max-w-6xl">

          {/* 1️⃣ Overview */}
          {/* 🎨 `--em-background: transparent` (hero only): no grey box behind the title's <em> */}
          <section id="overview" aria-labelledby="overview-title" className="flex flex-col items-start gap-4 [--em-background:transparent]">
            <AbChip dot>{t('pill')}</AbChip>
            <h1 id="overview-title" className="text-4xl lg:text-6xl font-bold">{t.rich('title', { em: (chunks) => <em>{chunks}</em> })}</h1>
            <p className="text-lg max-w-2xl">{t('lead')}</p>
            <div className="flex flex-wrap gap-3">
              {/* D26 (a): Get started → #install until the Docs exist */}
              <AbButton type="filled" label={t('cta.getStarted')} href="#install" />
              <AbButton type="outlined" label={t('cta.browse')} href="#packages" />
            </div>
          </section>

          {/* 2️⃣ Install */}
          <section id="install" aria-label={t('toc.install')}>
            <AbInstallSnippet
              pkg="ab-nextjs-core"
              storageKey={AB_PM_STORAGE_KEY}
              labels={{ group: tw('install.label', { pkg: 'ab-nextjs-core' }), copy: tw('install.copy'), copied: tw('install.copied') }}
            />
          </section>

          {/* 3️⃣ Packages */}
          <section id="packages" aria-labelledby="packages-title" className="flex flex-col gap-4">
            <h2 id="packages-title" className="text-2xl font-bold flex items-center gap-2">
              {t('packages.title')} <AbChip>{t('packages.count', { count: packages.length })}</AbChip>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                // 🔗 the sidebar's package rows jump here (`/#package-<id>`)
                <li key={pkg.id} id={`package-${pkg.id}`}>
                  <AbPackageCard
                    name={pkg.name}
                    href={`https://www.npmjs.com/package/${pkg.name}`}
                    version={pkg.version}
                    description={t(`packages.${pkg.id as AbPackageId}.desc`)}
                    icon={<AbIcon name={PACKAGE_ICONS[pkg.id]} size={24} />}
                    badge={pkg.beta ? t('packages.beta') : undefined}
                    headingLevel={3}
                  />
                </li>
              ))}
              {/* ➕ All packages */}
              <li>
                <AbCard as="div" title={t('packages.all.title')} href="#packages" description={t('packages.all.body')} />
              </li>
            </ul>
          </section>

          {/* 4️⃣ Guides */}
          <section id="guides" aria-labelledby="guides-title" className="flex flex-col gap-4">
            <h2 id="guides-title" className="text-2xl font-bold">{t('guides.title')}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GUIDES.map((id) => (
                <li key={id}>
                  <AbCard as="div" eyebrow={t(`guides.items.${id}.tag`)} title={t(`guides.items.${id}.title`)} />
                </li>
              ))}
            </ul>
          </section>

          {/* 5️⃣ What's new: no entries yet (D31) → hidden, with its TOC entry (§1.4 empty state) */}
        </div>
      </AbMainLayout>

      {/* 📑 On this page */}
      <HomeAside
        title={ts('aside.onThisPage')}
        items={[
          { id: 'overview', label: t('toc.overview') },
          { id: 'install', label: t('toc.install') },
          { id: 'packages', label: t('toc.packages') },
          { id: 'guides', label: t('toc.guides') },
        ]}
      />
    </>
  );
}
