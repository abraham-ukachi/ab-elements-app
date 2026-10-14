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
* @name: abElements Welcome Actions
* @file: app/[locale]/welcome/actions.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <form action={completeWelcome}>
*    -|> 
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


'use server';

// 🍪 Welcome server action: remember the visitor said hello, then send them home.
// It runs from a plain `<form action>` POST, so it works without JavaScript too ♿.

// import `redirect` from `next/navigation` (throws a NEXT_REDIRECT, so it must stay last 🚦)
import { redirect } from 'next/navigation';

// import the hello cookie action (writes `AB_APP_HELLO`) from `ab-nextjs-hooks` 🍪
import { toggleAppHello } from 'ab-nextjs-hooks/server/useAbApp';
// import the locale guard & the localized pathname helper from `ab-nextjs-i18n` 🌍
import { isAbLocale, localizeAbPathname } from 'ab-nextjs-i18n/config';

// import abElements' i18n config (locales, default locale...)
import abI18nConfig from '@/i18n/config';


// TODO(0.2.18): needs ab-nextjs-hooks@0.1.6 (G11: `toggleAppHello(state, { maxAge })` + `AB_APP_COOKIE_MAX_AGE`)
// Until then, the published 0.1.5 `toggleAppHello` takes one argument and ignores the second one,
// so the cookie keeps the package's 7-day lifetime ⏳. When hooks 0.1.6 lands:
//   1. import { AB_APP_COOKIE_MAX_AGE, toggleAppHello } from 'ab-nextjs-hooks/server/useAbApp';
//   2. delete `WELCOME_COOKIE_MAX_AGE` & `toggleWelcomeHello` below
//   3. call `toggleAppHello(true, { maxAge: AB_APP_COOKIE_MAX_AGE.oneYear })`
// one year, in SECONDS (= the planned `AB_APP_COOKIE_MAX_AGE.oneYear`) 📅
const WELCOME_COOKIE_MAX_AGE = 31536000;
// the planned 0.1.6 signature of `toggleAppHello` (a typed view of the same function, no runtime change) 🔭
const toggleWelcomeHello = toggleAppHello as (
  // the new hello state (`true` = the visitor finished the Welcome)
  newHelloState?: boolean,
  // the cookie options (`maxAge` in seconds)
  options?: { maxAge?: number },
) => Promise<boolean>;


/**
 * `completeWelcome` - Server Action 🎬✅
 *
 * Sets the hello cookie (`AB_APP_HELLO=true`) and redirects to the localized home page
 * (`/` for English, `/fr` for French...). Unknown locales fall back to the default one.
 *
 * @param { FormData } formData - the Get Started form data (with a hidden `locale` field)
 * @returns { Promise<never> } - never returns: it always redirects 🚀
 */
export async function completeWelcome(formData: FormData): Promise<never> {
  // read the `locale` field of the form 🌍
  const field = formData.get('locale');
  // keep it only if it's one of our locales, else use the default locale (no open redirect 🛡️)
  const locale = isAbLocale(abI18nConfig, field) ? field : abI18nConfig.defaultLocale;

  // 🍪 say hello for one year (see the TODO above: 7 days until hooks 0.1.6)
  await toggleWelcomeHello(true, { maxAge: WELCOME_COOKIE_MAX_AGE });

  // 🏠 go home, in the visitor's locale
  redirect(localizeAbPathname('/', locale, abI18nConfig));
}
