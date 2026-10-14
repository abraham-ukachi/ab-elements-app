/* 
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
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
* @file: app/[locale]/page.tsx
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


// NEXT types
import type { Metadata } from 'next';
// import the `Image` & `Link` components from `next` (as `NextLink`, since `Link` is the locale-aware one 😉)
import Image from 'next/image';
import NextLink from 'next/link';
// import `notFound` to throw a 404 for unknown locales
import { notFound } from 'next/navigation';

// import the locale guard from `ab-nextjs-i18n`
import { isAbLocale } from 'ab-nextjs-i18n/config';
// import the hreflang alternates & server-side translations helpers from `ab-nextjs-i18n`
import { getAbAlternates, getAbTranslations } from 'ab-nextjs-i18n/server';

// import abElements' i18n config (locales, default locale...)
import abI18nConfig from '@/i18n/config';
// import abElements' public URL (for the canonical & hreflang URLs)
import { APP_URL } from '@/app/metadata';


// create the props type of the home page as `HomeProps` (Next.js 16 hands us the `params` as a Promise)
type HomeProps = Readonly<{ params: Promise<{ locale: string }> }>;


/**
 * `generateMetadata` - Home Page Metadata 🔎
 *
 * Gives the home page the canonical URL of this locale
 * + hreflang alternates for every locale (and x-default).
 *
 * @param { HomeProps } props - the page props (with the `locale` param)
 * @returns { Promise<Metadata> }
 */
export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  // get the current `locale` from the params
  const { locale } = await params;
  // unknown locale ? throw a 404 🚫
  if (!isAbLocale(abI18nConfig, locale)) notFound();

  // return the localized alternates of `/` as the page's metadata
  return {
    alternates: getAbAlternates(abI18nConfig, '/', { locale, baseUrl: APP_URL }),
  };
}


// the class names shared by every framework link (Next.js, React, Vue, Lit & Flutter) 🔗
const frameworkLinkClass =
  'hover:text-(--md-sys-color-primary) hover:underline decoration-dashed underline-offset-4';


/**
 * `Home` - Page 🏠
 *
 * abElements' (localized) "Coming Soon" home page.
 *
 * @returns { Promise<ReactElement> }
 */
export default async function Home() {
  // get the translations of the `Common` messages of the current locale 🌐
  const t = await getAbTranslations('Common');
  // get the current year (for the copyright)
  const year = new Date().getFullYear();

  // return the home page
  return (
    <main className="flex flex-col relative w-full h-dvh items-center justify-center box-border p-6 select-none">

      {/* Container */}
      <div className="Container relative flex flex-col size-full grow overflow-auto items-left lg:items-center justify-center rounded-lg lg:rounded-xl lg:bg-(--md-sys-color-surface-container-low) p-0 lg:p-24">

        {/* abElements GitHub repo - Link */}
        <NextLink
          className="flex w-fit hover:no-underline"
          href="https://github.com/abraham-ukachi/ab-elements-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* Ab Elements - SVG */}
          <Image
            src="/ab-elements.svg"
            alt={t('logoAlt')}
            className="dark:invert w-[110px] h-[24px] lg:w-[220px] lg:h-[48px]"
            width={439}
            height={96}
            priority
          />
        </NextLink>

        {/* Coming Soon - Title */}
        <h1 className="text-4xl text-(--md-sys-color-primary) font-inter-bold my-2 animate-pulse hover:animate-none lg:text-7xl lg:uppercase lg:my-4">
          {t('comingSoon')}
        </h1>

        {/* Description */}
        <p className="text-base lg:text-xl lg:max-w-xl lg:text-center">
          {/* Tagline - with the framework links */}
          <span>
            {/* "A lightweight library of **100%** free ... for your" */}
            {t.rich('taglineBefore', {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}{' '}
            {/* Next.js - Link */}
            `<NextLink
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className={frameworkLinkClass}
            >
              {t('next')}
            </NextLink>`,
            {' '}
            {/* React - Link */}
            `<NextLink
              href="https://react.dev/learn"
              target="_blank"
              rel="noopener noreferrer"
              className={frameworkLinkClass}
            >
              {t('react')}
            </NextLink>`,
            {' '}
            {/* Vue - Link */}
            `<NextLink
              href="https://vuejs.org/guide/introduction.html"
              target="_blank"
              rel="noopener noreferrer"
              className={frameworkLinkClass}
            >
              {t('vue')}
            </NextLink>`,
            {' '}
            {/* Lit - Link */}
            `<NextLink
              href="https://lit.dev/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className={frameworkLinkClass}
            >
              {t('lit')}
            </NextLink>`,
            {' '}
            {/* "and" */}
            {t('and')}
            {' '}
            {/* Flutter - Link */}
            `<NextLink
              href="https://docs.flutter.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className={frameworkLinkClass}
            >
              {t('flutter')}
            </NextLink>`
            {/* "projects" */}
            {t('taglineAfter')}
          </span>
          {/* "created with ❤️ by" */}
          <span> {t('createdBy')} </span>
          {/* Author */}
          <span>
            {/* Abraham Ukachi's GitHub - Link */}
            <NextLink
              href="https://github.com/abraham-ukachi"
              target="_blank"
              rel="noopener noreferrer"
              className="group/author font-medium text-(--md-sys-color-primary)/80 hover:text-(--md-sys-color-primary) hover:underline decoration-dashed underline-offset-4 relative"
            >
              {t('authorName')}
              {/* Author's (spinning 😜) profile pic - shown on hover */}
              <Image
                src="/me.jpg"
                alt={t('authorAlt')}
                className="group-hover/author:block hidden absolute -right-6 top-1 lg:-right-9 lg:top-0 rounded-full outline outline-4 outline-(--md-sys-color-primary) animate-spin size-4 lg:size-6"
                width={24}
                height={24}
                priority
              />
            </NextLink>
            {'.'}
          </span>
        </p>

        {/* Footer */}
        <footer className="absolute bottom-0 place-self-center flex flex-col items-center justify-center w-full h-auto">
          {/* GitHub logo - Link (bouncing 🏀) */}
          <NextLink
            href="https://github.com/abraham-ukachi/ab-elements-app"
            target="_blank"
            rel="noopener noreferrer"
            className="my-4 opacity-20 transition-opacity hover:opacity-80 dark:invert animate-bounce hover:animate-none"
          >
            {/* GitHub - SVG */}
            <Image
              src="/github-logo.svg"
              alt={t('githubAlt')}
              className="size-8 lg:size-12"
              width={48}
              height={48}
              priority
            />
          </NextLink>
        </footer>
      </div>

      {/* Copyright ©️ */}
      <p className="text-xs lg:text-sm opacity-50 mt-2 lg:mt-4">{t('copyright', { year })}</p>
    </main>
  );
}
