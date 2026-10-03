<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# abElements crew rules

Rules for any agent (or human) working on **ab-elements-app**. Keep the Next.js block above as-is; `next dev` manages it.

## Toolchain

- **pnpm 11** only (pinned via `packageManager`). Don't use npm or yarn and don't add another lockfile. pnpm settings (e.g. `allowBuilds`, `overrides`) live in `pnpm-workspace.yaml`, not in `package.json`.
- **Node.js 24+** (`engines.node`). Vercel uses it to pick the runtime.
- **Next.js 16.3.4** with React 19 and Turbopack (the default; no `--turbopack` flag). Every `ab-nextjs-*` package peer-pins `next` to exactly `16.3.4`, so **bump Next and all Ab packages together, never one alone**.
- Tailwind CSS v4 with CSS-first config (`@import "tailwindcss"` + `@tailwindcss/postcss`). There's no `tailwind.config.*`.
- ESLint 9 flat config from `eslint-config-next`. Run `pnpm lint` (`eslint .`) and `pnpm build` before every commit; both must pass.

## Packages first

The app is a showcase of God's published packages: `ab-nextjs-fonts`, `ab-nextjs-icons`, `ab-nextjs-animations`, `ab-nextjs-theme`, `ab-nextjs-hooks`, `ab-nextjs-core` and `ab-nextjs-components`.

- If a component, hook, layout or token is missing, **build it in the right `ab-nextjs-*` package first**, release it, then use it here. Don't build one-off copies inside `app/`.
- Use the real Ab APIs instead of re-implementing them, e.g. `AbButton` (and the rest of the components) from `ab-nextjs-components`, `useAbTheme` from `ab-nextjs-hooks`, and `AbPageProvider` plus the `Ab*Layout` shells from `ab-nextjs-core`. Check each package's README or `index.ts` catalog for what exists and its status.
- Ab packages must only depend on registry semver ranges. Never publish `file:`/`link:` deps (`ab-nextjs-theme@0.2.8` did; fixed in 0.2.9, which now has a prepublish guard).

## Product source of truth

- Follow `README.md` (pages, routes, design screens and the components each page uses) when adding or changing pages. Don't remove or restructure pages without God's sign-off.
- Data features follow the MySQL design in `database/schema.sql` (see `database/README.md`). Change the schema there first, and keep secrets out of the repo (env vars only, see README).

## Git

- Commit messages use gitmoji with a capitalized summary, e.g. `:memo: Update README`, `:sparkles: Add settings page`, `:bug: Fix theme toggle`, `:arrow_up: Upgrade deps`, `:wrench: Update config`.
- Version bumps get their own commit, `chore(release): x.y.z`, which updates `package.json` and adds a `CHANGELOG.md` entry.
- Work on a branch. **No push, PR merge or npm publish without God's review.**
