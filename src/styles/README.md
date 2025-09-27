Style Architecture

This project organizes CSS into small, purpose‑specific layers to keep things modular and maintainable.

- variables.css — global CSS variables (colors, radii, layout metrics). Light/dark pairs live here.
- main.css — minimal base only: safe resets and global defaults. Avoid heavy global rules here.
- utilities.css — Tailwind utilities you define (e.g., .text-75, .radius-md, .icon-xl). Declared under @layer utilities.
- components.css — shared component patterns (buttons, cards, TOC bits). Declared under @layer components.
- layout.css — page/frame layout helpers (banner, navbar, grid positions). Declared under @layer components.
- content.css — styles that target rendered Typst/HTML content (.typst-content scope).
- content-extend.css — optional content tweaks kept separate to avoid noise in content.css.
- expressive-code.css, typst.css, scrollbar.css, transition.css, photoswipe.css — feature‑scoped styles.

Guidelines

- Do not @apply a custom class across files. Tailwind expands @apply per file and cannot see custom classes defined elsewhere reliably.
  - Instead, either use Tailwind core utilities directly, or add a dedicated rule for the selector.
  - Example: prefer “@apply text-black/75; .dark .btn { @apply text-white/75 }” over “@apply text-75”.
- Keep custom utilities in utilities.css under “@layer utilities”.
- Keep component patterns in components.css/layout.css under “@layer components”.
- Prefer CSS variables for theme‑aware colors; utilities remain for opacity steps and quick helpers.
- Pseudo‑elements with Tailwind shorthand (e.g., before:…) are OK when local to the same rule. If a rule gets complex, move pseudo‑styles into an explicit ::before/::after block.

Linting / formatting

- Use Biome tasks: “deno task format” and “deno task lint”.
- Keep changes small and co‑located with templates that use them.
