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
* @name: abElements Welcome Slides Tests
* @file: tests/unit/welcome-slides.test.tsx
* @type: TypeScript (Vitest)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test
*    -|> 
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// ✅ Welcome v6 component tests: the slide data, the messages, the scenes and the client carousel wiring.
// Rendered with `react-dom/server` (Node environment, no DOM needed): this checks the SSR / no-JS markup 🧪.

// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';
// import the static renderer from `react-dom/server` 🖨️
import { renderToStaticMarkup } from 'react-dom/server';

// import the English messages (the source locale) 🇬🇧
import en from '../../messages/en.json';
// import the client half of the Welcome + its pure helpers 🎞️
import WelcomeSlides, { fillWelcomePattern, readWelcomeSlideParam, type WelcomeSlidesLabels } from '../../app/[locale]/welcome/_components/welcome-slides';
// import the 9 scenes (data) 🗺️
import { WELCOME_HUB_SCENES } from '../../app/[locale]/welcome/welcome-scenes';
// import the slide list (each package slide names its packaged v6 scene) 🎞️
import { WELCOME_SLIDES } from '../../app/[locale]/welcome/welcome';
// import the packaged scene names 🗺️
import { AB_PLAYGROUND_SCENE_PACKAGES } from 'ab-nextjs-components/ab-playground-scene';


// the slide ids of the Welcome, s01 → s09 🎞️
const IDS = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09'] as const;
// the `Welcome` messages (typed loosely for the checks) 🌐
const W = en.Welcome as unknown as Record<string, unknown> & { slides: Record<string, Record<string, unknown>> };

// the labels the server hands to the client half (the raw English patterns) 🏷️
const LABELS: WelcomeSlidesLabels = {
  carousel: en.Welcome.carouselLabel, // 🎠
  skip: en.Welcome.skip, // ⏩
  back: en.Welcome.back, // ⏮️
  next: en.Welcome.next, // ⏭️
  slide: en.Welcome.slideLabel, // 🖼️
  goTo: en.Welcome.goTo, // ⚫
  announce: en.Welcome.announce, // 📣
  counter: en.Welcome.counter, // 🔢
  mainContent: en.Welcome.mainContent, // ⌨️ 0.2.3 the main scroller's name
  playground: en.Welcome.playground.title, // 🗺️ v5: the aside pane's name
  live: en.Welcome.playground.live, // 🟢 v6: the scene header's dot
  provider: en.Welcome.playground.provider, // 🌍 i18n scene
  prefix: en.Welcome.playground.prefix,
  intlFormat: en.Welcome.playground.intlFormat,
  greetings: en.Welcome.playground.greetings, // 👋
  locale: 'en', // 🗣️
};

// the phone header's pieces (0.2.3 AbMobileHeader + the language sheet) 📱
const MOBILE_HEADER = {
  logo: <span>abElements</span>, // 🅰️
  current: 'en', // ✅
  locales: [{ code: 'en', label: 'English' }, { code: 'fr', label: 'Français' }], // 🗣️
  labels: { ...en.Welcome.mobileHeader, languageTitle: en.Welcome.language }, // 🌐
};

// render the client carousel with 9 simple slides (each with its focusable title) 🖨️
function renderSlides(): string {
  // the 9 slides: an id, a plain title and a tiny markup
  const slides = IDS.map((id) => ({ id, title: `Title ${id}`, content: <h2 id={`welcome-${id}-title`} tabIndex={-1}>{`Title ${id}`}</h2>, playground: { alt: `Playground ${id}`, hub: { full: <p>{`Playground ${id}`}</p>, compact: <p>{`Playground ${id}`}</p> } } }));
  // render them to static HTML (the SSR / no-JS output)
  return renderToStaticMarkup(<WelcomeSlides slides={slides} labels={LABELS} mobileHeader={MOBILE_HEADER} />);
}


// ===== HELPERS ===== //
describe('Welcome slides helpers 🧩', () => {
  it('fills the ICU-like patterns (and keeps unknown keys) 🧩', () => {
    // a known pattern
    expect(fillWelcomePattern('{n} of {total}', { n: 3, total: 9 })).toBe('3 of 9');
    // an unknown key stays as is
    expect(fillWelcomePattern('Go to slide {n}: {title}', { n: 2 })).toBe('Go to slide 2: {title}');
  });

  it('reads `?s=` as a clamped 0-based index 🔗', () => {
    // missing → s01
    expect(readWelcomeSlideParam('', 9)).toBe(0);
    // `?s=3` → index 2
    expect(readWelcomeSlideParam('?s=3', 9)).toBe(2);
    // too big → the last slide
    expect(readWelcomeSlideParam('?s=42', 9)).toBe(8);
    // garbage → s01
    expect(readWelcomeSlideParam('?s=abc', 9)).toBe(0);
    expect(readWelcomeSlideParam('?s=-1', 9)).toBe(0);
  });
});


// ===== DATA & MESSAGES ===== //
describe('Welcome data & messages 🌐', () => {
  it('has a title, a body and an illustration alt for each of the 9 slides 🎞️', () => {
    // every slide has its three texts
    for (const id of IDS) {
      expect(W.slides[id], id).toHaveProperty('title');
      expect(W.slides[id], id).toHaveProperty('body');
      expect(W.slides[id], id).toHaveProperty('illustrationAlt');
    }
  });

  it('lists the 8 package one-liners on s01 ("eight packages") 📦', () => {
    // exactly 8 cards, i18n included
    expect(Object.keys(W.slides.s01.packages as object)).toEqual(['core', 'components', 'theme', 'icons', 'fonts', 'animations', 'hooks', 'i18n']);
  });

  it('has the GitHub "coming soon" & theme system labels 🚫🌗', () => {
    // the disabled GitHub button's badge
    expect(en.Welcome.comingSoon).toBeTruthy();
    // the 3-state theme switch
    expect(en.Welcome.theme.system).toBeTruthy();
  });

  it('gives s02–s08 their packaged v6 scene (name = the slide package) and s01 / s09 a wired hub 🗺️', () => {
    // 🗺️ every package slide names the AbPlaygroundScene of ITS package
    for (const slide of WELCOME_SLIDES.filter((x) => x.pkg)) expect(slide.scene && AB_PLAYGROUND_SCENE_PACKAGES[slide.scene], slide.id).toBe(slide.pkg);
    // 🚧 the two stopgap hubs: every wire connects two existing nodes
    for (const scene of Object.values(WELCOME_HUB_SCENES)) {
      const ids = new Set(scene.nodes.map((node) => node.id));
      for (const edge of scene.edges) expect(ids.has(edge.from) && ids.has(edge.to)).toBe(true);
    }
    // s01 wires the 8 packages to the logo
    expect(WELCOME_HUB_SCENES.s01.edges).toHaveLength(8);
  });
});


// ===== CAROUSEL (SSR markup) ===== //
describe('WelcomeSlides (SSR / no-JS markup) 🎠', () => {
  // render once for every check
  const html = renderSlides();

  it('renders the 9 slides, labelled "n of 9" ♿', () => {
    // 9 slide groups
    expect(html.match(/aria-roledescription="slide"/g)).toHaveLength(9);
    // the first and last labels
    expect(html).toContain('aria-label="1 of 9"');
    expect(html).toContain('aria-label="9 of 9"');
  });

  it('names the carousel region 🏷️', () => {
    // the region's name comes from the messages
    expect(html).toContain(`aria-label="${en.Welcome.carouselLabel}"`);
  });

  it('starts on s01 with the counter, Skip and a disabled back button 🔢⏩⏮️', () => {
    // the counter shows 01 / 09
    expect(html).toMatch(/01[\s\S]*\/[\s\S]*09/);
    // Skip is there on s01
    expect(html).toContain(`>${en.Welcome.skip}<`);
    // back is aria-disabled on s01 (and stays focusable)
    expect(html).toMatch(new RegExp(`aria-label="${en.Welcome.back}"[^>]*aria-disabled="true"|aria-disabled="true"[^>]*aria-label="${en.Welcome.back}"`));
    // next is there
    expect(html).toContain(`aria-label="${en.Welcome.next}"`);
  });

  it('renders the 9 dots with their "Go to slide" names ⚫', () => {
    // the first and last dot names
    expect(html).toContain('Go to slide 1: Title s01');
    expect(html).toContain('Go to slide 9: Title s09');
  });

  it('keeps the s09 title focusable for the Skip shortcut ♿', () => {
    // the Skip focus target
    expect(html).toContain('id="welcome-s09-title" tabindex="-1"');
  });
});


// ===== LAYOUT RULE (v5): header · main · aside, no footer ===== //
describe('Welcome layout rule 🧱', () => {
  it('puts the counter, the slides and the dots + arrows in main, and NO main footer bar ⚫', () => {
    // the SSR output
    const html = renderSlides();
    // 🚫 no core footer bar (the v6 nav lives inside the main content now)
    expect(html).not.toContain('data-ab-part="mainBar"');
    // ⚫ the dots are still rendered (inside main)
    expect(html).toContain('Go to slide 2');
  });

  it("shows ONLY the active slide's playground in the ONE aside pane, named 🗺️", () => {
    // the SSR output (s01 is active)
    const html = renderSlides();
    // 🗺️ the aside pane exists and holds s01's playground, named "Live Playground"
    expect(html.match(/data-ab-part="aside"/g)).toHaveLength(1);
    expect(html).toContain(`aria-label="${en.Welcome.playground.title}"`);
    expect(html).toContain('Playground s01');
    // 🙈 not the others
    expect(html).not.toContain('Playground s02');
  });
});
