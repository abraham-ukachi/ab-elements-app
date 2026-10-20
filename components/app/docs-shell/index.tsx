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
* @name: abElements Docs Shell
* @file: components/app/docs-shell/index.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <DocsShell locale="en" labels={labels} sections={sections}>{children}</DocsShell>
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


'use client';

// 🧭 The docs shell (0.2.21–0.2.22): composition ONLY of packaged pieces (no app-local UI).
// AbLinkProvider (locale-aware links 🌍) → AbPageProvider (aside state 📑) → AbAppLayout panes (G17 🧱) with
// AbAppBar (G43) + AbSearchTrigger (G44, coming soon) + theme toggle + locale switcher, AbSidebar (G40) with the
// persisted rail (`ab-sidebar-rail` 🗂️) and AbNavbar (G41) on mobile 📱.

// REACT types
import type { ReactNode } from 'react';

// import the packaged layout pieces from `ab-nextjs-core` (0.1.6) 🧱
import AbAppLayout from 'ab-nextjs-core/ab-app-layout';
import AbPageProvider, { useAbAsideToggle } from 'ab-nextjs-core/ab-page-provider';
// import the packaged UI from `ab-nextjs-components` (0.1.13) 🧩
import { AbLinkProvider, AbLink } from 'ab-nextjs-components/ab-link';
import AbAppBar from 'ab-nextjs-components/ab-app-bar';
import AbSearchTrigger from 'ab-nextjs-components/ab-search-trigger';
import AbSidebar, { type AbSidebarSection } from 'ab-nextjs-components/ab-sidebar';
import AbNavbar, { type AbNavbarItem } from 'ab-nextjs-components/ab-navbar';
import AbThemeToggle from 'ab-nextjs-components/ab-theme-toggle';
import AbLocaleSwitcher, { type AbLocaleOption } from 'ab-nextjs-components/ab-locale-switcher';
import AbLogo from 'ab-nextjs-components/ab-logo';
import AbChip from 'ab-nextjs-components/ab-chip';
import AbButton from 'ab-nextjs-components/ab-button';
import AbIcon from 'ab-nextjs-components/ab-icon';
// import the packaged icon button (the GitHub link) 🔘
import AbIconButton from 'ab-nextjs-components/ab-icon-button';
// import the localized pathname helper from `ab-nextjs-i18n` 🧭
import { localizeAbPathname } from 'ab-nextjs-i18n/config';

// import the locale-aware `Link` & the locale-free pathname (app-bar active link + locale switcher hrefs) 🌍
import { Link, usePathname } from '@/i18n/navigation';
// import abElements' i18n config (locales, default locale...)
import abI18nConfig from '@/i18n/config';
// import the rail preference (0.2.22) 🗂️
import { useSidebarRail } from '@/lib/sidebar-rail';
// import the repo URL (the GitHub button) 🐙
import { GITHUB_URL } from '@/lib/nav';


// 🏷️ every (already translated) label the shell needs, built by the server layout
export type DocsShellLabels = Readonly<{
  brand: string; nav: string; more: string; sidebar: string; collapse: string; expand: string; version: string;
  bottomBar: string; search: string; searchComingSoon: string; asideOpen: string; asideClose: string; language: string; github: string;
  theme: { group: string; light: string; dark: string; system: string };
}>;

// 🧾 the props of `DocsShell`
export type DocsShellProps = Readonly<{
  locale: string; // 🌍 the current locale
  labels: DocsShellLabels; // 🏷️
  locales: readonly AbLocaleOption[]; // 🗣️ code + endonym
  sections: AbSidebarSection[]; // 🗂️ resolved sidebar sections (lib/nav + lib/packages)
  topLinks: { href: string; label: string }[]; // 🔝 ready app-bar links (D26)
  bottomTabs: AbNavbarItem[]; // 📱 bottom-bar items
  children: ReactNode; // 📄 the page (AbMainLayout + AbAsideLayout)
}>;


/**
 * `AsideToggle` - the packaged aside toggle hook on a packaged button 📑
 *
 * @param { { open: string; close: string } } labels - the toggle labels
 * @returns { ReactElement }
 */
function AsideToggle({ labels }: { labels: { open: string; close: string } }) {
  // 📑 sheet on small screens, in-flow pane on laptop+ (core 0.1.6)
  const aside = useAbAsideToggle();
  // 🔘 fidelity spec: an icon-only toggle (`«` opens, `»` hides), never the big "Hide page outline" text.
  // AbButton keeps `label` as the accessible name ♿ and forwards aria-expanded / aria-controls; AbIconButton
  // can't forward them yet (package gap for components), so the icon rides as AbButton's visual `children`
  return (
    <AbButton type="text" label={aside.expanded ? labels.close : labels.open} {...aside.props}>
      <AbIcon name={aside.expanded ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'} size={20} />
    </AbButton>
  );
}


/**
 * `DocsShell` - Client Component 🧭
 *
 * @param { DocsShellProps } props - see `DocsShellProps`
 * @returns { ReactElement }
 */
export default function DocsShell({ locale, labels, locales, sections, topLinks, bottomTabs, children }: DocsShellProps) {
  // 🧭 the locale-free path (`/`, `/docs`...): only for the locale switcher's other-locale hrefs (AbAppBar reads the provider locales)
  const pathname = usePathname();
  // 🗂️ the persisted rail (false = expanded, also the SSR / JS-off state)
  const [rail, setRail] = useSidebarRail();

  // return the shell
  return (
    // 🔗 every packaged link becomes locale-aware (G42); `locales` lets the sidebar & navbar strip `/fr` themselves 🌍
    <AbLinkProvider component={Link} locales={abI18nConfig.locales}>
      {/* 📑 the aside (On this page) state, open by default on laptop+ */}
      <AbPageProvider defaultAsideOpen asideId="ab-aside">
        {/* 🧱 the 4-breakpoint panes (G17) */}
        <AbAppLayout
          orientation="vertical"
          variant="panes"
          railCollapsed={rail}
          pageName="docs"
          header={
            // 🔝 the app bar (G43)
            <AbAppBar
              brand={<AbLink href="/" aria-label={labels.brand}><AbLogo wordmark alt="" size={24} /></AbLink>}
              search={<AbSearchTrigger label={labels.search} href="/" comingSoon comingSoonLabel={labels.searchComingSoon} />}
              nav={topLinks}
              labels={{ nav: labels.nav, more: labels.more }}
              compactActions={
                // 📱 below 768px: just the theme switch (icon) & the globe
                <>
                  <AbThemeToggle variant="icon" size="sm" modes={['light', 'dark']} defaultMode="light" labels={labels.theme} />
                  <AbLocaleSwitcher
                    variant="icon"
                    align="end"
                    label={labels.language}
                    current={locale}
                    locales={locales}
                    getHref={(code) => localizeAbPathname(pathname, code, abI18nConfig)}
                  />
                </>
              }
              actions={
                // 🎯 fidelity spec order: [nav] · GitHub · globe · theme pill (+ the outline toggle below 1180px only)
                <>
                  {/* 📑 show / hide the page outline: tablet widths only (the mock has none on laptop / desktop) */}
                  <span className="contents min-[1180px]:hidden">
                    <AsideToggle labels={{ open: labels.asideOpen, close: labels.asideClose }} />
                  </span>
                  {/* 🐙 the repo on GitHub */}
                  <AbIconButton icon="github" label={labels.github} href={GITHUB_URL} />
                  {/* 🌍 the globe menu: same page, other locale (plain links, hreflang), left of the theme pill (Decision 2) */}
                  <AbLocaleSwitcher
                    variant="icon"
                    align="end"
                    label={labels.language}
                    current={locale}
                    locales={locales}
                    getHref={(code) => localizeAbPathname(pathname, code, abI18nConfig)}
                  />
                  {/* 🌗 light / dark only (the mock's 2-state pill) */}
                  <AbThemeToggle variant="segmented" size="sm" modes={['light', 'dark']} defaultMode="light" labels={labels.theme} />
                </>
              }
            />
          }
          sideBar={
            // 🗂️ the sidebar (G40) with the persisted rail (0.2.22)
            <AbSidebar
              sections={sections}
              collapsed={rail}
              onCollapsedChange={setRail}
              header={<AbChip>{labels.version}</AbChip>}
              labels={{ nav: labels.sidebar, collapse: labels.collapse, expand: labels.expand }}
            />
          }
          navBar={<AbNavbar items={bottomTabs} label={labels.bottomBar} />}
        >
          {children}
        </AbAppLayout>
      </AbPageProvider>
    </AbLinkProvider>
  );
}
