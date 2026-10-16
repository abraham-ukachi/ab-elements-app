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
* @name: abElements Docs Shell - Layout
* @file: app/[locale]/(docs)/layout.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> // wraps `/`, `/fr`, ... (and Docs, Icons, Profile, Settings later)
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧭 The `(docs)` shell layout (0.2.21 scaffolding): the route group Home, Docs, 404, Icons, Profile & Settings share.
// For now it only adds the skip link ♿: the app bar, sidebar, bottom bar & aside wait for the new packages
// (G40 sidebar, G41 navbar, G42 link provider, G43 app bar, G44 search pill, G17 4-breakpoint panes).

// REACT types
import type { ReactNode } from 'react';

// import the server-side translations helper from `ab-nextjs-i18n` 🌐
import { getAbTranslations } from 'ab-nextjs-i18n/server';


// create the props type of the docs layout as `DocsLayoutProps`
type DocsLayoutProps = Readonly<{ children: ReactNode }>;


/**
 * `DocsLayout` - Layout 🧭
 *
 * The docs shell frame. The skip link is the first focusable element and jumps to `#main` ♿.
 *
 * @param { DocsLayoutProps } props - the layout props (`children`)
 * @returns { Promise<ReactElement> }
 */
export default async function DocsLayout({ children }: DocsLayoutProps) {
  // get the translations of the `Shell` messages of the current locale 🌐
  const t = await getAbTranslations('Shell');

  // return the shell frame
  return (
    <>
      {/* Skip link ♿ - hidden until focused, then pinned top-left above everything */}
      <a
        href="#main"
        data-ab-part="skipLink"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:bg-(--md-sys-color-surface-container-high) focus:text-(--md-sys-color-on-surface) focus:outline-2 focus:outline-(--md-sys-color-primary)"
      >
        {t('skipToContent')}
      </a>
      {/* the page 📄 (it renders `<main id="main">`) */}
      {children}
    </>
  );
}
