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

// 🧭 The docs shell (0.2.21–0.2.22, Home fidelity pass 2): composition ONLY of packaged pieces (no app-local UI).
// AbLinkProvider (locale-aware links 🌍) → AbPageProvider (aside state 📑) → AbAppLayout panes (core 0.2.0 🧱:
// 768 / 1180 / 1920, `tabletHeader="main"`) with the compact AbAppBar, AbSidebar (compact, rounded rows, the
// AbVersionSwitcher on top, the persisted rail `ab-sidebar-rail` 🗂️) and the blurred AbNavbar on mobile 📱.
// Tablet (768–1179) has NO app bar: each page puts `<DocsMainBar>` in its AbMainLayout `mainHeader` 📟.

// REACT
import { createContext, useContext, type ReactNode } from 'react';

// import the packaged layout pieces from `ab-nextjs-core` (0.2.0) 🧱
import AbAppLayout from 'ab-nextjs-core/ab-app-layout';
import AbPageProvider, { useAbAsideToggle } from 'ab-nextjs-core/ab-page-provider';
// import the packaged UI from `ab-nextjs-components` (0.1.14) 🧩
import { AbLinkProvider, AbLink } from 'ab-nextjs-components/ab-link';
import AbAppBar from 'ab-nextjs-components/ab-app-bar';
import AbSearchTrigger from 'ab-nextjs-components/ab-search-trigger';
import AbSidebar, { type AbSidebarSection } from 'ab-nextjs-components/ab-sidebar';
import AbNavbar, { type AbNavbarItem } from 'ab-nextjs-components/ab-navbar';
import AbThemeToggle from 'ab-nextjs-components/ab-theme-toggle';
import AbLocaleSwitcher, { type AbLocaleOption } from 'ab-nextjs-components/ab-locale-switcher';
import AbLogo from 'ab-nextjs-components/ab-logo';
import AbIconButton from 'ab-nextjs-components/ab-icon-button';
import AbVersionSwitcher from 'ab-nextjs-components/ab-version-switcher';
import AbBreadcrumbs, { type AbBreadcrumbItem } from 'ab-nextjs-components/ab-breadcrumbs';
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
  brand: string; nav: string; more: string; sidebar: string; collapse: string; expand: string;
  docs: string; version: string; bottomBar: string; search: string; searchComingSoon: string;
  asideOpen: string; asideClose: string; language: string; github: string; breadcrumbs: string;
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

// 🧠 what the tablet main bar needs from the shell (so a server page can drop `<DocsMainBar>` in its `mainHeader`)
type ShellContextValue = Readonly<{ locale: string; labels: DocsShellLabels; locales: readonly AbLocaleOption[] }>;
const ShellContext = createContext<ShellContextValue | null>(null);


/**
 * `useShellActions` - the shared action pieces (GitHub · globe · theme pill) 🔘
 *
 * @returns { { github: ReactElement; globe: ReactElement; theme: ReactElement; themeIcon: ReactElement } }
 */
function useShellActions() {
  // 🧠 labels + locales from the shell
  const shell = useContext(ShellContext);
  // 🧭 the locale-free path, for the other-locale hrefs
  const pathname = usePathname();
  if (!shell) throw new Error('DocsMainBar must render inside DocsShell'); // 🚨 dev mistake, not a user state
  const { labels, locale, locales } = shell;
  // 🌍 the globe: a menu on wide screens, the packaged bottom drawer (AbBottomDrawer) below 768px (`auto`, G56)
  const globe = (
    <AbLocaleSwitcher
      variant="icon"
      align="end"
      presentation="auto"
      label={labels.language}
      current={locale}
      locales={locales}
      getHref={(code) => localizeAbPathname(pathname, code, abI18nConfig)}
    />
  );
  return {
    // 🐙 36×36, 20px octicon (spec §4)
    github: <AbIconButton icon="github" iconSize={20} label={labels.github} href={GITHUB_URL} />,
    globe,
    // 🌗 the mock's 2-state pill with a raised thumb (P7)
    theme: <AbThemeToggle variant="segmented" appearance="thumb" size="sm" modes={['light', 'dark']} defaultMode="light" labels={labels.theme} />,
    // 🌗 mobile: one icon that shows the mode a tap switches to
    themeIcon: <AbThemeToggle variant="icon" appearance="thumb" modes={['light', 'dark']} defaultMode="light" labels={labels.theme} />,
    labels,
  };
}


/**
 * `AsideToggle` - the packaged aside toggle hook on a packaged icon button 📑
 *
 * @returns { ReactElement }
 */
function AsideToggle() {
  // 🧠 the open / close labels
  const { labels } = useShellActions();
  // 📑 sheet below 1180, in-flow pane from 1180 (core 0.2.0); returns aria-expanded / aria-controls / onClick
  const aside = useAbAsideToggle();
  // 🔘 `<<` opens, `>>` hides (spec §4); AbIconButton forwards the aria props since components 0.1.14 ♿
  return (
    <AbIconButton
      icon={aside.expanded ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}
      iconSize={20}
      label={aside.expanded ? labels.asideClose : labels.asideOpen}
      {...aside.props}
    />
  );
}


/**
 * `DocsMainBar` - Client Component 📟: the tablet (768–1179) main-pane bar, put in AbMainLayout's `mainHeader`.
 * Core 0.2.0 shows it ONLY on tablet (`tabletHeader="main"`) and hides the app bar there.
 * Crumb · grow · search 260 · theme pill · GitHub · divider · `<<` (spec §3), all packaged pieces.
 *
 * @param { { crumbs: AbBreadcrumbItem[] } } props - the breadcrumb trail (last = current page)
 * @returns { ReactElement }
 */
export function DocsMainBar({ crumbs }: Readonly<{ crumbs: AbBreadcrumbItem[] }>) {
  // 🔘 the shared actions
  const { github, globe, theme, labels } = useShellActions();
  return (
    // 📏 fills core's main-header row (spec §3 padding 0 12 0 28); core owns the row height & rule
    <div className="flex h-full items-center gap-2 pr-3 pl-7">
      {/* 🍞 Docs › Home */}
      <AbBreadcrumbs items={crumbs} label={labels.breadcrumbs} />
      <span className="grow" aria-hidden="true" />
      {/* 🔎 the 36px field, 260 wide on tablet */}
      <div className="w-[260px]"><AbSearchTrigger variant="field" label={labels.search} href="/" comingSoon comingSoonLabel={labels.searchComingSoon} /></div>
      {globe}
      {theme}
      {github}
      {/* ➖ 1×20 divider before the outline toggle (decorative) */}
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-(--ab-color-div)" />
      <AsideToggle />
    </div>
  );
}


/**
 * `ShellBar` - the app bar (mobile, laptop, desktop) 🔝
 *
 * @param { { topLinks: { href: string; label: string }[] } } props - the ready app-bar links
 * @returns { ReactElement }
 */
function ShellBar({ topLinks }: Readonly<{ topLinks: { href: string; label: string }[] }>) {
  // 🔘 the shared actions
  const { github, globe, theme, themeIcon, labels } = useShellActions();
  return (
    <AbAppBar
      density="compact" // 📏 height from core's --ab-header-height (52 / 60 / 64), 13.5px links, 236 / 270 brand column
      divider // ➖ the 1×20 rule before GitHub
      moreMenu={false} // 🚫 no `⋮` (P19): only the 4 links, and they fit from 1180
      brand={<AbLink href="/" aria-label={labels.brand}><AbLogo wordmark alt="" size={22} /></AbLink>}
      // 🔎 laptop / desktop field (300 / 360 from the package); the mobile pill comes from compactActions
      search={<AbSearchTrigger variant="field" label={labels.search} href="/" comingSoon comingSoonLabel={labels.searchComingSoon} />}
      nav={topLinks}
      labels={{ nav: labels.nav, more: labels.more }}
      compactActions={
        // 📱 below 768px: the theme icon and the globe (opens the packaged bottom drawer); AbAppBar already
        // turns `search` into its own compact pill here, so a second trigger would duplicate it
        <>
          {globe}
          {themeIcon}
        </>
      }
      // 🎯 spec order: [nav] · divider · GitHub · globe · theme pill (Decision 2: the globe sits left of the pill)
      actions={<>{github}{globe}{theme}</>}
    />
  );
}


/**
 * `DocsShell` - Client Component 🧭
 *
 * @param { DocsShellProps } props - see `DocsShellProps`
 * @returns { ReactElement }
 */
export default function DocsShell({ locale, labels, locales, sections, topLinks, bottomTabs, children }: DocsShellProps) {
  // 🗂️ the persisted rail (false = expanded, also the SSR / JS-off state)
  const [rail, setRail] = useSidebarRail();

  // return the shell
  return (
    // 🔗 every packaged link becomes locale-aware (G42); `locales` lets the sidebar & navbar strip `/fr` themselves 🌍
    <AbLinkProvider component={Link} locales={abI18nConfig.locales}>
      <ShellContext.Provider value={{ locale, labels, locales }}>
        {/* 📑 the aside (On this page) state, open by default from 1180 */}
        <AbPageProvider defaultAsideOpen asideId="ab-aside">
          {/* 🧱 the 4-breakpoint panes (core 0.2.0) */}
          <AbAppLayout
            orientation="vertical"
            variant="panes"
            tabletHeader="main" // 📟 768–1179: no app bar, the page's `mainHeader` (DocsMainBar) is the bar
            railCollapsed={rail}
            pageName="docs"
            header={<ShellBar topLinks={topLinks} />}
            sideBar={
              // 🗂️ the compact sidebar (P8) + the version switcher (P9) + the outlined `<<` collapse
              <AbSidebar
                sections={sections}
                collapsed={rail}
                onCollapsedChange={setRail}
                density="compact"
                activeShape="rounded"
                badgeVariant="text"
                collapseButtonVariant="outlined"
                header={<AbVersionSwitcher label={labels.docs} version={labels.version} />}
                labels={{ nav: labels.sidebar, collapse: labels.collapse, expand: labels.expand }}
              />
            }
            // 📱 no pill, 25px icons, translucent + blur (P18)
            navBar={<AbNavbar items={bottomTabs} label={labels.bottomBar} indicator="none" blur />}
          >
            {children}
          </AbAppLayout>
        </AbPageProvider>
      </ShellContext.Provider>
    </AbLinkProvider>
  );
}
