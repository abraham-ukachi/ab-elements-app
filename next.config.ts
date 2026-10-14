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
* @name: Next Configuration File
* @file: next.config.ts
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
import type { NextConfig } from 'next';
// import the i18n plugin from `ab-nextjs-i18n`
import { withAbI18n } from 'ab-nextjs-i18n/plugin';


// create abElements' Next.js config as `nextConfig`
const nextConfig: NextConfig = {
  // the Ab packages ship TypeScript sources, so let Next.js compile them
  // (`withAbI18n` also adds `ab-nextjs-i18n` to this list)
  transpilePackages: [
    'ab-nextjs-fonts',
    'ab-nextjs-icons',
    'ab-nextjs-animations',
    'ab-nextjs-theme',
    'ab-nextjs-hooks',
    'ab-nextjs-core',
    'ab-nextjs-components',
  ],
  /* Experimental */
  experimental: {
    // root 404 for unmatched URLs when the root layout is under `app/[locale]`
    globalNotFound: true,
  },
};


// export the config, wrapped with the i18n plugin, as default 🌐
export default withAbI18n(nextConfig);
