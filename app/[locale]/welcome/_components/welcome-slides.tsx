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
* @name: abElements Welcome Slides
* @file: app/[locale]/welcome/_components/welcome-slides.tsx
* @type: TypeScript (React, client)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <WelcomeSlides slides={slides} labels={labels} mobileHeader={mobileHeader} /> // 🧱 core's AbMainLayout inside a HEADLESS carousel (0.2.3)
*    -|> 
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


'use client';

// 🎞️ Welcome slides: the client half of the Welcome (composition only, no app-local UI).
// Every piece comes from `ab-nextjs-components/ab-carousel`; this file only wires the
// `?s=` URL state, the Skip shortcut (→ s09 + focus its title ♿) and the frame rows 🧩.

// import the React hooks we need (state, effects, stable callbacks) ⚛️
import { useCallback, useEffect, useState, type ReactNode } from 'react';

// import the packaged carousel + its parts + its hook from `ab-nextjs-components` 🎠
import {
  AbCarouselProvider, // 🧠 0.2.3: the carousel state WITHOUT an element (so it no longer wraps <main>)
  AbCarouselStatus, // 📣 0.2.3: the polite live region ("Slide 3 of 9: …"), once, inside our region
  useAbCarouselRegion, // 🧷 0.2.3: the region attributes, spread on OUR element
  AbCarouselCounter, // 🔢 `02 / 09`
  AbCarouselDots, // ⚫ the 9 dots
  AbCarouselNext, // ⏭️ next arrow
  AbCarouselPrev, // ⏮️ back arrow
  AbCarouselSlide, // 🖼️ one slide (role=group)
  AbCarouselTrack, // 🛤️ the slides' track
  useAbCarousel, // 🪝 read the carousel state from inside it
  type AbCarouselChange, // 🧾 why the index changed (next, dot, skip...)
} from 'ab-nextjs-components/ab-carousel';
// import the packaged (client) button from `ab-nextjs-components` (the Skip button) 🔘
import AbButton from 'ab-nextjs-components/ab-button';
// import the packaged main pane (core 0.2.x layout rule: header · ONE scroller · bar, empty slots = 0px) 🧱
import AbMainLayout from 'ab-nextjs-core/ab-main-layout';
// import the page state: the main pane's own scroller (reset to the top on every slide change) 📜
import { useAbPage } from 'ab-nextjs-core/ab-page-provider';
// import the class names helper 🏷️
import clsx from 'clsx';

// import the mobile header (AbMobileHeader + the language sheet), below 768px 📱
import WelcomeMobileHeader, { type WelcomeMobileHeaderData } from './welcome-mobile-header';

// import every Welcome-only style 🎨
import styles from '../welcome.module.css';


// ===== WELCOME SLIDES - TYPES ===== //

// one slide handed over by the server `Welcome` 🖼️
export interface WelcomeSlideData {
  id: string; // 🆔 `s01` → `s09`
  title: string; // 🏷️ plain-text title (dots + live announcement)
  content: ReactNode; // 🧩 the slide's server-rendered markup
}

// every (already translated) label of the client half 🌐
export interface WelcomeSlidesLabels {
  carousel: string; // 🎠 region name ("Introduction to AbElements")
  skip: string; // ⏩ "Skip"
  back: string; // ⏮️ "Previous slide"
  next: string; // ⏭️ "Next slide"
  slide: string; // 🖼️ "{n} of {total}" pattern
  goTo: string; // ⚫ "Go to slide {n}: {title}" pattern
  announce: string; // 📣 "Slide {n} of {total}: {title}" pattern
  counter: string; // 🔢 "{current} / {total}" pattern
  mainContent: string; // ⌨️ the focusable main scroller's name (core 0.2.3 `scrollerLabel`)
}

// the props of `WelcomeSlides` 🧾
interface WelcomeSlidesProps {
  slides: readonly WelcomeSlideData[]; // 🎞️ the 9 slides
  labels: WelcomeSlidesLabels; // 🌐 the labels
  mobileHeader: WelcomeMobileHeaderData; // 📱 logo, locales + labels of the phone header
}


// ===== WELCOME SLIDES - HELPERS ===== //

// fill an ICU-like `{name}` pattern with values (the server already translated the pattern) 🧩
export function fillWelcomePattern(pattern: string, values: Record<string, string | number>): string {
  // replace every `{key}` by its value (unknown keys stay as they are) 🔁
  return pattern.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

// two-digit numbers (`02`, `09`) for the counter 🔢
const pad = (n: number): string => String(n).padStart(2, '0');

// read the 0-based slide index from `?s=` (1-based in the URL), clamped to the slides 🔗
export function readWelcomeSlideParam(search: string, count: number): number {
  // parse `?s=3` → 3
  const raw = Number(new URLSearchParams(search).get('s'));
  // invalid / missing ? start at the first slide 🌱
  if (!Number.isInteger(raw) || raw < 1) return 0;
  // clamp to the last slide and turn it 0-based 📏
  return Math.min(raw, count) - 1;
}


// ===== WELCOME SLIDES - PARTS (composition of the packaged hook + button) ===== //

/** ⏩ Skip: jumps to the last slide with the `'skip'` reason (hidden on s09). */
function WelcomeSkip({ label }: { label: string }) {
  // read the carousel state 🪝
  const { index, count, goTo } = useAbCarousel();
  // s09: no Skip at all 🙈
  if (index >= count - 1) return null;
  // the packaged text button 🔘
  return <AbButton type="text" label={label} className={styles.skip} onClick={() => goTo(count - 1, 'skip')} />;
}

/** ⏮️⏭️ the arrows: none on s09 (the brief's "no arrows on s09"). */
function WelcomeArrows({ back, next }: { back: string; next: string }) {
  // read the carousel state 🪝
  const { index, count } = useAbCarousel();
  // s09: no arrows 🙈
  if (index >= count - 1) return null;
  // back (aria-disabled on s01) + next (primary filled) 🔘
  return (
    <div className={styles.arrows}>
      <AbCarouselPrev label={back} />
      <AbCarouselNext label={next} hideAtEdge />
    </div>
  );
}


/**
 * `WelcomeScrollReset` - puts the main scroller back at the top whenever the slide changes 📜
 * (the main pane is ONE scroller for every slide now, so a long slide must not leave the next one scrolled)
 *
 * @returns { null }
 */
function WelcomeScrollReset() {
  // 🎠 the active slide
  const { index } = useAbCarousel();
  // 📜 core publishes the main pane's scroller (G55)
  const { mainScrollElement } = useAbPage();
  // ⬆️ back to the top on every change (instant: the slide motion is the transition)
  useEffect(() => { mainScrollElement?.scrollTo({ top: 0 }); }, [index, mainScrollElement]);
  return null;
}


/**
 * `WelcomeRegion` - OUR carousel region (headless mode, 0.2.3) 🧷
 * The packaged region attributes (roledescription, label, keyboard, motion switches) spread on a plain div INSIDE
 * the main scroller, plus the live region. It fills the visible area (a size container: the slides read `100cqh`).
 *
 * @param { { className?: string; children: ReactNode } } props - extra classes + the track (and the 768px+ counter)
 * @returns { ReactElement }
 */
function WelcomeRegion({ className, children }: { className?: string; children: ReactNode }) {
  // 🧷 the attributes the region needs (merge our class with the packaged one)
  const region = useAbCarouselRegion();
  // 🎠 our element is the region
  return (
    <div {...region} className={clsx(region.className, className)}>
      {children}
      {/* 📣 "Slide 3 of 9: …" (polite), rendered once */}
      <AbCarouselStatus />
    </div>
  );
}


/**
 * `WelcomeBar` - the dots + arrows row (core's `mainBar`) with the carousel's OWN ←/→ Home/End handler ⌨️
 * In headless mode our region sits inside the main scroller, so the bar is outside it: we hand the bar the packaged
 * `onKeyDown` from `useAbCarouselRegion()` (no keys of our own), so arrow keys on a dot still move the slides.
 *
 * @param { { children: ReactNode } } props - the dots + arrows
 * @returns { ReactElement }
 */
function WelcomeBar({ children }: { children: ReactNode }) {
  // ⌨️ the packaged key handler (only while focus is inside this row: no global hijack) + the region's class
  const { onKeyDown, className } = useAbCarouselRegion();
  // 🎨 the packaged region class carries the carousel tokens (`--_accent`: the active dot + the filled Next); outside
  //    the region the parts would lose them (gap: the parts should fall back to --ab-carousel-accent themselves)
  return <div className={clsx(className, styles.footer)} onKeyDown={onKeyDown}>{children}</div>;
}


/**
 * `WelcomeSlides` - Client Component 🎞️
 *
 * Core's `AbMainLayout` inside the HEADLESS packaged carousel (0.2.3 `AbCarouselProvider`: no element, so <main> is
 * the content row's own pane again):
 *   📱 below 768px: AbMobileHeader with the 🔢 counter + Skip in its `row` → `mainHeader`
 *   🛤️ the slides (+ the 🔢 counter row at 768px+) → OUR region in the main content (THE scroller, focusable, named)
 *   ⚫⏮️⏭️ dots + arrows → `mainBar`. `autoHeight`: the track follows the active slide (no blank scroll on short ones).
 * Plus the `?s=` URL state.
 *
 * @param { WelcomeSlidesProps } props - the slides and their labels
 * @returns { ReactElement }
 */
export default function WelcomeSlides({ slides, labels, mobileHeader }: WelcomeSlidesProps) {
  // the number of slides (9) 🔢
  const count = slides.length;
  // the active slide (SSR always renders s01 for SEO / no-JS 🌱)
  const [index, setIndex] = useState(0);

  // 🔗 on mount: restore the slide from `?s=` (a reload keeps the slide)
  useEffect(() => {
    // read the slide from the URL
    const fromUrl = readWelcomeSlideParam(window.location.search, count);
    // nothing to restore ? stay on s01 🌱
    if (fromUrl === 0) return;
    // move on the next frame (after hydration, so SSR and the first client render agree 🤝)
    const frame = window.requestAnimationFrame(() => setIndex(fromUrl));
    // cancel it if we unmount first 🧹
    return () => window.cancelAnimationFrame(frame);
  }, [count]);

  // 🎚️ every change (arrows, dots, keys, swipe, Skip)
  const onIndexChange = useCallback(
    (next: number, change: AbCarouselChange) => {
      // keep the new slide 🧠
      setIndex(next);
      // sync `?s=` without a navigation (shallow, no history entry) 🔗
      const url = new URL(window.location.href);
      // s01 keeps a clean URL, the others get `?s=n` (1-based)
      if (next === 0) url.searchParams.delete('s');
      else url.searchParams.set('s', String(next + 1));
      // replace the current entry
      window.history.replaceState(window.history.state, '', url);
      // ⏩ Skip: move focus to the s09 title once it's no longer inert ♿
      if (change.reason === 'skip') {
        // wait for the next frame (the carousel removes `inert` on the new slide first)
        window.requestAnimationFrame(() => document.getElementById(`welcome-${slides[next]?.id}-title`)?.focus());
      }
    },
    [slides],
  );

  // 🔢 the counter row: `02 / 09` left, Skip right (in the mobile header's `row` below 768px, atop the region above)
  const counterRow = (className: string) => (
    <div className={className}>
      <AbCarouselCounter
        className={styles.counter}
        format={(current, total) => fillWelcomePattern(labels.counter, { current: pad(current), total: pad(total) })}
      />
      <WelcomeSkip label={labels.skip} />
    </div>
  );

  // return the headless carousel around the main pane 🎠
  return (
    <AbCarouselProvider
      label={labels.carousel} // 🏷️ region name
      index={index} // 🎛️ controlled (for `?s=`)
      onIndexChange={onIndexChange} // 📣 changes
      count={count} // 🔢 explicit: the track sits inside AbMainLayout's `content`, so it can't be counted from children
      titles={slides.map((slide) => slide.title)} // 🏷️ dots + announcements
      slideLabel={(n, total) => fillWelcomePattern(labels.slide, { n, total })} // ♿ "3 of 9"
      announce={(n, total, title) => fillWelcomePattern(labels.announce, { n, total, title: title ?? '' })} // 📣
      autoHeight // 📏 0.2.3: the track takes the ACTIVE slide's height (short slides don't scroll into blank space)
    >
      {/* ⬆️ a new slide starts at the top of the main scroller */}
      <WelcomeScrollReset />
      {/* 🧱 the main pane: `id="main"` (the skip target ♿), header · content · bar from core */}
      <AbMainLayout
        id="main"
        orientation="vertical"
        pageName="welcome"
        className={styles.main}
        chrome={false} // 🧰 no legacy backdrop / menus / progress layers (0.1.5)
        scrollerLabel={labels.mainContent} // ⌨️ 0.2.3: the main scroller is a named tab stop (axe scrollable-region-focusable)
        // 📱 below 768px only (core hides this slot at 768px+): logo · globe · 3-state theme + the counter row
        mainHeader={<WelcomeMobileHeader {...mobileHeader} row={counterRow(clsx(styles.counterRow, styles.counterRowInHeader))} />}
        // ⚫⏮️⏭️ Bar - dots left, arrows right (core renders the <footer>)
        mainBar={
          <WelcomeBar>
            <AbCarouselDots label={labels.carousel} dotLabel={(n, _total, title) => fillWelcomePattern(labels.goTo, { n, title: title ?? '' })} />
            <WelcomeArrows back={labels.back} next={labels.next} />
          </WelcomeBar>
        }
        // 🛤️ our region (the 768px+ counter row + the 9 slides), inside the main scroller
        content={
          <WelcomeRegion className={styles.region}>
            {/* 🔢 768px+: the counter row atop the slides (below 768px it's in the mobile header's `row`) */}
            <div className={styles.counterWide}>{counterRow(styles.counterRow)}</div>
            <AbCarouselTrack className={styles.track}>
              {slides.map((slide, i) => (
                <AbCarouselSlide key={slide.id} className={styles.slide} label={fillWelcomePattern(labels.slide, { n: i + 1, total: count })}>
                  {slide.content}
                </AbCarouselSlide>
              ))}
            </AbCarouselTrack>
          </WelcomeRegion>
        }
      />
    </AbCarouselProvider>
  );
}
