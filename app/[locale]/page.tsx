import Image from 'next/image';
import NextLink from 'next/link';

import { getAbTranslations } from 'ab-nextjs-i18n/server';


const frameworkLinkClass =
  'hover:text-(--md-sys-color-primary) hover:underline decoration-dashed underline-offset-4';


export default async function Home() {
  const t = await getAbTranslations('Common');
  const year = new Date().getFullYear();

  return (
    <main className="flex flex-col relative w-full h-dvh items-center justify-center box-border p-6 select-none">

      {/* Container */}
      <div className="Container relative flex flex-col size-full grow overflow-auto items-left lg:items-center justify-center rounded-lg lg:rounded-xl lg:bg-(--md-sys-color-surface-container-low) p-0 lg:p-24">

        <NextLink
          className="flex w-fit hover:no-underline"
          href="https://github.com/abraham-ukachi/ab-elements-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/ab-elements.svg"
            alt={t('logoAlt')}
            className="dark:invert w-[110px] h-[24px] lg:w-[220px] lg:h-[48px]"
            width={439}
            height={96}
            priority
          />
        </NextLink>

        <h1 className="text-4xl text-(--md-sys-color-primary) font-inter-bold my-2 animate-pulse hover:animate-none lg:text-7xl lg:uppercase lg:my-4">
          {t('comingSoon')}
        </h1>

        <p className="text-base lg:text-xl lg:max-w-xl lg:text-center">
          <span>
            {t.rich('taglineBefore', {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}{' '}
            `<NextLink
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className={frameworkLinkClass}
            >
              {t('next')}
            </NextLink>`,
            {' '}
            `<NextLink
              href="https://react.dev/learn"
              target="_blank"
              rel="noopener noreferrer"
              className={frameworkLinkClass}
            >
              {t('react')}
            </NextLink>`,
            {' '}
            `<NextLink
              href="https://vuejs.org/guide/introduction.html"
              target="_blank"
              rel="noopener noreferrer"
              className={frameworkLinkClass}
            >
              {t('vue')}
            </NextLink>`,
            {' '}
            `<NextLink
              href="https://lit.dev/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className={frameworkLinkClass}
            >
              {t('lit')}
            </NextLink>`,
            {' '}
            {t('and')}
            {' '}
            `<NextLink
              href="https://docs.flutter.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className={frameworkLinkClass}
            >
              {t('flutter')}
            </NextLink>`
            {t('taglineAfter')}
          </span>
          <span> {t('createdBy')} </span>
          <span>
            <NextLink
              href="https://github.com/abraham-ukachi"
              target="_blank"
              rel="noopener noreferrer"
              className="group/author font-medium text-(--md-sys-color-primary)/80 hover:text-(--md-sys-color-primary) hover:underline decoration-dashed underline-offset-4 relative"
            >
              {t('authorName')}
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

        <footer className="absolute bottom-0 place-self-center flex flex-col items-center justify-center w-full h-auto">
          <NextLink
            href="https://github.com/abraham-ukachi/ab-elements-app"
            target="_blank"
            rel="noopener noreferrer"
            className="my-4 opacity-20 transition-opacity hover:opacity-80 dark:invert animate-bounce hover:animate-none"
          >
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

      <p className="text-xs lg:text-sm opacity-50 mt-2 lg:mt-4">{t('copyright', { year })}</p>
    </main>
  );
}
