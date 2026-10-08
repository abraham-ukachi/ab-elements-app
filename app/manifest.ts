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
* @name: abElements Web App Manifest
* @file: app/manifest.ts
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


// NEXT types
import type { MetadataRoute } from 'next';

// import the i18n config (default locale) & the default (en) messages
import abI18nConfig from '@/i18n/config';
import enMessages from '@/messages/en.json';
// import abElements' directories
import { MANIFEST_DIR, IMAGES_DIR } from './metadata';
// import the theme colors
import { THEME_COLORS } from './viewport';


// the squircle icon sizes shipped in `public/assets/images/manifest/squircle`
const ICON_SIZES: readonly number[] = [48, 72, 96, 144, 192, 512];


/**
 * `manifest` - Web App Manifest
 *
 * Next.js serves this as `/manifest.webmanifest` and links it in every page's `<head>`.
 * There's one manifest for every locale, so its copy comes from the default (en) messages.
 *
 * @returns { MetadataRoute.Manifest }
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: enMessages.Metadata.applicationName,
    short_name: enMessages.Metadata.applicationName,
    description: enMessages.Metadata.description,
    lang: abI18nConfig.defaultLocale,
    id: '/?homescreen=1',
    start_url: '/?homescreen=1',
    scope: '/',
    display: 'standalone',
    display_override: ['fullscreen', 'minimal-ui'],
    theme_color: THEME_COLORS.dark,
    background_color: THEME_COLORS.dark,

    icons: ICON_SIZES.map((size) => ({
      src: `${MANIFEST_DIR}/squircle/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
    })),

    screenshots: [
      {
        src: `${IMAGES_DIR}/screenshots/mobile_screenshot_light.png`,
        sizes: '430x932',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: `${IMAGES_DIR}/screenshots/laptop_screenshot_light.png`,
        sizes: '1024x720',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
  };
};
