<p align="center">
  <!-- Ab - Logo - Light Mode -->
  <a href="https://abraham-ukachi.vercel.app/#gh-light-mode-only" target="_blank">
    <img src="./.github/ab-logo-light.svg" alt="Ab Logo on Light" width="64" height="64" />
  </a>

  <!-- Ab - Logo - Dark Mode -->
  <a href="https://abraham-ukachi.vercel.app/#gh-dark-mode-only" target="_blank">
    <img src="./.github/ab-logo-dark.svg" alt="Ab Logo on Dark" width="64" height="64" />
  </a>

  <!-- Next.js - Logo Name - Light Mode -->
  <a href="https://nextjs.org/#gh-light-mode-only" target="_blank">
    <img src="./.github/nextjs-logoname-light.svg" alt="Next.js LogoName on Light" width="192" height="64" />
  </a>

  <!-- Next.js - Logo Name - Dark Mode -->
  <a href="https://nextjs.org/#gh-dark-mode-only" target="_blank">
    <img src="./.github/nextjs-logoname-dark.svg" alt="Next.js LogoName on Dark" width="192" height="64" />
  </a>
</p>


<p align="center" style="width:512px; margin:0 auto;">
  <b>abElements</b> is the home of every <b>Ab</b> package: docs, live examples, and an installable PWA, built with the same packages it documents.
</p>

<p align="center" style="margin-top:12px;">
    <a href="https://ab-elements.vercel.app" target="_blank"><b>Checkout abElements &rarr;</b></a>
</p>




# Contributing to `ab-elements-app`

👍🎉 First off, with ❤️ from the author ([Abraham Ukachi](https://github.com/abraham-ukachi)), thanks for taking the time to contribute! 🎉👍


The following is a set of guidelines for contributing to **abElements** and the `ab-nextjs-*` packages it's built with, which is currently deployed with [vercel](https://vercel.com) at [ab-elements.vercel.app](https://ab-elements.vercel.app). These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

> IMPORTANT: abElements is a work in progress and subject to major changes until version 1.0. Every API in this guide was checked against the Ab packages installed in this repo (see [The Ab packages](#the-ab-packages-)); when a package moves, this guide moves with it.


### Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [What is abElements? 🧩](#what-is-abelements-)
    - [The Ab packages 📦](#the-ab-packages-)
    - [How a package change reaches the app](#how-a-package-change-reaches-the-app)
3. [Getting Started 🚀](#getting-started-)
    - [Requirements](#requirements)
    - [Setup](#setup)
    - [Scripts](#scripts)
    - [Environment variables](#environment-variables)
    - [Database](#database)
4. [Project Structure 📁](#project-structure-)
5. [Branches, Pull Requests & Versioning 🌿](#branches-pull-requests--versioning-)
    - [Branch names](#branch-names)
    - [Releasing a version](#releasing-a-version)
    - [Opening & merging a pull request](#opening--merging-a-pull-request)
6. [Styleguides](#styleguides)
    - [Git Commit Messages](#git-commit-messages)
    - [Gitmoji used in this repo](#gitmoji-used-in-this-repo)
    - [TypeScript & React Styleguide](#typescript--react-styleguide)
7. [How to create a new page ?](#how-to-create-a-new-page-)
    - 7.1 [The building blocks](#the-building-blocks)
    - 7.2 [A simple hello-world page](#a-simple-hello-world-page)
    - 7.3 [A toggleable aside](#a-toggleable-aside)
8. [Dialogs & Menus 💬](#dialogs--menus-)
    - 8.1 [Where they live: main, aside or the whole app](#where-they-live-main-aside-or-the-whole-app)
    - 8.2 [Dialogs with `useAbDialog`](#dialogs-with-useabdialog)
    - 8.3 [Menus with `useAbMenu`](#menus-with-useabmenu)
    - 8.4 [Putting it all together](#putting-it-all-together)
    - 8.5 [Inline menus with `<AbMenu>`](#inline-menus-with-abmenu)
    - 8.6 [Toasts with `useAbToast`](#toasts-with-useabtoast)
    - 8.7 [Package notes](#package-notes)
9. [Theming 🎨](#theming-)
10. [Internationalization 🌍](#internationalization-)
11. [Testing 🧪](#testing-)
12. [Reporting Bugs & Requesting Features 🐛](#reporting-bugs--requesting-features-)
13. [License](#license)
14. [Contact](#contact)


## Code of Conduct

Everyone participating in this project is expected to uphold a certain code - i.e. make participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation. Be kind, be patient, and assume good intent ;)

> NOTE: There's no `CODE_OF_CONDUCT.md` file in this repo (yet): until there is one, the paragraph above is the code.


---


## What is abElements? 🧩

Imagine a cozy little workshop 🛠️ where every shelf holds a beautifully labeled box 📦: **fonts** ✏️, **icons** ⭐️, **animations** 💫, **theme** 🎨, **hooks** 🪝, **core** layouts 🌱, **components** 🧱 and now **i18n** 🌍. That workshop is **abElements**!

`ab-elements-app` (this repo) is the **docs site + Progressive Web App** 📱💻 of those `ab-nextjs-*` packages, live at [ab-elements.vercel.app](https://ab-elements.vercel.app). It's a [Next.js](https://nextjs.org/docs) 16 App Router app, and it's **built with the very packages it documents** (we eat our own cooking 🍳😜).

> MOTTO: We'll always do [**more**](https://github.com/abraham-ukachi/ab-elements-app#more) 😜


### The Ab packages 📦

Each package lives in **its own GitHub repo** and is **published to npm on its own**. There is no monorepo: this app installs them from the npm registry, exactly like any other Next.js app would.

| No. | Package | Installed here | Role in abElements | npm | GitHub |
|:----|:--------|:---------------|:-------------------|:----|:-------|
| 1 | ✏️ `ab-nextjs-fonts` | **0.2.4** (`^0.2.4`) | Typefaces (Inter, Mulish, Quicksand, Roboto, Zilla Slab) as CSS + class names (`interStyles`, ...). | [npm](https://www.npmjs.com/package/ab-nextjs-fonts) | [repo](https://github.com/abraham-ukachi/ab-nextjs-fonts) |
| 2 | ⭐️ `ab-nextjs-icons` | **0.1.5** (`^0.1.5`) | Material Symbols / Material Icons CSS, AbIcons, Ant Design icons, logos & pics. | [npm](https://www.npmjs.com/package/ab-nextjs-icons) | [repo](https://github.com/abraham-ukachi/ab-nextjs-icons) |
| 3 | 💫 `ab-nextjs-animations` | **0.2.2** (`^0.2.2`) | `fadeIn`, `fadeOut`, `popIn`, `slide*` keyframes + classes (CSS) and their keyframe objects (TS). | [npm](https://www.npmjs.com/package/ab-nextjs-animations) | [repo](https://github.com/abraham-ukachi/ab-nextjs-animations) |
| 4 | 🎨 `ab-nextjs-theme` | **0.3.0** (`^0.3.0`) | Color tokens (light / dark + medium & high contrast), typography, and base/shell styles as CSS variables. | [npm](https://www.npmjs.com/package/ab-nextjs-theme) | [repo](https://github.com/abraham-ukachi/ab-nextjs-theme) |
| 5 | 🪝 `ab-nextjs-hooks` | **0.1.4** (`^0.1.4`) | `useAbTheme`, `useAbDialog`, `useAbMenu`, `useAbToast`, data & auth helpers. | [npm](https://www.npmjs.com/package/ab-nextjs-hooks) | [repo](https://github.com/abraham-ukachi/ab-nextjs-hooks) |
| 6 | 🌱 `ab-nextjs-core` | **0.1.5** (`^0.1.5`) | `AbAppLayout`, `AbScreenLayout`, `AbMainLayout`, `AbAsideLayout` (server + client), `AbPageProvider`, `AbLinearProgress`. Landmark tags + `data-ab-part`. | [npm](https://www.npmjs.com/package/ab-nextjs-core) | [repo](https://github.com/abraham-ukachi/ab-nextjs-core) |
| 7 | 🧱 `ab-nextjs-components` | **0.1.8** (`^0.1.8`) | `AbSidebar`, `AbNavbar`, `AbButton`, `AbIconButton`, `AbMenu`, `AbTabs`, `AbSearchbar`, `AbDemoBox`... (server + client). Ships the chrome via `styles.css`: toast, dialog, spinner, logo, doodle. | [npm](https://www.npmjs.com/package/ab-nextjs-components) | [repo](https://github.com/abraham-ukachi/ab-nextjs-components) |
| 8 | 🌍 `ab-nextjs-i18n` | *not installed yet* (0.1.0 is published) | Locales, messages & routing for the **Language** setting (en, fr, es, ru), wrapping `next-intl`, plus a CLI. | [npm](https://www.npmjs.com/package/ab-nextjs-i18n) | [repo](https://github.com/abraham-ukachi/ab-nextjs-i18n) |

> NOTE: The guiding principle of this app is **packages first** 📦➡️📱: whenever abElements needs something reusable that doesn't exist yet (e.g. an `AbSheet`, an `AbDialog` or a `useAbMedia` hook), it's **built in the relevant package first**, released to npm, and **then** used here. No app-only copies of reusable UI 🚫📋. The current gaps are listed in the [README](./README.md#package-gaps-to-build-first).

> IMPORTANT: The Ab packages ship **TypeScript sources** (not compiled JS), which is why [`next.config.ts`](./next.config.ts) lists all seven of them in `transpilePackages`. Add any new Ab package there too.


### How a package change reaches the app

Because every package is a separate repo, a change always travels the same road:

```
ab-nextjs-<name> repo                          ab-elements-app (this repo)
─────────────────────                          ───────────────────────────
1. branch, commit, PR, merge
2. bump the version & publish to npm   ──▶     3. bump the dependency (pnpm add ab-nextjs-<name>@^x.y.z)
                                               4. use it, check it (pnpm lint && pnpm build)
                                               5. patch release + PR, like any other change
```

For example, the last two releases of this app were exactly that: `:arrow_up: Bump the 7 Ab packages to their trusted-publishing releases (0.2.5) (#8)` and `:arrow_up: Bump ab-nextjs-theme to 0.2.9 & drop overrides (0.2.3) (#6)`.

```sh
# e.g. after a new ab-nextjs-components release
pnpm add ab-nextjs-components@latest
pnpm lint && pnpm build
```

> NOTE: [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) excludes `ab-nextjs-*` from pnpm's `minimumReleaseAge`, so a fresh Ab release can be installed right after it's published.

> TIP: Don't edit files in `node_modules/ab-nextjs-*` to "fix" something: open an issue or a pull request in the package's own repo instead (links in the table above).


---


## Getting Started 🚀
> IMPORTANT: `ab-elements-app` uses the [App Router](https://nextjs.org/docs/app) of [Next.js](https://nextjs.org/) 16.

### Requirements

| Tool | Version | Where it's pinned |
|:-----|:--------|:------------------|
| [Node.js](https://nodejs.org) | **>= 24** | `engines.node` in [`package.json`](./package.json) (Vercel dropped Node 20.x) |
| [pnpm](https://pnpm.io) | **11** (exactly `pnpm@11.3.0`) | `packageManager` in [`package.json`](./package.json); settings in [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) |
| [Git](https://git-scm.com) | any recent version | |

> NOTE: pnpm 11 doesn't read the `"pnpm"` field of `package.json` anymore: its settings (`allowBuilds` for `sharp` & `unrs-resolver`, `minimumReleaseAgeExclude` for `ab-nextjs-*`) live in `pnpm-workspace.yaml`.


### Setup

#### 1. Enable the pinned pnpm (once per machine)

```sh
corepack enable
```

> NOTE: With Corepack enabled, running `pnpm` inside this repo uses the exact `pnpm@11.3.0` from the `packageManager` field.

#### 2. Clone the repo & install the dependencies

```sh
git clone https://github.com/abraham-ukachi/ab-elements-app.git
cd ab-elements-app
pnpm install
```

#### 3. Start the dev server

```sh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result 🎉


### Scripts

The real scripts from [`package.json`](./package.json):

| Script | Command | What it does |
|:-------|:--------|:-------------|
| `pnpm dev` | `next dev` | Dev server with Turbopack (the default bundler in Next.js 16). |
| `pnpm build` | `next build` | Production build (also type-checks the app). |
| `pnpm start` | `next start` | Serves the production build (run `pnpm build` first). |
| `pnpm lint` | `eslint .` | ESLint 9 flat config ([`eslint.config.mjs`](./eslint.config.mjs)); there's no `next lint` in Next.js 16. |

> TIP: For a quick type check without a full build: `pnpm exec tsc --noEmit`.


### Environment variables

There's no `.env.example` in this repo yet, and the app runs without any env var today. The only variable the code reads right now is:

| Variable | Used in | Default |
|:---------|:--------|:--------|
| `NEXT_PUBLIC_APP_LANG` | [`app/metadata.ts`](./app/metadata.ts) (`APP_LANG`: `<html lang>` & the web app manifest) | `en` |

The auth + database variables planned for later (`DATABASE_URL`, `AUTH_SECRET`, `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`, `EMAIL_PROVIDER_API_KEY` / `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`) are described in the [README](./README.md#getting-started-).

> WARNING: Local env files (`.env*.local`) are git-ignored. Never commit them, and never paste their values in an issue or a pull request.


### Database

A MySQL 8 schema for accounts, auth, synced settings, the docs catalogue, search, bookmarks and history lives in [`database/schema.sql`](./database/schema.sql) (29 tables, 41 foreign keys). It's a **design only**: nothing is created on Vercel yet. Read [`database/README.md`](./database/README.md) for the recommended provider (TiDB Cloud Starter) and how to apply it, and the [README](./README.md#database) for the ER diagram and the table-by-table reference.

> NOTE: Schema changes go in `database/schema.sql` with a 🗃️ `:card_file_box:` commit (see [Gitmoji used in this repo](#gitmoji-used-in-this-repo)).


---


## Project Structure 📁

The tracked files of `ab-elements-app` today (`node_modules`, `.next`, `.vercel` and every `trash/` folder are git-ignored):

```sh
.
├── .github
│   ├── ab-logo*.svg             # Ab logos (light / dark) used by the README & this guide
│   ├── nextjs-logoname-*.svg    # Next.js logos (light / dark)
│   └── screenshots              # README mockups: laptop/ & mobile/, light & dark
├── app
│   ├── globals.css              # Tailwind v4 + theme styles.css + components chrome styles.css + Inter
│   ├── layout.tsx               # root layout: no-flash theme script, <html lang={APP_LANG}>
│   ├── manifest.ts              # web app manifest (/manifest.webmanifest)
│   ├── metadata.ts              # StaticMetadata, APP_LANG, APP_DESCRIPTION & asset directories
│   ├── not-found.tsx            # 404 page
│   ├── page.tsx                 # Coming Soon page (/)
│   └── viewport.ts              # StaticViewport & THEME_COLORS (from ab-nextjs-theme)
├── database
│   ├── README.md                # provider notes + how to apply the schema
│   └── schema.sql               # MySQL 8 DDL
├── public
│   ├── assets/images            # favicons, manifest icons (squircle/), PWA screenshots
│   └── *.svg, me.jpg, ...       # logos & pictures used by the pages
├── CHANGELOG.md                 # one heading per release (standard-version format)
├── CONTRIBUTING.md              # this file ;)
├── LICENSE                      # MIT
├── README.md
├── eslint.config.mjs            # ESLint 9 flat config (next core-web-vitals + typescript)
├── next.config.ts               # transpilePackages: the 7 Ab packages
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml          # pnpm 11 settings
├── postcss.config.mjs           # @tailwindcss/postcss
└── tsconfig.json                # strict, moduleResolution "bundler", "@/*" path alias
```

> NOTE: The planned structure (route groups like `(docs)/` and `(auth)/`, `@splash` / `@welcome` parallel routes, `proxy.ts`, ...) is drafted in the [README](./README.md#planned-draft-follows-the-approved-designs). The old `components/`, `core/` and `hooks/` folders are gone for good: they're the npm packages now.


---


## Branches, Pull Requests & Versioning 🌿

`main` is the production branch (Vercel deploys it). Don't push to `main` directly: every change goes through a short-lived branch, a **patch release commit** and a pull request **merged with a merge commit** (never squash, never rebase).

> IMPORTANT: **Announce before acting.** Before every version bump commit, every `git push` and every merge, post a one-liner to the maintainer ([Abraham Ukachi](https://github.com/abraham-ukachi)): *what, which branch / PR, which version*. Wait for the go-ahead when it's asked for.

### Branch names

Use `<type>/<short-kebab-case-description>`, where `<type>` says what kind of change it is. Real branch names from this repo:

| Branch | What it was for |
|:-------|:----------------|
| `chore/upgrade-deps` | Next.js 16, React 19.3, Tailwind 4.3, TS 6 + the Ab packages |
| `chore/theme-0.2.9` | Bump `ab-nextjs-theme` to 0.2.9 |
| `chore/ab-packages-trusted-publishing` | Bump the 7 Ab packages to their trusted-publishing releases |
| `docs/readme-screenshots` | README screenshots |

> NOTE: `chore/` (dependencies, config, tooling), `docs/` (README, this guide, screenshots) and `fix/` (bug fixes) are the prefixes used so far. Use `feat/` for a new screen or feature.


### Releasing a version

Every pull request **is** a release: the **last commit of the branch** bumps the **patch** version.

1. **Announce the bump** (e.g. "Bumping `docs/merge-commit-workflow` to 0.2.9"), then bump `version` in [`package.json`](./package.json) (e.g. `0.2.6` → `0.2.7`).
2. Add the matching heading at the top of [`CHANGELOG.md`](./CHANGELOG.md), in the same format as the others:

```md
### [0.2.7](https://github.com/abraham-ukachi/ab-elements-app/compare/v0.2.6...v0.2.7) (YYYY-MM-DD)
```

3. Commit both files with this exact subject (no emoji, it's the only conventional-commit style subject in the history):

```sh
git add package.json CHANGELOG.md
git commit -m "chore(release): 0.2.7"
```

> NOTE: Minor versions are kept for milestones (`0.2.0` was the Next.js 15 upgrade); day-to-day work is a patch bump.


### Opening & merging a pull request

1. Make sure `pnpm lint` and `pnpm build` pass.
2. **Announce the push**, then push the branch and open a pull request against `main`.
3. Title it like a commit (gitmoji + summary) **plus the new version** in parentheses, e.g. `:memo: Replace squash-merge with merge commits & announce-first releases (0.2.9)`.
4. **Announce the merge**, then merge with **Create a merge commit**. Don't use *Squash and merge* or *Rebase and merge*: every branch commit stays in the history.
5. **Tag the merge commit** with the new version and push the tag (announce that push too):

```sh
git switch main && git pull
git tag -a v0.2.9 -m "v0.2.9"   # HEAD is the merge commit
git push origin v0.2.9
```

The tag is what makes the `compare/v0.2.8...v0.2.9` link of the `CHANGELOG.md` heading work.

This is what the history looks like with a merge commit (`git log --oneline --graph`, newest first, using the 0.2.9 pull request as the example):

```
*   Merge pull request #13 from abraham-ukachi/docs/merge-commit-workflow   (tag: v0.2.9)
|\
| * chore(release): 0.2.9
| * :card_file_box: Credit Abraham Ukachi as the schema author
| * :memo: Refresh the package table & document the ab-nextjs-i18n CLI
| * :memo: Replace squash-merge with merge commits & announce-first releases
|/
* :lipstick: Adopt theme 0.3.0 + components chrome styles (0.2.8) (#12)
```

> NOTE: Pull requests up to `(0.2.8) (#12)` were squash-merged, so they show up as a single commit with the PR number appended, and they have no `v0.2.x` tags.


---


## Styleguides

### Git Commit Messages

* Use present tense, imperative mood ("Add feature" not "Added feature")
* Use sentence case after the emoji ("Add the README screenshots", not "add the readme screenshots")
* Keep the first line short (aim for 72 characters or less, PR number included)
* Start the commit message with a [gitmoji](https://gitmoji.dev) **shortcode** (`:memo:`, not 📝): every emoji in the history is a shortcode
* Put extra details in parentheses at the end of the subject when they help: `:wrench: Migrate next.config.mjs to next.config.ts (transpile the Ab packages)`
* Several emojis are fine when a commit really does several things: `:memo: :fire: Update README.md`
* The release commit is the exception: `chore(release): x.y.z`, no emoji

The format:

```
<:gitmoji:> [<:gitmoji:> ...] <Imperative summary> [(details)]
```

Real examples from this repo:

```
:bug: Replace the not-found redirect with a real 404 & drop the catch-all
:lipstick: Use ab-nextjs-fonts & ab-nextjs-theme in the layout (no theme flash, no hardcoded lang)
:fire: Remove the Tailwind v3 leftovers in favor of ab-nextjs-theme
:wrench: Require Node.js 24+ (Vercel dropped 20.x)
:card_file_box: Add MySQL database schema design
:pencil2: Clean the package.json description & update the README tree
chore(release): 0.2.4
```


### Gitmoji used in this repo

Built from `git log --all --format=%s`: **54** of the **73** commit subjects start with a gitmoji (the rest are `chore(release): x.y.z` commits and a few merge / housekeeping commits). A subject with two emojis counts for both.

| Emoji | Shortcode | Count | Meaning ([gitmoji.dev](https://gitmoji.dev)) | How it's used here |
|:------|:----------|:------|:----------------------------------------------|:-------------------|
| 📝 | `:memo:` | 14 | Add or update documentation. | README, package docs, TODO lists, this guide. Often paired with ✅, 🔥 or 💥. |
| ⬆️ | `:arrow_up:` | 8 | Upgrade dependencies. | Next.js / React / Tailwind upgrades and Ab package bumps (most release PRs). |
| 🍱 | `:bento:` | 6 | Add or update assets. | Logos, favicons, SVGs and README screenshots. |
| 🔥 | `:fire:` | 6 | Remove code or files. | Removing leftovers (e.g. the Tailwind v3 config); early commits also used it for copy rewrites. |
| 🔧 | `:wrench:` | 5 | Add or update configuration files. | `next.config.ts`, `engines`, `packageManager`, the web app manifest, dependency config. |
| ✅ | `:white_check_mark:` | 5 | Add, update, or pass tests. | So far only with 📝, to tick a TODO as done ("Done - create a ab-nextjs-… npm package"). Use it for tests once there are some. |
| 🐛 | `:bug:` | 4 | Fix a bug. | Bug fixes (404 page, viewport, ...), also as the title of a fix PR. |
| 💥 | `:boom:` | 4 | Introduce breaking changes. | Initial commit, major refactors, routing changes (not-found redirects). |
| 💚 | `:green_heart:` | 4 | Fix CI build. | Fixing the CI build only. Early commits used it for "new file" (`metadata.ts`, `viewport.ts`, public assets, manifest); that house meaning is **retired**: use ✨ (feature), 🍱 (assets) or 🔧 (config) for a new file instead. |
| 💄 | `:lipstick:` | 2 | Add or update the UI and style files. | Layout & styling with ab-nextjs-theme / ab-nextjs-fonts. |
| ♻️ | `:recycle:` | 2 | Refactor code. | Refactors (with 🐛 / 💥 or 🍱). |
| 💩 | `:poop:` | 2 | Write bad code that needs to be improved. | Experimental work in progress ("Polymer"). |
| ✏️ | `:pencil2:` | 1 | Fix typos. | Small copy & wording fixes. |
| 🗃️ | `:card_file_box:` | 1 | Perform database related changes. | `database/schema.sql`. |
| 🔒 | `:lock:` | 1 | Fix security or privacy issues. | Making the package `private`. |

> NOTE: Only the emojis above have been used so far. If you need another one, pick it from [gitmoji.dev](https://gitmoji.dev) and use its official meaning. There are no house meanings (💚's old "new file" meaning is retired).


### TypeScript & React Styleguide

These are the conventions of the existing code ([`app/`](./app)) and of the Ab packages themselves:

* **TypeScript everywhere** (`.ts` / `.tsx`), `strict` mode on (see [`tsconfig.json`](./tsconfig.json)). Type the props with an `interface` and the return value of a component as `ReactElement`.
* **Server Components by default**. Add `'use client';` as the very first line **only** to files that need state, effects, event handlers or browser APIs (e.g. every file that calls a `useAb*` hook), and keep those files small.
* **Imports are grouped & labeled** with a short comment, types first:

```tsx
// REACT types
import type { ReactElement } from 'react';
// NEXT types
import type { Metadata } from 'next';
// NEXT components
import Link from 'next/link';

// AB core (server)
import AbMainLayout from 'ab-nextjs-core/server/ab-main-layout';
// AB components
import AbButton from 'ab-nextjs-components/ab-button';
// AB hooks
import { useAbDialog } from 'ab-nextjs-hooks';
```

* **Import Ab components & layouts from their subpath** (`ab-nextjs-core/server/ab-main-layout`, `ab-nextjs-components/ab-button`, ...). The `server/` subpaths are the Server Component variants; the others are Client Components. Hooks come from the `ab-nextjs-hooks` entry.
* **Document every component** with a JSDoc block: a `` `Name` - Server Component `` / `Client Component` line, a sentence about what it does, and `@returns { ReactElement }`.
* **Comment the JSX sections** (`{/* Title */}`, `{/* Home - Link */}`) like in [`app/not-found.tsx`](./app/not-found.tsx).
* **Name things the Ab way**: reusable components are `Ab<Name>` in an `ab-<name>/index.tsx` folder (with an optional `styles.module.css`) and hooks are `useAb<Name>`, **but** those belong in the packages (see [What is abElements?](#what-is-abelements-)). Files that only exist for one route (like `page-header.tsx` below) are kebab-case and live next to their `page.tsx`.
* **Style with Tailwind CSS v4** utilities and the Ab theme variables (`text-(--md-sys-color-primary)`, see [Theming](#theming-)), never with hardcoded colors.
* **New source files start with the license header** of the project (copy it from [`app/not-found.tsx`](./app/not-found.tsx) and update `@name` & `@file`):

```tsx
/*
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* ...(the rest of the MIT license text, as in app/not-found.tsx)...
*
*
* @project: ab-elements-app
* @name: Hello World - Page
* @file: app/hello-world/page.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/
```

> NOTE: The snippets in this guide leave the license header out to keep them short.

* **Before you push**, both of these must pass (`pnpm build` also runs the TypeScript check):

```sh
pnpm lint
pnpm build
```

> NOTE: The ESLint config is `eslint-config-next` (`core-web-vitals` + `typescript`), with `@typescript-eslint/no-explicit-any` turned off. Prefer real types anyway ;)


---


## How to create a new page ?

In this tutorial, you'll create a `/hello-world` page with a **sidebar**, a **main** part with a **header**, an **aside** part and a **footer**, all made with the Ab packages.

> IMPORTANT: Today, the pages of this app ([`app/page.tsx`](./app/page.tsx) & [`app/not-found.tsx`](./app/not-found.tsx)) don't use the Ab layouts yet: the new docs screens will be the first ones. Every snippet below was written against **`ab-nextjs-core` 0.1.5**, **`ab-nextjs-components` 0.1.7** and **`ab-nextjs-hooks` 0.1.4**, then type-checked, linted and built with `next build`.


### The building blocks

| Part of the page | What renders it | Import |
|:-----------------|:----------------|:-------|
| The app shell (sidebar + content + footer) | `<AbAppLayout>` (`orientation`, `pageName`, `header`, `sideBar`, `navBar`, `footer`, `menus` slots) | `ab-nextjs-core/server/ab-app-layout` |
| Sidebar | `<AbSidebar>` (`links`, `page`, `brandHref`, `brandLabel`, `className`, `type`): renders a `<nav data-ab-part="sidebar">` | `ab-nextjs-components/ab-sidebar` (client) or `.../server/ab-sidebar` |
| Bottom bar | `<AbNavbar>` (`links`, `page`, `type`, `className`): renders a `<nav data-ab-part="bottomBar">` | `ab-nextjs-components/ab-navbar` (client) or `.../server/ab-navbar` |
| Main part | `<AbMainLayout>` (`orientation`, `header`, `footer`, `menus` slots): renders a `<main data-ab-part="main">` | `ab-nextjs-core/server/ab-main-layout` (or the client `ab-nextjs-core/ab-main-layout`) |
| Aside part | `<AbAsideLayout>` (same slots): renders an `<aside data-ab-part="aside">` (uses `.slideFromRight` when open) | `ab-nextjs-core/server/ab-aside-layout`, or the client `ab-nextjs-core/ab-aside-layout` to open / close it |
| Header | *your own markup* in the `header` slot of a layout | |
| Footer | *your own markup* in the `footer` slot of a layout | |
| Icons, logo, buttons | `<AbIcon name>`, `<AbLogo>`, `<AbButton label>`, `<AbIconButton icon title>` | `ab-nextjs-components/server/ab-icon`, `.../server/ab-logo`, `.../ab-button`, `.../ab-icon-button` |

> NOTE: There's **no `AbHeader` or `AbFooter` component** (yet): the header and the footer are **slots** of the layouts, filled with your own markup. Also, the header & footer wrappers of the layouts use `pointer-events: none`, so add `pointer-events-auto` to anything clickable inside them.

> TIP: Every layout **requires** an `orientation` (`"horizontal"` or `"vertical"`). The app shell is `horizontal` (sidebar | content), the main and aside parts are `vertical` (header / content / footer).

> NOTE: Layout wrappers use landmark tags with `data-ab-part`: `<header data-ab-part="header">` / `<footer data-ab-part="footer">` around the header & footer slots, `<main data-ab-part="main">`, `<aside data-ab-part="aside">`, and the consumer navs (`AbSidebar` → `data-ab-part="sidebar"`, `AbNavbar` → `data-ab-part="bottomBar"`). Dialogs, menus and toasts target the real aside via `aside.AbAsideLayout` / `aside[data-ab-part="aside"]`, never the sidebar.


### A simple hello-world page

Here's what you'll end up with:

```sh
app
├── globals.css          # 1. updated: icons, animations & Tailwind sources
└── hello-world
    ├── nav-links.ts     # 2. the sidebar links
    ├── footer.tsx       # 3. the footer (a slot)
    ├── page-header.tsx  # 4. the header (a slot)
    ├── layout.tsx       # 5. the app shell
    └── page.tsx         # 6. the main & aside parts
```

#### 1. Update `app/globals.css` (once)

The Ab components use the **Material Symbols** icon font, the dialogs & menus use the **Ab animations**, and the packages use Tailwind utility classes that Tailwind can't see in `node_modules` by default. Keep **both** theme and components chrome imports (theme first), then add these lines to [`app/globals.css`](./app/globals.css), right after the existing `ab-nextjs-fonts` import:

```css
/* the Material Symbols used by the Ab components (`material-symbols-rounded`) */
@import "ab-nextjs-icons/material-icons/index.css";
/* the keyframes + classes used by `useAbDialog` / `useAbMenu` / the backdrops / aside / toasts */
@import "ab-nextjs-animations/fade-in/styles.css";
@import "ab-nextjs-animations/fade-out/styles.css";
@import "ab-nextjs-animations/slide-from-up/styles.css";
@import "ab-nextjs-animations/slide-up/styles.css";
@import "ab-nextjs-animations/slide-from-down/styles.css";
@import "ab-nextjs-animations/slide-down/styles.css";
@import "ab-nextjs-animations/slide-from-right/styles.css";
@import "ab-nextjs-animations/pop-in/styles.css";

/* let Tailwind see the utility classes used inside the Ab packages */
@source "../node_modules/ab-nextjs-core";
@source "../node_modules/ab-nextjs-components";
```

<details>
<summary>The whole <code>app/globals.css</code> after this step</summary>

```css
@import "tailwindcss";

/* the full Ab theme (colors, typography & base/shell) from `ab-nextjs-theme` */
@import "ab-nextjs-theme/styles.css";
/* chrome (toast, dialog, spinner, logo, doodle) from `ab-nextjs-components` — requires >= 0.1.8 */
@import "ab-nextjs-components/styles.css";
/* the Inter font from `ab-nextjs-fonts` */
@import "ab-nextjs-fonts/inter/styles.css";
/* the Material Symbols used by the Ab components (`material-symbols-rounded`) */
@import "ab-nextjs-icons/material-icons/index.css";
/* the keyframes + classes used by `useAbDialog` / `useAbMenu` / the backdrops / aside / toasts */
@import "ab-nextjs-animations/fade-in/styles.css";
@import "ab-nextjs-animations/fade-out/styles.css";
@import "ab-nextjs-animations/slide-from-up/styles.css";
@import "ab-nextjs-animations/slide-up/styles.css";
@import "ab-nextjs-animations/slide-from-down/styles.css";
@import "ab-nextjs-animations/slide-down/styles.css";
@import "ab-nextjs-animations/slide-from-right/styles.css";
@import "ab-nextjs-animations/pop-in/styles.css";

/* let Tailwind see the utility classes used inside the Ab packages */
@source "../node_modules/ab-nextjs-core";
@source "../node_modules/ab-nextjs-components";


/* follow the Ab theme set on `<html>` (`.dark` / `.light`) instead of the media query */
@custom-variant dark (&:where(.dark, .dark *));


/* Ab theme defaults while the theme script hasn't run (e.g. no JS) */
:root {
  color-scheme: light dark;
}

body {
  background-color: var(--md-sys-color-background, light-dark(#FFF8F5, #19120C));
  color: var(--md-sys-color-on-background, light-dark(#211A14, #EFE0D5));
}
```

</details>

> WARNING: Without the two `@source` lines, classes used inside the packages (like the `!hidden` of a closed backdrop) are never generated, and the containers of the layouts stay visible.

#### 2. Create the sidebar links: `app/hello-world/nav-links.ts`

Create the `hello-world` folder inside `app` first:

```sh
mkdir app/hello-world
```


```ts
// AB types
import type { AbSidebarLink } from 'ab-nextjs-components/ab-sidebar';


// the sidebar links of the hello-world shell
// (`icon` is a Material Symbols name, `value` is matched against the sidebar's `page` prop)
export const NAV_LINKS: AbSidebarLink[] = [
  { href: '/', icon: 'home', value: 'home', label: 'Home' },
  { href: '/hello-world', icon: 'waving_hand', value: 'hello-world', label: 'Hello World' },
];
```

#### 3. Create the footer: `app/hello-world/footer.tsx`

```tsx
// REACT types
import type { ReactElement } from 'react';


/**
 * `AppFooter` - Server Component
 *
 * Rendered in the `footer` slot of `<AbAppLayout>`.
 * NOTE: there is no `AbFooter` component (yet): a footer is plain markup in a slot.
 *
 * @returns { ReactElement }
 */
export default function AppFooter(): ReactElement {
  return (
    <footer className="pointer-events-auto flex w-full items-center justify-center p-2 text-xs opacity-50">
      © {new Date().getFullYear()} abElements. All rights reserved.
    </footer>
  );
}
```

#### 4. Create the header: `app/hello-world/page-header.tsx`

```tsx
// REACT types
import type { ReactElement, ReactNode } from 'react';
// AB components (server)
import AbLogo from 'ab-nextjs-components/server/ab-logo';


interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}


/**
 * `PageHeader` - Server Component
 *
 * Rendered in the `header` slot of `<AbMainLayout>` (or `<AbAsideLayout>`).
 * NOTE: header wrappers use `pointer-events: none`, so interactive headers need `pointer-events-auto`.
 *
 * @returns { ReactElement }
 */
export default function PageHeader({ title, actions }: PageHeaderProps): ReactElement {
  return (
    <header className="pointer-events-auto flex h-16 w-full items-center gap-3 px-4">
      {/* default `src` is an inlined Ab logo; pass `src` only to brand it */}
      <AbLogo type="contained" alt="Ab" size={28} />
      <h1 className="font-inter-semibold grow text-xl">{title}</h1>
      {actions}
    </header>
  );
}
```

> TIP: `<AbLogo type="contained">` ships with an inlined default logo. Pass `src` (e.g. [`public/ab-logo.svg`](./public/ab-logo.svg)) only when you want your own branding. Mask types (`outlined` / `hollow` / `naked`) without `src`/`mask` defer to `ab-nextjs-components`' `--app-logo-url`.

#### 5. Create the app shell: `app/hello-world/layout.tsx`

The root [`app/layout.tsx`](./app/layout.tsx) already renders `<html>`, `<body>`, the Inter font and the no-flash theme script, so this is a **nested layout**: it only adds the Ab shell around the pages of `/hello-world`.

```tsx
// REACT types
import type { ReactNode } from 'react';
// NEXT types
import type { Metadata } from 'next';

// AB core (server)
import AbAppLayout from 'ab-nextjs-core/server/ab-app-layout';
// AB components (client: highlights the active link with `usePathname`)
import AbSidebar from 'ab-nextjs-components/ab-sidebar';

import AppFooter from './footer';
import { NAV_LINKS } from './nav-links';


// the hello-world's own metadata (uses the root title template)
export const metadata: Metadata = {
  title: 'Hello World',
};


/**
 * `HelloWorldLayout` - Server Component
 *
 * The app shell: sidebar + content (main & aside) + footer.
 */
export default function HelloWorldLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="h-dvh w-full">
      <AbAppLayout
        orientation="horizontal"
        pageName="hello-world"
        sideBar={<AbSidebar links={NAV_LINKS} brandLabel="abElements" />}
        footer={<AppFooter />}
      >
        {children}
      </AbAppLayout>
    </div>
  );
}
```

#### 6. Create the page: `app/hello-world/page.tsx`

The page renders the two parts of the content: the `<main>` and the `<aside>`.

```tsx
// REACT types
import type { ReactElement } from 'react';

// AB core (server)
import AbMainLayout from 'ab-nextjs-core/server/ab-main-layout';
import AbAsideLayout from 'ab-nextjs-core/server/ab-aside-layout';
// AB components (server)
import AbIcon from 'ab-nextjs-components/server/ab-icon';

import PageHeader from './page-header';


/**
 * `HelloWorldPage` - Server Component
 *
 * Renders the main part (`<main>`) and the aside part (`<aside>`) of the hello-world page,
 * inside the content slot of the shell (see `layout.tsx`).
 *
 * @returns { ReactElement }
 */
export default function HelloWorldPage(): ReactElement {
  return (
    <>
      {/* Main - Hello World Page */}
      <AbMainLayout
        orientation="vertical"
        pageName="hello-world"
        header={<PageHeader title="Hello World" />}
      >
        <section className="flex flex-col gap-4 p-6">
          <p className="flex items-center gap-2">
            <AbIcon name="waving_hand" /> Hello from the <strong>main</strong> part!
          </p>
        </section>
      </AbMainLayout>

      {/* Aside - Hello World Page */}
      <AbAsideLayout
        orientation="vertical"
        pageName="hello-world"
        className="md:max-w-sm"
        header={<PageHeader title="Aside" />}
      >
        <section className="flex flex-col gap-4 p-6">
          <p>Hello from the <strong>aside</strong> part!</p>
        </section>
      </AbAsideLayout>
    </>
  );
}
```

#### 7. Run it

```sh
pnpm dev
```

Then open [http://localhost:3000/hello-world](http://localhost:3000/hello-world) 🎉

You should see the sidebar (with *Hello World* highlighted), the main part with its header, the aside part and the footer. Switch your system between light & dark: the colors follow the Ab theme.


### A toggleable aside

To open & close the aside from a button, use the **client** `<AbAsideLayout>` (`ab-nextjs-core/ab-aside-layout`). It reads its state from `<AbPageProvider>` (`defaultAsideOpen`, `asideDuration` in ms), and any Client Component below the provider can change it with the `useAbPage()` hook (`isAsideOpen`, `setAsideOpen`, ...).

`app/hello-aside/layout.tsx`:

```tsx
// REACT types
import type { ReactNode } from 'react';

// AB core
import AbAppLayout from 'ab-nextjs-core/server/ab-app-layout';
import { AbPageProvider } from 'ab-nextjs-core/ab-page-provider';
// AB components
import AbSidebar from 'ab-nextjs-components/ab-sidebar';

import AppFooter from '../hello-world/footer';
import { NAV_LINKS } from '../hello-world/nav-links';


// same shell as hello-world, wrapped in `<AbPageProvider>` for the aside state
export default function HelloAsideLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AbPageProvider defaultAsideOpen={true} asideDuration={300}>
      <div className="h-dvh w-full">
        <AbAppLayout
          orientation="horizontal"
          pageName="hello-aside"
          sideBar={<AbSidebar links={NAV_LINKS} />}
          footer={<AppFooter />}
        >
          {children}
        </AbAppLayout>
      </div>
    </AbPageProvider>
  );
}
```

`app/hello-world/aside-toggle.tsx` (a Client Component, it calls a hook):

```tsx
'use client';

// REACT types
import type { ReactElement } from 'react';

// AB core
import { useAbPage } from 'ab-nextjs-core/ab-page-provider';
// AB components
import AbIconButton from 'ab-nextjs-components/ab-icon-button';


/**
 * `AsideToggle` - Client Component
 *
 * Opens / closes the client `<AbAsideLayout>` (needs an `<AbPageProvider>` above it).
 *
 * @returns { ReactElement }
 */
export default function AsideToggle(): ReactElement {
  const { isAsideOpen, setAsideOpen } = useAbPage();

  return (
    <AbIconButton
      icon={isAsideOpen ? 'right_panel_close' : 'right_panel_open'}
      title={isAsideOpen ? 'Hide the aside' : 'Show the aside'}
      onClick={() => setAsideOpen(!isAsideOpen)}
    />
  );
}
```

`app/hello-aside/page.tsx` (the `ThemeToggle` comes from [Theming](#theming-)):

```tsx
// REACT types
import type { ReactElement } from 'react';

// AB core
import AbMainLayout from 'ab-nextjs-core/server/ab-main-layout';
// the CLIENT aside layout (reads its open state from `useAbPage`)
import AbAsideLayout from 'ab-nextjs-core/ab-aside-layout';

import PageHeader from '../hello-world/page-header';
import AsideToggle from '../hello-world/aside-toggle';
import ThemeToggle from '../hello-world/theme-toggle';


export default function HelloAsidePage(): ReactElement {
  return (
    <>
      <AbMainLayout
        orientation="vertical"
        pageName="hello-aside"
        header={
          <PageHeader
            title="Hello Aside"
            actions={
              <>
                <ThemeToggle />
                <AsideToggle />
              </>
            }
          />
        }
      >
        <p className="p-6">Use the toggle in the header to open / close the aside.</p>
      </AbMainLayout>

      <AbAsideLayout orientation="vertical" pageName="hello-aside" className="md:max-w-sm">
        <p className="p-6">On this page</p>
      </AbAsideLayout>
    </>
  );
}
```

> NOTE: Outside of an `<AbPageProvider>`, `useAbPage()` silently returns default values (`setAsideOpen` does nothing), which is why the provider wraps the whole shell in the layout.


---


## Dialogs & Menus 💬

Dialogs, menus and toasts are **not** React components (yet): they're driven by three hooks of `ab-nextjs-hooks` (`useAbDialog`, `useAbMenu`, `useAbToast`) that show them **inside containers rendered by the Ab layouts**. Pick the container, and you've picked where it shows up.


### Where they live: main, aside or the whole app

| Placement | `part` | Containers | Rendered by | Your menus go in |
|:----------|:-------|:-----------|:------------|:-----------------|
| (a) Inside the **main** part | `'main'` | `main > .Backdrop`, `.Menus`, `.Dialogs`, `.Toasts` | `<AbMainLayout>` | its `menus` slot |
| (b) Inside the **aside** part | `'aside'` | `aside > .Backdrop`, `.Menus`, `.Dialogs`, `.Toasts` | `<AbAsideLayout>` | its `menus` slot |
| (c) **Over the whole app** | `'full'` | `#backdrop`, `#menus`, `#dialogs`, `#toasts` | `<AbAppLayout>` | its `menus` slot |

Dialogs and toasts are **created by the hooks** in those containers; menus are **`<AbMenu>` (or equivalent markup)** placed in a `menus` slot, which `useAbMenu` then shows & hides.


### Dialogs with `useAbDialog`

`useAbDialog().open(params, timeout, part)` builds a dialog in the chosen part and animates it in (`timeout` is the animation, in seconds). The `params` are typed as `DialogParams` (exported): `title`, `message`, `confirmBtnText`, `cancelBtnText`, `onConfirm`, `onCancel`, `isCancelable`, `html`, `noConfirmBtn`, `noCancelBtn`, `noButtons`, `list`, ... Confirm / cancel **run then close**; return `false` to keep the dialog open. Text is escaped unless `html: true`.

`app/hello-world/dialog-button.tsx`:

```tsx
'use client';

// REACT types
import type { ReactElement } from 'react';

// AB hooks
import { useAbDialog, type AbDialogPart } from 'ab-nextjs-hooks';
// AB components
import AbButton from 'ab-nextjs-components/ab-button';


interface DialogButtonProps {
  part: AbDialogPart;
  label: string;
}


/**
 * `DialogButton` - Client Component
 *
 * Opens a confirm dialog in the `main` part, the `aside` part or over the whole app (`full`).
 * Text is escaped by default; `onConfirm` / `onCancel` run then close (return `false` to keep open).
 *
 * @returns { ReactElement }
 */
export default function DialogButton({ part, label }: DialogButtonProps): ReactElement {
  // a dialog API bound to this component
  const dialog = useAbDialog();

  // open a fresh dialog in the given part
  const openDialog = (): void => {
    dialog
      .open(
        {
          title: 'Hello from abElements 👋',
          message: `This dialog lives in the "${part}" part.`,
          confirmBtnText: 'Got it',
          cancelBtnText: 'Close',
          // optional: run work, then the dialog closes (return `false` to keep it open)
          onConfirm: () => {
            console.log(`confirmed in ${part}`);
          },
        },
        0.5, // open animation, in seconds
        part,
      )
      .catch((error: unknown) => console.warn(error));
  };

  return <AbButton type="outlined" label={label} onClick={openDialog} />;
}
```

> NOTE: `onConfirm` / `onCancel` **run, then the dialog closes**. Return `false` (or a Promise that resolves to `false`) to keep it open. A cancelable backdrop click does the same as Cancel (also respects `false`).

> NOTE: `title`, `message` and the button texts are **escaped by default** (XSS-safe). Pass `html: true` only for trusted markup.


### Menus with `useAbMenu`

`useAbMenu({ id, origin, isCancelable, closeOnItemClick, onItemClick }, duration, part)` shows the `<menu data-id={id}>` found in `ul.{origin}` of the part's menus container, with its backdrop. It returns `{ show, hide }`.

Use `<AbMenu>` for that markup: it sets `data-id={id}` (and `data-id` / `menu-item` on items; cancel is `li[role=close-menu]`), so the hook can find it:

`app/hello-world/menu-items.tsx`:

```tsx
// REACT types
import type { ReactElement } from 'react';

// AB components (client: sets `data-id` so `useAbMenu` can find it)
import AbMenu from 'ab-nextjs-components/ab-menu';


interface MenuItemsProps {
  id: string;
  title: string;
}


/**
 * `MenuItems` - Client Component (via `<AbMenu>`)
 *
 * An `<AbMenu>` with `data-id={id}`, ready for `useAbMenu` to show & hide it
 * inside a layout's `.Menus > ul.{origin}` container.
 *
 * @returns { ReactElement }
 */
export default function MenuItems({ id, title }: MenuItemsProps): ReactElement {
  return (
    <AbMenu
      id={id}
      title={title}
      hidden
      isCancelable
      items={[
        { id: 'share', label: `Share ${title}`, icon: 'share' },
        { id: 'bookmark', label: 'Bookmark', icon: 'bookmark' },
      ]}
    />
  );
}
```

One `<ul>` per placement, each passed to the `menus` slot of its layout:

`app/hello-world/main-menus.tsx`:

```tsx
import MenuItems from './menu-items';

// rendered in `main > .Menus` (the `menus` slot of `<AbMainLayout>`)
export default function MainMenus() {
  return (
    <ul className="main-menus">
      <MenuItems id="main-menu" title="this page" />
    </ul>
  );
}
```

`app/hello-world/aside-menus.tsx`:

```tsx
import MenuItems from './menu-items';

// rendered in `aside > .Menus` (the `menus` slot of `<AbAsideLayout>`)
export default function AsideMenus() {
  return (
    <ul className="aside-menus">
      <MenuItems id="aside-menu" title="this section" />
    </ul>
  );
}
```

`app/hello-world/app-menus.tsx`:

```tsx
import MenuItems from './menu-items';

// rendered in `#menus` (the `menus` slot of `<AbAppLayout>`): over the whole app
export default function AppMenus() {
  return (
    <ul className="app-menus">
      <MenuItems id="app-menu" title="abElements" />
    </ul>
  );
}
```

And a button that opens one of them, `app/hello-world/menu-button.tsx`:

```tsx
'use client';

// REACT types
import type { ReactElement } from 'react';

// AB hooks
import { useAbMenu } from 'ab-nextjs-hooks';
// AB components
import AbButton from 'ab-nextjs-components/ab-button';


interface MenuButtonProps {
  id: string; // the `data-id` of the `<menu>`
  origin: string; // the class name of its `<ul>`
  part: 'main' | 'aside' | 'full';
  label: string;
}


/**
 * `MenuButton` - Client Component
 *
 * Shows the `<menu data-id={id}>` found in `.Menus > ul.{origin}` of the given part.
 *
 * @returns { ReactElement }
 */
export default function MenuButton({ id, origin, part, label }: MenuButtonProps): ReactElement {
  const menu = useAbMenu(
    {
      id,
      origin,
      isCancelable: true, // a click on the backdrop closes it
      closeOnItemClick: true,
      onItemClick: (itemId) => console.log(`"${itemId}" clicked in ${id}`),
    },
    0.5, // show/hide animation, in seconds
    part,
  );

  return <AbButton type="text" label={label} onClick={menu.show} />;
}
```


### Putting it all together

The final shell puts the sidebar in the real **`sideBar` slot** and passes the app-wide menus to `<AbAppLayout>`, `app/hello-world/layout.tsx`:

```tsx
// REACT types
import type { ReactNode } from 'react';
// NEXT types
import type { Metadata } from 'next';

// AB core (server)
import AbAppLayout from 'ab-nextjs-core/server/ab-app-layout';
// AB components (client: highlights the active link with `usePathname`)
import AbSidebar from 'ab-nextjs-components/ab-sidebar';

import AppFooter from './footer';
import AppMenus from './app-menus';
import { NAV_LINKS } from './nav-links';


// the hello-world's own metadata (uses the root title template)
export const metadata: Metadata = {
  title: 'Hello World',
};


/**
 * `HelloWorldLayout` - Server Component
 *
 * The app shell: sidebar + content (main & aside) + footer, plus the app-wide
 * `#backdrop`, `#menus`, `#dialogs` and `#toasts` containers that `<AbAppLayout>` renders.
 */
export default function HelloWorldLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="h-dvh w-full">
      <AbAppLayout
        orientation="horizontal"
        pageName="hello-world"
        sideBar={<AbSidebar links={NAV_LINKS} brandLabel="abElements" />}
        footer={<AppFooter />}
        menus={<AppMenus />}
      >
        {children}
      </AbAppLayout>
    </div>
  );
}
```

And the final page, with a dialog & a menu in each placement, `app/hello-world/page.tsx`:

```tsx
// REACT types
import type { ReactElement } from 'react';

// AB core (server)
import AbMainLayout from 'ab-nextjs-core/server/ab-main-layout';
import AbAsideLayout from 'ab-nextjs-core/server/ab-aside-layout';
// AB components (server)
import AbIcon from 'ab-nextjs-components/server/ab-icon';

import PageHeader from './page-header';
import DialogButton from './dialog-button';
import MenuButton from './menu-button';
import MainMenus from './main-menus';
import AsideMenus from './aside-menus';


/**
 * `HelloWorldPage` - Server Component
 *
 * Renders the main part (`<main>`) and the aside part (`<aside>`) of the hello-world page,
 * inside the content slot of the shell (see `layout.tsx`).
 *
 * @returns { ReactElement }
 */
export default function HelloWorldPage(): ReactElement {
  return (
    <>
      {/* Main - Hello World Page */}
      <AbMainLayout
        orientation="vertical"
        pageName="hello-world"
        header={<PageHeader title="Hello World" />}
        menus={<MainMenus />}
      >
        <section className="flex flex-col gap-4 p-6">
          <p className="flex items-center gap-2">
            <AbIcon name="waving_hand" /> Hello from the <strong>main</strong> part!
          </p>

          {/* Dialogs: inside main & over the whole app */}
          <div className="flex flex-wrap gap-3">
            <DialogButton part="main" label="Dialog in main" />
            <DialogButton part="full" label="Dialog over the app" />
          </div>

          {/* Menus: inside main & over the whole app */}
          <div className="flex flex-wrap gap-3">
            <MenuButton id="main-menu" origin="main-menus" part="main" label="Menu in main" />
            <MenuButton id="app-menu" origin="app-menus" part="full" label="Menu over the app" />
          </div>
        </section>
      </AbMainLayout>

      {/* Aside - Hello World Page */}
      <AbAsideLayout
        orientation="vertical"
        pageName="hello-world"
        className="md:max-w-sm"
        header={<PageHeader title="Aside" />}
        menus={<AsideMenus />}
      >
        <section className="flex flex-col gap-4 p-6">
          <p>Hello from the <strong>aside</strong> part!</p>
          <DialogButton part="aside" label="Dialog in aside" />
          <MenuButton id="aside-menu" origin="aside-menus" part="aside" label="Menu in aside" />
        </section>
      </AbAsideLayout>
    </>
  );
}
```

| Button | Shows up |
|:-------|:---------|
| *Dialog in main* / *Menu in main* | (a) inside the `<main>`, over its content only |
| *Dialog in aside* / *Menu in aside* | (b) inside the `<aside>`, over its content only |
| *Dialog over the app* / *Menu over the app* | (c) over the whole app (sidebar included) |


### Inline menus with `<AbMenu>`

`<AbMenu>` (`id`, `title`, `items`, `hidden`, `isCancelable`, `onCancel`, `className`) is also a good fit for a small menu anchored to a button, opened & closed with React state (no `.Menus` container, no backdrop), `app/hello-world/sort-menu.tsx`:

```tsx
'use client';

// REACT types
import type { ReactElement } from 'react';
// REACT hooks
import { useState } from 'react';

// AB components
import AbButton from 'ab-nextjs-components/ab-button';
import AbMenu from 'ab-nextjs-components/ab-menu';


type SortBy = 'name' | 'date';


/**
 * `SortMenu` - Client Component
 *
 * A small inline menu, opened & closed with React state (no `.Menus` container, no backdrop).
 *
 * @returns { ReactElement }
 */
export default function SortMenu(): ReactElement {
  const [opened, setOpened] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortBy>('name');

  // pick a sort order, then close the menu
  const pick = (value: SortBy): void => {
    setSortBy(value);
    setOpened(false);
  };

  return (
    <div className="relative w-fit">
      <AbButton type="text" label={`Sort by ${sortBy}`} onClick={() => setOpened(!opened)} />

      <AbMenu
        id="sort-menu"
        title="Sort by"
        className="absolute top-full left-0 z-10 mt-2"
        hidden={!opened}
        isCancelable={true}
        onCancel={() => setOpened(false)}
        items={[
          { id: 'name', label: 'Name', icon: 'sort_by_alpha', selected: sortBy === 'name', onClick: () => pick('name') },
          { id: 'date', label: 'Date', icon: 'calendar_today', selected: sortBy === 'date', onClick: () => pick('date') },
        ]}
      />
    </div>
  );
}
```

> TIP: The same `<AbMenu>` works both ways: drive it with `useAbMenu` (put it in a `menus` slot, keep `hidden`, open with the hook) **or** control it with React state for a small inline menu (like this sort menu). It always sets `data-id={id}`.


### Toasts with `useAbToast`

`useAbToast().show({ message, type, part, html }, timeout, force)` shows a toast in the part's toasts container for `timeout` seconds. `type` is one of `normal`, `success`, `error`, `good` or `bad`. `message` is **escaped by default**; pass `html: true` only for trusted markup.

`app/hello-world/toast-button.tsx`:

```tsx
'use client';

// REACT types
import type { ReactElement } from 'react';

// AB hooks
import { useAbToast } from 'ab-nextjs-hooks';
// AB components
import AbButton from 'ab-nextjs-components/ab-button';


/**
 * `ToastButton` - Client Component
 *
 * Pops a toast at the bottom of the `main` part for 3 seconds.
 *
 * @returns { ReactElement }
 */
export default function ToastButton(): ReactElement {
  const toast = useAbToast();

  const saySaved = (): void => {
    toast
      .show({ message: 'Saved to your account', type: 'success', part: 'main' }, 3, true)
      .catch((error: unknown) => console.warn(error));
  };

  return <AbButton type="text" label="Show a toast" onClick={saySaved} />;
}
```


### Package notes

A few things that are still by design (not bugs):

| No. | Note | What to do |
|:----|:-----|:-----------|
| 1 | There is no `<AbDialog>`, `<AbHeader>` or `<AbFooter>` component yet. | Dialogs: `useAbDialog`. Header & footer: your own markup in the layout slots. |
| 2 | Dialogs / menus / toasts target landmarks via `data-ab-part` (and `aside.AbAsideLayout`). | Keep the sidebar as `<AbSidebar>` in the **`sideBar`** slot; keep asides as `<AbAsideLayout>`. Import `slide-from-right` (and `pop-in` for toasts) from `ab-nextjs-animations` in `globals.css`. |

Fixed in **hooks 0.1.4 / core 0.1.5 / components 0.1.7** (so this guide no longer works around them): aside dialog targeting, `<AbMenu data-id>`, backdrop close + `onConfirm`/`onCancel` run-then-close, XSS-safe text by default (`html: true` opt-in), exported `AbDialogPart` / `DialogParams`, `useAbTheme` key `theme` on `<html>`, `.slideFromRight` on the aside, and `<AbLogo>`'s default inlined `src`.

---


## Theming 🎨

The colors, typography and base/shell styles come from [`ab-nextjs-theme`](https://www.npmjs.com/package/ab-nextjs-theme), and the chrome (toast, dialog, spinner, logo, doodle) from [`ab-nextjs-components`](https://www.npmjs.com/package/ab-nextjs-components), both imported in [`app/globals.css`](./app/globals.css):

```css
@import "ab-nextjs-theme/styles.css";
@import "ab-nextjs-components/styles.css";
```

#### Light & dark

* The theme is a class on `<html>`: **`.light`** or **`.dark`** (plus `data-theme` and `color-scheme`).
* It's set **before the first paint** by the `themeScript` of [`app/layout.tsx`](./app/layout.tsx): the saved `theme` from `localStorage`, or the system's color scheme. That's why `<html>` has `suppressHydrationWarning`.
* `useAbTheme` uses the same `theme` key on `<html>` and migrates any legacy `abTheme` / `body[data-theme]` value once.
* Tailwind's `dark:` variant follows that class (not the media query), thanks to this line in `globals.css`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

#### Using the colors

The theme's colors are CSS variables (`--md-sys-color-primary`, `--md-sys-color-on-background`, `--md-sys-color-surface-container-low`, ...). Use them with Tailwind's variable syntax, like the existing pages do:

```tsx
<p className="font-inter-bold text-6xl text-(--md-sys-color-primary)">404</p>

<div className="lg:bg-(--md-sys-color-surface-container-low)">...</div>

<Image src="/ab-elements.svg" alt="AB Elements" className="dark:invert" width={439} height={96} />
```

The browser UI colors (`themeColor` in [`app/viewport.ts`](./app/viewport.ts)) come from the same source, `ab-nextjs-theme/material-theme.json`.

#### Fonts

`ab-nextjs-fonts` provides the Inter font (`@import "ab-nextjs-fonts/inter/styles.css"`), its class names for JS (`interStyles.regular` on `<body>`) and utility classes from `font-inter-extralight` to `font-inter-black` (`font-inter-medium`, `font-inter-semibold`, `font-inter-bold`, ...).

#### A theme toggle

Use `useAbTheme` from `ab-nextjs-hooks`: it stores the choice under the **`theme`** key (same as the no-flash script in [`app/layout.tsx`](./app/layout.tsx)), stamps `.light` / `.dark`, `data-theme` and `color-scheme` on `<html>`, and migrates a legacy `abTheme` / `body[data-theme]` value once.

`app/hello-world/theme-toggle.tsx`:

```tsx
'use client';

// REACT types
import type { ReactElement } from 'react';

// AB hooks
import { useAbTheme } from 'ab-nextjs-hooks';
// AB components
import AbIconButton from 'ab-nextjs-components/ab-icon-button';


/**
 * `ThemeToggle` - Client Component
 *
 * Flips abElements between ☀️ light and 🌙 dark via `useAbTheme`
 * (storage key `theme` on `<html>`, with migration from legacy `abTheme`).
 *
 * @returns { ReactElement }
 */
export default function ThemeToggle(): ReactElement {
  const [theme, updateTheme] = useAbTheme('light');

  const toggleTheme = (): void => {
    updateTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return <AbIconButton icon="contrast" title="Toggle the theme" onClick={toggleTheme} />;
}
```

> TIP: The helpers `AB_THEME_STORAGE_KEY` (`'theme'`), `AB_THEME_LEGACY_STORAGE_KEY` (`'abTheme'`) and `applyAbThemeToDocument` are also exported if you need them outside the hook.


---


## Internationalization 🌍

> IMPORTANT: **Planned.** [`ab-nextjs-i18n`](https://www.npmjs.com/package/ab-nextjs-i18n) **0.1.0** is published, but it's **not installed in this app yet**, and the app currently has a single language (`NEXT_PUBLIC_APP_LANG`, `en` by default). The snippets below follow the published 0.1.0 package (its templates and exports) and were type-checked with Next.js 16.3.4 and `next-intl` 4.14.9. Adopting it is a change of its own (one branch, one PR).

`ab-nextjs-i18n` wraps [`next-intl`](https://next-intl.dev) for the **Language** setting of abElements: `en` (default), `fr`, `es` and `ru`, with the default locale at `/` and the others at `/fr`, `/es`, `/ru` (`localePrefix: 'as-needed'`).

#### 1. Install & create the files

```sh
pnpm add ab-nextjs-i18n next-intl     # next-intl (^4.14.9) is a peer dependency: install it too
pnpm exec ab-nextjs-i18n init --dry-run   # what would be created
pnpm exec ab-nextjs-i18n init         # only creates missing files, never overwrites
```

`init` creates `i18n/config.ts`, `i18n/request.ts`, `i18n/navigation.ts`, `i18n/global.d.ts` (typed keys), `proxy.ts` and `messages/{en,fr,es,ru}.json`. The config is the single source of truth:

```ts
// i18n config: the single source of truth for locales (used by the app, the proxy and the ab-nextjs-i18n CLI).
// Keep this file free of TypeScript-only runtime syntax (enums, namespaces): the CLI imports it with Node's type stripping.
import { defineAbI18n } from 'ab-nextjs-i18n/config';

export const abI18nConfig = defineAbI18n({
  locales: ['en', 'fr', 'es', 'ru'],
  defaultLocale: 'en',
  // 'as-needed': the default locale lives at `/`, the others at `/fr`, `/es`...
  localePrefix: 'as-needed',
  // Only written when the user picks a locale (switchLocale / createAbLocaleCookieAction), for maxAge (one year).
  localeCookie: { name: 'NEXT_LOCALE', maxAge: 60 * 60 * 24 * 365 },
  messagesDir: 'messages',
});

export type AppLocale = (typeof abI18nConfig.locales)[number];

export default abI18nConfig;
```

#### 2. Plug it into Next.js

Wrap the existing config with `withAbI18n` (it also adds `ab-nextjs-i18n` to `transpilePackages`), in [`next.config.ts`](./next.config.ts):

```ts
import type { NextConfig } from 'next';
import { withAbI18n } from 'ab-nextjs-i18n/plugin';


// create abElements' Next.js config as `nextConfig`
const nextConfig: NextConfig = {
  // the Ab packages ship TypeScript sources, so let Next.js compile them
  transpilePackages: [
    'ab-nextjs-fonts',
    'ab-nextjs-icons',
    'ab-nextjs-animations',
    'ab-nextjs-theme',
    'ab-nextjs-hooks',
    'ab-nextjs-core',
    'ab-nextjs-components',
  ],
};


// plug in next-intl (and add `ab-nextjs-i18n` to `transpilePackages`)
export default withAbI18n(nextConfig);
```

The generated `proxy.ts` (Next.js 16's middleware) detects the locale and redirects; it **reads** the `NEXT_LOCALE` cookie but never writes it:

```ts
// Next.js 16 proxy (formerly middleware): locale detection and redirects (it reads NEXT_LOCALE, never writes it).
// To add an auth guard, pass `onRequest` (see the ab-nextjs-i18n README, "Proxy (with auth)").
import { createAbI18nProxy } from 'ab-nextjs-i18n/proxy';
import abI18nConfig from './i18n/config';

export default createAbI18nProxy(abI18nConfig);

export const config = {
  // Everything except API routes, Next.js / Vercel internals and files with an extension.
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
```

#### 3. Move the root layout under `[locale]`

`app/[locale]/layout.tsx` becomes **the root layout** (and `app/layout.tsx` goes away, so its metadata, viewport, fonts and the no-flash theme script move into it):

```tsx
// REACT types
import type { ReactNode } from 'react';
// NEXT hooks
import { notFound } from 'next/navigation';

// AB i18n
import { AbI18nProvider } from 'ab-nextjs-i18n';
import { isAbLocale } from 'ab-nextjs-i18n/config';
import { generateAbStaticParams } from 'ab-nextjs-i18n/server';

import abI18nConfig from '@/i18n/config';


// prerender /, /fr, /es and /ru at build time
export const generateStaticParams = () => generateAbStaticParams(abI18nConfig);


// the ROOT layout once i18n lands (it replaces `app/layout.tsx`)
export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // unknown prefix → 404
  if (!isAbLocale(abI18nConfig, locale)) notFound();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <AbI18nProvider config={abI18nConfig}>{children}</AbI18nProvider>
      </body>
    </html>
  );
}
```

#### 4. Use the messages

`messages/en.json` (ICU syntax: `{name}`, plurals, rich-text tags):

```json
{
  "App": {
    "title": "Welcome to abElements",
    "greeting": "Hello, {name}!",
    "items": "{count, plural, =0 {No items yet} one {# item} other {# items}}",
    "learnMore": "Read the <link>docs</link> to add your own messages."
  }
}
```

In a **Server Component**, with `getAbTranslations` (and `AbLink` from `@/i18n/navigation` instead of `next/link`):

```tsx
// AB i18n (server)
import { getAbTranslations } from 'ab-nextjs-i18n/server';

import { AbLink } from '@/i18n/navigation';
import Greeting from '@/components/greeting';


export default async function HomePage() {
  // the request's locale
  const t = await getAbTranslations('App');

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('items', { count: 3 })}</p>
      <p>{t.rich('learnMore', { link: (chunks) => <AbLink href="/docs">{chunks}</AbLink> })}</p>
      <Greeting name="Ada" />
    </main>
  );
}
```

In a **Client Component**, with `useAbTranslations`:

```tsx
'use client';

// AB i18n (client)
import { useAbTranslations } from 'ab-nextjs-i18n';


export default function Greeting({ name }: { name: string }) {
  const t = useAbTranslations('App');

  return <p>{t('greeting', { name })}</p>;
}
```

#### 5. Translate & check

```sh
# keys only come from env vars, never from a file in the repo
export DEEPL_API_KEY="…"    # DeepL first
export OPENAI_API_KEY="…"   # OpenAI as the fallback

pnpm exec ab-nextjs-i18n translate --dry-run   # the plan only (no API calls, no keys needed)
pnpm exec ab-nextjs-i18n translate             # fills the missing keys of fr, es & ru
pnpm exec ab-nextjs-i18n check                 # exit 1 on missing keys / placeholder mismatches
```

> TIP: Run `check` before every pull request that touches `messages/`. The full API (`useAbLocaleSwitch`, `createAbLocaleCookieAction`, `onRequest` for auth in the proxy, ...) is documented in the [`ab-nextjs-i18n` README](https://github.com/abraham-ukachi/ab-nextjs-i18n#readme).


---


## Testing 🧪

There's **no automated test suite** in this repo yet (no test runner, no CI workflow). Until there is, every pull request must:

1. pass `pnpm lint`,
2. pass `pnpm build` (production build + type check),
3. be checked by hand with `pnpm dev` (or `pnpm build && pnpm start`) in **light & dark**, on a **mobile** and a **laptop** width, for every page it touches.

> NOTE: Tests (e.g. Playwright for the screens) will come with the docs screens. When they do, use ✅ `:white_check_mark:` for them, as [gitmoji.dev](https://gitmoji.dev) intends.


---


## Reporting Bugs & Requesting Features 🐛

* **The app** (docs pages, layout, PWA, README, this guide): open an issue in [abraham-ukachi/ab-elements-app/issues](https://github.com/abraham-ukachi/ab-elements-app/issues).
* **A package** (a component, a hook, a theme token, an icon...): open it in the package's own repo, e.g. [ab-nextjs-components/issues](https://github.com/abraham-ukachi/ab-nextjs-components/issues) (every link is in [The Ab packages](#the-ab-packages-) table).

A good bug report has:

| No. | What | Example |
|:----|:-----|:--------|
| 1 | A clear title | *"Dialog backdrop click should keep the dialog open when `onCancel` returns false"* |
| 2 | Steps to reproduce | the page, the clicks, the screen width |
| 3 | Expected vs. actual behavior | a screenshot (light / dark) helps a lot |
| 4 | Versions | the app version (`package.json`), the Ab package versions, your browser & OS |

For a feature request, describe the **problem** first, then your idea. If it's reusable UI, it'll be built in a package first ;)

> WARNING: Never paste the content of an `.env*` file, a token or an API key in an issue.


---


## License

This **`ab-elements-app`** project is [MIT Licensed](./LICENSE) ;)

By contributing, you agree that your contributions will be licensed under the same license.


## Contact

| Name | Abraham Ukachi |
|:-----|:---------------|
| GitHub | [@abraham-ukachi](https://github.com/abraham-ukachi) |
| Email | [abraham.ukachi@laplateforme.io](mailto:abraham.ukachi@laplateforme.io) |
| Website | [abraham-ukachi.vercel.app](https://abraham-ukachi.vercel.app) |


---

<p align="center">
  Made with ❤️ by <a href="https://github.com/abraham-ukachi" target="_blank">Abraham Ukachi</a>
  <br />
  <i>We'll always do <b>more</b> 😜</i>
</p>
