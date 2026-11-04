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
* @name: page
* @file: app/[locale]/(docs)/docs/[[...slug]]/page.tsx
* @type: page
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> GET /docs/installation · /fr/docs/installation
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📚 The docs page template (0.2.24 → 0.2.25: + the header chips & the Edit / Report / Source links): one MDX page of `content/docs/<locale>/…` (lib/source), rendered in the packaged shell:
// the main pane (DocsMainBar crumbs · title · lede · the MDX body · prev / next) + the "On this page" pane (HomeAside:
// AbToc + scroll spy, AbTocDrawer below 1180). A page missing in fr / es / ru shows the English one + a banner 🏳️.
// 🚫 Every (locale, slug) pair is prerendered and `dynamicParams = false`, so a missing slug is an UNMATCHED URL that
//    Next.js serves from `app/global-not-found.tsx` (a real 404 with the shell, no `notFound()` blank shell, 0.2.22).

// NEXT types
import type { Metadata } from 'next';
// REACT types
import type { ReactElement } from 'react';
// import `notFound` (unknown locale / slug safety net) 🚫
import { notFound } from 'next/navigation';

// import the server main pane from `ab-nextjs-core` 🧱
import AbMainLayout from 'ab-nextjs-core/server/ab-main-layout';
// import the packaged banner (the "not translated yet" notice) & the prev / next pager from `ab-nextjs-components` 🧩
import AbInfo from 'ab-nextjs-components/ab-info';
import AbDocPager from 'ab-nextjs-components/ab-doc-pager';
// import the packaged chip (the page header's section · package · Client/Server · status, 0.2.25) 🏷️
import AbChip from 'ab-nextjs-components/ab-chip';
// import the locale guard & the server i18n helpers from `ab-nextjs-i18n` 🌐
import { isAbLocale, localizeAbPathname } from 'ab-nextjs-i18n/config';
import { getAbAlternates, getAbTranslations } from 'ab-nextjs-i18n/server';

// import abElements' i18n config & public URL 🌍
import abI18nConfig from '@/i18n/config';
import { APP_URL } from '@/app/metadata';
// import the docs source & helpers 📚
import { source } from '@/lib/source';
import { docsChips, docsContentFile, docsEditUrl, docsReportUrl, docsSourceUrl, docsNeighbours, docsUnprefixed, docsPath, docsTocItems, flattenDocsTree, type DocsTreeNode } from '@/lib/docs';
// import the MDX component map (packages only) 🗺️
import { getDocsMdxComponents } from '@/components/app/docs-mdx';
// import the "On this page" pane & the tablet main bar of the packaged shell 📑📟
import HomeAside from '@/components/app/home-aside';
import { DocsMainBar } from '@/components/app/docs-shell';


// 🧾 the page props (Next.js 16 hands the params as a Promise; `slug` is undefined on `/docs`)
type DocsPageProps = Readonly<{ params: Promise<{ locale: string; slug?: string[] }> }>;

// 🔠 the shared title look (same as Home: Mulish 800 via the theme's `--ab-font-title`)
const TITLE = 'font-(family-name:--ab-font-title) font-extrabold tracking-[-0.03em] text-(--ab-color-text)';


/**
 * `generateStaticParams` - every docs slug, for every locale 🧱
 *
 * The English tree is the full list: a page missing in another locale still exists there (the English fallback).
 *
 * @returns { { slug: string[] }[] }
 */
export function generateStaticParams(): { slug: string[] }[] {
  // 📚 the English pages' slugs (the `[locale]` segment above adds the 4 locales)
  return source.getPages(abI18nConfig.defaultLocale).map((page) => ({ slug: page.slugs }));
}

// 🚫 only the prerendered slugs match: anything else is an unmatched URL → app/global-not-found.tsx (a real 404)
export const dynamicParams = false;


/**
 * `getDocsPage` - the docs page of the params (or a 404) 🔎
 *
 * @param { Awaited<DocsPageProps['params']> } params
 * @returns the locale & the page
 */
function getDocsPage({ locale, slug = [] }: Awaited<DocsPageProps['params']>) {
  // 🛂 unknown locale → 404 (before any next-intl call, 0.2.22)
  if (!isAbLocale(abI18nConfig, locale)) notFound();
  // 📄 the page in this locale (or its English fallback)
  const page = source.getPage(slug, locale);
  // 🚫 no page (never happens with `dynamicParams = false`, kept as a safety net)
  if (!page) notFound();
  // return both 📦
  return { locale, slug, page };
}


/**
 * `generateMetadata` - the docs page's title, description & hreflang alternates 🔎
 *
 * @param { DocsPageProps } props
 * @returns { Promise<Metadata> }
 */
export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  // 📄 the page
  const { locale, slug, page } = getDocsPage(await params);
  // 🌐 the docs messages
  const t = await getAbTranslations({ locale, namespace: 'Docs' });
  // return the localized metadata (the alternates point at the same slug in every locale) 🌍
  return {
    title: { absolute: `${page.data.title} · ${t('metaSuffix')}` },
    description: page.data.description,
    alternates: getAbAlternates(abI18nConfig, docsPath(slug), { locale, baseUrl: APP_URL }),
  };
}


/**
 * `DocsPage` - Page 📚
 *
 * @param { DocsPageProps } props
 * @returns { Promise<ReactElement> }
 */
export default async function DocsPage({ params }: DocsPageProps): Promise<ReactElement> {
  // 📄 the page
  const { locale, slug, page } = getDocsPage(await params);
  // 🌐 the docs & shell messages
  const t = await getAbTranslations({ locale, namespace: 'Docs' });
  const ts = await getAbTranslations({ locale, namespace: 'Shell' });
  // 🏳️ the English fallback of an untranslated page: fumadocs keeps `page.locale` = the requested locale, so the
  //    content locale is the file's own folder (`en/quick-start.mdx`, `parser: 'dir'`)
  const { contentLocale, file } = docsContentFile(page.path, locale);
  const isFallback = contentLocale !== locale;
  // 🏷️ the header chips (0.2.25): section · package · Client/Server · status, from the slugs & the frontmatter
  const chips = docsChips(page.slugs, page.data);
  // 🔗 the TOC extras (0.2.25): Edit (GitHub editor) · Report (a prefilled issue) · Source (the raw MDX), all on the
  //    file the reader actually sees (the English one for a fallback page 🏳️)
  const pageUrl = `${APP_URL}${localizeAbPathname(docsPath(slug), locale, abI18nConfig)}`;
  const asideLinks = [
    { id: 'edit', href: docsEditUrl(contentLocale, file), label: ts('aside.editPage'), icon: 'github' },
    { id: 'report', href: docsReportUrl({ title: page.data.title, url: pageUrl, file: `content/docs/${contentLocale}/${file}` }), label: ts('aside.reportIssue'), icon: 'bug_report' },
    { id: 'source', href: docsSourceUrl(contentLocale, file), label: ts('aside.viewSource'), icon: 'code' },
  ];
  // 🧩 the compiled MDX body & its TOC
  const MDX = page.data.body;
  const toc = docsTocItems(page.data.toc);
  // ⬅️➡️ the neighbours in this locale's tree (meta.json order; their URLs lose the locale prefix below, AbCard adds it)
  const { previous, next } = docsNeighbours(flattenDocsTree(source.getPageTree(locale).children as DocsTreeNode[]), page.url);

  // return the main pane + the aside pane (direct children of the panes, G17)
  return (
    <>
      {/* 🧱 the main pane (`id="main"` = the skip link's target ♿) */}
      <AbMainLayout
        id="main"
        orientation="vertical"
        pageName="docs"
        // 🍞 "Docs › <title>": the "Docs" crumb links the docs index. Components ≥ 0.4.1 keep the trail wide
        //    enough at 768px (the search field shrinks first, ≥ 24×24 crumbs ♿) & ellipsize a long current crumb ✂️
        mainHeader={<DocsMainBar crumbs={[{ label: t('crumb'), href: '/docs' }, { label: page.data.title }]} />}
      >
        {/* 📏 the same pane padding as Home (spec §3) */}
        <div className="@container px-4 pt-[18px] pb-[110px] min-[768px]:px-9 min-[768px]:py-[30px] min-[1180px]:px-12 min-[1180px]:py-[34px] min-[1920px]:px-0 min-[1920px]:py-11">
          <article className="mx-auto flex max-w-[760px] flex-col gap-5" data-docs-page={page.slugs.join('/') || 'index'} lang={contentLocale}>
            {/* 🏳️ not translated yet: the packaged banner (no close button) */}
            {isFallback ? <AbInfo icon="translate" title={t('fallback.title')} message={t('fallback.message')} /> : null}
            <header className="flex flex-col gap-2">
              {/* 🔠 the one h1 of the page = its frontmatter title */}
              <h1 className={`${TITLE} m-0 text-[29px] leading-[1.13] min-[768px]:text-[34px] min-[1180px]:text-[38px]`}>{page.data.title}</h1>
              {/* 📝 the lede = its frontmatter description */}
              {page.data.description ? <p className="m-0 text-[15.5px] leading-[1.55] text-(--ab-color-muted)">{page.data.description}</p> : null}
              {/* 🏷️ the chips (a labelled list of packaged AbChips; a package name stays as is, the rest is translated) */}
              <ul data-docs-chips="" aria-label={t('chips.label')} className="m-0 mt-1 flex list-none flex-wrap gap-2 p-0">
                {chips.map((chip) => (
                  <AbChip key={chip.id} as="li" size="sm" tone={chip.tone} mono={chip.mono} dot={chip.dot}>
                    {chip.text ?? t(chip.key as Parameters<typeof t>[0])}
                  </AbChip>
                ))}
              </ul>
            </header>
            {/* 📄 the MDX body in the theme's `.ab-prose` typography (headings carry their ids, Shiki's code is
                pre-highlighted & wrapped in AbCodeBlock, which opts itself out with `.ab-prose-none`) */}
            <div data-docs-body="" className="ab-prose">
              <MDX components={getDocsMdxComponents({ copyLabel: t('copyCode'), copiedLabel: t('copied'), exampleLabel: t('example.label'), previewLabel: t('example.preview'), codeLabel: t('example.code') })} />
            </div>
            {/* ⬅️➡️ prev / next: the packaged AbDocPager (its URLs lose the locale prefix, AbLink adds it back 🌍) */}
            <div data-docs-pager="">
              <AbDocPager
                prev={previous ? { href: docsUnprefixed(previous.url, abI18nConfig.locales), title: previous.title } : null}
                next={next ? { href: docsUnprefixed(next.url, abI18nConfig.locales), title: next.title } : null}
                labels={{ nav: t('pager'), prev: t('previous'), next: t('next') }}
              />
            </div>
          </article>
        </div>
      </AbMainLayout>

      {/* 📑 On this page (+ Edit · Report · Source → this content file on GitHub, 0.2.25) */}
      <HomeAside
        pageName="docs"
        title={ts('aside.onThisPage')}
        items={toc}
        links={asideLinks}
      />
    </>
  );
}
