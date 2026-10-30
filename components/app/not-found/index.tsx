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

// 🤷🏽‍♂️ The 404 page body (0.2.22, mocks 44–47), rendered INSIDE the docs shell by both 404 entry points:
// `app/[locale]/not-found.tsx` (unknown paths + `notFound()`) and `app/global-not-found.tsx` (English fallback).
// Composition only 🧩: AbMainLayout + AbAsideLayout (core), AbErrorHero / AbButton / AbList / AbCard / AbToc /
// server AbIcon (components). AbButton, AbCard, AbListItem & AbToc all read AbLinkProvider, so every href here is
// written once (`/docs`…) and the provider adds `/fr`, `/es`… 🌍. The page never scrolls: the main pane does 📜.

// REACT types
import type { ReactElement } from 'react';

// import the server main pane & the (client) aside pane from `ab-nextjs-core` 🧱
// (the client aside reads the shell's AbPageProvider, which opens it at ≥ 1180px; the server one stays closed 📑)
import AbMainLayout from 'ab-nextjs-core/server/ab-main-layout';
import AbAsideLayout from 'ab-nextjs-core/ab-aside-layout';
// import the packaged UI from `ab-nextjs-components` 🧩
import AbErrorHero from 'ab-nextjs-components/ab-error-hero';
import AbButton from 'ab-nextjs-components/ab-button';
import AbCard from 'ab-nextjs-components/ab-card';
import AbToc from 'ab-nextjs-components/ab-toc';
import { AbList, AbListItem } from 'ab-nextjs-components/ab-list';
import { AbLink } from 'ab-nextjs-components/ab-link';
// import the server AbIcon (full icon map, no JS shipped) 🔣
import AbIcon from 'ab-nextjs-components/server/ab-icon';
// import the server-safe icon registrar (a client leaf that fills the CLIENT AbIcon registry during render) 🗂️
import { AbIconRegistrar } from 'ab-nextjs-components/ab-icon/registrar';
// import the link_off svg data (AbErrorHero's default badge glyph, ab-nextjs-icons 0.2.6) 🔗🚫
import link_off from 'ab-nextjs-icons/ab-icons/icons/link_off';
// import the server-side translations helper from `ab-nextjs-i18n` 🌐
import { getAbTranslations } from 'ab-nextjs-i18n/server';
// import `notFound` (an unknown locale never reaches next-intl) 🚫
import { notFound } from 'next/navigation';
// import the locale guard from `ab-nextjs-i18n` 🛂
import { isAbLocale } from 'ab-nextjs-i18n/config';
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


// 🏷️ the small caps section label ("SUGGESTED"), mock `.sg-h`
const EYEBROW = 'm-0 text-[11px] leading-none font-bold uppercase tracking-[0.06em] text-(--ab-color-faint)';
// ⠿ the hero's dot grid, a touch fainter than the package default (mock `.e-grid` reads lighter) 🌫️
const FAINT_DOTS = '[&_[data-ab-part=error-grid]]:opacity-55';


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
  // 🌐 the 404 strings
  const t = await getAbTranslations({ locale, namespace: 'NotFound' });

  // return the main pane (+ the Popular pages aside, laptop+)
  return (
    <>
      <AbMainLayout
        id="main"
        orientation="vertical"
        pageName="not-found"
        // 📟 the tablet bar's crumb ("Page not found") · 📱 the mobile header gets the mock's search pill + theme 🔎🌗
        mainHeader={<DocsMainBar crumbs={[{ label: t('crumb') }]} asideToggle={false} mobileSearch />}
      >
        {/* 📏 pane padding per breakpoint (Home spec §3): 18×16 (110 bottom, over the nav) · 30×36 · 34×48 · 44 */}
        <div className="@container px-4 pt-[18px] pb-[110px] min-[768px]:px-9 min-[768px]:py-[30px] min-[1180px]:px-12 min-[1180px]:py-[34px] min-[1920px]:py-11">
          {/* 🎯 one centred column: the hero's copy & actions, the Suggested row may go wider (mock 46–47) */}
          <div className="mx-auto flex max-w-[760px] flex-col items-center">
            {/* 🗂️ register link_off BEFORE the hero renders (same set on the server & at hydration: no Material font fallback, no dev warning) */}
            <AbIconRegistrar icons={{ link_off }} />
            {/* 🦸 the packaged hero: gradient "404" + the link_off tile, the one h1 ♿, the lede, the hint & the actions */}
            <AbErrorHero
              className={FAINT_DOTS}
              code={t('code')}
              // 🟫 no `badge` prop: AbErrorHero's default is the (client) link_off AbIcon, registered just above ⬆️
              title={t('title')}
              message={t('lede')}
              // 💡 "Did you mean …?" (client island, only when a route is close) — on every width now 📱💻
              hint={<NotFoundDidYouMean />}
              actions={
                <div className="flex w-full max-w-[440px] flex-col items-stretch gap-3">
                  {/* 🔎 the big field (AbSearchTrigger size="lg") opens the search drawer */}
                  <NotFoundSearch label={t('search')} />
                  {/* 🔘 the two actions: stacked full width on mobile (fr / es labels never wrap 🌍; `!` beats the unlayered button CSS), side by side from 768 */}
                  <div className="flex flex-col gap-3 min-[768px]:flex-row min-[768px]:justify-center [&>*]:whitespace-nowrap max-[767px]:[&>*]:w-full! max-[767px]:[&>*]:justify-center!">
                    {/* ⬅️ Back to home (the bronze, filled one) */}
                    <AbButton type="filled" shape="rounded" size="md" color="bronze" label={t('backHome')} href="/" startIcon={<AbIcon name="arrow_back" size={18} />} />
                    {/* 📖 Browse docs (Home's packages grid until the docs pages exist, D26) */}
                    <AbButton type="outlined" shape="rounded" size="md" color="card" label={t('browseDocs')} href="/#packages" startIcon={<AbIcon name="menu_book" size={18} />} />
                  </div>
                </div>
              }
            >
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
                {/* 💻 the three cards: icon tile · bold title · arrow (one link each ♿) */}
                <ul className="hidden w-full list-none grid-cols-3 gap-3 p-0 text-left @min-[640px]:grid">
                  {NOT_FOUND_SUGGESTED.map(({ id, href, icon }) => (
                    <AbCard
                      key={id}
                      as="li"
                      href={href}
                      headingLevel={3}
                      iconTile={<AbIcon name={icon} size={18} />}
                      arrow
                      boldTitle
                      title={t(`suggestions.${id}.title` as Parameters<typeof t>[0])}
                      description={t(`suggestions.${id}.desc` as Parameters<typeof t>[0])}
                    />
                  ))}
                </ul>
              </section>
            </AbErrorHero>
          </div>
        </div>
      </AbMainLayout>

      {/* 🔥 Popular pages (the aside pane: laptop+ only, core hides it below 1180; no drawer on the 404) */}
      <AbAsideLayout orientation="vertical" pageName="not-found" aria-labelledby="not-found-popular-title">
        <div className="px-[22px] py-[26px]">
          {/* 🔗 AbToc's plain link list: icon · bold label · small meta, then the two GitHub links (new tab) 🐙 */}
          <AbToc
            id="not-found-popular"
            variant="links"
            title={t('popular')}
            items={NOT_FOUND_POPULAR.map(({ id, href, icon }) => ({
              id,
              href,
              icon: <AbIcon name={icon} size={16} />,
              label: t(`popularPages.${id}.title` as Parameters<typeof t>[0]),
              description: t(`popularPages.${id}.meta` as Parameters<typeof t>[0]),
            }))}
            footer={
              <>
                <AbLink href={`${GITHUB_URL}/issues/new`} target="_blank" rel="noopener"><AbIcon name="bug_report" size={15} />{t('reportLink')}</AbLink>
                <AbLink href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener"><AbIcon name="github" size={15} />{t('openIssue')}</AbLink>
              </>
            }
          />
        </div>
      </AbAsideLayout>
    </>
  );
}
