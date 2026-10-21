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
* @name: abElements Docs Shell - Error
* @file: app/[locale]/(docs)/error.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> // thrown by any `(docs)` page: shows "Something went wrong · Try again"
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


'use client';

// 🧯 The `(docs)` route error boundary: the shell (layout) stays, the page area shows a localized
// "Something went wrong · Try again" (`Shell.error.*`). Build-time data errors fail the build instead.

// REACT types
import type { ReactElement } from 'react';

// import the client translations hook from `ab-nextjs-i18n` 🌐
import { useAbTranslations } from 'ab-nextjs-i18n';


// create the props type of the error boundary as `DocsErrorProps` (what Next.js hands to `error.tsx`)
export type DocsErrorProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;


/**
 * `DocsError` - Error Boundary 🧯
 *
 * @param { DocsErrorProps } props - the error & the `reset` (re-render the segment) callback
 * @returns { ReactElement }
 */
export default function DocsError({ reset }: DocsErrorProps): ReactElement {
  // get the translations of the `Shell` messages 🌐
  const t = useAbTranslations('Shell');

  // return the error panel (it's the page's `main`, so the skip link still lands here ♿)
  return (
    <main id="main" tabIndex={-1} data-ab-part="error" className="flex flex-col w-full h-dvh items-center justify-center gap-4 p-6 text-center">
      {/* Title - announced right away 📣 */}
      <h1 role="alert" className="font-inter-medium text-xl lg:text-3xl">{t('error.title')}</h1>
      {/* Try again - re-renders the segment 🔁 */}
      <button
        type="button"
        onClick={() => reset()}
        className="min-h-11 rounded-full px-6 bg-(--md-sys-color-primary) text-(--md-sys-color-on-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--md-sys-color-primary)"
      >
        {t('error.retry')}
      </button>
    </main>
  );
}
