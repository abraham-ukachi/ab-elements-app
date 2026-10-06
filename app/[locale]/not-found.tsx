/*
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
*
* @project: ab-elements-app
* @name: Not Found - Page
* @file: app/[locale]/not-found.tsx
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// REACT types
import type { ReactElement } from 'react';
// NEXT types
import type { Metadata } from 'next';

import { getAbTranslations } from 'ab-nextjs-i18n/server';
import { Link } from '@/i18n/navigation';


// the 404 page's own metadata (uses the root title template)
export async function generateMetadata(): Promise<Metadata> {
  const t = await getAbTranslations('Metadata');
  return {
    title: t('notFoundTitle'),
  };
}


/**
 * `NotFound` / 404 - Page
 *
 * Rendered for unmatched URLs under a known locale and every `notFound()` call
 * inside `app/[locale]`.
 *
 * @returns { ReactElement }
 */
export default async function NotFoundPage(): Promise<ReactElement> {
  const t = await getAbTranslations('NotFound');

  return (
    <main className="flex flex-col w-full h-dvh items-center justify-center gap-4 p-6 text-center">

      {/* Status Code */}
      <p className="font-inter-bold text-6xl lg:text-8xl text-(--md-sys-color-primary)">{t('code')}</p>

      {/* Title */}
      <h1 className="font-inter-medium text-xl lg:text-3xl">{t('title')}</h1>

      {/* Home - Link */}
      <Link
        href="/"
        className="text-(--md-sys-color-primary) hover:underline decoration-dashed underline-offset-4">
        {t('backHome')}
      </Link>

    </main>
  );
};
