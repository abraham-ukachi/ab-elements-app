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
* @name: abElements Welcome Locale Switcher
* @file: app/[locale]/welcome/_components/welcome-locale-switcher.tsx
* @type: TypeScript (React, client)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <WelcomeLocaleSwitcher current="en" label="Language" locales={WELCOME_LOCALES} />
*    -|> 
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


'use client';

// 🌍 Welcome globe: the packaged `AbLocaleSwitcher` with real links (works as plain `<a hreflang>`).
// 🗄️ 0.2.21 (D40): `presentation="auto"` = the packaged bottom app drawer (AbDrawerList) below 768px, the popover menu above.
// 📱 0.2.3: below 768px the app header row (and so this globe) is hidden by core's `mobileHeader="main"`; the phone globe
//   lives in AbMobileHeader instead (see WelcomeMobileHeader), which reuses `useWelcomeLocaleHref` from here.
// Composition only: this file just builds each locale's `/welcome` URL and keeps the slide (`?s=`) 🔗.

// import the React hooks (state + effect) ⚛️
import { useEffect, useState } from 'react';

// import the packaged globe menu from `ab-nextjs-components` 🌐
import AbLocaleSwitcher, { type AbLocaleOption } from 'ab-nextjs-components/ab-locale-switcher';
// import the localized pathname helper from `ab-nextjs-i18n` 🧭
import { localizeAbPathname } from 'ab-nextjs-i18n/config';

// import abElements' i18n config (locales, default locale...)
import abI18nConfig from '@/i18n/config';


// the props of `WelcomeLocaleSwitcher` 🧾
interface WelcomeLocaleSwitcherProps {
  current: string; // ✅ the active locale
  label: string; // 🏷️ "Language"
  locales: readonly AbLocaleOption[]; // 🗣️ code + endonym
}


/**
 * `useWelcomeLocaleHref` - the `/welcome` URL of a locale, keeping the slide (`?s=`) 🔗
 * (shared by the 768px+ globe menu and the mobile header's language drawer)
 *
 * @returns { (code: string) => string } the href builder
 */
export function useWelcomeLocaleHref(): (code: string) => string {
  // the current `?s=…` query (empty on the server and on s01) 🔗
  const [search, setSearch] = useState('');

  // 👂 follow the `?s=` the carousel writes (replaceState fires no event, so read it when the menu is used)
  useEffect(() => {
    // read the query now
    const sync = () => setSearch(window.location.search);
    // first read 🌱
    sync();
    // re-read whenever the pointer / keyboard is used (cheap, no polling) 🖱️⌨️
    document.addEventListener('pointerdown', sync, true);
    document.addEventListener('keydown', sync, true);
    // clean up 🧹
    return () => {
      document.removeEventListener('pointerdown', sync, true);
      document.removeEventListener('keydown', sync, true);
    };
  }, []);

  // 🔗 same slide, other locale
  return (code: string) => `${localizeAbPathname('/welcome', code, abI18nConfig)}${search}`;
}


/**
 * `WelcomeLocaleSwitcher` - Client Component 🌍
 *
 * @param { WelcomeLocaleSwitcherProps } props - the current locale, the trigger label and the choices
 * @returns { ReactElement }
 */
export default function WelcomeLocaleSwitcher({ current, label, locales }: WelcomeLocaleSwitcherProps) {
  // 🔗 the locale hrefs (keeping `?s=`)
  const getHref = useWelcomeLocaleHref();

  // return the packaged globe (variant icon, menu aligned to the end) 🌐
  return (
    <AbLocaleSwitcher
      variant="icon" // 🌐 globe only
      align="end" // ↔️ under the right edge
      presentation="auto" // 🗄️ drawer on phones, menu on tablet / desktop (resolved at open time: no hydration flip)
      label={label} // 🏷️ "Language"
      current={current} // ✅
      locales={locales} // 🗣️
      getHref={getHref} // 🔗 same slide, other locale
    />
  );
}
