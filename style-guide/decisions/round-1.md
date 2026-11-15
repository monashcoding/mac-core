# Round 1 decisions: visual identity

Asked on 2026-11-02 with the comparison board [`boards/round-1.html`](../boards/round-1.html). Each tile on the board renders the same eox-vote ballot, built with one app's real tokens. Section 0 of the board shows live screenshots of all four apps.

Apps compared, with short names used below:

| Short name | Repo | Live |
|---|---|---|
| site | monashcoding-site | monashcoding.com |
| MonMap | monmap | monmap.monashcoding.com |
| Study | mac-study | study.monashcoding.com |
| Jobs | mploy-app | jobs.monashcoding.com |

## Adopted without asking (all four apps agree)

- One accent colour: MAC yellow `#ffe330`, used scarcely: for the primary action, the active or selected item, and the newest thing. Never decoration (site `.impeccable.md:31`). Jobs uses `#ffe22f`, which is drift; eox-vote uses `#ffe330`.
- Text on yellow is always `#252525`. Never yellow text on a yellow tint (MonMap `CLAUDE.md:81-88`, site `.impeccable.md:14-15`).
- Small labels and eyebrows: uppercase, semibold, 10-12px, letter-spacing 0.08-0.2em.
- Lucide icons (Jobs uses Tabler; 3 of 4 use Lucide). Tailwind CSS v4, with tokens as CSS variables and a `cn()` helper.
- Easing `cubic-bezier(0.22, 1, 0.36, 1)` for reveals and hovers; reduced-motion is always respected.
- UI copy: no em dashes, middle dots or emoji (MonMap `CLAUDE.md:114`, site `.impeccable.md:22`).
- Mobile: dialogs become bottom sheets, touch targets are at least 44px, text inputs are at least 16px below `md`, and zoom stays enabled.

## Questions

### 1. Theme mode

| Option | Source |
|---|---|
| A. Dark only | site (`.impeccable.md:17`), Study (`src/app/globals.css:79`), Jobs (`frontend/src/app/layout.tsx:54`) |
| B. Light + dark, follows the system | MonMap (`packages/webapp/app/globals.css:94-234`, next-themes `defaultTheme="system"`) |
| C. Dark by default, light opt-in | hybrid |

**Answer:** "dark, with optional light if feasible".
**Applied as:** dark is the default and the brand. Light is an opt-in theme derived from MonMap's contrast-checked light palette.

### 2. Dark surface ladder

Lightness (CIE L*) of page / card / popover:

| Option | Values | L* |
|---|---|---|
| A. site: charcoal page, darker cards | `#252525` / `#1e1e1e` / `#141414` | 14.7 / 11.3 / 6.3 |
| B. MonMap: near-black page, lighter panels | `#161616` / `#202020` / `#2a2a2a` | 7.2 / 12.3 / 17.1 |
| C. Study: near-black, warm borders | `#171717` / `#1c1c1c` / `#232323` | 7.7 / 10.3 / 13.7 |
| D. Jobs: mid-charcoal, chunky | `#1f1f1f` / `#2e2e2e` / `#2e2e2e` | 11.8 / 18.9 / 18.9 |

**Answer:** D, Jobs (`frontend/src/app/globals.css:19-39`).

### 3. Typeface

| Option | Source |
|---|---|
| A. Poppins only | site (`app/layout.tsx:5-9`, `.impeccable.md:16` "Poppins only"), MonMap (`packages/webapp/app/layout.tsx:12-18`), Jobs (`frontend/src/app/layout.tsx:47-50`) |
| B. Inter only | Study (`src/app/globals.css:93-100`; never loaded, so it falls back to the system font) |
| C. Poppins headings + Inter UI | pairing |
| D. Poppins + monospace numbers | Study timers |

The board showed that Poppins has no tabular figures; see [`research/poppins-tabular-figures.md`](../research/poppins-tabular-figures.md).

**Answer:** A, Poppins only.

### 4. Corner radius

| Option | tag | button | input | card | dialog |
|---|---|---|---|---|---|
| A. MonMap role scale (`packages/webapp/app/globals.css:71-91`) | 4 | 6 | 6 | 12 | 12 |
| B. Study (`.superdesign/design-system.md:14`) | 4 | 8 | 8 | 10 | 12 |
| C. site (`.impeccable.md:18`) | 6 | 6 | 12 | 8 | 12 |
| D. Jobs | pill | 8 | 10 | 12 | 16 |

**Answer:** A, MonMap's role scale.

### 5. Depth and containment

| Option | Source |
|---|---|
| A. Thin border + one soft card shadow | MonMap `shadow-card` (`packages/webapp/app/globals.css:242-247`) |
| B. No shadows | site (`.impeccable.md:17`) |
| C. Thin border + top highlight; shadows only on floating layers | Study (`src/app/globals.css:30`) |
| D. 2px solid borders | Jobs (`frontend/src/components/jobs/job-card.tsx`, `bd="2px solid selected"`) |

**Answer:** D, 2px solid borders. Floating layers keep Jobs' large soft shadows.

### 6. Colour beyond yellow and grey

| Option | Source |
|---|---|
| A. Yellow + greys only | MonMap, Jobs |
| B. Min and Max mascots, with indigo `#5757D3` only inside the art | Study login, site, Jobs 404 page |
| C. Full site palette: pastel panels, organic shapes, mascots | site `components/home/QuickLinksSection.tsx:39-92` |

**Answer:** "both C and B, but throw in B when C gets repetitive or already used on when viewing at one view/scroll of a page".
**Applied as:** at most one pastel (C) panel per screen. Any other illustration visible on the same screen is a mascot on a plain card (B). Organic shapes only on pastel panels, never on UI controls.
