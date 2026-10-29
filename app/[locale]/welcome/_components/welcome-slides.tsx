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
  useAbCarouselKeys, // ⌨️ 0.2.3: ←/→ anywhere inside <main> (dots, slide area), never page-wide
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
// import the packaged aside pane (core: an in-flow column from 1180px, closed below; the playground lives there) 🗺️
import AbAsideLayout from 'ab-nextjs-core/ab-aside-layout';
// import the packaged v6 "Live Playground" scenes (John's 7 + the i18n placeholder: dots, rich nodes, card, pulses) 🎨
import AbPlaygroundScene, { type AbPlaygroundSceneName } from 'ab-nextjs-components/ab-playground-scene';
// import the packaged media-query hook (phones get the compact 350×276 scene) 📱
import { useAbMedia } from 'ab-nextjs-hooks/useAbMedia';
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
  content: ReactNode; // 🧩 the slide's server-rendered markup (the text)
  playground: WelcomePlaygroundData; // 🗺️ the slide's playground (the aside pane)
}

// one slide's playground: a packaged scene, or (🚧 s01 / s09 stopgap) a server-drawn hub per variant 🗺️
export interface WelcomePlaygroundData {
  scene?: AbPlaygroundSceneName; // 🗂️ AbPlaygroundScene `name` (s02–s08)
  alt: string; // ♿ the translated alt
  hub?: { full: ReactNode; compact: ReactNode }; // 🚧 s01 / s09 until a packaged `welcome` / `all` scene exists
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
  playground: string; // 🗺️ "Live Playground": the aside pane's name + the scene header title
  live: string; // 🟢 "live": the scene header's dot label
  provider: string; // 🌍 i18n scene: "provider"
  prefix: string; // 🌍 i18n scene: "prefix"
  intlFormat: string; // 🌍 i18n scene: "Intl format"
  greetings: { en: string; fr: string; es: string; ru: string }; // 👋 i18n scene greetings
  locale: string; // 🗣️ the app locale (i18n scene)
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
 * `WelcomeKeys` - the carousel's ←/→ for the whole main pane ⌨️
 * Our region (counter, slides, dots) sits inside the main scroller, so the packaged hook scopes the keys to
 * <main> (core's `data-ab-part="main"`): arrows on a dot or in the slide area move the slides; focus outside main
 * (the app header, the body) is left alone (no global hijack).
 *
 * @returns { null }
 */
function WelcomeKeys() {
  // ⌨️ main only (NOT 'document')
  useAbCarouselKeys('main');
  return null;
}


/**
 * `WelcomePlayground` - the ACTIVE slide's playground, in the aside pane 🗺️
 * The packaged v6 `AbPlaygroundScene` (compact 350×276 on phones, the full 760×600 card elsewhere), centred like the
 * v6 laptop aside. One scene at a time; core places the ONE aside above main below 1180px (`asideBelow`).
 *
 * @param { { playgrounds: readonly WelcomePlaygroundData[]; labels: WelcomePlaygroundLabels } } props
 * @returns { ReactElement }
 */
// the words every scene reads (title, live dot) + the i18n scene's own (provider, prefix, Intl format, greetings) 🌍
type WelcomePlaygroundLabels = Pick<WelcomeSlidesLabels, 'live' | 'provider' | 'prefix' | 'intlFormat' | 'greetings' | 'locale'> & { title: string };

function WelcomePlayground({ playgrounds, labels }: { playgrounds: readonly WelcomePlaygroundData[]; labels: WelcomePlaygroundLabels }) {
  // 🎠 the active slide
  const { index } = useAbCarousel();
  // 📱 phones (< 768px) get the compact v6 mobile scene (SSR: full, then the client corrects it once)
  const isPhone = useAbMedia('(max-width: 767px)');
  // 🗺️ the active slide's data (SSR / no-JS: s01's)
  const data = playgrounds[index];
  const variant = isPhone ? 'compact' : 'full';
  return (
    <div className={styles.asidePlayground}>
      {data?.scene ? (
        <AbPlaygroundScene
          key={data.scene} // 🔁 a fresh scene (and pulse) per slide
          name={data.scene}
          variant={variant}
          active // ▶️ only the active slide's scene is mounted, so it always animates
          locale={labels.locale} // 🗣️ the i18n scene follows the app locale
          labels={{
            title: labels.title,
            live: labels.live,
            alt: { [data.scene]: data.alt }, // ♿ only the active scene's alt (e.g. `alt.i18n`)
            provider: labels.provider,
            prefix: labels.prefix,
            intlFormat: labels.intlFormat,
            greetings: labels.greetings,
          }}
          className={styles.diagram}
        />
      ) : (
        // 🚧 s01 / s09: the server-drawn hub (stopgap)
        data?.hub?.[variant]
      )}
    </div>
  );
}


/**
 * `WelcomeSlides` - Client Component 🎞️
 *
 * Core's `AbMainLayout` inside the HEADLESS packaged carousel (0.2.3 `AbCarouselProvider`: no element, so <main> is
 * the content row's own pane again):
 *   📱 AbMobileHeader → `mainHeader` (below 768px)
 *   🛤️ 🔢 counter · the slides · ⚫⏮️⏭️ dots + arrows → OUR region in the main content (THE scroller, focusable, named)
 *   🗺️ the active AbPlaygroundScene → AbAsideLayout (a column ≥ 1180px, above main below) · ⌨️ ←/→ scoped to <main>
 *   `autoHeight`: the track follows the active slide (no blank scroll on short ones).
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

  // 🔢 the counter row: `02 / 09` left, Skip right; at the TOP of the main column (v6 `ctr`, every width)
  const counterRow = (
    <div className={styles.counterRow}>
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
      {/* ⌨️ ←/→ inside <main> */}
      <WelcomeKeys />
      {/* 🧱 the main pane: `id="main"` (the skip target ♿). God's layout rule + John's v6: EVERYTHING on the left is in
          the scrollable main content (counter · slide · dots + arrows), no main footer bar */}
      <AbMainLayout
        id="main"
        orientation="vertical"
        pageName="welcome"
        className={styles.main}
        chrome={false} // 🧰 no legacy backdrop / menus / progress layers (0.1.5)
        scrollerLabel={labels.mainContent} // ⌨️ 0.2.3: the main scroller is a named tab stop (axe scrollable-region-focusable)
        // 📱 below 768px only (core hides this slot at 768px+): logo · globe · 3-state theme
        mainHeader={<WelcomeMobileHeader {...mobileHeader} />}
        // 🛤️ our region, inside the main scroller: counter (top) · the 9 slides · dots + arrows (bottom), as in v6
        content={
          <WelcomeRegion className={styles.region}>
            {counterRow}
            <AbCarouselTrack className={styles.track}>
              {slides.map((slide, i) => (
                <AbCarouselSlide key={slide.id} className={styles.slide} label={fillWelcomePattern(labels.slide, { n: i + 1, total: count })}>
                  {slide.content}
                </AbCarouselSlide>
              ))}
            </AbCarouselTrack>
            {/* ⚫⏮️⏭️ the v6 `nav`: dots left, arrows right (the parts resolve the accent themselves, 0.2.3) */}
            <div className={styles.nav}>
              <AbCarouselDots label={labels.carousel} dotLabel={(n, _total, title) => fillWelcomePattern(labels.goTo, { n, title: title ?? '' })} />
              <WelcomeArrows back={labels.back} next={labels.next} />
            </div>
          </WelcomeRegion>
        }
      />
      {/* 🗺️ the aside pane: the active slide's playground (core: a column from 1180px, inline ABOVE main below via
          `asideBelow`, rendered once). `dividerHidden` + the app's `--ab-pane-divider: none`: no line between the panes */}
      <AbAsideLayout
        orientation="vertical"
        pageName="welcome"
        className={styles.asidePane}
        aria-label={labels.playground} // 🏷️ core 0.2.3: the complementary landmark's name
        chrome={false} // 🧰 no legacy layers
        dividerHidden // ➖ no divider
        content={<WelcomePlayground playgrounds={slides.map((slide) => slide.playground)} labels={{ ...labels, title: labels.playground }} />}
      />
    </AbCarouselProvider>
  );
}
