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
*   1+|> // wraps `/`, `/fr`, ... (and the package pages later)
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/



// 🧭 The `(docs)` shell layout (0.2.21–0.2.22): hands the current locale & the page to the shared shell frame
// (`components/app/docs-shell/frame.tsx`), which the 404 pages reuse too 🤷🏽‍♂️. The skip link lives there ♿.

// REACT types
import type { ReactElement, ReactNode } from 'react';

// import the shared (server) docs shell frame 🧭
import DocsShellFrame from '@/components/app/docs-shell/frame';


// create the props type of the docs layout as `DocsLayoutProps`
type DocsLayoutProps = Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>;


/**
 * `DocsLayout` - Layout 🧭
 *
 * @param { DocsLayoutProps } props - the layout props (`children` & the `locale` param)
 * @returns { Promise<ReactElement> }
 */
export default async function DocsLayout({ children, params }: DocsLayoutProps): Promise<ReactElement> {
  // 🌍 the current locale
  const { locale } = await params;
  // return the shared shell frame around the page 🧩
  return <DocsShellFrame locale={locale}>{children}</DocsShellFrame>;
}
