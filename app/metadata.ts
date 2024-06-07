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


// create and export some vip path directories ;)
export const ASSETS_DIR: string = '/assets';
export const IMAGES_DIR: string = '/assets/images';
export const MANIFEST_DIR: string = '/assets/images/manifest';


export { Metadata };

// create and export abElements' root static metadata as `StaticMetadata`
export const StaticMetadata: Metadata = {
  /* Application Name */
  applicationName: 'abElements',

  /* App Title */
  title: {
    template: '%s | abElements',
    default: 'Coming Soon 🫶🏼 - abElements',
  },

  /* App Description */
  description: 'A lightweight library of 100% free UI elements for your Next.js, React, Vue, Lit and Flutter projects, created with ❤️  by Abraham UKachi.',

  /* JSON Manifest file */
  manifest: '/manifest.json',

  /* Generator 4 SEO */
  generator: 'abElements',

  /* Referrer - OWCO to send the full URL to referring pages within abElements but only domain/subdomain to external sites */
  referrer: 'origin-when-cross-origin',

  /* Keywords */
  keywords: [ "nextjs", "react", "vue", "lit", "flutter", "components", "free", "ui", "open-source", "ab-elements", "abraham", "ukachi", "ab-nextjs-components", "ab-react-components", "ab-vue-components", "ab-lit-components", "ab-flutter-components" ],
 
  /* Apple Web App - ...add to homescreen for Safari on iOS */
  appleWebApp: {
    title: 'abElements',
    statusBarStyle: 'default',
  },

  /* App Icons */
  icons: {
    icon: [ {url: IMAGES_DIR + '/favicon.ico'} ],
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
