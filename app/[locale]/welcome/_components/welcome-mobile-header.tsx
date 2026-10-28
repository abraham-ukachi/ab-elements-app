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
* @name: abElements Welcome Mobile Header
* @file: app/[locale]/welcome/_components/welcome-mobile-header.tsx
* @type: TypeScript (React, client)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <WelcomeMobileHeader logo={logo} current="en" locales={locales} labels={labels} row={counterRow} />
*    -|> // 📱 below 768px only (core's `mobileHeader="main"` hides the main header slot at 768px+)
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


'use client';

// 📱 Welcome mobile header: the packaged AbMobileHeader (logo · globe · 3-state theme) + the counter row in its
// `row` slot (components 0.2.3), and the language list as the packaged bottom drawer (D40) that closes on a swipe
// down and gives focus back to the globe (`trigger`). Composition only: no app-local UI 🧩.

// import the React hooks we need (state, a ref, a stable drawer component) ⚛️
import { useCallback, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';

// import the packaged mobile header (+ its theme-mode type) from `ab-nextjs-components` 📱
import AbMobileHeader, { type AbMobileHeaderThemeMode } from 'ab-nextjs-components/ab-mobile-header';
// import the packaged bottom sheet (0.2.3: swipe down to close + `trigger` focus return) 🗄️
import AbBottomDrawer from 'ab-nextjs-components/ab-bottom-drawer';
// import the packaged drawer list (the locale rows with hreflang links + the ✓) 📋
import AbDrawerList from 'ab-nextjs-components/ab-drawer-list';
// import the drawer props type (the `as` component's contract) 🧾
import type { AbDrawerProps } from 'ab-nextjs-components/ab-drawer';
// import the locale option type from the packaged switcher 🗣️
import type { AbLocaleOption } from 'ab-nextjs-components/ab-locale-switcher';
// import the theme engine (the same one AbThemeToggle uses: persists + applies to <html>) 🌗
import { useAbThemeMode } from 'ab-nextjs-hooks/useAbTheme';

// import the shared locale href builder (keeps `?s=`) 🔗
import { useWelcomeLocaleHref } from './welcome-locale-switcher';


// ===== WELCOME MOBILE HEADER - TYPES ===== //

// every (already translated) label of the mobile header 🌐
export interface WelcomeMobileHeaderLabels {
  language: string; // 🌍 the globe's name ("Change language")
  languageTitle: string; // 🏷️ the drawer title ("Language")
  toLight: string; // ☀️ "Switch to light theme"
  toDark: string; // 🌙 "Switch to dark theme"
  toSystem: string; // 🖥️ "Use the system theme"
  header: string; // 🏷️ the group's name ("Main header")
}

// what the server `Welcome` hands over (the counter row is added by WelcomeSlides) 🧾
export interface WelcomeMobileHeaderData {
  logo: ReactNode; // 🅰️ the wordmark (server-rendered)
  current: string; // ✅ the active locale
  locales: readonly AbLocaleOption[]; // 🗣️ code + endonym
  labels: WelcomeMobileHeaderLabels; // 🌐
}

// the props of `WelcomeMobileHeader` 🧾
interface WelcomeMobileHeaderProps extends WelcomeMobileHeaderData {
  row?: ReactNode; // ➕ the second row (the `02 / 09` counter + Skip)
}


/**
 * `WelcomeMobileHeader` - Client Component 📱
 *
 * @param { WelcomeMobileHeaderProps } props - logo, locales, labels and the counter row
 * @returns { ReactElement }
 */
export default function WelcomeMobileHeader({ logo, current, locales, labels, row }: WelcomeMobileHeaderProps) {
  // 🌗 the 3-state theme (light → dark → system), the v6 default is "system"
  const { mode, setMode } = useAbThemeMode('system');
  // 🗄️ is the language drawer open?
  const [open, setOpen] = useState(false);
  // 🌍 the globe button: the drawer's `trigger` (focus goes back to it on close, even after a swipe / on Safari)
  const globeRef = useRef<HTMLElement | null>(null);
  // 🔗 the locale hrefs (same slide, other locale)
  const getHref = useWelcomeLocaleHref();

  // 🌍 the globe was tapped: remember it as the trigger, then open the sheet
  const onLanguage = useCallback((event?: MouseEvent<HTMLElement>) => {
    // 📌 AbMobileHeader passes its click event; fall back to its globe part (gap: no `languageRef` prop yet)
    globeRef.current = event?.currentTarget ?? document.querySelector<HTMLElement>('[data-ab-part="mobile-header-language"]');
    // 🚪 open
    setOpen(true);
  }, []);

  // 🧱 the drawer AbDrawerList renders in: the packaged bottom sheet with our `trigger` (stable, so it never remounts)
  const Sheet = useMemo(() => {
    // 🗄️ AbBottomDrawer + the globe as the focus-return target
    function WelcomeLanguageSheet(props: AbDrawerProps) {
      return <AbBottomDrawer {...props} trigger={globeRef} />;
    }
    return WelcomeLanguageSheet;
  }, []);

  // return the packaged header + its language sheet 📱
  return (
    <>
      <AbMobileHeader
        logo={logo} // 🅰️
        onLanguage={onLanguage} // 🌍 opens the sheet
        languageExpanded={open} // ♿ aria-expanded on the globe
        themeMode={mode as AbMobileHeaderThemeMode} // 🌗 the current mode
        onThemeModeChange={setMode} // 🔁 light → dark → system (persists + applies to <html>)
        row={row} // ➕ the counter row under the 56px bar
        labels={{ language: labels.language, toLight: labels.toLight, toDark: labels.toDark, toSystem: labels.toSystem, header: labels.header }} // 🌐
      />
      {/* 🗄️ the language list: a bottom sheet (swipe down / Esc / scrim close it) with real hreflang links */}
      <AbDrawerList
        as={Sheet} // 📱 the bottom sheet + `trigger`
        open={open} // 🚪
        onClose={() => setOpen(false)} // ⎋
        title={labels.languageTitle} // 🏷️ "Language"
        noJsFallback={false} // 🧯 no in-flow copy without JS (the 768px+ globe is a plain <details> menu)
        value={current} // ✅ the active locale
        items={locales.map((l) => ({ value: l.code, label: l.label, lang: l.code, href: getHref(l.code) }))} // 🔗
      />
    </>
  );
}
