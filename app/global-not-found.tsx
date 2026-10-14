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
* @name: Global Not Found - Page
* @file: app/global-not-found.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> // served for unmatched URLs outside `app/[locale]`
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


/*
* NOTE: Bypasses `app/[locale]/layout.tsx` for unmatched URLs, so it brings its own
* html/body, theme script, fonts and global styles (no theme flash).
*/


// NEXT types
import type { Metadata } from 'next';
// REACT types
import type { ReactElement } from 'react';

// import the Inter font class names from `ab-nextjs-fonts`
import { interStyles } from 'ab-nextjs-fonts';
// import the `Link` component from `next` (no locale here, so not the locale-aware one)
import Link from 'next/link';

// import abElements' default (en) description
import { APP_DESCRIPTION } from './metadata';

// import the global styles 🎨
import './globals.css';


// the global 404's own (English) metadata
export const metadata: Metadata = {
  /* App Title */
  title: 'Page not found | abElements',
  /* App Description */
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
 *
 * @returns { ReactElement }
 */
export default function GlobalNotFound(): ReactElement {
  // return the global 404 page (with its own html & body) 🤷🏽‍♂️
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Head - with the (no flash ⚡️) theme script */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* Body - with the Inter font */}
      <body className={interStyles.regular}>
        <main className="flex flex-col w-full h-dvh items-center justify-center gap-4 p-6 text-center">
          {/* Status Code */}
          <p className="font-inter-bold text-6xl lg:text-8xl text-(--md-sys-color-primary)">404</p>
          {/* Title */}
          <h1 className="font-inter-medium text-xl lg:text-3xl">This page could not be found.</h1>
          {/* Home - Link */}
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
