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
*
* @project: ab-elements-app
* @name: Not Found - Page 
* @file: app/not-found.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
* 
*
* Example usage:
*    -|>
*
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
// NEXT components
import Link from 'next/link';


// the 404 page's own metadata (uses the root title template)
export const metadata: Metadata = {
  title: 'Page not found',
};


/**
 * `NotFound` / 404 - Page
 *
 * This component renders the real 404 abElements page.
 * Next.js serves it (with a 404 status) for every unmatched URL and every `notFound()` call.
 *
 * @returns { ReactElement }
 */
export default function NotFoundPage(): ReactElement {
  return (
    <main className="flex flex-col w-full h-dvh items-center justify-center gap-4 p-6 text-center">

      {/* Status Code */}
      <p className="font-inter-bold text-6xl lg:text-8xl text-(--md-sys-color-primary)">404</p>

      {/* Title */}
      <h1 className="font-inter-medium text-xl lg:text-3xl">This page could not be found.</h1>

      {/* Home - Link */}
      <Link
        href="/"
        className="text-(--md-sys-color-primary) hover:underline decoration-dashed underline-offset-4">
        Back to abElements
      </Link>

    </main>
  );
};
