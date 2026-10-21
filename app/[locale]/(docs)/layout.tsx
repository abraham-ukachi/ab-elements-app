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
* @name: abElements Docs Shell - Layout
* @file: app/[locale]/(docs)/layout.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> // wraps `/`, `/fr`, ... (and the package pages later)
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧭 The `(docs)` shell layout (0.2.21–0.2.22): translates every label on the server, resolves the nav data
// (lib/nav + lib/packages, D26: only built pages) and hands them to the packaged shell (`DocsShell`) 🧩.
// The skip link stays first ♿.

// REACT types
import type { ReactNode } from 'react';

// import the server-side translations helper from `ab-nextjs-i18n` 🌐
import { getAbTranslations } from 'ab-nextjs-i18n/server';

// import the packaged-only docs shell 🧭
import DocsShell from '@/components/app/docs-shell';
// import the nav & package data 🗂️📦
import { BOTTOM_TABS, SIDEBAR_HOME, SIDEBAR_SECTIONS, TOP_LINKS, readyNavSections } from '@/lib/nav';
import { getAbPackages, getAbPackageSymbols } from '@/lib/packages';
import { PACKAGE_ICONS, SHELL_ICONS } from '@/lib/shell-icons';
// import the packaged, server-safe icon registration (components 0.1.13) 🔣
import AbIconRegistrar from 'ab-nextjs-components/ab-icon/registrar';
// import the locale endonyms (shared with the Welcome globe) 🗣️
import { WELCOME_LOCALES } from '@/app/[locale]/welcome/welcome';
// import the app version (the "v0.2.x" version switcher, D23 (a)) 🏷️
import appPackage from '@/package.json';


// create the props type of the docs layout as `DocsLayoutProps`
type DocsLayoutProps = Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>;


/**
 * `DocsLayout` - Layout 🧭
 *
 * @param { DocsLayoutProps } props - the layout props (`children` & the `locale` param)
 * @returns { Promise<ReactElement> }
 */
export default async function DocsLayout({ children, params }: DocsLayoutProps) {
  // 🌍 the current locale
  const { locale } = await params;
  // get the translations of the `Shell` messages 🌐
  const t = await getAbTranslations('Shell');
  // the theme labels still live in `Welcome.theme` (D30 moves them to `Common` later) 🌗
  const tw = await getAbTranslations('Welcome');
  // the package one-liners (the search drawer's descriptions) live in `Home.packages` 📦
  const th = await getAbTranslations('Home');
  // 🔑 lib/nav keys are plain strings (checked by tests/unit/shell-data.test.ts), so widen them once
  const tk = (key: string): string => t(key as Parameters<typeof t>[0]);
  // 📦 the installed packages (real versions, D22)
  const packages = getAbPackages();
  // 🏷️ the real minor for AbVersionSwitcher & the nav drawer chip: "v0.2.x" (D3; no "Docs" label, God 01:27)
  const version = `v${appPackage.version.split('.').slice(0, 2).join('.')}.x`;

  // 🗂️ the sidebar: Home, then the ready sections (packages filled from lib/packages, anchored on Home)
  const sections = [
    { id: 'home', items: [{ href: SIDEBAR_HOME.href, icon: SIDEBAR_HOME.icon, label: tk(SIDEBAR_HOME.label) }] },
    ...readyNavSections(SIDEBAR_SECTIONS).map((section) => ({
      id: section.id,
      label: tk(section.label),
      // 📏 the PACKAGES group uses the 30px rows + 16px icons (spec §4, P8)
      ...(section.id === 'packages' ? { itemSize: 'sm' as const } : {}),
      items: section.id === 'packages'
        // 🏷️ fidelity spec: display names (Fonts, Icons…) + the real version; the mono `ab-nextjs-*` name stays on the cards
        ? packages.map((pkg) => ({ href: `/#package-${pkg.id}`, icon: PACKAGE_ICONS[pkg.id], label: pkg.title, badge: pkg.versionLabel }))
        : section.items.map((item) => ({ href: item.href, icon: item.icon, label: tk(item.label) })),
    })),
  ];

  // return the skip link + the packaged shell
  return (
    <>
      {/* Skip link ♿ - hidden until focused, then pinned top-left above everything */}
      <a
        href="#main"
        data-ab-part="skipLink"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:bg-(--md-sys-color-surface-container-high) focus:text-(--md-sys-color-on-surface) focus:outline-2 focus:outline-(--md-sys-color-primary)"
      >
        {t('skipToContent')}
      </a>
      {/* 🔣 register the shell icons for the client AbIcon (server-safe, before any icon renders) */}
      <AbIconRegistrar icons={SHELL_ICONS} />
      {/* the packaged shell 🧭 */}
      <DocsShell
        locale={locale}
        locales={WELCOME_LOCALES}
        sections={sections}
        topLinks={TOP_LINKS.filter((link) => link.ready).map((link) => ({ href: link.href, label: tk(link.label) }))}
        // 📱 Home · Packages · Search · Profile; the shell wires the two buttons (Search → search drawer, Profile → Settings)
        bottomTabs={BOTTOM_TABS.map((tab) => ('kind' in tab
          ? { kind: 'button' as const, id: tab.id, icon: tab.icon ?? 'search', label: tk(tab.label) }
          : { kind: 'link' as const, href: tab.href, icon: tab.icon ?? 'home', label: tk(tab.label) }))}
        // 🔎 what the search drawer searches (the 8 packages + the sidebar pages), already translated
        searchIndex={{
          packages: packages.map((pkg) => ({ id: pkg.id, href: `/#package-${pkg.id}`, title: pkg.title, name: pkg.name, description: th(`packages.${pkg.id}.desc`), meta: pkg.versionLabel, icon: PACKAGE_ICONS[pkg.id] })),
          // 🧩 the exported components & hooks, grouped by package ("button" → AbButton · ab-nextjs-components)
          symbols: packages.map((pkg) => ({ id: pkg.id, label: pkg.title, meta: pkg.name, items: getAbPackageSymbols(pkg.id).map((symbol) => ({ id: `${pkg.id}-${symbol}`, href: `/#package-${pkg.id}`, title: symbol, meta: pkg.versionLabel, icon: PACKAGE_ICONS[pkg.id] })) })),
          pages: sections.filter((section) => section.id !== 'packages').flatMap((section) => section.items.map((item) => ({ id: `page-${item.href}`, href: item.href, title: item.label, icon: item.icon }))),
        }}
        labels={{
          brand: t('brandLabel'), nav: t('nav.primary'), more: t('nav.more'), sidebar: t('sidebar.label'),
          collapse: t('sidebar.collapse'), expand: t('sidebar.expand'), version, bottomBar: t('bottomBar.label'),
          search: t('search.placeholder'), searchShort: t('search.short'), searchComingSoon: t('search.comingSoon'),
          asideOpen: t('aside.toggleOpen'), asideClose: t('aside.toggleClose'), language: t('language.label'), github: t('github'), breadcrumbs: t('breadcrumbs'),
          theme: { group: tw('theme.label'), light: tw('theme.light'), dark: tw('theme.dark'), system: tw('theme.system') },
        }}
      >
        {children}
      </DocsShell>
    </>
  );
}
