<!--
  Title: gitmoji shortcode + imperative summary + the new version in parentheses,
  e.g. `:construction_worker: Add the CI workflow (lint, typecheck, build) (0.2.10)`.
  Read CONTRIBUTING.md ("Branches, Pull Requests & Versioning") before opening this pull request.
-->

## Summary

<!-- What does this pull request change, and why? Keep it to one concern. -->

-

## Version

<!-- The patch version this pull request releases, e.g. 0.2.9 → 0.2.10 -->

`0.2.x` → `0.2.y`

## Announcement & linked issue

<!-- Link the announcement (bump, push & merge) and the issue this pull request closes, if any. -->

- Announcement:
- Closes #

## Checklist

### Before the push

- [ ] Branch is named `<type>/<short-kebab-case-description>` (`feat/`, `fix/`, `chore/`, `docs/`, `test/`, `ci/`)
- [ ] Every commit subject starts with a gitmoji **shortcode** (e.g. `:memo:`), in the imperative mood
- [ ] `pnpm lint` passes locally
- [ ] `pnpm typecheck` passes locally
- [ ] `pnpm test` passes locally
- [ ] `pnpm build` passes locally
- [ ] Checked by hand in **light & dark**, on a **mobile** and a **laptop** width, for every page it touches (or N/A)
- [ ] No `.env*` values, tokens or API keys anywhere in the diff

### Release

- [ ] The version bump was announced before it was committed
- [ ] The **last commit** is `chore(release): 0.2.y` and only bumps `version` in `package.json` + adds the `CHANGELOG.md` heading
- [ ] The push was announced before the branch was pushed

### Merge

- [ ] CI is green
- [ ] The merge was announced before merging
- [ ] Merged with **Create a merge commit** (never *Squash and merge*, never *Rebase and merge*)
- [ ] The merge commit is tagged `v0.2.y` and the tag is pushed (announced too)
