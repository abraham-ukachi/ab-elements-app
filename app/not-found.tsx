/* 
* @license MIT
* ~~~~~~~~~~~~
* lesyeuxdoux
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
// REACT hooks
// REACT components

// NEXT types
// NEXT components
// NEXT hooks
import { permanentRedirect } from 'next/navigation';


/**
 * `NotFound` / 404 - Page
 *
 * This component is used to render the 404 abElements page.
 *
 * > HACK: However, we are redirecting all traffic to home/comingSoon page. 
 *         This is a temporary solution until we are ready for products and/or have a proper 404 page ;)
 *
 * @returns { Promise<ReactElement> }
 */
export default async function NotFoundPage(): Promise<ReactElement> {
  return permanentRedirect('/');
};

