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
* @name: abElements Welcome
* @file: app/[locale]/welcome/welcome.tsx
* @type: TypeScript (React)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <Welcome locale={locale} />
*    -|> 
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🎬 Welcome v6: THE single entry component of the Welcome (a server component).
// Composition only: every piece of UI comes from the ab-nextjs-* packages, this file just wires
// the `Welcome` messages and the slide data together. A redesign swaps this folder + the messages 🔁.

// REACT types
import type { ReactNode } from 'react';

// import the class names helper
import clsx from 'clsx';

// import the Mulish title font class names from `ab-nextjs-fonts` (titles use Mulish, it has Cyrillic 🇷🇺)
import { mulishStyles } from 'ab-nextjs-fonts';
// import the (server) wordmark logo from `ab-nextjs-components` 🅰️
import AbLogo from 'ab-nextjs-components/server/ab-logo';
// import the (server) button from `ab-nextjs-components` 🔘
import AbButton from 'ab-nextjs-components/server/ab-button';
// import the server-side translations helper from `ab-nextjs-i18n` 🌐
import { getAbTranslations } from 'ab-nextjs-i18n/server';

// import the Get Started server action 🍪
import { completeWelcome } from './actions';
// import every Welcome-only style 🎨
import styles from './welcome.module.css';


// ===== WELCOME - DATA ===== //
// (package, component & hook names are code: they're NEVER translated, so they live here, not in the messages 🔒)

// the 8 packages of the s01 cards ("eight packages" 📦), in the mocks' order
export const WELCOME_PACKAGES = [
  // [message key, package name]
  ['core', 'ab-nextjs-core'],
  ['components', 'ab-nextjs-components'],
  ['theme', 'ab-nextjs-theme'],
  ['icons', 'ab-nextjs-icons'],
  ['fonts', 'ab-nextjs-fonts'],
  ['animations', 'ab-nextjs-animations'],
  ['hooks', 'ab-nextjs-hooks'],
  ['i18n', 'ab-nextjs-i18n'],
] as const;

// one chip: a code name (kept as is) or a message key (translated) 🏷️
type WelcomeChip =
  | { code: string }
  | {
      key:
        | 'slides.s04.chips.tokens' | 'slides.s04.chips.lightDark' | 'slides.s04.chips.cssVariables'
        | 'slides.s05.chips.grid' | 'slides.s05.chips.typed'
        | 'slides.s07.chips.easings' | 'slides.s07.chips.fades' | 'slides.s07.chips.reducedMotion';
    };

// the slide ids, s01 → s09 🎞️
export type WelcomeSlideId = 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07' | 's08' | 's09';

// the 9 slides (s02–s08 each show one package: pill + chips + install command)
export const WELCOME_SLIDES: ReadonlyArray<{ id: WelcomeSlideId; pkg?: string; chips?: ReadonlyArray<WelcomeChip> }> = [
  // s01: Welcome + the 8 package cards 👋
  { id: 's01' },
  // s02: core (real 0.1.5 exports: the layouts)
  { id: 's02', pkg: 'ab-nextjs-core', chips: [{ code: 'AbScreenLayout' }, { code: 'AbMainLayout' }, { code: 'AbAsideLayout' }] },
  // s03: components (real 0.1.9 exports)
  { id: 's03', pkg: 'ab-nextjs-components', chips: [{ code: 'AbButton' }, { code: 'AbIconButton' }, { code: 'AbTabs' }, { code: 'AbMenu' }, { code: 'AbSplash' }] },
  // s04: theme 🌗
  { id: 's04', pkg: 'ab-nextjs-theme', chips: [{ key: 'slides.s04.chips.tokens' }, { key: 'slides.s04.chips.lightDark' }, { key: 'slides.s04.chips.cssVariables' }] },
  // s05: icons
  { id: 's05', pkg: 'ab-nextjs-icons', chips: [{ code: 'ab-icons' }, { key: 'slides.s05.chips.grid' }, { key: 'slides.s05.chips.typed' }] },
  // s06: fonts (the five specimens are font names 🔤)
  { id: 's06', pkg: 'ab-nextjs-fonts', chips: [{ code: 'Zilla Slab' }, { code: 'Inter' }, { code: 'Mulish' }, { code: 'Quicksand' }, { code: 'Roboto' }] },
  // s07: animations
  { id: 's07', pkg: 'ab-nextjs-animations', chips: [{ key: 'slides.s07.chips.easings' }, { key: 'slides.s07.chips.fades' }, { key: 'slides.s07.chips.reducedMotion' }] },
  // s08: hooks (real `useAb*` names; useAbMedia & useAbClipboard ship in hooks 0.1.6)
  { id: 's08', pkg: 'ab-nextjs-hooks', chips: [{ code: 'useAbTheme' }, { code: 'useAbMedia' }, { code: 'useAbLocalStorage' }, { code: 'useAbClipboard' }] },
  // s09: the end, Get Started + Continue with GitHub 🚀
  { id: 's09' },
];

// two-digit counter numbers (`02`, `09`)
const pad = (n: number): string => String(n).padStart(2, '0');


// create the props type of the Welcome as `WelcomeProps`
type WelcomeProps = Readonly<{ locale: string }>;


/**
 * `Welcome` - Entry Component 🎬
 *
 * Renders the 9 slides as one vertical stack: that's the no-JS / SSR markup of the walkthrough,
 * and the markup the packaged carousel will enhance (see the TODOs below).
 *
 * @param { WelcomeProps } props - the current `locale` (for the Get Started form)
 * @returns { Promise<ReactElement> }
 */
export default async function Welcome({ locale }: WelcomeProps) {
  // get the translations of the `Welcome` messages 🌐
  const t = await getAbTranslations('Welcome');
  // the total number of slides (9)
  const total = WELCOME_SLIDES.length;
  // the rich-text tags of the titles (`<em>` = the bronze accent word, `<br>` = a line break)
  const rich = { em: (chunks: ReactNode) => <em className={styles.accent}>{chunks}</em>, br: () => <br /> };

  // TODO(0.2.18): needs ab-nextjs-components@0.1.10 (G31 `AbCarousel` from `ab-nextjs-components/ab-carousel`)
  //   Wrap the slides in a client `welcome-slides.tsx` (composition only):
  //     <AbCarousel label={t('carouselLabel')} index={i} onIndexChange={onChange} titles={titles}
  //       slideLabel={(n, total) => t('slideLabel', { n, total })}
  //       announce={(n, total, title) => t('announce', { n, total, title: title ?? '' })}>
  //       <AbCarouselCounter format={(c, n) => t('counter', { current: pad(c), total: pad(n) })} />
  //       <AbCarouselTrack>{slides.map(… <AbCarouselSlide label=…>)}</AbCarouselTrack>
  //       <AbCarouselDots dotLabel={(n, total, title) => t('goTo', { n, title: title ?? '' })} />
  //       <AbCarouselPrev label={t('back')} /> <AbCarouselNext label={t('next')} hideAtEdge />
  //     </AbCarousel>
  //   Skip (s01–s08): `const { goTo, count } = useAbCarousel(); goTo(count - 1, 'skip')`, and in
  //   `onIndexChange`, `change.reason === 'skip'` → focus `#welcome-s09-title` (tabIndex -1) ♿.
  //   `?s=` sync: controlled `index` + `history.replaceState`. No-JS: `<noscript><style>{AB_CAROUSEL_NOSCRIPT_CSS}</style></noscript>`.

  // return the Welcome
  return (
    <div className={styles.welcome}>

      {/* Top Bar - logo + utilities */}
      <header className={styles.topBar}>
        {/* abElements wordmark 🅰️ */}
        <AbLogo wordmark size={24} alt="abElements" />
        {/* Utilities - theme + globe */}
        <div className={styles.utilities}>
          {/* TODO(0.2.18): needs ab-nextjs-components@0.1.10 + ab-nextjs-hooks@0.1.6 (G34 3-state theme toggle, `useAbTheme('system')`):
              <AbThemeToggle variant="segmented" labels={{ group: t('theme.label'), light: t('theme.light'), dark: t('theme.dark'), system: t('theme.system') }} /> 🌗 */}
          {/* TODO(0.2.18): needs ab-nextjs-components@0.1.10 (G7 globe):
              <AbLocaleSwitcher label={t('language')} current={locale} locales={…endonyms} variant="icon" align="end" /> 🌍 */}
        </div>
      </header>

      {/* Slides - the no-JS stack of the 9 slides 🎞️ */}
      <main className={styles.slides} aria-label={t('carouselLabel')}>
        {WELCOME_SLIDES.map((slide, index) => {
          // the 1-based slide number
          const n = index + 1;
          // the title element: one `h1` (s01), the others are `h2` ♿
          const Title = index === 0 ? 'h1' : 'h2';
          // the message keys of this slide
          const key = `slides.${slide.id}` as const;

          // return one slide
          return (
            <section
              key={slide.id}
              id={`welcome-${slide.id}`}
              className={styles.slide}
              role="group"
              aria-roledescription="slide"
              aria-label={t('slideLabel', { n, total })}
            >
              {/* Text Pane */}
              <div className={styles.textPane}>
                {/* Counter `02 / 09` (decorative: the group label says it ♿) */}
                <p className={styles.counter} aria-hidden="true">{t('counter', { current: pad(n), total: pad(total) })}</p>

                {/* Eyebrow (s01) / package pill (s02–s08) / MIT pill (s09) */}
                {/* TODO(0.2.18): needs ab-nextjs-components@0.1.10 (G36 `AbPill`, with `dot="sage"` on s09) */}
                {slide.id === 's01' && <p className={styles.eyebrow}>{t('slides.s01.eyebrow')}</p>}
                {slide.pkg && <p className={styles.eyebrow}>{slide.pkg}</p>}
                {slide.id === 's09' && <p className={styles.eyebrow}>{t('slides.s09.pill')}</p>}

                {/* Title (Mulish, bold) - s09's is the Skip focus target ♿ */}
                <Title id={`welcome-${slide.id}-title`} tabIndex={-1} className={clsx(styles.title, mulishStyles.bold)}>
                  {t.rich(`${key}.title`, rich)}
                </Title>

                {/* Body (Inter) */}
                <p className={styles.body}>{t(`${key}.body`)}</p>

                {/* s01: the 8 package cards 📦 */}
                {slide.id === 's01' && (
                  <ul className={styles.cards}>
                    {WELCOME_PACKAGES.map(([pkgKey, name]) => (
                      <li key={pkgKey} className={styles.card}>
                        {/* TODO(0.2.18): needs ab-nextjs-icons@0.2.3 + ab-nextjs-components@0.1.10 (G33 package glyphs, G2 `AbIcon`) */}
                        {/* package name (code, never translated) */}
                        <code className={styles.cardName}>{name}</code>
                        {/* one-liner (hidden on mobile) */}
                        <span className={styles.cardDesc}>{t(`slides.s01.packages.${pkgKey}`)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* s02–s08: chips 🏷️ */}
                {/* TODO(0.2.18): needs ab-nextjs-components@0.1.10 (G36 `<AbChip as="li">`) */}
                {slide.chips && (
                  <ul className={styles.chips}>
                    {slide.chips.map((chip) => (
                      <li key={'code' in chip ? chip.code : chip.key} className={styles.chip}>
                        {'code' in chip ? chip.code : t(chip.key)}
                      </li>
                    ))}
                  </ul>
                )}

                {/* s02–s08: install command 💻 */}
                {/* TODO(0.2.18): needs ab-nextjs-components@0.1.10 + ab-nextjs-hooks@0.1.6 (G35 `AbInstallSnippet`, `useAbClipboard`):
                    <AbInstallSnippet pkg={slide.pkg} storageKey="ab-welcome-pm" labels={{ group: t('install.label', { pkg }), copy: t('install.copy'), copied: t('install.copied') }} /> */}
                {slide.pkg && (
                  <pre className={styles.install} aria-label={t('install.label', { pkg: slide.pkg })} data-ab-swipe-ignore="">
                    <code>{`pnpm add ${slide.pkg}`}</code>
                  </pre>
                )}

                {/* s09: Get Started (works without JS) + Continue with GitHub (coming soon) 🚀 */}
                {slide.id === 's09' && (
                  <div className={styles.actions}>
                    {/* Get Started - a plain form POST to the server action 🍪 */}
                    <form action={completeWelcome}>
                      {/* the visitor's locale (validated by the action) */}
                      <input type="hidden" name="locale" value={locale} />
                      {/* the submit button */}
                      <AbButton type="contained" htmlType="submit" label={t('cta')} icon="arrow_forward" iconPosition="right" withIcon />
                    </form>
                    {/* Continue with GitHub - disabled until auth exists (sets NO cookie) */}
                    {/* TODO(0.2.18): needs ab-nextjs-components@0.1.10 + ab-nextjs-icons@0.2.3 (G22 `badge` / `disabledReason`, G33 `github` mark):
                        <AbButton type="outlined" label={t('github')} startIcon={<AbIcon name="github" />} disabled badge={t('comingSoon')} /> */}
                    <AbButton type="outlined" label={`${t('github')} · ${t('comingSoon')}`} disabled />
                  </div>
                )}
              </div>

              {/* Aside - the Live Playground illustration */}
              {/* TODO(0.2.18): needs ab-nextjs-components@0.1.10 + ab-nextjs-animations@0.2.4 (G38 `AbFlowDiagram`, G37 wires):
                  <aside aria-label={t('playground.title')}><AbFlowDiagram {...WELCOME_SCENES[slide.id]} title={t('playground.title')} alt={t(`${key}.illustrationAlt`)} live /></aside>
                  (the 9 scenes are nodes/edges data in this folder; until then the alt text is the only content ♿) */}
              <p className={styles.srOnly}>{t(`${key}.illustrationAlt`)}</p>
            </section>
          );
        })}
      </main>
    </div>
  );
}
