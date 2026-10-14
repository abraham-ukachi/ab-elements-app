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
* @name: abElements Splash - Index (thin wrapper over ab-nextjs-components/ab-splash)
* @file: components/app/splash/index.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> import Splash, { abSplashGateScript } from '@/components/app/splash';
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// export the Splash overlay (mark + wordmark + AbLinearProgress) from `ab-nextjs-components` as the default 💦
export { default } from 'ab-nextjs-components/ab-splash';

// import the gate script builder from `ab-nextjs-components` 🚦
import { buildAbSplashGateScript } from 'ab-nextjs-components/ab-splash/gate';
// import our i18n config (the single source of truth for locales) 🌐
import { abI18nConfig } from '@/i18n/config';

// create and export the gate script, built from OUR locales (`/fr`, `/es`, `/ru` + `/` for the default) as `abSplashGateScript` 🏗️
export const abSplashGateScript: string = buildAbSplashGateScript({
  locales: abI18nConfig.locales,
  defaultLocale: abI18nConfig.defaultLocale,
});
