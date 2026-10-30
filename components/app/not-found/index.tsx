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
* @name: abElements 404 - View
* @file: components/app/not-found/index.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <DocsShellFrame locale={locale}><NotFoundView locale={locale} /></DocsShellFrame>
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


// 🤷🏽‍♂️ The 404 page body (0.2.22, mocks 44–47), rendered INSIDE the docs shell by both 404 entry points:
// `app/[locale]/not-found.tsx` (unknown paths + `notFound()`) and `app/global-not-found.tsx` (English fallback).
// Composition only 🧩: AbMainLayout + AbAsideLayout (core 0.2.3), AbDottedSurface (core), AbButton / AbList / AbCard /
// server AbIcon / AbLink (components 0.2.3). The theme's `@layer base` lets plain Tailwind utilities style h1 / h2 / p 🧅.
// The page never scrolls: the main pane does (layout rule) 📜.

// REACT types
import type { ReactElement } from 'react';

// import the server main pane, the (client) aside pane & the dotted canvas from `ab-nextjs-core` 🧱
// (the client aside reads the shell's AbPageProvider, which opens it at ≥ 1180px; the server one stays closed 📑)
import AbMainLayout from 'ab-nextjs-core/server/ab-main-layout';
import AbAsideLayout from 'ab-nextjs-core/ab-aside-layout';
import AbDottedSurface from 'ab-nextjs-core/ab-dotted-surface';
// import the packaged UI from `ab-nextjs-components` 🧩
import AbButton from 'ab-nextjs-components/ab-button';
import AbCard from 'ab-nextjs-components/ab-card';
import { AbList, AbListItem } from 'ab-nextjs-components/ab-list';
import { AbLink } from 'ab-nextjs-components/ab-link';
// import the server AbIcon (full icon map, no JS shipped) 🔣
import AbIcon from 'ab-nextjs-components/server/ab-icon';
// import the server-side translations helper from `ab-nextjs-i18n` 🌐
import { getAbTranslations } from 'ab-nextjs-i18n/server';
// import `notFound` (an unknown locale never reaches next-intl) 🚫
import { notFound } from 'next/navigation';
// import the locale guard & the localized pathname helper from `ab-nextjs-i18n` 🛂🌍
import { isAbLocale, localizeAbPathname } from 'ab-nextjs-i18n/config';
// import abElements' i18n config (the locales) 🌍
import abI18nConfig from '@/i18n/config';

// import the tablet / mobile main bar of the packaged shell 📟
import { DocsMainBar } from '@/components/app/docs-shell';
// import the two client islands ("Did you mean" + the search field) 🏝️
import { NotFoundDidYouMean, NotFoundSearch } from '@/components/app/not-found/islands';
// import the 404 data (Suggested + Popular pages) 💡🔥
import { NOT_FOUND_POPULAR, NOT_FOUND_SUGGESTED } from '@/lib/not-found';
// import the repo URL (Report a broken link · Open an issue) 🐙
import { GITHUB_URL } from '@/lib/nav';


// 🔠 the shared title look (Home spec §2/§8): Mulish 800 via the theme's `--ab-font-title`, tight tracking
const TITLE = 'font-(family-name:--ab-font-title) font-extrabold tracking-[-0.03em] text-(--ab-color-text)';
// 🏷️ the small caps section label ("SUGGESTED", "POPULAR PAGES"), mock `.sg-h` / `.toc-h`
const EYEBROW = 'm-0 text-[11px] leading-none font-bold uppercase tracking-[0.06em] text-(--ab-color-faint)';


// 🧾 the props of `NotFoundView`
export type NotFoundViewProps = Readonly<{
  locale: string; // 🌍 the locale to translate in (explicit: the global 404 has no root params)
}>;


/**
 * `NotFoundView` - Server Component 🤷🏽‍♂️
 *
 * @param { NotFoundViewProps } props - the `locale`
 * @returns { Promise<ReactElement> }
 */
export default async function NotFoundView({ locale }: NotFoundViewProps): Promise<ReactElement> {
  // 🛂 an unknown locale (e.g. `/foo.bar`, which the proxy never rewrites) → 404 right away: this renders in
  //    parallel with the root layout's own check, and next-intl would read the request headers (a 500 💥)
  if (!isAbLocale(abI18nConfig, locale)) notFound();
  // 🌍 the locale, narrowed by the guard above
  const lang = locale;
  // 🌐 the 404 strings
  const t = await getAbTranslations({ locale: lang, namespace: 'NotFound' });
  // 🌍 AbButton's link mode is a plain <a> (it doesn't read AbLinkProvider yet: components gap), so its hrefs are
  //    localized here (`/` → `/fr`, `/#packages` → `/fr#packages`); AbLink / AbCard / AbListItem localize themselves
  const homeHref = localizeAbPathname('/', lang, abI18nConfig);
  const docsHref = homeHref === '/' ? '/#packages' : `${homeHref}#packages`;

  // return the main pane (+ the Popular pages aside, laptop+)
  return (
    <>
      <AbMainLayout
        id="main"
        orientation="vertical"
        pageName="not-found"
        // 📟 the tablet bar's crumb ("Page not found", one crumb like Home's) · the mobile header (< 768); no outline, so no `<<` 🚫
        mainHeader={<DocsMainBar crumbs={[{ label: t('crumb') }]} asideToggle={false} />}
      >
        {/* 📏 pane padding per breakpoint (Home spec §3): 18×16 (110 bottom, over the nav) · 30×36 · 34×48 · 44 */}
        <div className="@container px-4 pt-[18px] pb-[110px] min-[768px]:px-9 min-[768px]:py-[30px] min-[1180px]:px-12 min-[1180px]:py-[34px] min-[1920px]:py-11">
          {/* 🎯 one centred column: 520px for the copy & actions, the Suggested row may go wider (mock 46–47) */}
          <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">

            {/* 1️⃣ the big "404" on the packaged dotted canvas (decorative: the h1 says it ♿) */}
            <AbDottedSurface aria-hidden="true" className="relative flex w-full max-w-[420px] justify-center py-2 [mask-image:radial-gradient(closest-side,#000_55%,transparent)]">
              {/* 🔢 the bronze gradient numeral (theme accent tokens; clipped to the glyphs) */}
              <span className={`${TITLE} block bg-linear-to-b from-(--ab-color-accent) to-(--ab-color-accent-text) bg-clip-text text-[112px] leading-[1] tracking-[-0.04em] text-transparent min-[768px]:text-[136px] min-[1180px]:text-[148px]`}>
                {t('code')}
              </span>
            </AbDottedSurface>

            {/* 2️⃣ the one h1 of the page ♿ + the lede */}
            <h1 className={`mt-4 ${TITLE} text-[28px] leading-[1.15] min-[1180px]:text-[30px]`}>{t('title')}</h1>
            <p className="mt-3 max-w-[440px] text-[15.5px] leading-[1.55] text-(--ab-color-muted)">{t('lede')}</p>

            {/* 3️⃣ "Did you mean …?" (client island: only when a route is close; tablet+ like mock 46–47, the mobile mock has none) 💡 */}
            <div className="mt-5 hidden max-w-full justify-center empty:hidden min-[768px]:flex"><NotFoundDidYouMean /></div>

            {/* 4️⃣ the search field (opens the search drawer) + the two actions 🔎 */}
            <div className="mt-6 flex w-full max-w-[520px] flex-col gap-3 min-[1180px]:max-w-[312px] min-[1180px]:mt-5">
              <NotFoundSearch label={t('search')} />
            </div>
            {/* 🔘 the actions: they share the row and grow to fill it (mock 44–45), and wrap when a locale is longer 🌍 */}
            <div className="mt-3 flex w-full max-w-[520px] flex-wrap justify-center gap-3 [&>*]:grow min-[1180px]:w-auto min-[1180px]:[&>*]:grow-0">
              {/* ⬅️ Back to home (the bronze, filled one) */}
              <AbButton type="filled" shape="rounded" size="md" color="bronze" label={t('backHome')} href={homeHref} startIcon={<AbIcon name="arrow_back" size={18} />} />
              {/* 📖 Browse docs (Home's packages grid until the docs pages exist, D26) */}
              <AbButton type="outlined" shape="rounded" size="md" color="card" label={t('browseDocs')} href={docsHref} startIcon={<AbIcon name="menu_book" size={18} />} />
            </div>

            {/* 5️⃣ Suggested: rows below 640px of content (mock 44–45), three cards from 640px (mock 46–47) 💡 */}
            <section aria-labelledby="not-found-suggested" className="mt-8 flex w-full flex-col gap-3 text-left @min-[640px]:items-center @min-[640px]:text-center">
              <h2 id="not-found-suggested" className={EYEBROW}>{t('suggested')}</h2>
              {/* 📱 the row list */}
              <div className="w-full @min-[640px]:hidden">
                <AbList label={t('suggested')}>
                  {NOT_FOUND_SUGGESTED.map(({ id, href, icon }) => (
                    <AbListItem
                      key={id}
                      href={href}
                      media={<AbIcon name={icon} size={18} />}
                      title={t(`suggestions.${id}.title` as Parameters<typeof t>[0])}
                      meta={t(`suggestions.${id}.desc` as Parameters<typeof t>[0])}
                      trailing="chevron"
                    />
                  ))}
                </AbList>
              </div>
              {/* 💻 the three cards (one link each ♿) */}
              <ul className="hidden w-full list-none grid-cols-3 gap-3 p-0 text-left @min-[640px]:grid">
                {NOT_FOUND_SUGGESTED.map(({ id, href, icon }) => (
                  <AbCard
                    key={id}
                    as="li"
                    href={href}
                    headingLevel={3}
                    media={<AbIcon name={icon} size={18} />}
                    title={t(`suggestions.${id}.title` as Parameters<typeof t>[0])}
                    description={t(`suggestions.${id}.desc` as Parameters<typeof t>[0])}
                  />
                ))}
              </ul>
            </section>
          </div>
        </div>
      </AbMainLayout>

      {/* 🔥 Popular pages (the aside pane: laptop+ only, core hides it below 1180; no drawer on the 404) */}
      <AbAsideLayout orientation="vertical" pageName="not-found" aria-labelledby="not-found-popular">
        <nav aria-labelledby="not-found-popular" className="flex h-auto flex-none flex-col justify-start gap-3 px-[22px] py-[26px]">
          <h2 id="not-found-popular" className={EYEBROW}>{t('popular')}</h2>
          {/* 🔗 icon · title · meta rows: packaged links + icons, laid out like the TOC (no card chrome in the aside) */}
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {NOT_FOUND_POPULAR.map(({ id, href, icon }) => (
              <li key={id}>
                <AbLink href={href} className="flex items-start gap-2.5 rounded-lg py-1.5 text-(--ab-color-text) no-underline">
                  {/* 🖼️ the 16px icon, aligned with the title */}
                  <span className="mt-px text-(--ab-color-accent-text)"><AbIcon name={icon} size={16} /></span>
                  {/* 🏷️ title (13 / 600) + meta (11.5, muted) */}
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[13px] leading-[1.3] font-semibold">{t(`popularPages.${id}.title` as Parameters<typeof t>[0])}</span>
                    <span className="text-[11.5px] leading-[1.3] text-(--ab-color-muted)">{t(`popularPages.${id}.meta` as Parameters<typeof t>[0])}</span>
                  </span>
                </AbLink>
              </li>
            ))}
          </ul>
          {/* ➖ the rule, then the two GitHub links (new tab) 🐙 — one block, so they stay right under the list */}
          <div className="flex flex-col gap-1 border-t border-(--ab-color-div) pt-3">
            {/* 🐙 each link sits in its own row, so the pane's flex column never stretches it */}
            <div>
              <AbLink href={`${GITHUB_URL}/issues/new`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 py-1 text-[12.5px] leading-[1.3] text-(--ab-color-muted)">
                <AbIcon name="bug_report" size={15} />{t('reportLink')}
              </AbLink>
            </div>
            <div>
              <AbLink href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 py-1 text-[12.5px] leading-[1.3] text-(--ab-color-muted)">
                <AbIcon name="github" size={15} />{t('openIssue')}
              </AbLink>
            </div>
          </div>
        </nav>
      </AbAsideLayout>
    </>
  );
}
