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
* @name: abElements Home Aside
* @file: components/app/home-aside/index.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <HomeAside items={[{ id: 'overview', label: 'Overview' }]} title="On this page" />
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


'use client';

// 📑 Home's "On this page" pane: the packaged aside layout (core 0.2.0) + AbToc with its footer (components 0.1.14)
// driven by useAbScrollSpy & scrollToAbSection (hooks 0.1.7). Composition only 🧩.

// import the packaged aside pane from `ab-nextjs-core` 🧱
import AbAsideLayout from 'ab-nextjs-core/ab-aside-layout';
// import the packaged table of contents from `ab-nextjs-components` 📑
import AbToc, { type AbTocItem } from 'ab-nextjs-components/ab-toc';
// import the scroll spy & the smooth (reduced-motion safe) section scroll from `ab-nextjs-hooks` 🔭
import { scrollToAbSection, useAbScrollSpy } from 'ab-nextjs-hooks/useAbScrollSpy';
// import React's state & effect hooks ⚛️
import { useEffect, useState } from 'react';
// import the page state (the main pane's own scroller) from `ab-nextjs-core` 📜
import { useAbPage } from 'ab-nextjs-core/ab-page-provider';
// import the DOM lookup for the main scroller from `ab-nextjs-components` 🔎 (effects only)
import { getAbMainScroller } from 'ab-nextjs-components/ab-toc';
// import the packaged link, icon, chip & card for the TOC extras (fidelity spec §4) 🔗
import { AbLink } from 'ab-nextjs-components/ab-link';
import AbIcon from 'ab-nextjs-components/ab-icon';
import AbChip from 'ab-nextjs-components/ab-chip';
import AbCard from 'ab-nextjs-components/ab-card';


// 🧾 the props of `HomeAside`
export type HomeAsideProps = Readonly<{
  items: AbTocItem[]; // 📑 the sections
  title: string; // 🏷️ "On this page"
  links: { edit: { href: string; label: string }; changelog: { href: string; label: string } }; // 🔗 the TOC extras (spec §4)
  promo: { kind: string; title: string; body: string }; // 🆕 the "New" card
}>;


/**
 * `HomeAside` - Client Component 📑
 *
 * @param { HomeAsideProps } props - the TOC items (section ids + labels) & the title
 * @returns { ReactElement }
 */
export default function HomeAside({ items, title, links, promo }: HomeAsideProps) {
  // 📜 the main pane scrolls on its own (the page never does), so it's the spy root & the scroll container
  const { mainScrollElement } = useAbPage();
  // 🔎 fallback: look the scroller up in the DOM after mount (never during render / SSR)
  const [foundScroller, setFoundScroller] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (mainScrollElement) return; // ✅ already published
    const frame = requestAnimationFrame(() => setFoundScroller(getAbMainScroller())); // 🖼️ after paint
    return () => cancelAnimationFrame(frame); // 🧹
  }, [mainScrollElement]);
  // 🎯 the published scroller wins, the DOM lookup fills the gap
  const scroller = mainScrollElement ?? foundScroller;
  // 🔭 the section currently in view (first one before any scroll, the last one at the bottom)
  const activeId = useAbScrollSpy(items.map((item) => item.id), {
    root: scroller,
    lastAtBottom: true,
    initialId: items[0]?.id ?? null,
  });

  // return the aside pane
  return (
    // 🫥 no asideHeader / asideBar = 0px (one banner per page ♿)
    <AbAsideLayout orientation="vertical" pageName="home">
      {/* 📑 On this page (plain #id links without JS) + the extras in AbToc's own footer slot (components 0.1.14, P14):
          the package draws the 1px rule & the 12.5px link style; we only pass packaged links + the promo card 🧩 */}
      <AbToc
        items={items}
        activeId={activeId}
        label={title}
        onNavigate={(id) => scrollToAbSection(id, { container: scroller, updateHash: true })}
        footer={
          <>
            <AbLink href={links.edit.href} target="_blank" rel="noopener"><AbIcon name="github" size={15} />{links.edit.label}</AbLink>
            <AbLink href={links.changelog.href} target="_blank" rel="noopener"><AbIcon name="north_east" size={15} />{links.changelog.label}</AbLink>
            {/* 🆕 the "New" promo card */}
            <AbCard as="div" eyebrow={<AbChip size="sm" shape="rounded" tone="accent">{promo.kind}</AbChip>} title={promo.title} description={promo.body} />
          </>
        }
      />
    </AbAsideLayout>
  );
}
