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

// 🧭 The docs shell (0.2.21–0.2.22, Home fidelity + drawers v2): composition ONLY of packaged pieces (no app-local UI).
// AbLinkProvider (locale-aware links 🌍) → AbPageProvider (aside state 📑) → AbAppLayout panes (core 🧱: 768 / 1180 / 1920,
// `tabletHeader="main"` + `mobileHeader="main"`) with the compact AbAppBar (laptop+), AbSidebar, the blurred AbNavbar
// (mobile 📱) and John's approved drawers (God 01:22 / 01:27):
//   ⚙️ AbSettingsDrawer (theme + language) · ⬅️ AbNavDrawer (the mobile sidebar, left edge swipe) · 🔎 AbSearchDrawer.
//   ➡️ AbTocDrawer belongs to the page that has an aside (Home's HomeAside renders it + the right edge swipe ≤ 1179px,
//      God 02:44); the shell only keeps the one-drawer-at-a-time state (`useShellDrawer`) and the tablet `<<` toggle.
//   👤 AbSidebar's `profile` = AbSidebarProfileButton at the bottom left (≥ 1180px), which opens its own Settings drawer.
//   ↩️ Every drawer returns focus to the header logo by itself (components 0.2.1 AB_DRAWER_RETURN_FOCUS): no overrides.
// Each page puts `<DocsMainBar>` in its AbMainLayout `mainHeader`: the mobile header below 768, the tablet bar 768–1179 📟.

// REACT
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
// NEXT (a plain router: `localizeAbPathname` already returns the prefixed path)
import { useRouter } from 'next/navigation';

// import the packaged layout pieces from `ab-nextjs-core` 🧱
import AbAppLayout from 'ab-nextjs-core/ab-app-layout';
import AbPageProvider from 'ab-nextjs-core/ab-page-provider';
// import the packaged UI from `ab-nextjs-components` 🧩
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
// import the drawers v2 pieces (components 0.2.0) 🗄️
import AbMobileHeader from 'ab-nextjs-components/ab-mobile-header';
import AbSettingsDrawer, { type AbSettingsTheme } from 'ab-nextjs-components/ab-settings-drawer';
import AbNavDrawer from 'ab-nextjs-components/ab-nav-drawer';
import AbSearchDrawer, { type AbSearchDrawerGroup } from 'ab-nextjs-components/ab-search-drawer';
import { useAbEdgeSwipe } from 'ab-nextjs-components/ab-drawer';
// import the client icon registry + the Settings drawer's `settings` glyph (it isn't in AbIcon's built-in set) 🗂️⚙️
import { registerAbIcons } from 'ab-nextjs-components/ab-icon';
import settings from 'ab-nextjs-icons/ab-icons/icons/settings';
// import the ONE theme engine every toggle shares (so the pill, the mobile icon & Settings never disagree) 🌗
import { useAbThemeMode } from 'ab-nextjs-hooks/useAbTheme';
// import the client translations & the localized pathname helper from `ab-nextjs-i18n` 🌐
import { useAbTranslations } from 'ab-nextjs-i18n';
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
  version: string; bottomBar: string; search: string; searchShort: string; searchComingSoon: string;
  asideOpen: string; asideClose: string; language: string; github: string; breadcrumbs: string;
  theme: { group: string; light: string; dark: string; system: string };
}>;

// 🔎 one searchable entry (a package or a sidebar page), already translated
export type DocsSearchEntry = Readonly<{ id: string; href: string; title: string; name?: string; description?: string; meta?: string; icon?: string }>;

// 🧩 one package's exported components & hooks (a search group)
export type DocsSearchSymbols = Readonly<{ id: string; label: string; meta?: string; items: readonly DocsSearchEntry[] }>;

// 🧾 the props of `DocsShell`
export type DocsShellProps = Readonly<{
  locale: string; // 🌍 the current locale
  labels: DocsShellLabels; // 🏷️
  locales: readonly AbLocaleOption[]; // 🗣️ code + endonym
  sections: AbSidebarSection[]; // 🗂️ resolved sidebar sections (lib/nav + lib/packages)
  topLinks: { href: string; label: string }[]; // 🔝 ready app-bar links (D26)
  bottomTabs: AbNavbarItem[]; // 📱 bottom-bar items (the `search` & `profile` buttons are wired here)
  searchIndex: Readonly<{ packages: readonly DocsSearchEntry[]; symbols: readonly DocsSearchSymbols[]; pages: readonly DocsSearchEntry[] }>; // 🔎
  children: ReactNode; // 📄 the page (AbMainLayout + AbAsideLayout)
}>;

// 🗄️ which drawer is open (only one at a time, drawer spec "Z-order")
export type OpenDrawer = '' | 'settings' | 'nav' | 'search' | 'toc';

// 🧠 what the main bar (a page's `mainHeader`) needs from the shell
type ShellContextValue = Readonly<{
  locale: string; labels: DocsShellLabels; locales: readonly AbLocaleOption[];
  theme: ReturnType<typeof useAbThemeMode>; // 🌗 the shared engine
  open: OpenDrawer; setOpen: (next: OpenDrawer) => void; // 🗄️
}>;
const ShellContext = createContext<ShellContextValue | null>(null);

// 🆔 the page outline drawer's id (the tablet `<<` toggle's aria-controls target)
export const TOC_DRAWER_ID = 'ab-toc-drawer';


/**
 * `useShell` - the shell context, or a loud dev error 🧠
 *
 * @returns { ShellContextValue }
 */
function useShell(): ShellContextValue {
  const shell = useContext(ShellContext);
  if (!shell) throw new Error('DocsMainBar must render inside DocsShell'); // 🚨 dev mistake, not a user state
  return shell;
}


/**
 * `useShellDrawer` - the shell's one-drawer-at-a-time state, for a page's own drawer (Home's AbTocDrawer) 🗄️
 *
 * @returns { { open: OpenDrawer; setOpen: (next: OpenDrawer) => void } }
 */
export function useShellDrawer(): Readonly<{ open: OpenDrawer; setOpen: (next: OpenDrawer) => void }> {
  const { open, setOpen } = useShell();
  return { open, setOpen };
}


/**
 * `useIsMobile` - true below 768px (after mount; false on the server and without JS) 📱
 *
 * @returns { boolean }
 */
function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)'); // 📐 core's mobile breakpoint
    const sync = () => setMobile(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync); // 🧹
  }, []);
  return mobile;
}


/**
 * `editDistance` - Levenshtein distance, for the search drawer's "Did you mean …?" 💡
 *
 * @param { string } a - one word
 * @param { string } b - the other
 * @returns { number }
 */
function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const keep = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = keep;
    }
  }
  return row[b.length];
}


/**
 * `AsideToggle` - the tablet `<<` (768–1179): opens the page outline drawer, the aside's only form below 1180 📑
 *
 * @returns { ReactElement }
 */
function AsideToggle() {
  // 🧠 the open / close labels & the drawer state
  const { labels, open, setOpen } = useShell();
  const expanded = open === 'toc';
  return (
    <AbIconButton
      icon={expanded ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}
      iconSize={20}
      label={expanded ? labels.asideClose : labels.asideOpen}
      aria-expanded={expanded}
      aria-controls={TOC_DRAWER_ID}
      onClick={() => setOpen(expanded ? '' : 'toc')}
    />
  );
}


/**
 * `ThemePill` - the 2-state pill with a raised thumb, on the shared theme engine 🌗
 *
 * @returns { ReactElement }
 */
function ThemePill() {
  const { labels, theme } = useShell();
  return (
    <AbThemeToggle variant="segmented" appearance="thumb" size="sm" modes={['light', 'dark']} value={theme.mode as 'light' | 'dark'} onChange={theme.setMode} labels={labels.theme} />
  );
}


/**
 * `DocsMainBar` - Client Component 📟: a page's AbMainLayout `mainHeader`. Core shows it below 1180 only
 * (`mobileHeader="main"` + `tabletHeader="main"`), and hides the app bar there.
 *   📱 < 768: AbMobileHeader (logoname · globe → Settings with the language list · theme), no search (the tab has it)
 *   📟 768–1179: crumb · grow · search · globe · theme pill · GitHub · divider · `<<` (spec §3)
 *
 * @param { { crumbs: AbBreadcrumbItem[]; asideToggle?: boolean } } props - the breadcrumb trail (last = current page)
 *   & whether the page has an outline for the `<<` toggle (default true; the 404 has none, 0.2.22 🤷🏽‍♂️)
 *   & `mobileSearch` (the 404 mock): the mobile header shows a "Search ⌘K" pill + the theme icon instead of globe · theme
 * @returns { ReactElement }
 */
export function DocsMainBar({ crumbs, asideToggle = true, mobileSearch = false }: Readonly<{ crumbs: AbBreadcrumbItem[]; asideToggle?: boolean; mobileSearch?: boolean }>) {
  // 🧠 the shell
  const { labels, locale, locales, theme, open, setOpen } = useShell();
  // 🌐 the drawer strings
  const t = useAbTranslations('Shell');
  // 🧭 the locale-free path, for the globe menu's other-locale hrefs
  const pathname = usePathname();
  return (
    <>
      {/* 📱 the mobile header (drawer spec "Mobile header") */}
      <div className="contents min-[768px]:hidden">
        <AbMobileHeader
          logo={<AbLink href="/" aria-label={labels.brand}><AbLogo wordmark alt="" size={22} /></AbLink>}
          theme={theme.resolvedTheme === 'dark' ? 'dark' : 'light'}
          // 🌗🌍 the default header: globe · theme (built in); the 404's (mobileSearch) puts both in `actions` instead
          onThemeChange={mobileSearch ? undefined : theme.setMode}
          onLanguage={mobileSearch ? undefined : () => setOpen('settings')}
          // 🔎 404 mock: the 34px "Search ⌘K" pill (opens the search drawer) + the packaged theme icon, in that order
          actions={mobileSearch ? (
            <span className="flex items-center gap-1">
              <AbSearchTrigger size="sm" variant="field" label={labels.searchShort} onOpen={() => setOpen('search')} hotkey={false} />
              <AbThemeToggle variant="icon" modes={['light', 'dark']} value={theme.mode as 'light' | 'dark'} onChange={theme.setMode} labels={labels.theme} />
            </span>
          ) : undefined}
          languageExpanded={open === 'settings'}
          labels={{ language: t('drawers.changeLanguage'), toDark: t('drawers.toDark'), toLight: t('drawers.toLight'), header: t('drawers.mobileHeader') }}
        />
      </div>
      {/* 📟 the tablet bar */}
      <div className="hidden h-full items-center gap-2 pr-3 pl-7 min-[768px]:flex">
        {/* 🍞 Home (no "Docs" crumb, God 01:27) */}
        <AbBreadcrumbs items={crumbs} label={labels.breadcrumbs} />
        <span className="grow" aria-hidden="true" />
        {/* 🔎 the field opens the search drawer (no ⌘K, no hotkey) */}
        <div className="w-[260px]"><AbSearchTrigger variant="field" label={labels.search} onOpen={() => setOpen('search')} hotkey={false} /></div>
        <AbLocaleSwitcher variant="icon" align="end" label={labels.language} current={locale} locales={locales} getHref={(code) => localizeAbPathname(pathname, code, abI18nConfig)} />
        <ThemePill />
        <AbIconButton icon="github" iconSize={20} label={labels.github} href={GITHUB_URL} />
        {/* ➖ 1×20 divider + the outline toggle, only when the page has an outline drawer (no dead `<<` on the 404 🚫) */}
        {asideToggle && <span aria-hidden="true" className="mx-1 h-5 w-px bg-(--ab-color-div)" />}
        {asideToggle && <AsideToggle />}
      </div>
    </>
  );
}


// 🗂️ register the shell's extra glyphs once, at module load (server render AND browser: same set, no hydration
//    diff, no Material font fallback). `brightness_auto` (the drawer's System theme) has no AbIcons svg yet 🚧
registerAbIcons({ settings });


/**
 * `ShellBar` - the app bar (laptop & desktop; core hides it below 1180) 🔝
 *
 * @param { { topLinks: { href: string; label: string }[] } } props - the ready app-bar links
 * @returns { ReactElement }
 */
function ShellBar({ topLinks }: Readonly<{ topLinks: { href: string; label: string }[] }>) {
  // 🧠 the shell
  const { labels, locale, locales, setOpen } = useShell();
  // 🧭 the locale-free path, for the globe menu's other-locale hrefs
  const pathname = usePathname();
  return (
    <AbAppBar
      density="compact" // 📏 60 / 64px, 13.5px links, 236 / 270 brand column
      divider // ➖ the 1×20 rule before GitHub
      moreMenu={false} // 🚫 no `⋮`
      brand={<AbLink href="/" aria-label={labels.brand}><AbLogo wordmark alt="" size={22} /></AbLink>}
      // 🔎 the 300 / 360 field opens the search drawer (drawer spec §4: no shortcut hint anywhere)
      search={<AbSearchTrigger variant="field" label={labels.search} onOpen={() => setOpen('search')} hotkey={false} />}
      nav={topLinks}
      labels={{ nav: labels.nav, more: labels.more }}
      // 🎯 spec order: [nav] · divider · GitHub · globe · theme pill
      actions={
        <>
          <AbIconButton icon="github" iconSize={20} label={labels.github} href={GITHUB_URL} />
          <AbLocaleSwitcher variant="icon" align="end" label={labels.language} current={locale} locales={locales} getHref={(code) => localizeAbPathname(pathname, code, abI18nConfig)} />
          <ThemePill />
        </>
      }
    />
  );
}


/**
 * `DocsShell` - Client Component 🧭
 *
 * @param { DocsShellProps } props - see `DocsShellProps`
 * @returns { ReactElement }
 */
export default function DocsShell({ locale, labels, locales, sections, topLinks, bottomTabs, searchIndex, children }: DocsShellProps) {
  // 🗂️ the persisted rail (false = expanded, also the SSR / JS-off state)
  const [rail, setRail] = useSidebarRail();
  // 🌗 ONE theme engine for the pill, the mobile icon & Settings
  const theme = useAbThemeMode('light');
  // 🗄️ the open drawer (one at a time)
  const [open, setOpen] = useState<OpenDrawer>('');
  const close = useCallback(() => setOpen(''), []);
  // 🌐 the drawer strings
  const t = useAbTranslations('Shell');
  // 🧭 locale switch = same page, other locale (a plain router: the path is already prefixed)
  const router = useRouter();
  const pathname = usePathname();
  // 📱 the left edge swipe opens the nav drawer, on phones only, while nothing else is open
  const mobile = useIsMobile();
  useAbEdgeSwipe({ edge: 'left', onOpen: () => setOpen('nav'), enabled: mobile && open === '' });

  // ⚙️ the Settings drawer's data, shared by the mobile drawer & the sidebar profile button
  const settingsLocales = locales.map((l) => ({ code: l.code, label: l.label }));
  const switchLocale = (code: string) => { if (code !== locale) router.replace(localizeAbPathname(pathname, code, abI18nConfig), { scroll: false }); };
  const settingsLabels = {
    title: t('drawers.settings'), theme: t('drawers.theme'), language: t('drawers.language'),
    light: labels.theme.light, dark: labels.theme.dark, system: labels.theme.system,
    close: t('drawers.closeSettings'), expand: t('drawers.expandSettings'), collapse: t('drawers.collapseSettings'),
  };

  // 🔘 the two button tabs: Search → the search drawer · Profile → Settings (drawer spec §1) until accounts (P7)
  const tabs = bottomTabs.map((tab): AbNavbarItem => {
    if (tab.kind !== 'button') return tab;
    if (tab.id === 'search') return { ...tab, onSelect: () => setOpen('search'), expanded: open === 'search' };
    if (tab.id === 'profile') return { ...tab, onSelect: () => setOpen('settings'), expanded: open === 'settings' };
    return tab;
  });

  // ⬅️ the nav drawer = the laptop sidebar's content (versions as mono meta)
  const navSections = useMemo(() => sections.map((section) => ({
    id: section.id ?? section.label ?? 'nav',
    label: section.label,
    items: section.items.map((item) => ({ href: item.href, label: String(item.label ?? ''), icon: item.icon, meta: typeof item.badge === 'string' ? item.badge : undefined })),
  })), [sections]);

  // 🔎 search: packages first, then pages; title, `ab-nextjs-*` name or one-liner contains the query
  const search = useCallback((query: string): AbSearchDrawerGroup[] => {
    const q = query.trim().toLowerCase();
    const hit = (entry: DocsSearchEntry) => [entry.title, entry.name, entry.description].some((text) => text?.toLowerCase().includes(q));
    const groups: AbSearchDrawerGroup[] = [
      // 🧩 one group per package (drawer spec §4: results grouped by package)
      ...searchIndex.symbols.map((group) => ({ id: group.id, label: group.label, meta: group.meta, items: group.items.filter(hit) })),
      { id: 'packages', label: t('drawers.packagesGroup'), items: searchIndex.packages.filter(hit) },
      { id: 'pages', label: t('drawers.sidebarGroup'), items: searchIndex.pages.filter(hit) },
    ];
    return groups.filter((group) => group.items.length > 0);
  }, [searchIndex, t]);
  // 💡 "Did you mean …?": the closest package / page title within 2 edits
  const suggest = useCallback((query: string): string | null => {
    const q = query.trim().toLowerCase();
    const best = [...searchIndex.symbols.flatMap((group) => group.items), ...searchIndex.packages, ...searchIndex.pages]
      .map((entry) => ({ title: entry.title, d: Math.min(editDistance(q, entry.title.toLowerCase()), editDistance(q, entry.title.toLowerCase().replace(/^(ab|useab)/, ''))) }))
      .sort((a, b) => a.d - b.d)[0];
    return best && best.d > 0 && best.d <= 2 ? best.title : null;
  }, [searchIndex]);

  // return the shell
  return (
    // 🔗 every packaged link becomes locale-aware (G42); `locales` lets the sidebar & navbar strip `/fr` themselves 🌍
    <AbLinkProvider component={Link} locales={abI18nConfig.locales}>
      <ShellContext.Provider value={{ locale, labels, locales, theme, open, setOpen }}>
        {/* 📑 the aside (On this page) state, open by default from 1180 */}
        <AbPageProvider defaultAsideOpen asideId="ab-aside">
          {/* 🧱 the 4-breakpoint panes */}
          <AbAppLayout
            orientation="vertical"
            variant="panes"
            tabletHeader="main" // 📟 768–1179: the page's `mainHeader` (DocsMainBar) is the bar
            mobileHeader="main" // 📱 < 768: no app header either, the mainHeader is AbMobileHeader (drawers v2)
            railCollapsed={rail}
            pageName="docs"
            header={<ShellBar topLinks={topLinks} />}
            sideBar={
              // 🗂️ the compact sidebar + the version switcher (no "Docs" label, God 01:27) + the tablet logo row
              <AbSidebar
                sections={sections}
                collapsed={rail}
                onCollapsedChange={setRail}
                density="compact"
                activeShape="rounded"
                badgeVariant="text"
                collapseButtonVariant="outlined"
                logo={<AbLink href="/" aria-label={labels.brand}><AbLogo wordmark alt="" size={22} /></AbLink>}
                header={<AbVersionSwitcher version={labels.version} />}
                // 👤 bottom left (≥ 1180): signed out (the profile glyph) until real auth exists; opens Settings
                profile={{
                  user: null,
                  theme: theme.mode as AbSettingsTheme,
                  onThemeChange: theme.setMode,
                  locales: settingsLocales,
                  locale,
                  onLocaleChange: switchLocale,
                  labels: settingsLabels,
                }}
                labels={{ nav: labels.sidebar, collapse: labels.collapse, expand: labels.expand, profile: t('drawers.profile') }}
              />
            }
            // 📱 Home · Packages · Search · Profile: no pill, 25px icons, translucent + blur
            navBar={<AbNavbar items={tabs} label={labels.bottomBar} indicator="none" blur />}
          >
            {children}
          </AbAppLayout>

          {/* ⚙️ Settings: theme + language, the 70% sheet (globe, Profile, the nav drawer's Settings row) */}
          <AbSettingsDrawer
            open={open === 'settings'}
            onClose={close}
            theme={theme.mode as AbSettingsTheme}
            onThemeChange={theme.setMode}
            locales={settingsLocales}
            locale={locale}
            onLocaleChange={switchLocale}
            labels={settingsLabels}
          />
          {/* ⬅️ the mobile sidebar (left edge swipe); "Settings ›" closes it, then raises Settings */}
          <AbNavDrawer
            open={open === 'nav'}
            onClose={close}
            logo={<AbLink href="/" aria-label={labels.brand}><AbLogo wordmark alt="" size={22} /></AbLink>}
            version={labels.version}
            sections={navSections}
            activeHref={pathname}
            footer={[{ href: '/#whats-new', label: topLinks.find((link) => link.href === '/#whats-new')?.label ?? 'Changelog', icon: 'north_east' }]}
            onSettings={() => setTimeout(() => setOpen('settings'), 0)}
            labels={{ title: t('drawers.siteNav'), close: t('drawers.closeNav'), settings: t('drawers.settings') }}
          />
          {/* 🔎 search (the Search tab, the tablet / laptop field) */}
          <AbSearchDrawer
            open={open === 'search'}
            onClose={close}
            search={search}
            suggest={suggest}
            labels={{
              title: t('drawers.search'), close: t('drawers.closeSearch'), placeholder: t('drawers.searchPlaceholder'),
              clear: t('drawers.clearSearch'), recent: t('drawers.recent'), remove: (term) => t('drawers.remove', { term }),
              results: (count) => t('drawers.results', { count }), noResults: t('drawers.noResults'),
              noResultsFor: (query) => t('drawers.noResultsFor', { query }), hint: t('drawers.hint'), didYouMean: t('drawers.didYouMean'),
            }}
          />
        </AbPageProvider>
      </ShellContext.Provider>
    </AbLinkProvider>
  );
}
