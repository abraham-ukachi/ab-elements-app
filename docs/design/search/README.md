# Search drawer 🔎

The current search design for abElements. Search opens a **drawer**, not a page and not a `Ctrl/⌘ + K` palette. The previous command palette design is kept for reference under [Previous](../../../README.md#search-design-).

| Frame | Light | Dark |
|:------|:------|:-----|
| Mobile | [search-drawer-mobile-light](../../../.github/screenshots/mobile/search-drawer-mobile-light.png) | [search-drawer-mobile-dark](../../../.github/screenshots/mobile/search-drawer-mobile-dark.png) |
| Mobile, no results | [search-drawer-empty-mobile-light](../../../.github/screenshots/mobile/search-drawer-empty-mobile-light.png) | [search-drawer-empty-mobile-dark](../../../.github/screenshots/mobile/search-drawer-empty-mobile-dark.png) |
| Laptop | [search-drawer-laptop-light](../../../.github/screenshots/laptop/search-drawer-laptop-light.png) | [search-drawer-laptop-dark](../../../.github/screenshots/laptop/search-drawer-laptop-dark.png) |

## Spec (bottom drawer variant)

- **Opens from:** the Search tab in the bottom nav, and the top-bar search field on laptop. There is no shortcut key hint anywhere.
- **Mobile:** opens straight to full height (top at 47px), with the handle on top, then the title "Search" and a 44px close button. Swiping down past 30% or faster than 0.5px/ms closes it; there's no 70% stop because the keyboard is up.
- **Laptop:** centred in the main column, max 640px wide and max 70% of the app height (567px). Results scroll inside with a 48px fade at the bottom.
- **Input:**
  - 48px tall with an 8px radius and a 2px bronze focus border.
  - Autofocused on open; on iOS, focus inside the same tap gesture so the keyboard opens.
  - Placeholder: "Search packages, components, hooks…".
  - A 40px clear (×) button appears when there's text; clearing keeps focus in the input.
- **Recent searches:** up to 4, stored in `localStorage` (`ab:search:recent`), most recent first, de-duplicated. Each row has a history icon and a remove × button (aria-label "Remove <term>"). Recents are saved when a result is opened or Enter is pressed. On laptop they show only while the query is empty; on mobile they stay above the results until the query is 2+ characters.
- **Results:**
  - Queried after a 150ms debounce, from 2 characters.
  - Grouped under package headers (uppercase label plus the mono package name).
  - Each row is at least 56px: a 32px icon tile, the name (Inter 600 15px), a one-line description (13px, ellipsis) and the mono version.
  - The matched text is bronze 700 (#8b6340 in light, #D8B085 in dark). Bold weight plus colour means it doesn't rely on colour alone.
  - The active row uses the #F7EDE4 tint.
- **No results:** "No results for “q”", a hint, and a "Did you mean …?" suggestion (frame `search-drawer-empty-mobile-*`).
- **Keyboard (laptop):**
  - ↑/↓ move the active option across groups, wrapping at the ends.
  - Enter opens the active result. With no active option, Enter opens the first result.
  - Esc clears the query first, then closes on a second press.
  - Tab moves from the input to the result list.
- **ARIA:**
  - The input is `role="combobox"` with `aria-expanded`, `aria-controls` pointing to the listbox, `aria-autocomplete="list"` and `aria-activedescendant` (focus stays in the input).
  - The results are a `role="listbox"`. Each group is `role="group"`, labelled by its header. Rows are `role="option"` with `aria-selected`.
  - A polite live region announces "4 results" or "No results".
  - The match highlight is a `<mark>` styled bronze.
- **Contrast:** #8B6340 on #FFF8F5 is 5.1, on the #F7EDE4 tint 4.6. #D8B085 on #1D150F is 9.0. The muted description text is 6.2 (light) and 7.5 (dark).
