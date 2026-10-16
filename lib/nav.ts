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
* @name: abElements Docs Navigation
* @file: lib/nav.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> const sections = readyNavSections(DOCS_NAV) // only what's built 🧭
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧭 The docs shell navigation data (0.2.21 scaffolding): app bar links, sidebar sections and bottom-bar tabs.
// Labels are `Shell.*` message keys (never raw text 🌍). Icons are AbIcons names; some only land in icons 0.2.4 (G49),
// so nothing renders them yet. `ready: false` hides an item until its page exists (D26: no 404s from the main nav).

// 🔗 a link of the shell (top link, sidebar item or bottom-bar tab)
export type ShellNavLink = Readonly<{
  id: string; // 🆔 stable id (tests, analytics)
  href: string; // 🔗 the locale-free path (the locale-aware `Link` adds `/fr`, `/es`... 🌍)
  label: string; // 🏷️ the `Shell` message key
  icon?: string; // 🖼️ the AbIcons name (outlined; filled when active)
  ready: boolean; // ✅ the page is built (D26)
}>;

// 🔘 a button tab (Search opens the palette from P5, until then it links to `/docs`, D24)
export type ShellNavButton = Omit<ShellNavLink, 'href'> & Readonly<{ kind: 'button'; fallbackHref: string }>;

// 🗂️ a sidebar section
export type ShellNavSection = Readonly<{ id: string; label: string; items: readonly ShellNavLink[] }>;


// 🔝 the app-bar top links (laptop+)
export const TOP_LINKS: readonly ShellNavLink[] = [
  { id: 'docs', href: '/docs', label: 'nav.docs', ready: false },
  { id: 'packages', href: '/#packages', label: 'nav.packages', ready: true },
  { id: 'guides', href: '/docs/guides', label: 'nav.guides', ready: false },
  { id: 'changelog', href: '/changelog', label: 'nav.changelog', ready: false },
];

// 🏠 the sidebar's first row
export const SIDEBAR_HOME: ShellNavLink = { id: 'home', href: '/', label: 'sidebar.home', icon: 'home', ready: true };

// 🗂️ the sidebar sections (tablet+)
export const SIDEBAR_SECTIONS: readonly ShellNavSection[] = [
  {
    id: 'gettingStarted', label: 'sidebar.sections.gettingStarted', items: [
      { id: 'introduction', href: '/docs/getting-started', label: 'sidebar.items.introduction', icon: 'article', ready: false },
      { id: 'installation', href: '/docs/installation', label: 'sidebar.items.installation', icon: 'download', ready: false },
      { id: 'quickStart', href: '/docs/quick-start', label: 'sidebar.items.quickStart', icon: 'school', ready: false },
    ],
  },
  // 📦 the 8 package rows are built from `lib/packages.ts` (name + version badge), so they're not listed here
  { id: 'packages', label: 'sidebar.sections.packages', items: [] },
  {
    id: 'guides', label: 'sidebar.sections.guides', items: [
      { id: 'themingDarkMode', href: '/docs/guides/theming', label: 'sidebar.items.themingDarkMode', icon: 'dark_mode', ready: false },
      { id: 'iconsFonts', href: '/docs/guides/icons-fonts', label: 'sidebar.items.iconsFonts', icon: 'interests', ready: false },
      { id: 'pwaShell', href: '/docs/guides/pwa-shell', label: 'sidebar.items.pwaShell', icon: 'deployed_code', ready: false },
    ],
  },
];

// 📱 the bottom-bar tabs (mobile): Home · Docs · Search · Profile
export const BOTTOM_TABS: readonly (ShellNavLink | ShellNavButton)[] = [
  { id: 'home', href: '/', label: 'bottomBar.home', icon: 'home', ready: true },
  { id: 'docs', href: '/docs', label: 'bottomBar.docs', icon: 'article', ready: false },
  // 🔎 D24 (a): no palette before P5, so it falls back to `/docs`
  { id: 'search', kind: 'button', fallbackHref: '/docs', label: 'bottomBar.search', icon: 'search', ready: false },
  // 👤 D25 (a): shown disabled ("coming soon") until auth (P7)
  { id: 'profile', href: '/profile', label: 'bottomBar.profile', icon: 'person', ready: false },
];


/**
 * `readyNavSections` - drop the unbuilt items (D26) 🧹
 *
 * Keeps every section, but only its `ready` items. Sections left empty are kept only when `keepEmpty`
 * lists them (e.g. `packages`, which is filled from `lib/packages.ts`).
 *
 * @param { readonly ShellNavSection[] } sections - the sidebar sections
 * @param { readonly string[] } keepEmpty - the section ids to keep even when empty
 * @returns { ShellNavSection[] }
 */
export function readyNavSections(sections: readonly ShellNavSection[], keepEmpty: readonly string[] = ['packages']): ShellNavSection[] {
  return sections
    .map((section) => ({ ...section, items: section.items.filter((item) => item.ready) })) // ✅ only ready items
    .filter((section) => section.items.length > 0 || keepEmpty.includes(section.id)); // 🗂️ no empty headers
}
