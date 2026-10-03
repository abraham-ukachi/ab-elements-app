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
* @name: abElements Viewport
* @file: viewport.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
*
* Example usage:
*   1+|> 
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// import the Viewport type from `next`
import type { Viewport } from 'next';

// import the Ab theme's material colors from `ab-nextjs-theme`
import materialTheme from 'ab-nextjs-theme/material-theme.json';


export type { Viewport };


// create and export the theme colors used by the browser UI as `THEME_COLORS`
export const THEME_COLORS = {
  light: materialTheme.schemes.light.background,
  dark: materialTheme.schemes.dark.background,
} as const;


// create and export abElements' root static viewport as `StaticViewport`
// NOTE: zooming stays allowed on purpose (no `maximumScale` / `userScalable`) for a11y ;)
export const StaticViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,

  /* Color Scheme */
  colorScheme: 'light dark',

  /* Theme Color */
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
  ],
};
