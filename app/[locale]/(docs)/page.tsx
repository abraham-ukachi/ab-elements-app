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


// 🏠 Home (0.2.23 + fidelity pass 1): hero (copy · install), the 8 package cards, then Guides + What's new side by side,
// inside the packaged shell panes. Sizes / spacing follow `home-fidelity-spec.md` §2–§4 (John, approved by God 20:10).
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
// import the repo URL (Edit this page / Changelog) 🐙
import { GITHUB_URL } from '@/lib/nav';


// create the props type of the home page as `HomeProps` (Next.js 16 hands us the `params` as a Promise)
type HomeProps = Readonly<{ params: Promise<{ locale: string }> }>;

// 📚 the 4 guide rows (no pages yet, D26: plain cards without links) + their icons (spec §4)
const GUIDES = [
  { id: 'install', icon: 'rocket_launch' },
  { id: 'theming', icon: 'palette' },
  { id: 'iconsFonts', icon: 'match_case' },
  { id: 'pwaShell', icon: 'dashboard_customize' },
] as const;

// 🆕 What's new: real entries from the published changelogs (core 0.1.6, hooks 0.1.7, components 0.1.13) 📰
const WHATS_NEW = [
  { id: 'core', kind: 'new' },
  { id: 'hooks', kind: 'new' },
  { id: 'components', kind: 'new' },
] as const;

// 🔠 the shared title look (spec §2): Mulish via the theme's `--ab-font-title`, heavy & tight
const TITLE = 'font-(family-name:--ab-font-title) font-[750] tracking-[-0.032em]';
// 🔠 a section header's h2 (18 / 700 / −0.015em)
const H2 = 'font-(family-name:--ab-font-title) text-[18px] font-bold tracking-[-0.015em]';


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
        {/* 📏 pane padding per breakpoint (spec §3): 18×16 mobile · 30×36 tablet · 34×48 laptop · 44 / max 1060 desktop */}
        <div className="@container px-4 pt-[18px] pb-8 md:px-9 md:py-[30px] min-[1180px]:px-12 min-[1180px]:py-[34px] min-[1920px]:px-0 min-[1920px]:py-11">
          <div className="mx-auto flex max-w-[1060px] flex-col gap-6 md:gap-[30px] min-[1180px]:gap-[34px] min-[1920px]:gap-10">

            {/* 1️⃣ Overview: copy left, install right from ~680px of content (stacked below), no hero art (Decision 5) */}
            <section
              id="overview"
              aria-labelledby="overview-title"
              className="grid grid-cols-1 items-center gap-[14px] @min-[680px]:grid-cols-[minmax(0,1fr)_300px] @min-[680px]:gap-7 @min-[820px]:grid-cols-[minmax(0,1fr)_340px] @min-[820px]:gap-10 @min-[1000px]:grid-cols-[minmax(0,1fr)_380px]"
            >
              <div className="flex min-w-0 flex-col items-start">
                <AbChip dot>{t('pill')}</AbChip>
                {/* 🔠 h1: 29 mobile · 34 tablet · 38 laptop · 44 desktop, 750, no italics (spec §2) */}
                <h1
                  id="overview-title"
                  className={`${TITLE} mt-3 max-w-[560px] text-[29px] leading-[1.13] md:mt-[14px] md:text-[34px] md:leading-[1.12] min-[1180px]:text-[38px] min-[1920px]:max-w-[620px] min-[1920px]:text-[44px]`}
                >
                  {t('title')}
                </h1>
                {/* 📝 lede: 14.5 / 15.5 / 16.5, muted */}
                <p className="mt-[10px] max-w-[520px] text-[14.5px] leading-[1.55] text-(--md-sys-color-on-surface-variant) md:mt-3 md:text-[15.5px] min-[1920px]:max-w-[560px] min-[1920px]:text-[16.5px]">
                  {t('lead')}
                </p>
                {/* 🔘 CTAs: side by side (halves on mobile), Get started with its arrow */}
                <div className="mt-4 flex w-full gap-[10px] md:mt-[22px] md:w-auto [&>*]:flex-1 md:[&>*]:flex-none">
                  {/* D26 (a): Get started → #install until the Docs exist */}
                  <AbButton type="filled" label={t('cta.getStarted')} href="#install" endIcon={<AbIcon name="arrow_forward" size={18} />} />
                  <AbButton type="outlined" label={t('cta.browse')} href="#packages" />
                </div>
              </div>

              {/* 2️⃣ Install (the TOC's "Install" target) */}
              <div id="install" className="min-w-0 scroll-mt-4 @min-[680px]:pt-10" aria-label={t('toc.install')} role="region">
                <AbInstallSnippet
                  pkg="ab-nextjs-core"
                  storageKey={AB_PM_STORAGE_KEY}
                  labels={{ group: tw('install.label', { pkg: 'ab-nextjs-core' }), copy: tw('install.copy'), copied: tw('install.copied') }}
                />
              </div>
            </section>

            {/* 3️⃣ Packages: 2 cols (gap 10) on phones, 4 cols (gap 12) from tablet; the 8 cards fill two rows (no "All packages", Decision 1) */}
            <section id="packages" aria-labelledby="packages-title" className="flex flex-col gap-[10px] md:gap-[14px]">
              <div className="flex items-center gap-2">
                <h2 id="packages-title" className={H2}>{t('packages.title')}</h2>
                <AbChip>{t('packages.count', { count: packages.length })}</AbChip>
              </div>
              <ul className="grid grid-cols-2 gap-[10px] @min-[560px]:grid-cols-4 @min-[560px]:gap-3">
                {packages.map((pkg) => (
                  // 🔗 the sidebar's package rows jump here (`/#package-<id>`)
                  <li key={pkg.id} id={`package-${pkg.id}`} className="min-w-0">
                    <AbPackageCard
                      name={pkg.name}
                      href={`https://www.npmjs.com/package/${pkg.name}`}
                      version={pkg.version}
                      description={t(`packages.${pkg.id as AbPackageId}.desc`)}
                      icon={<AbIcon name={PACKAGE_ICONS[pkg.id]} size={18} />}
                      badge={pkg.beta ? t('packages.beta') : undefined}
                      headingLevel={3}
                    />
                  </li>
                ))}
              </ul>
            </section>

            {/* 4️⃣ Guides + 5️⃣ What's new: side by side (2 × 1fr, gap 24) from ~760px of content, stacked below */}
            <div className="grid grid-cols-1 gap-6 @min-[760px]:grid-cols-2">
              <section id="guides" aria-labelledby="guides-title" className="flex min-w-0 flex-col gap-[10px] md:gap-[14px]">
                <h2 id="guides-title" className={H2}>{t('guides.title')}</h2>
                <ul className="flex flex-col gap-2">
                  {GUIDES.map(({ id, icon }) => (
                    // ⚓ the sidebar's Guides rows jump here (`/#guide-<id>`)
                    <li key={id} id={`guide-${id}`}>
                      <AbCard as="div" media={<AbIcon name={icon} size={18} />} title={t(`guides.items.${id}.title`)} description={t(`guides.items.${id}.tag`)} />
                    </li>
                  ))}
                </ul>
              </section>

              <section id="whats-new" aria-labelledby="whats-new-title" className="flex min-w-0 flex-col gap-[10px] md:gap-[14px]">
                <h2 id="whats-new-title" className={H2}>{t('whatsNew.title')}</h2>
                <ul className="flex flex-col gap-2">
                  {WHATS_NEW.map(({ id, kind }) => (
                    <li key={id}>
                      {/* 📰 eyebrow = New / Improved, meta = the package (mono) · the month */}
                      <AbCard
                        as="div"
                        eyebrow={t(`whatsNew.kind.${kind}`)}
                        title={t(`whatsNew.items.${id}.title`)}
                        footer={<span><code>{`ab-nextjs-${id}`}</code> · {t(`whatsNew.items.${id}.date`)}</span>}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
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
          { id: 'whats-new', label: t('toc.whatsNew') },
        ]}
        links={{
          // ✏️ "Edit this page" → this file on GitHub; ↗ "Changelog" → the repo's releases
          edit: { href: `${GITHUB_URL}/blob/main/app/%5Blocale%5D/(docs)/page.tsx`, label: ts('aside.editPage') },
          changelog: { href: `${GITHUB_URL}/releases`, label: ts('aside.changelog') },
        }}
        promo={{ kind: t('whatsNew.kind.new'), title: t('whatsNew.promo'), body: t('whatsNew.asideLabel', { pkg: 'ab-nextjs-components' }) }}
      />
    </>
  );
}
