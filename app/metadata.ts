/* 
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElments Project.
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
* @name: abElements Metadata
* @file: metadata.ts
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


// import the Metadata type from `next`
import type { Metadata } from 'next';

// import the default (en) messages: the source of abElements' shared copy
import enMessages from '../messages/en.json';


// create and export some vip path directories ;)
export const ASSETS_DIR: string = '/assets';
export const IMAGES_DIR: string = '/assets/images';
export const MANIFEST_DIR: string = '/assets/images/manifest';


// create and export abElements' public URL as `APP_URL` (metadataBase, canonical & hreflang URLs, sitemap, robots)
export const APP_URL: string = process.env.NEXT_PUBLIC_APP_URL || 'https://ab-elements.vercel.app';

// create and export abElements' default (en) description as `APP_DESCRIPTION` (global 404 & web app manifest)
export const APP_DESCRIPTION: string = enMessages.Metadata.description;

export { Metadata };

// create and export abElements' root static metadata as `StaticMetadata`
// NOTE: the title & description are localized in `app/[locale]/layout.tsx` (`generateMetadata`)
export const StaticMetadata: Metadata = {
  /* Metadata Base - resolves relative URLs (canonical, hreflang, Open Graph...) */
  metadataBase: new URL(APP_URL),

  /* Application Name */
  applicationName: 'abElements',

  /* Generator 4 SEO */
  generator: 'abElements',

  /* Referrer - OWCO to send the full URL to referring pages within abElements but only domain/subdomain to external sites */
  referrer: 'origin-when-cross-origin',

  /* Keywords */
  keywords: [ "nextjs", "react", "components", "free", "ui", "open-source", "pwa", "ab-elements", "abraham", "ukachi", "ab-nextjs-fonts", "ab-nextjs-icons", "ab-nextjs-animations", "ab-nextjs-theme", "ab-nextjs-hooks", "ab-nextjs-core", "ab-nextjs-components" ],
 
  /* Apple Web App - ...add to homescreen for Safari on iOS */
  appleWebApp: {
    title: 'abElements',
    statusBarStyle: 'default',
  },

  /* App Icons */
  icons: {

    icon: [ 

      { url: IMAGES_DIR + '/favicon.ico' },

      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        media: '(prefers-color-scheme: light)',
        url: IMAGES_DIR + '/favicon-light.png',
        href: IMAGES_DIR + '/favicon-light.png',
      },

      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        media: '(prefers-color-scheme: dark)',
        url: IMAGES_DIR + '/favicon-dark.png',
        href: IMAGES_DIR + '/favicon-dark.png',
      },

    ],

    shortcut: [ IMAGES_DIR + '/shortcut-icon.png' ],
    apple: [
      { url: MANIFEST_DIR + '/squircle' + '/icon-48x48.png' },
      { url: MANIFEST_DIR + '/squircle' + '/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: MANIFEST_DIR + '/squircle' + '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: MANIFEST_DIR + '/squircle' + '/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: MANIFEST_DIR + '/squircle' + '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ]
  },

  /* abElements Authors */
  authors: [
    {name: 'Abraham Ukachi', url: 'https://github.com/abraham-ukachi'},
  ],


}
