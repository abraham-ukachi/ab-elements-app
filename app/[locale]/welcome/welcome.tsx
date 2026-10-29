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
// the `Welcome` messages, the slide data and the scenes together. A redesign swaps this folder + the messages 🔁.
// 🧱 0.2.21 (the layout rule): core's AbAppLayout `panes` owns the 100dvh frame (the document never scrolls).
//   top bar → the app `header` row (768px+) · below 768px core's `mobileHeader="main"` hides that row and the main pane's
//   header is the packaged AbMobileHeader (logo · globe · 3-state theme) 📱
//   · counter + slide + dots / arrows → the main content (THE scroller, focusable, v6 left column) · the playground →
//   core's AbAsideLayout from 1180px, inline in the slide below (see WelcomeSlides).
//   God's layout rule: header · main (text + counter, dots, arrows) · aside (the playground, ≥ 1180px). No sidebar,
//   no footer / bottom nav: those slots are empty = 0px.

// REACT types
import type { ReactNode } from 'react';

// import the packaged app frame & page state from `ab-nextjs-core` (0.2.x panes) 🧱
import AbAppLayout from 'ab-nextjs-core/ab-app-layout';
import AbPageProvider from 'ab-nextjs-core/ab-page-provider';

// import the class names helper
import clsx from 'clsx';

// import the (server) wordmark logo from `ab-nextjs-components` 🅰️
import AbLogo from 'ab-nextjs-components/server/ab-logo';
// import the (server) button from `ab-nextjs-components` (Get Started + GitHub, with the G22 badge) 🔘
import AbButton from 'ab-nextjs-components/server/ab-button';
// import the (server) SVG icon from `ab-nextjs-components` (no Material font) 🔣
import AbIcon from 'ab-nextjs-components/server/ab-icon';
// import the chip (s02–s09) & the pill (eyebrows) from `ab-nextjs-components` 🏷️
import AbChip from 'ab-nextjs-components/ab-chip';
import AbPill from 'ab-nextjs-components/ab-pill';
// import the install box (pm tabs + copy) from `ab-nextjs-components` 💻
import AbInstallSnippet from 'ab-nextjs-components/ab-install-snippet';
// import the 3-state theme switch (light / dark / system) from `ab-nextjs-components` 🌗
import AbThemeToggle from 'ab-nextjs-components/ab-theme-toggle';
// import the ONE shared theme mode (0.2.3): the laptop toggle + the mobile header's 3-state button read & write it 🧠
import { AbThemeModeProvider } from 'ab-nextjs-components/ab-theme-mode';
// import the "Live Playground" diagram from `ab-nextjs-components` 🗺️
// import the packaged type of the v6 playground scene names (John's 7 + the i18n placeholder) 🗺️
import type { AbPlaygroundSceneName } from 'ab-nextjs-components/ab-playground-scene';
// import the no-JS carousel CSS (all slides stacked, controls hidden) from the server-safe helpers 🧯
import { AB_CAROUSEL_NOSCRIPT_CSS } from 'ab-nextjs-components/ab-carousel/helpers';
// import the per-icon SVG modules of the 8 package cards + the GitHub mark from `ab-nextjs-icons` (tree-shaken 🌳)
import iconPackage from 'ab-nextjs-icons/ab-icons/icons/package';
import iconWidgets from 'ab-nextjs-icons/ab-icons/icons/widgets';
import iconPalette from 'ab-nextjs-icons/ab-icons/icons/palette';
import iconShapes from 'ab-nextjs-icons/ab-icons/icons/shapes';
import iconFormatBold from 'ab-nextjs-icons/ab-icons/icons/format_bold';
import iconBolt from 'ab-nextjs-icons/ab-icons/icons/bolt';
import iconFunction from 'ab-nextjs-icons/ab-icons/icons/function';
import iconTranslate from 'ab-nextjs-icons/ab-icons/icons/translate';
import iconGithub from 'ab-nextjs-icons/ab-icons/icons/github';
import iconArrowForward from 'ab-nextjs-icons/ab-icons/icons/arrow_forward';
// import the server-side translations helper from `ab-nextjs-i18n` 🌐
import { getAbTranslations } from 'ab-nextjs-i18n/server';

// import the Get Started server action 🍪
import { completeWelcome } from './actions';
// import the client halves: the carousel wiring + the globe 🎞️🌍
import WelcomeSlides, { type WelcomeSlideData } from './_components/welcome-slides';
import WelcomeLocaleSwitcher from './_components/welcome-locale-switcher';
// import every Welcome-only style 🎨
import styles from './welcome.module.css';
// import the shared package-manager key (`ab-pm`, D27: one choice for the whole app 📦)
import { AB_PM_STORAGE_KEY } from '@/lib/install-pm';


// ===== WELCOME - DATA ===== //
// (package, component & hook names are code: they're NEVER translated, so they live here, not in the messages 🔒)

// the 8 packages of the s01 cards ("eight packages" 📦), in the mocks' order, with their glyph 🔣
export const WELCOME_PACKAGES = [
  // [message key, package name, SVG glyph]
  ['core', 'ab-nextjs-core', iconPackage],
  ['components', 'ab-nextjs-components', iconWidgets],
  ['theme', 'ab-nextjs-theme', iconPalette],
  ['icons', 'ab-nextjs-icons', iconShapes],
  ['fonts', 'ab-nextjs-fonts', iconFormatBold],
  ['animations', 'ab-nextjs-animations', iconBolt],
  ['hooks', 'ab-nextjs-hooks', iconFunction],
  ['i18n', 'ab-nextjs-i18n', iconTranslate],
] as const;

// the language choices of the globe (endonyms: each name in its own language 🗣️)
export const WELCOME_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'ru', label: 'Русский' },
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

// the slide ids, s01 → s10 🎞️ (02:40: i18n became s09, the final slide moved to s10)
export type WelcomeSlideId = 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07' | 's08' | 's09' | 's10';

// the 10 slides (s02–s09 each show one package: pill + chips + install box)
// 🗺️ `scene` = the packaged v6 playground (AbPlaygroundScene `name`): `welcome` on s01, one per package, `all` on s10
export const WELCOME_SLIDES: ReadonlyArray<{ id: WelcomeSlideId; pkg?: string; scene: AbPlaygroundSceneName; chips?: ReadonlyArray<WelcomeChip> }> = [
  // s01: Welcome + the 8 package cards 👋
  { id: 's01', scene: 'welcome' },
  // s02: core (real 0.1.5 exports: the layouts)
  { id: 's02', pkg: 'ab-nextjs-core', scene: 'core', chips: [{ code: 'AbScreenLayout' }, { code: 'AbMainLayout' }, { code: 'AbAsideLayout' }] },
  // s03: components (real exports)
  { id: 's03', pkg: 'ab-nextjs-components', scene: 'components', chips: [{ code: 'AbButton' }, { code: 'AbIconButton' }, { code: 'AbTabs' }, { code: 'AbMenu' }, { code: 'AbSplash' }] },
  // s04: theme 🌗
  { id: 's04', pkg: 'ab-nextjs-theme', scene: 'theme', chips: [{ key: 'slides.s04.chips.tokens' }, { key: 'slides.s04.chips.lightDark' }, { key: 'slides.s04.chips.cssVariables' }] },
  // s05: icons
  { id: 's05', pkg: 'ab-nextjs-icons', scene: 'icons', chips: [{ code: 'ab-icons' }, { key: 'slides.s05.chips.grid' }, { key: 'slides.s05.chips.typed' }] },
  // s06: fonts (the five specimens are font names 🔤)
  { id: 's06', pkg: 'ab-nextjs-fonts', scene: 'fonts', chips: [{ code: 'Zilla Slab' }, { code: 'Inter' }, { code: 'Mulish' }, { code: 'Quicksand' }, { code: 'Roboto' }] },
  // s07: animations
  { id: 's07', pkg: 'ab-nextjs-animations', scene: 'animations', chips: [{ key: 'slides.s07.chips.easings' }, { key: 'slides.s07.chips.fades' }, { key: 'slides.s07.chips.reducedMotion' }] },
  // s08: hooks (real `useAb*` names)
  { id: 's08', pkg: 'ab-nextjs-hooks', scene: 'hooks', chips: [{ code: 'useAbTheme' }, { code: 'useAbMedia' }, { code: 'useAbLocalStorage' }, { code: 'useAbClipboard' }] },
  // s09: i18n (John's 8th illustration, the packaged `AbPlaygroundScene name="i18n"`; real export names) 🌍
  { id: 's09', pkg: 'ab-nextjs-i18n', scene: 'i18n', chips: [{ code: 'AbI18nProvider' }, { code: 'useAbTranslations' }, { code: 'useAbLocaleSwitch' }, { code: 'getAbAlternates' }] },
  // s10: the end, Get Started + Continue with GitHub 🚀
  { id: 's10', scene: 'all' },
];


// create the props type of the Welcome as `WelcomeProps`
type WelcomeProps = Readonly<{ locale: string }>;


/**
 * `Welcome` - Entry Component 🎬
 *
 * Renders the frame (top bar with the theme switch + globe) and hands the 10 server-rendered
 * slides to the packaged carousel. Without JS, all slides stay stacked and Get Started still works ♿.
 *
 * @param { WelcomeProps } props - the current `locale` (for the Get Started form + the globe)
 * @returns { Promise<ReactElement> }
 */
export default async function Welcome({ locale }: WelcomeProps) {
  // get the translations of the `Welcome` messages 🌐
  const t = await getAbTranslations('Welcome');
  // the rich-text tags of the titles (`<em>` = the bronze accent word, `<br>` = a line break)
  const rich = { em: (chunks: ReactNode) => <em className={styles.accent}>{chunks}</em>, br: () => <br /> };
  // the plain-text tags of the titles (for the dots & the live announcement 📣)
  const plain = { em: (chunks: string) => chunks, br: () => ' ' };

  // 🎞️ build the 10 slides (server markup handed to the client carousel)
  const slides: WelcomeSlideData[] = WELCOME_SLIDES.map((slide) => {
    // the message keys of this slide
    const key = `slides.${slide.id}` as const;
    // the title element: every slide's title is an `h1` ♿ (0.2.21, axe page-has-heading-one)
    // 🎯 only the ACTIVE slide's counts: the packaged carousel makes the others `inert` + `aria-hidden` + hidden,
    //    so the a11y tree always has ONE h1 (s01's on load, the active slide's after every move)
    const Title = 'h1';
    // return one slide's data
    return {
      // 🆔 the slide id
      id: slide.id,
      // 🗺️ the playground, for the ONE aside pane (core: a column ≥ 1180px, inside the main scroller below)
      playground: {
        scene: slide.scene, // 🗂️ AbPlaygroundScene `name` (welcome · core … i18n · all)
        alt: t(`${key}.illustrationAlt`), // ♿ its translated alt (→ AbPlaygroundScene `labels.alt[name]`)
      },
      // 🏷️ the plain title
      title: t.markup(`${key}.title`, plain),
      // 🧩 the slide markup
      content: (
        <div
          id={`welcome-${slide.id}`}
          className={clsx(styles.slideBody, slide.id === 's10' && styles.slideEnd)}
          // ♿ a named region per slide (no tab stop of its own: core ≥ 0.2.3 makes the MAIN scroller focusable,
          // with a translated `scrollerLabel`, so a keyboard reaches & arrow-scrolls a long slide there ⌨️)
          role="region"
          aria-labelledby={`welcome-${slide.id}-title`}
        >
          {/* Text Pane */}
          <div className={styles.textPane}>
            {/* Eyebrow (s01) / package pill (s02–s09) / MIT pill with a sage dot (s10) 🏷️ */}
            {slide.id === 's01' && <AbPill>{t('slides.s01.eyebrow')}</AbPill>}
            {slide.pkg && <AbPill mono>{slide.pkg}</AbPill>}
            {slide.id === 's10' && <AbPill dot="sage">{t('slides.s10.pill')}</AbPill>}

            {/* Title (Mulish via `--ab-font-title`) - s10's is the Skip focus target ♿ */}
            <Title id={`welcome-${slide.id}-title`} tabIndex={-1} className={styles.title}>
              {t.rich(`${key}.title`, rich)}
            </Title>

            {/* Body (Inter) */}
            <p className={styles.body}>{t(`${key}.body`)}</p>

            {/* s01: the 8 package cards with their SVG glyphs 📦 */}
            {slide.id === 's01' && (
              <ul className={styles.cards}>
                {WELCOME_PACKAGES.map(([pkgKey, name, glyph]) => (
                  <li key={pkgKey} className={styles.card}>
                    {/* glyph (decorative: the name says it ♿) */}
                    <AbIcon name={pkgKey} svg={glyph} size={22} className={styles.cardIcon} />
                    {/* package name (code, never translated) */}
                    <code className={styles.cardName}>{name}</code>
                    {/* one-liner (hidden on mobile) */}
                    <span className={styles.cardDesc}>{t(`slides.s01.packages.${pkgKey}`)}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* s02–s09: chips 🏷️ */}
            {slide.chips && (
              <ul className={styles.chips}>
                {slide.chips.map((chip) => (
                  <AbChip as="li" key={'code' in chip ? chip.code : chip.key}>
                    {'code' in chip ? chip.code : t(chip.key)}
                  </AbChip>
                ))}
              </ul>
            )}

            {/* s02–s09: the install box (pnpm / npm / yarn / bun + copy; the choice persists across slides & the whole app via `ab-pm`) 💻 */}
            {slide.pkg && (
              <AbInstallSnippet
                pkg={slide.pkg}
                storageKey={AB_PM_STORAGE_KEY}
                className={styles.install}
                labels={{ group: t('install.label', { pkg: slide.pkg }), copy: t('install.copy'), copied: t('install.copied') }}
              />
            )}

            {/* s10: Get Started (works without JS) + Continue with GitHub (coming soon) 🚀 */}
            {slide.id === 's10' && (
              <div className={styles.actions}>
                {/* Get Started - a plain form POST to the server action 🍪 */}
                <form action={completeWelcome}>
                  {/* the visitor's locale (validated by the action) */}
                  <input type="hidden" name="locale" value={locale} />
                  {/* the submit button */}
                  {/* 🥉 v6 primary CTA (components 0.2.3): rounded lg = 52px (56px ≥ 1180px), 12px radius, bronze #A67C52 + #FFF8F5 label, v6 shadow */}
                  <AbButton
                    type="filled"
                    shape="rounded" // 🔲 v6 12px radius (not a pill)
                    size="lg" // 📏 v6 52 / 56px
                    color="bronze" // 🎨 v6 bronze + cream label
                    htmlType="submit"
                    label={t('cta')}
                    endIcon={<AbIcon name="arrow_forward" svg={iconArrowForward} size={20} />}
                  />
                </form>
                {/* Continue with GitHub - disabled until auth exists, with a "Coming soon" badge (sets NO cookie) 🚫 */}
                <AbButton
                  type="outlined"
                  color="card" // 🃏 components 0.2.3: the v6 GitHub secondary (card bg, 1px hairline, text colour)
                  shape="rounded" // 🔲 v6 secondary: same 12px radius
                  size="lg" // 📏 same 52 / 56px as Get Started
                  label={t('github')}
                  startIcon={<AbIcon name="github" svg={iconGithub} size={20} />}
                  disabled
                  badge={t('comingSoon')}
                />
              </div>
            )}
          </div>

        </div>
      ),
    };
  });

  // return the Welcome
  return (
    <>
      {/* No-JS: all slides stacked, carousel controls hidden 🧯 */}
      <noscript>
        <style>{AB_CAROUSEL_NOSCRIPT_CSS}</style>
      </noscript>

      {/* 📑 the page state (publishes the scrollers); the aside pane (the playground) is OPEN: core shows it from 1180px */}
      {/* 🌗 one theme mode for the whole Welcome (no drift between the laptop toggle and the phone header at 768px) */}
      <AbThemeModeProvider defaultMode="system">
      <AbPageProvider defaultAsideOpen>
        {/* 🧱 the frame (God's layout rule): header · main (text + slider controls) · aside (the playground). No sidebar, no footer */}
        <AbAppLayout
          orientation="vertical"
          variant="panes"
          pageName="welcome"
          className={styles.app}
          asideBelow="inline-in-main" // 📜 0.2.3: 768–1179px the ONE aside joins the main scroller after the counter (nothing pinned)
          asideDrawerAt="mobile" // 📱 0.2.3: below 768px that same aside is the RIGHT drawer (God's rule), opened by "Show playground"
          surface="page" // 🎨 0.2.3: v6's original page surface on the panes at every width (theme ≥ 0.3.7), no app override
          mobileHeader="main" // 📱 0.2.3: below 768px the main pane's header (AbMobileHeader) IS the bar (the counter lives in main now)
          // 🔝 Top Bar - logo + utilities (core renders the row; its height is the v6 48 / 56 / 60px via a token)
          // 🪧 0.2.21 (axe `region`): the slot child IS a <header> (banner), so core renders its panes row as a plain
          //    div around it (no nested header) and the logo + utilities live inside the banner landmark
          header={
            <header className={styles.topBar}>
              {/* abElements wordmark 🅰️ */}
              <AbLogo wordmark size={24} alt="abElements" />
              {/* Utilities - theme + globe */}
              <div className={styles.utilities}>
                {/* 3-state theme switch (light / dark / system; follows the OS until the visitor picks) 🌗 */}
                <AbThemeToggle
                  variant="segmented"
                  size="sm"
                  defaultMode="system"
                  labels={{ group: t('theme.label'), light: t('theme.light'), dark: t('theme.dark'), system: t('theme.system') }}
                />
                {/* the globe: a bottom app drawer below 768px, the popover menu above (D40) 🌍 */}
                <WelcomeLocaleSwitcher current={locale} label={t('language')} locales={WELCOME_LOCALES} />
              </div>
            </header>
          }
          // 🎞️ the main + aside panes (one headless carousel drives both: 0.2.3 AbCarouselProvider renders no element)
          content={
            <WelcomeSlides
              slides={slides}
              // 🅰️ our mark for the scene headers + hubs (decorative: the scene is ONE image with its own alt)
              playgroundLogo={<AbLogo size={20} alt="" />}
              // 📱 the mobile header's pieces (below 768px)
              mobileHeader={{
                logo: <AbLogo wordmark size={22} alt="abElements" />,

                current: locale,
                locales: WELCOME_LOCALES,
                labels: {
                  language: t('mobileHeader.language'),
                  languageTitle: t('language'),
                  toLight: t('mobileHeader.toLight'),
                  toDark: t('mobileHeader.toDark'),
                  toSystem: t('mobileHeader.toSystem'),
                  header: t('mobileHeader.header'),
                },
              }}
              labels={{
                carousel: t('carouselLabel'),
                skip: t('skip'),
                back: t('back'),
                next: t('next'),
                // ICU patterns, filled on the client (raw: no arguments here) 🧩
                slide: t.raw('slideLabel') as string,
                goTo: t.raw('goTo') as string,
                announce: t.raw('announce') as string,
                counter: t.raw('counter') as string,
                playground: t('playground.title'), // 🗺️ the aside pane's name (+ the scene header title)
                live: t('playground.live'), // 🟢 the scene header's live dot
                show: t('playground.show'), // 📱 below 768px: the "Show playground" button (opens the right drawer)
                // 🌍 the i18n scene's words (Julie's AbPlaygroundScene name="i18n"); greetings stay in their own language
                provider: t('playground.provider'),
                prefix: t('playground.prefix'),
                intlFormat: t('playground.intlFormat'),
                greetings: { en: t('playground.greetings.en'), fr: t('playground.greetings.fr'), es: t('playground.greetings.es'), ru: t('playground.greetings.ru') },
                locale, // 🗣️ the app locale (the i18n scene starts its EN→FR→ES→RU cycle there)
                mainContent: t('mainContent'), // ⌨️ the focusable main scroller's name (core 0.2.3 `scrollerLabel`)
              }}
            />
          }
        />
      </AbPageProvider>
      </AbThemeModeProvider>
    </>
  );
}
