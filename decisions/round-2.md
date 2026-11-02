# Round 2 decisions: components, voice and motion

Asked on 2026-11-02 with the comparison board [`boards/round-2.html`](../boards/round-2.html). Every tile on the board already uses the round-1 answers ([`round-1.md`](round-1.md)). The motion demos in section 10 play live in the browser.

## Round-1 answers applied (board section 0)

Board section 0 showed the ballot in the default dark theme and the opt-in light theme, plus one screen that follows the pastel and mascot rule. Two contrast fixes came out of it and are in `STYLE_GUIDE.md`:

- Light muted text: `#6b6a65` became `#6a6964`. MonMap's value measures 4.499:1 on the light hover background `#ebeae5`, just under the 4.5:1 minimum; the new value measures 4.567:1.
- Dark "subtle" text (`rgb(255 255 255 / .5)`) measures 4.14:1 on selected rows (`#3a3a3a`), so it is not used for text there.

## Questions

### 7. Density

| Option | Desktop height (px) | Phone height (px) | Phone tap area (px) | Source |
|---|---|---|---|---|
| A. Compact | 36 | 36 | 44 | MonMap `packages/webapp/components/ui/button.tsx`, `CLAUDE.md:104-113` |
| B. Comfortable | 40 | 44 | 44 | Jobs auth-gate buttons, Study nudge pill |
| C. Touch-first | 48 | 48 | 48 | Study `.superdesign/design-system.md:37` |

**Answer:** "compact on desktop, touch first on mobile".
**Applied as:**
- `md` and up: MonMap compact. Controls are 36px (`h-9`) with `text-sm`.
- Below `md`: Study touch-first. Inputs, selects and secondary buttons are 44px (`h-11`). Primary buttons are 48px (`h-12`) and full width in forms, dialog footers and sheets. Icon buttons are 44px (`size-11`).

### 8. Capitalisation

| Option | Source |
|---|---|
| A. Uppercase extra-bold buttons, Title Case headings | site |
| B. Sentence case everywhere; uppercase only for small labels | MonMap, Study |
| C. Title Case buttons and headings | Jobs ("Apply Now", "Copy Link") |

**Answer:** B. Title Case is kept only for proper nouns such as MAC Study, MonMap and Jobs Board.

### 9. Status colours

| Option | Values | Source |
|---|---|---|
| A. MonMap oklch set | success, warning, info, destructive, each with base, foreground and soft values in light and dark | MonMap `packages/webapp/app/globals.css:133-145`, `:202-213` |
| B. Study bright hex | success `#42d392`, danger `#ff6b6b`, info `#6cb6ff`, live `#ff7a00` | Study `src/app/globals.css:18-20` |
| C. Jobs roles | active yellow, win `#9ddfb0`, loss `#ff7351`, neutral white at 65% | Jobs `frontend/src/app/globals.css:32-39` |

**Answer:** B, Study's colours. Study has no light-theme values, so `STYLE_GUIDE.md` adds contrast-checked light variants. Study's live orange `#ff7a00` covers live and time-pressure states; there is no separate warning colour.

### 10. Motion

| Option | Source |
|---|---|
| A. Functional only: 120-220ms fades, small slides, press feedback | Study `.superdesign/design-system.md:45`, MonMap button press |
| B. Functional plus signature moments on the hero and results only | site `.impeccable.md:25-28`; Jobs confetti `frontend/src/app/globals.css:1857`, `:2151` |
| C. Full expressive: B plus click sparks and animated backgrounds everywhere | site |

**Answer:** B. The signature moments are the yellow-bar headline wipe, cards lifting 2px on hover, the 45° arrow turn, and a confetti burst when the winner is revealed. At most one per screen.

### 11. Highlighting key words

| Option | Source |
|---|---|
| A. Yellow highlighter block behind the words, `#252525` text | site hero |
| B. Yellow underline, 2px thick, 4px offset | Jobs `frontend/src/app/globals.css:49-55` |
| C. Second line of a headline in yellow | Study login |
| D. None | MonMap |

**Answer:** "A or B".
**Applied as:** both, using the same rule as the round-1 colour answer:
- The highlighter block appears at most once per screen, only on a hero or display headline or on the results winner.
- Everywhere else, key words get the underline.
- The underline uses the emphasis colour: yellow in dark, `#252525` in light, where a yellow line would vanish on white (MonMap `packages/webapp/app/globals.css:128-131` precedent).

### 12. Navigation

| Option | Source |
|---|---|
| A. Top bar, slide-out menu on phones | MonMap `packages/webapp/components/app-header.tsx`, Jobs nav bar |
| B. Top bar on desktop, bottom tab bar on phones | Study `src/app/globals.css:21-29`, `:255-269` |
| C. Floating header, full-screen menu | site `components/Navigation.tsx` |

**Answer:** B.

### 13. Component library

| Option | Source |
|---|---|
| A. shadcn/ui on Base UI | MonMap `packages/webapp/components.json` (style `base-luma`) |
| B. shadcn/ui on Radix | site `components.json` (style `new-york`) |
| C. Mantine | Jobs |
| D. Hand-built | Study |

**Answer:** A.
