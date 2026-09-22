# Changelog

## 1.7.0

### Breaking — the package no longer ships Tailwind

Up to 1.6.4, importing the library injected a compiled Tailwind build — the reset
plus roughly 160 utility classes — into the page at runtime. Injected styles sit
outside the cascade layers, and unlayered CSS outranks anything inside an `@layer`,
so an app on Tailwind v4 had its own utilities silently overridden: `md:hidden` and
the like stopped applying.

1.7.0 ships only the table's own chrome, as a stylesheet. The components still use
Tailwind classes, so your Tailwind build has to see them now:

```js
// tailwind.config.js — Tailwind v3
content: ["./src/**/*.{ts,tsx}", "./node_modules/fuzzy-tables/dist/index.mjs"],
```

```css
/* your CSS entry — Tailwind v4 */
@source "../node_modules/fuzzy-tables/dist/index.mjs";
```

Import the stylesheet as before:

```tsx
import "fuzzy-tables/styles.css";
```

Skip the Tailwind entry and the table keeps its borders, sticky header and row
hover, but loses its padding, sizing and colours — and nothing reports an error.
That is the one thing to check when upgrading. If your app does not use Tailwind,
stay on 1.6.4.

### Theming

The chrome now reads six CSS custom properties: `--ft-surface`,
`--ft-muted-surface`, `--ft-muted-text`, `--ft-header-text`, `--ft-border` and
`--ft-hover`. Each falls back to the value it had before, so an app that sets none
looks exactly like 1.6.4. Set them to follow your own palette, dark mode included.
The README lists the defaults.

### React 19

The `react` peer range widens to `^18.3.1 || ^19.0.0`; React 18 still works. Three
component types now read `React.JSX.Element` where they read `JSX.Element`, because
React 19's types drop the global `JSX` namespace.

### Fixed

Dragging to select text inside a cell ended in a click on the row, which fired the
row action and made copying a value impossible. A row click is now ignored while a
text selection is active.
