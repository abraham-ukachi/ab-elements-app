# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
