/*
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
*
* @project: ab-elements-app
* @name: Global Not Found - Page
* @file: app/global-not-found.tsx
*
* Bypasses `app/[locale]/layout.tsx` for unmatched URLs, so it brings its own
* html/body, theme script, fonts and global styles (no theme flash).
*/


import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { interStyles } from 'ab-nextjs-fonts';
import Link from 'next/link';

import { APP_DESCRIPTION } from './metadata';

import './globals.css';


export const metadata: Metadata = {
  title: 'Page not found | abElements',
  description: APP_DESCRIPTION,
};


/**
 * `themeScript` — same as the locale layout: apply light/dark before first paint.
 */
const themeScript: string = `(function () {
  try {
    var saved = localStorage.getItem('theme');
    var theme = saved === 'light' || saved === 'dark'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch (e) {}
})();`;


/**
 * Global 404 for URLs that never enter `app/[locale]` (experimental.globalNotFound).
 * English copy on purpose: there is no locale segment here.
 */
export default function GlobalNotFound(): ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={interStyles.regular}>
        <main className="flex flex-col w-full h-dvh items-center justify-center gap-4 p-6 text-center">
          <p className="font-inter-bold text-6xl lg:text-8xl text-(--md-sys-color-primary)">404</p>
          <h1 className="font-inter-medium text-xl lg:text-3xl">This page could not be found.</h1>
          <Link
            href="/"
            className="text-(--md-sys-color-primary) hover:underline decoration-dashed underline-offset-4"
          >
            Back to abElements
          </Link>
        </main>
      </body>
    </html>
  );
}
