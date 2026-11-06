# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.2.27](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.26...v0.2.27) (2026-11-06)

* :memo: Write the getting started pages: Introduction, Installation (pnpm, npm, yarn and bun) and Quick start, using the published layout APIs
* :memo: Write the eight package overviews (fonts, icons, animations, theme, hooks, core, components and i18n) against the published package APIs
* :memo: Keep the introduction in user-facing language and point exact colours and typefaces at the Theme page
* :recycle: Order the package pager like the sidebar: Fonts, Icons, Animations, Theme, Hooks, Core, Components, i18n
* :white_check_mark: Test the layout rules on every docs page, and that the introduction stays free of design-spec tokens and the pager follows the sidebar

### [0.2.26](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.25...v0.2.26) (2026-11-04)

* :sparkles: Add live Preview / Code tabs to docs examples: an MDX `<Example>` renders the real package components (packaged AbPreviewCode), and its Code tab shows the exact same source, highlighted by Shiki at build time (one source per example, no eval, no runtime code strings, no iframe)
* :sparkles: Show the packaged preview toolbar on every example: a light/dark toggle for that preview only and a reload that remounts it, labelled in all four locales
* :lock: Check every live example at build time: package components and literal props only, no handlers, spreads, expressions or raw HTML, and URL props limited to `/path` (not `//`), `#hash`, `https:` and `mailto:` (anything else fails the build)
* :shield: Add `pnpm check:no-eval` (also in CI): the client bundle must contain no `eval` or `new Function`, so the site keeps working under a CSP without `'unsafe-eval'`
* :wheelchair: Keep one tab stop per code block (the code wrapper; arrow keys scroll long lines) and no separate tab panel stop
* :memo: Add live examples (buttons, chips and pills, a keyboard hint, a callout) to the Components page
* :chart_with_upwards_trend: Audit `/docs/packages/components` in Lighthouse and Lighthouse CI too
* :arrow_up: Upgrade ab-nextjs-components to 0.6.0, with an exact release-age pin that expires 24h after its publish, and drop the 0.5.0 pin
* :white_check_mark: Test the live previews in every locale and theme: the tabs, the keyboard and tab order, both panels, the code matching the preview, the toolbar, arrow-key scrolling, the copy button at 390px and no CSP eval violation

### [0.2.25](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.24...v0.2.25) (2026-11-04)

* :sparkles: Add the docs page template: chips under each title (section, package, Client or Server Component, status) and Edit this page, Report an issue and View source links in the aside and the outline drawer, in all four locales
* :construction_worker: Run Lighthouse CI in warn mode on `/`, `/docs/installation` and `/fr/docs/quick-start` (mobile and desktop, every assertion a warning)
* :bug: Rename the Lighthouse CI preset and port variables to `AB_LH_*`, so lhci stops reading them as flags
* :arrow_up: Upgrade ab-nextjs-components to 0.4.2, then to 0.5.0 for one active sidebar item (Introduction no longer lights up next to the current page), with an exact release-age pin that expires 24h after its publish
* :fire: Remove personal names from comments and docs
* :white_check_mark: Test the docs page template in every locale and theme (breadcrumbs, chips, TOC and scroll spy, the outline drawer below 1180px, the links)
* :white_check_mark: Test that exactly one sidebar and nav drawer item is active on `/docs` and `/docs/installation` in every locale

### [0.2.24](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.23...v0.2.24) (2026-11-03)

* :heavy_plus_sign: Add Fumadocs MDX, fumadocs-core and zod for the docs pipeline
* :memo: Add the first docs content in four locales
* :sparkles: Render the MDX docs pages in the shell
* :recycle: Render the docs with the packaged code blocks, callouts, tabs and pager
* :bug: Let the picked theme set the color-scheme and keep the crumb a label at 768px
* :lipstick: Highlight the code with github-dark on the dark code surface
* :sparkles: Link the Docs crumb and highlight with both Shiki themes
* :arrow_up: Upgrade to theme 0.3.8 and components 0.4.0, then to theme 0.3.9 and components 0.4.1
* :white_check_mark: Test the docs pages in all four locales
* :white_check_mark: Load the docs source in unit tests and cover the docs sitemap

### [0.2.23](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.22...v0.2.23) (2026-11-01)

* :white_check_mark: Test the layout rules on Home, the 404 and the Welcome at 390, 768, 1180, 1280 and 1920px in light and dark: the document never scrolls, only the panes scroll and they scroll independently, empty slots are 0px, the aside is a pane from 1180px and the right drawer below it, the tablet `<<` toggle opens it (Escape closes it and focus returns), and the scroll spy follows main
* :white_check_mark: Test touch on phones: 44px tap targets, edge swipes that open the nav and outline drawers, scrim taps and swipes that close them, and every drawer staying inside the app with focus back on its opener
* :white_check_mark: Test accessibility: axe at every width in both themes and with each drawer open, one `h1`, named landmarks, the skip link first and no Tab stop in a hidden pane
* :chart_with_upwards_trend: Add `pnpm lighthouse` (and `lighthouse:strict`): Performance, Accessibility, Best Practices and SEO for `/`, `/fr` and the 404 on the mobile and desktop presets, the median of 3 runs against the plan's targets
* :iphone: Use the packaged mobile header search slot on the 404 (search · theme, the shared theme glyph)
* :wheelchair: Name the Home aside landmark after its outline
* :card_file_box: Register the `brightness_auto` icon, so the Settings drawer never falls back to the Material Symbols font
* :arrow_up: Pin the published ab-nextjs-components 0.3.2, ab-nextjs-icons 0.2.7 & ab-nextjs-fonts 0.2.7 (Inter now swaps in, so the Home text paints at once), with exact release-age pins that expire 24h after each publish, and drop the expired pins

### [0.2.22](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.21...v0.2.22) (2026-10-30)

* :sparkles: Build the 404 page inside the docs shell in en, fr, es & ru: the packaged `AbErrorHero` (gradient 404, link_off badge, faint dot grid), the large search field, Back to home · Browse docs, "Did you mean …?" on every width, and Suggested rows (mobile) or cards with an icon tile, bold title & arrow (from 640px)
* :bookmark_tabs: Show Popular pages in the aside from 1180px (`AbToc` links variant) with Report a broken link · Open an issue
* :iphone: Give the 404 mobile header a Search pill and a theme icon, and stack the two actions full width below 768px so longer labels never wrap
* :bug: Serve every unknown URL (including `/foo.bar`, no more 500) a real 404 status in the visitor's locale, with `noindex`
* :globe_with_meridians: Localize AbButton links through AbLinkProvider (no more server-computed hrefs)
* :card_file_box: Register the `link_off` and `settings` icons, so they never fall back to the Material Symbols font
* :arrow_up: Pin the published ab-nextjs-components 0.3.1 & ab-nextjs-icons 0.2.6, with exact release-age pins that expire 24h after each publish
* :white_check_mark: Test the 404 in every locale (status, h1, localized links, mobile rows, global 404) and run axe on it at every width in both themes

### [0.2.21](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.20...v0.2.21) (2026-10-30)

* :building_construction: :iphone: Rebuild the Welcome on the packaged core panes: header · main · aside, with the counter in main, one scroller below 1180px (header, counter, playground and text scroll together) and the playground pane from 1180px
* :sparkles: Show the packaged v6 Live Playground scenes (`AbPlaygroundScene`, compact below 768px and full from 768px, no JS) with the abElements logo, code-name captions and the v6 page, pane and card surfaces
* :globe_with_meridians: Add the i18n slide "Every language, built in" (10 slides now; the last slide moves to s10) in en, fr, es & ru
* :iphone: Open the playground in a right drawer below 768px from a "Show playground" button (Esc, backdrop tap & swipe close it, focus returns)
* :pushpin: Pin the slide dots & arrows to the bottom of main at every width (a named "Slide controls" main bar, never an app footer); Skip stays in the top bar
* :art: Match the v6 call to action: a bronze rounded Get Started and a card-style Continue with GitHub (52px, 56px from 1180px)
* :wheelchair: Put the top bar in a banner landmark and make each slide title the page's single `h1` (no axe issues at any width)
* :arrow_up: Pin the published ab-nextjs-components 0.2.3, ab-nextjs-core 0.2.3, ab-nextjs-theme 0.3.7 & ab-nextjs-animations 0.2.5, with exact release-age pins that expire 24h after each publish, and drop the expired pins
* :white_check_mark: Test the 10 slides, the playground drawer (dialog, Esc, backdrop tap, real-touch swipe, hit-testing, focus return) and the packaged scenes, and refresh the Welcome visual baselines

### [0.2.20](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.19...v0.2.20) (2026-10-21)

* :sparkles: :iphone: Build the docs shell from packaged pieces only: the compact app bar, the sidebar (rail, version switcher, profile button), the bottom nav (Home · Packages · Search · Profile) and the 768 / 1180 / 1920 panes, where only the main pane scrolls
* :sparkles: Build Home with the packaged package cards & previews, Guides, What's new and a scroll-spied "On this page" aside with the "New" promo
* :card_file_box: Add the drawers: the mobile header (logo · language · theme), Settings (theme & language), the nav drawer (left edge swipe), the search drawer (components & hooks grouped by package, "Did you mean") and the outline drawer (right edge swipe below 1180, or the tablet `<<`)
* :sparkles: Share one `ab-pm` install key across the app & migrate the Welcome's `ab-welcome-pm`
* :globe_with_meridians: Add the Shell & Home messages in en, fr, es & ru, including the drawer and Components preview labels
* :recycle: Use the packaged `abThemeScript` instead of the app's own theme script
* :art: Load Mulish & Roboto Mono and set the Home pane widths & surfaces as token overrides
* :arrow_up: Pin the published ab-nextjs-theme 0.3.6, ab-nextjs-core ^0.2.2 & ab-nextjs-components 0.2.2 (plus hooks 0.1.7, icons 0.2.4 & fonts 0.2.6), with exact release-age pins that expire 24h after each publish
* :white_check_mark: Test the docs shell, the shell data & messages, the theme script, the shell icons and the release-age pins

### [0.2.19](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.18...v0.2.19) (2026-10-16)

* :globe_with_meridians: Polish & refine the Welcome translations in fr, es & ru
* :wheelchair: Make long Welcome slides a focusable, keyboard-scrollable region
* :heavy_plus_sign: Add @axe-core/playwright for the accessibility e2e tests
* :white_check_mark: Test the Welcome messages & the full gate table
* :white_check_mark: Add the Welcome e2e tests: gate (incl. Get Started without JavaScript), slides (incl. swipe at 390px), Splash shown once, theme, motion, axe & Cyrillic
* :bento: Add the Welcome visual snapshot baselines (s01 & s09; laptop & mobile, light & dark)
* :arrow_up: Bump ab-nextjs-theme 0.3.3 & ab-nextjs-components 0.1.12: the globe menu can be clicked with a mouse again (scoped layout `main` z-index), and the `AbInstallSnippet` tabs pass AA in every state
* :white_check_mark: Drop the globe menu & AbInstallSnippet test allowances (no axe exceptions left)
* :lipstick: Use the filled (solid bronze) AbButton for the Welcome Get Started
* Deferred: WebKit e2e, the full 72+ visual set & tablet frame, Lighthouse / JS budget, the HTTPS (`Secure`) cookie check, and a CI e2e job (0.2.20+)

### [0.2.18](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.17...v0.2.18) (2026-10-15)

* :sparkles: Add the Welcome v6 walkthrough at `/[locale]/welcome`: 9 slides built on `AbCarousel` & `AbFlowDiagram`, with Skip to the last slide and a Get Started action
* :passport_control: Gate the first home visit behind the Welcome, remembered for one year (`AB_APP_COOKIE_MAX_AGE.oneYear`); direct links, bots & browsers without `sec-fetch-dest` never see it
* :globe_with_meridians: Add the Welcome messages (en, fr, es, ru)
* :lipstick: Keep the system theme mode in the no-flash theme script
* :lipstick: Keep the Welcome diagrams clear of their header, never clip a slide's top, and show Skip as plain bronze text
* :fire: Remove the app-side theme workarounds now fixed in ab-nextjs-theme 0.3.2
* :arrow_up: Bump ab-nextjs-theme 0.3.2, ab-nextjs-components 0.1.11 & the other Ab packages for the Welcome
* :white_check_mark: Test the Welcome gate, the Get Started action, the slides, messages & scenes
* :bento: Swap the README screenshots to the Welcome v6 (laptop & mobile)

### [0.2.17](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.16...v0.2.17) (2026-10-14)

* :sparkles: Add the Splash screen (light & dark), shown on the first visit only
* :recycle: Make the Splash a thin wrapper over `ab-nextjs-components/ab-splash`, with the gate built from the i18n config
* :arrow_up: Bump ab-nextjs-components 0.1.9, ab-nextjs-hooks 0.1.5 & ab-nextjs-animations 0.2.3
* :white_check_mark: Test the Splash gate & timing (skips `/en`, bots & webdriver, and second visits)
* :pencil2: Move the global styles comment back above `globals.css`

### [0.2.16](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.15...v0.2.16) (2026-10-14)

### [0.2.15](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.14...v0.2.15) (2026-10-14)

* :lock: Add baseline security headers: HSTS, nosniff, Referrer-Policy, Permissions-Policy, COOP, `X-Frame-Options: DENY` & a report-only CSP; drop `X-Powered-By`
* :white_check_mark: Test the security headers with Vitest & Playwright (new `test:e2e` script)
* :bulb: Update the copyright year to 2026 in the license headers & the LICENSE

### [0.2.14](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.13...v0.2.14) (2026-10-14)

### [0.2.13](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.12...v0.2.13) (2026-10-08)

### [0.2.12](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.11...v0.2.12) (2026-10-08)

### [0.2.11](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.10...v0.2.11) (2026-10-06)

### [0.2.10](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.9...v0.2.10) (2026-10-06)

### [0.2.9](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.8...v0.2.9) (2026-10-06)

### [0.2.8](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.7...v0.2.8) (2026-10-05)

### [0.2.7](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.6...v0.2.7) (2026-10-05)

### [0.2.6](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.5...v0.2.6) (2026-10-03)

### [0.2.5](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.4...v0.2.5) (2026-10-03)

### [0.2.4](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.3...v0.2.4) (2026-10-03)

### [0.2.3](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.2...v0.2.3) (2026-10-03)

### [0.2.2](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.1...v0.2.2) (2026-10-03)

### [0.2.1](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.0...v0.2.1) (2026-10-03)

## [0.2.0](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.1.5...v0.2.0) (2025-03-09)

### [0.1.5](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.1.4...v0.1.5) (2024-06-09)

### [0.1.4](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.1.3...v0.1.4) (2024-06-07)

### [0.1.3](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.1.2...v0.1.3) (2024-06-07)

### [0.1.2](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.1.1...v0.1.2) (2024-06-07)

### 0.1.1 (2024-06-07)
