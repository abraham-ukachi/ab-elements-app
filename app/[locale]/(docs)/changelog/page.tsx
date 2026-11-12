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
* @name: changelog page
* @file: app/[locale]/(docs)/changelog/page.tsx
* @type: page
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> GET /changelog · /fr/changelog
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📜 The changelog (0.2.29): one page per locale, built from the app CHANGELOG.md and each installed
//    package's CHANGELOG.md. Plain markdown, not MDX. The outline is the docs template's aside (scroll spy on main).
//    es / fr / ru show the English notes plus the "not translated yet" banner. Full translations are deferred 🏳️.

// NEXT types
import type { Metadata } from 'next';
// REACT types
import type { ReactElement } from 'react';
// import `notFound` for an unknown locale 🚫
import { notFound } from 'next/navigation';

// import the server main pane 🧱
import AbMainLayout from 'ab-nextjs-core/server/ab-main-layout';
// import the packaged banner 🏳️
import AbInfo from 'ab-nextjs-components/ab-info';
// import the locale guard & the alternates helper 🌐
import { isAbLocale, localizeAbPathname } from 'ab-nextjs-i18n/config';
import { getAbAlternates, getAbTranslations } from 'ab-nextjs-i18n/server';

// import the i18n config & the public URL 🌍
import abI18nConfig from '@/i18n/config';
import { APP_URL } from '@/app/metadata';
// import the repo URL (Edit / Source) 🐙
import { GITHUB_URL } from '@/lib/nav';
// import the issue URL helper 🐛
import { docsReportUrl } from '@/lib/docs';
// import the parsed changelogs and the build gate 📜
import { assertChangelogGateDuringBuild, changelogToc, loadChangelogs } from '@/lib/changelog';
// import the plain-markdown renderer (no raw HTML) 🧱
import { ChangelogMarkdown } from '@/components/app/changelog-md';
// import the outline pane & the tablet bar 📑
import HomeAside from '@/components/app/home-aside';
import { DocsMainBar } from '@/components/app/docs-shell';


// 🏗️ fail `next build` when an installed package version has no released entry (unless AB_CHANGELOG_GATE=warn)
assertChangelogGateDuringBuild();

// 🧾 the page props (Next.js 16: params is a Promise)
type ChangelogPageProps = Readonly<{ params: Promise<{ locale: string }> }>;

// 🔠 the same title look as a docs page
const TITLE = 'font-(family-name:--ab-font-title) font-extrabold tracking-[-0.03em] text-(--ab-color-text)';

// 📚 read once per process (the files do not change during a build)
const CHANGELOGS = loadChangelogs();
// 📑 the outline: one h2 per package, one h3 per version
const TOC = changelogToc(CHANGELOGS);


/**
 * `generateMetadata` - title, lede & hreflang 🔎
 *
 * @param { ChangelogPageProps } props
 * @returns { Promise<Metadata> }
 */
export async function generateMetadata({ params }: ChangelogPageProps): Promise<Metadata> {
  // 🌍 the locale
  const { locale } = await params;
  // 🚫 unknown locale
  if (!isAbLocale(abI18nConfig, locale)) notFound();
  // 🌐 the chrome strings
  const shell = await getAbTranslations({ locale, namespace: 'Shell' });
  const docs = await getAbTranslations({ locale, namespace: 'Docs' });
  const copy = await getAbTranslations({ locale, namespace: 'Changelog' });
  // 🔎 the localized metadata (the suffix is the docs one, so the tab reads like the other pages)
  return {
    title: { absolute: `${shell('nav.changelog')} · ${docs('metaSuffix')}` },
    description: copy('lede'),
    alternates: getAbAlternates(abI18nConfig, '/changelog', { locale, baseUrl: APP_URL }),
  };
}


/**
 * `ChangelogPage` - Page 📜
 *
 * @param { ChangelogPageProps } props
 * @returns { Promise<ReactElement> }
 */
export default async function ChangelogPage({ params }: ChangelogPageProps): Promise<ReactElement> {
  // 🌍 the locale
  const { locale } = await params;
  // 🚫 unknown locale, before next-intl reads the request
  if (!isAbLocale(abI18nConfig, locale)) notFound();
  // 🌐 chrome, the English-fallback banner, and the code-block labels
  const shell = await getAbTranslations({ locale, namespace: 'Shell' });
  const docs = await getAbTranslations({ locale, namespace: 'Docs' });
  const copy = await getAbTranslations({ locale, namespace: 'Changelog' });
  // 🏳️ the notes themselves are English (package changelogs). Other locales get the banner.
  const isFallback = locale !== abI18nConfig.defaultLocale;
  // 🔗 the public URL of this locale's page
  const pageUrl = `${APP_URL}${localizeAbPathname('/changelog', locale, abI18nConfig)}`;
  // 🐙 Edit / Report / Source point at the app changelog (the file this repo owns)
  const asideLinks = [
    { id: 'edit', href: `${GITHUB_URL}/edit/main/CHANGELOG.md`, label: shell('aside.editPage'), icon: 'github' },
    { id: 'report', href: docsReportUrl({ title: shell('nav.changelog'), url: pageUrl, file: 'CHANGELOG.md' }), label: shell('aside.reportIssue'), icon: 'bug_report' },
    { id: 'source', href: `${GITHUB_URL}/blob/main/CHANGELOG.md`, label: shell('aside.viewSource'), icon: 'code' },
  ];
  // 💻 the copy button's words
  const labels = { copy: docs('copyCode'), copied: docs('copied') };

  // 🧱 main + aside, the same pair as a docs page
  return (
    <>
      {/* 🧱 the main pane (`id="main"` is the skip link's target ♿) */}
      <AbMainLayout
        id="main"
        orientation="vertical"
        pageName="changelog"
        mainHeader={<DocsMainBar crumbs={[{ label: shell('sidebar.home'), href: '/' }, { label: shell('nav.changelog') }]} />}
      >
        {/* 📏 the same pane padding as a docs page */}
        <div className="@container px-4 pt-[18px] pb-[110px] min-[768px]:px-9 min-[768px]:py-[30px] min-[1180px]:px-12 min-[1180px]:py-[34px] min-[1920px]:px-0 min-[1920px]:py-11">
          <article className="mx-auto flex max-w-[760px] flex-col gap-5" data-changelog-page="" lang={locale}>
            {/* 🏳️ the notes are not translated */}
            {isFallback ? <AbInfo icon="translate" title={docs('fallback.title')} message={docs('fallback.message')} /> : null}
            <header className="flex flex-col gap-2">
              {/* 🔠 the one h1 */}
              <h1 className={`${TITLE} m-0 text-[29px] leading-[1.13] min-[768px]:text-[34px] min-[1180px]:text-[38px]`}>{shell('nav.changelog')}</h1>
              {/* 📝 the lede */}
              <p className="m-0 text-[15.5px] leading-[1.55] text-(--ab-color-muted)">{copy('lede')}</p>
            </header>
            {/* 📜 the notes, in English, as elements (no raw HTML) */}
            <div data-changelog-body="" lang="en" className="ab-prose">
              {CHANGELOGS.map((doc) => (
                <section key={doc.id}>
                  {/* 📦 the package. The id is the outline anchor (`#components`). */}
                  <h2 id={doc.id}>{doc.title}</h2>
                  <p><code>{doc.name}</code> {doc.installedVersion}</p>
                  {doc.entries.map((entry) => (
                    <section key={entry.anchor}>
                      {/* ⚓ `#components-0.7.0` */}
                      <h3 id={entry.anchor}>
                        {entry.version ?? 'Unreleased'}
                        {entry.date ? ` (${entry.date})` : ''}
                      </h3>
                      {/* 🔗 the compare link, when the heading had one (https only; the parser already checked) */}
                      {entry.compareUrl ? <p><a href={entry.compareUrl} target="_blank" rel="noopener">{copy('compare')}</a></p> : null}
                      <ChangelogMarkdown markdown={entry.body} labels={labels} />
                    </section>
                  ))}
                </section>
              ))}
            </div>
          </article>
        </div>
      </AbMainLayout>

      {/* 📑 On this page, same scroll spy as the docs template */}
      <HomeAside pageName="changelog" title={shell('aside.onThisPage')} items={TOC} links={asideLinks} />
    </>
  );
}
