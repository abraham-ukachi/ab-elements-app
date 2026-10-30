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
* @name: abElements 404 - Client Islands
* @file: components/app/not-found/islands.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <NotFoundDidYouMean /> · <NotFoundSearch label={t('search')} />
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


'use client';

// 🏝️ The 404 page's two client islands (0.2.22), composed ONLY of packaged pieces 🧩:
//   💡 `NotFoundDidYouMean` — the requested path + the closest route (AbChip, mono), hidden when nothing is close;
//   🔎 `NotFoundSearch` — the big "Search docs… ⌘K" field (AbSearchTrigger) that opens the shell's search drawer.
// Everything else on the 404 renders on the server (no JS shipped for it) ⚡.

// import the client translations (rich `<link>` tag) from `ab-nextjs-i18n` 🌐
import { useAbTranslations } from 'ab-nextjs-i18n';
// import the packaged chip, link & search field from `ab-nextjs-components` 🧩
import AbChip from 'ab-nextjs-components/ab-chip';
import { AbLink } from 'ab-nextjs-components/ab-link';
import AbSearchTrigger from 'ab-nextjs-components/ab-search-trigger';

// import the locale-free pathname (what the visitor typed, without `/fr`, `/es`…) 🌍
import { usePathname } from '@/i18n/navigation';
// import the shell's one-drawer-at-a-time state (Search → the search drawer) 🗄️
import { useShellDrawer } from '@/components/app/docs-shell';
// import the "Did you mean …?" matcher 💡
import { closestRoute } from '@/lib/not-found';


/**
 * `NotFoundDidYouMean` - Client Component 💡
 *
 * `/docs/componnets · Did you mean /#package-components?` — only when a route is close enough (else nothing).
 *
 * @returns { ReactElement | null }
 */
export function NotFoundDidYouMean() {
  // 🧭 the path that 404'd, without the locale prefix
  const pathname = usePathname();
  // 🌐 the 404 strings
  const t = useAbTranslations('NotFound');
  // 💡 the closest route (or none)
  const match = closestRoute(pathname);
  // 🙈 nothing close enough: no pill at all
  if (!match) return null;
  // return the mono chip: requested path · "Did you mean <link>…</link>?"
  return (
    // ↩️ overflow="wrap": a long path breaks onto lines (the suggestion link must stay readable on a phone 📱)
    <AbChip mono shape="rounded" overflow="wrap" className="max-w-full">
      {/* 🧾 what was requested (mono, muted) */}
      <code aria-label={`${t('requested')}: ${pathname}`}>{pathname}</code>
      {/* · a decorative separator */}
      <span aria-hidden="true" className="mx-1.5">·</span>
      {/* 💡 the suggestion, as a locale-aware packaged link (AbLinkProvider adds `/fr`… 🌍) */}
      <span>{t.rich('didYouMean', { path: match.href, link: (chunks) => <AbLink href={match.href}>{chunks}</AbLink> })}</span>
    </AbChip>
  );
}


/**
 * `NotFoundSearch` - Client Component 🔎
 *
 * The full-width "Search docs… ⌘K" field: a click, Enter or ⌘K / Ctrl+K opens the shell's search drawer.
 *
 * @param { { label: string } } props - the (translated) placeholder
 * @returns { ReactElement }
 */
export function NotFoundSearch({ label }: Readonly<{ label: string }>) {
  // 🗄️ the shell's drawer state
  const { setOpen } = useShellDrawer();
  // return the packaged big field (size="lg": 44px, 440px wide, full width on a phone 📏; its ⌘K cap like the mock ⌨️)
  return <AbSearchTrigger size="lg" variant="field" label={label} onOpen={() => setOpen('search')} hotkey />;
}
