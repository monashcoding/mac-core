# MAC style guide

This style guide unifies the design systems of MonMap, monashcoding.com, MAC Study, and Jobs Board. The foundational decisions were established for the eox-vote project across two decision rounds (documented in `decisions/round-1.md` and `decisions/round-2.md`; per-repo audits in `research/`). Everything in this guide applies across any Monash Association of Coding (MAC) application, with the sole exception of the voting-specific component recipes in Section 17.

---

## 1. Principles

1. **Dark-first brand.** Dark is the default and the brand identity. Light is an optional opt-in theme, never the default hero. Three of four MAC apps ship dark-only; MonMap proves a warm-paper light mode can coexist without diluting the brand.
   *Sources: monashcoding-site: .impeccable.md:16 ("Dark only"); mac-study: src/app/globals.css:11; mploy-app: frontend/src/app/globals.css:19-46; monmap: packages/webapp/components/theme-provider.tsx:14.*

2. **Yellow is scarce.** MAC yellow `#ffe330` appears only on primary actions, active/selected states, and the newest/winning thing. It is never decoration, never a background wash, never a gradient fill for aesthetics.
   *Sources: monashcoding-site: .impeccable.md:31 ("Yellow is scarce: it marks the action, the active item and the newest thing, never decoration"); monmap: CLAUDE.md:81-88; consensus of all four repos.*

3. **Clarity over cleverness.** Plain language, sentence-case headings and buttons, no em dashes, no middle dots, no emoji in UI. Copy is direct and student-first.
   *Sources: monmap: CLAUDE.md:114 ("In UI text, use plain hyphens, not middle dots or em dashes"); monashcoding-site: .impeccable.md:22; mac-study: casing conventions.*

4. **Accessible by default.** Visible focus rings (yellow on dark, charcoal on light), touch targets >= 44px on mobile, text inputs >= 16px below `md`, never disable user zoom, never signal selection by colour alone. Honour `prefers-reduced-motion` everywhere.
   *Sources: monmap: packages/webapp/components/ui/button.tsx:7; mac-study: src/app/globals.css:568-575 (.mac-focus); monmap: packages/webapp/app/globals.css:386-395 (16px input guard); monashcoding-site: .impeccable.md:35.*

5. **Containment over elevation.** Surfaces are separated by 2px solid borders and stepped background values, not by heavy drop shadows. Floating layers (popovers, dialogs, toasts) are the only elements that earn a shadow.
   *Sources: mploy-app: frontend/src/app/globals.css:24, frontend/src/components/jobs/job-card.tsx:24 (2px border pattern); monashcoding-site: .impeccable.md:17 ("No drop shadows: depth comes from surface lightness steps, hairlines and hover lifts").*

6. **One font, one icon set, one utility belt.** Poppins for all text. Lucide for all icons. Tailwind v4 + `cn()` + `cva` for all styling. No second conventions.
   *Sources: consensus of monashcoding-site: .impeccable.md:16; monmap: packages/webapp/app/layout.tsx:12-18; mploy-app: frontend/src/app/layout.tsx:43-46; monmap: packages/webapp/components.json:3-13.*

7. **Tokens, not magic numbers.** Every colour, radius, and shadow is a CSS variable consumed through `@theme inline`. Hardcoded hex values in components are bugs.
   *Sources: monmap: packages/webapp/app/globals.css:82-234; mploy-app: frontend/src/app/globals.css:19-46; mac-study: src/app/globals.css:11-30.*

---

## 2. Stack

| Layer | Technology | Decision & Citation |
|---|---|---|
| Framework | Next.js App Router, React 19, TypeScript | used by all four apps; monmap: packages/webapp/package.json:38,43,61 |
| Styling system | Tailwind CSS v4 via `@tailwindcss/postcss` | adopted without asking (decisions/round-1.md); monmap: packages/webapp/package.json:51 |
| Component primitives | shadcn/ui on `@base-ui/react` (style `base-luma`) | eox-vote decision (round 2); monmap: packages/webapp/components.json:3 |
| Font | Poppins (400, 500, 600, 700, 800) via `next/font/google` | eox-vote decision (round 1); monmap: packages/webapp/app/layout.tsx:12-18 |
| Icons | `lucide-react` (stroke 2px) | adopted without asking (decisions/round-1.md); monmap: packages/webapp/components.json:13 |
| Theme provider | `next-themes` (`attribute="class"`, `defaultTheme="dark"`) | eox-vote decision (round 1); monmap: packages/webapp/components/theme-provider.tsx:14-23 |
| Class utilities | `cn()` (`clsx` + `tailwind-merge`), `cva` for variants | adopted without asking (decisions/round-1.md); monmap: packages/webapp/components/ui/button.tsx:2-4 |
| Formatter | `prettier-plugin-tailwindcss` | adopted from MonMap; monmap: packages/webapp/package.json:59 |

---

## 3. Colour

### 3.1 Dark theme tokens (default)

The dark theme is the default brand surface, following the Jobs surface ladder with MAC yellow accents:

| Token | CSS Value | Role & Usage | Citation |
|---|---|---|---|
| `--background` | `#1f1f1f` | Root viewport & app canvas | mploy-app: frontend/src/app/globals.css:21 |
| `--surface-soft` | `#262626` | Grouped regions, columns, field backgrounds | mploy-app: frontend/src/app/globals.css:23 |
| `--card` | `#2e2e2e` | Cards, list rows, dialogs, popovers, menus, toasts | mploy-app: frontend/src/app/globals.css:22 |
| `--accent` | `#3a3a3a` | Hover wash, selected rows | mploy-app: frontend/src/app/globals.css:20 |
| `--border` | `#3a3a3a` | 2px structural container borders | mploy-app: frontend/src/app/globals.css:24 |
| `--border-strong` | `#4a4a4a` | Emphasized borders, active input boundaries | mploy-app: frontend/src/app/globals.css:25 |
| `--foreground` | `#ffffff` | Primary readable text and high-contrast headings | mploy-app: frontend/src/app/globals.css; all repos |
| `--muted` | `rgb(255 255 255 / .65)` | Secondary copy, metadata, unselected labels | mploy-app: frontend/src/app/globals.css:28 |
| `--subtle` | `rgb(255 255 255 / .5)` | Tertiary text, placeholders, search icons | mploy-app: frontend/src/app/globals.css:29 |
| `--disabled` | `rgb(255 255 255 / .35)` | Disabled text (never sole indicator; see §3.6) | mploy-app: frontend/src/app/globals.css:30 |
| `--primary` | `#ffe330` | MAC brand yellow - primary CTAs, active indicators | adopted without asking (decisions/round-1.md); all repos |
| `--primary-foreground` | `#252525` | High-contrast dark ink on yellow surfaces | monmap: packages/webapp/app/globals.css:97 |
| `--field` | `#262626` | Input, select, and textarea fill | derived from `--surface-soft` |
| `--ring` | `#ffe330` | Focus ring outline on dark surfaces | monmap: packages/webapp/app/globals.css:199 |
| `--emphasis` | `#ffe330` | Underline-fancy and active tab accent | monmap: packages/webapp/app/globals.css:199 |

### 3.2 Light theme tokens (opt-in via `.light` class)

The light theme provides a warm-paper aesthetic adapted from MonMap:

| Token | CSS Value | Role & Usage | Citation |
|---|---|---|---|
| `--background` | `#f5f5f2` | Warm paper canvas | monmap: packages/webapp/app/globals.css:100 |
| `--surface-soft` | `#efeeea` | Grouped regions, secondary panels | monmap: packages/webapp/app/globals.css:118 |
| `--card` | `#ffffff` | Clean white cards, dialogs, popovers | monmap: packages/webapp/app/globals.css:103 |
| `--accent` | `#ebeae5` | Hover wash, selected row backgrounds | monmap: packages/webapp/app/globals.css:125 |
| `--border` | `#d9d7d0` | 2px structural container borders | monmap: packages/webapp/app/globals.css:147 |
| `--border-strong` | `#c8c6bf` | Emphasized borders, active input boundaries | derived for the light theme (round 1) |
| `--foreground` | `#252525` | Primary charcoal text | monmap: packages/webapp/app/globals.css:101 |
| `--muted` | `#6a6964` | Secondary copy, metadata | **corrected from MonMap's #6b6a65** (see §3.6) |
| `--subtle` | `#6a6964` | Tertiary text, placeholders | derived for the light theme; equals `--muted` because no lighter grey reaches 4.5:1 on `--accent` (see §3.6) |
| `--disabled` | `#b5b3ad` | Disabled text | derived for the light theme; inactive-control text only (see §3.6) |
| `--primary` | `#ffe330` | MAC brand yellow (same in both themes) | adopted without asking (decisions/round-1.md); all repos |
| `--primary-foreground` | `#252525` | Dark ink on yellow surfaces | monmap: packages/webapp/app/globals.css:97 |
| `--field` | `#f8f8f6` | Input and select background fill | monmap: packages/webapp/app/globals.css:150 |
| `--ring` | `#252525` | Focus ring on light (yellow vanishes on paper) | monmap: packages/webapp/app/globals.css:130 |
| `--emphasis` | `#252525` | Underline-fancy on paper (yellow vanishes) | monmap: packages/webapp/app/globals.css:130 |

### 3.3 Yellow rules

1. **One canonical yellow:** Always `#ffe330`. Jobs' `#ffe22f` is drift; normalise to `#ffe330`. (*adopted without asking, decisions/round-1.md; mploy-app: frontend/src/app/globals.css:26*).
2. **Text on yellow is always `#252525`:** Never white, never grey, never yellow on yellow tints. (*monmap: CLAUDE.md:81-88*).
3. **Yellow text and icons only on dark surfaces:** Yellow text or yellow icons on white or light paper surfaces are strictly forbidden (contrast ratio < 1.3:1). A light toast check icon must be green `#15803d` or charcoal `#252525`, never yellow. (*eox-vote decision (round 2)*).
4. **Light mode focus ring switches to `#252525`:** Yellow focus rings on light backgrounds are invisible. Use charcoal ink `--ring: #252525`. (*monmap: packages/webapp/app/globals.css:130*).
5. **Yellow is scarce:** Reserved for primary CTAs, active/selected states, live badges, and the winner element. Never used for general borders, card fills, or ambient decoration. (*monashcoding-site: .impeccable.md:31*).

### 3.4 Status colours

Status colours are grounded in MAC Study's bright dark palette, with derived light-theme counterparts verified for WCAG AA text (>= 4.5:1) and non-text (>= 3.0:1):

| Status | Role | Dark Token | Dark Tint (Fill / Border) | Light Text (>= 4.5:1) | Light Icon/Border (>= 3.0:1) | Light Tint (Fill / Border) | Citation |
|---|---|---|---|---|---|---|---|
| `success` | Validated, voted, completed | `#42d392` | `rgb(66 211 146 / .1)` / `rgb(66 211 146 / .5)` | `#166534` (emerald-800) | `#15803d` (emerald-700) | `rgb(22 101 52 / .08)` / `rgb(21 128 61 / .45)` | mac-study: src/app/globals.css:18 |
| `danger` | Error, invalid, revoked | `#ff6b6b` | `rgb(255 107 107 / .08)` / `rgb(255 107 107 / .5)` | `#b91c1c` (red-700) | `#dc2626` (red-600) | `rgb(185 28 28 / .08)` / `rgb(220 38 38 / .45)` | mac-study: src/app/globals.css:19 |
| `info` | Notice, system info, rules | `#6cb6ff` | `rgb(108 182 255 / .1)` / `rgb(108 182 255 / .5)` | `#0369a1` (sky-700) | `#0284c7` (sky-600) | `rgb(3 105 161 / .08)` / `rgb(2 132 199 / .45)` | mac-study: src/app/globals.css:20 |
| `live` | Open, time pressure, countdown | `#ff7a00` | `rgb(255 122 0 / .1)` / `rgb(255 122 0 / .5)` | `#9a3412` (amber-800) | `#c2410c` (orange-700) | `rgb(154 52 18 / .08)` / `rgb(194 65 12 / .45)` | mac-study: src/components/groups/groups-dashboard.tsx:1157, 1291 |

*Note: There is no separate warning colour. Time pressure, closing soon, and live active states all use `live` orange.* (*eox-vote decision (round 2)*).

### 3.5 Voting state mapping table

| Voting State | Status Role | Dark Presentation | Light Presentation | Purpose / Trigger |
|---|---|---|---|---|
| Open / live now | `live` | Orange tag with pulsing `#ff7a00` dot, 2px border | Orange tag with pulsing `#c2410c` dot, text `#9a3412` | Ballot actively accepting votes |
| Closing soon | `live` | `#ff7a00` timer countdown, orange border highlight | `#9a3412` timer countdown, `#c2410c` border | Under 24 hours remaining on ballot |
| Voted | `success` | Green checkmark chip, "Vote recorded" toast | Green checkmark chip, green toast check icon (`#15803d`) | User has successfully cast a ballot |
| Closed | `muted` | Neutral card border, muted text, disabled CTA | Neutral paper card, muted text `#6a6964` | Voting window has officially closed |
| Winner | `primary` | Yellow celebration card, confetti burst, trophy icon | Yellow card highlight with `#252525` text | Ballot results published (highest priority item) |
| Disqualified / error | `danger` | Red alert box, `#ff6b6b` outline and message | Red alert box, `#b91c1c` text, `#dc2626` icon | Invalid vote, duplicate ballot, session revoked |
| Info | `info` | Blue informational banner, neutral blue link | Blue informational banner, `#0369a1` text | Instructions, voting eligibility rules |

*Yellow rule for Winner:* Yellow is strictly permitted for the Winner element because it represents the newest and most important item on the page. (*eox-vote decision (round 2); monashcoding-site: .impeccable.md:31*).

### 3.6 Contrast verification

**Token change explanation:** Light theme `--muted` was changed from MonMap's `#6b6a65` to `#6a6964`. In MonMap, `#6b6a65` on `--accent` (`#ebeae5`) produces a contrast ratio of `4.499:1`, failing the WCAG AA minimum of `4.5:1` for normal body text. The adjusted value `#6a6964` achieves `4.567:1` on accent and `5.036:1` on background, passing WCAG AA across every light surface.

#### Dark theme contrast table

| Text Token | Effective Hex | On Background (`#1f1f1f`) | On Surface-Soft (`#262626`) | On Card (`#2e2e2e`) | On Accent (`#3a3a3a`) | WCAG AA Normal | WCAG AA Large |
|---|---|---|---|---|---|---|---|
| `--foreground` | `#ffffff` | 16.48:1 | 15.13:1 | 13.58:1 | 11.37:1 | PASS | PASS |
| `--muted` (`white/.65`) | `#b0b0b0` / `#bababa` | 7.60:1 | 7.22:1 | 6.62:1 | 5.86:1 | PASS | PASS |
| `--subtle` (`white/.5`) | `#8f8f8f` / `#9c9c9c` | 5.10:1 | 4.86:1 | 4.59:1 | **4.14:1** | **FAIL on accent** | PASS |
| `--disabled` (`white/.35`) | `#6d6d6d` / `#7e7e7e` | 3.19:1 | 3.10:1 | 3.03:1 | **2.80:1** | **FAIL all** | PASS (except accent) |
| `--primary` (`#ffe330`) | `#ffe330` | 12.78:1 | 11.73:1 | 10.53:1 | 8.82:1 | PASS | PASS |
| `--primary-foreground` (`#252525`) on Yellow | `#252525` on `#ffe330` | **11.88:1** | (Primary button) | | | PASS | PASS |
| Dark `success` (`#42d392`) | `#42d392` | 8.61:1 | 7.90:1 | 7.09:1 | 5.94:1 | PASS | PASS |
| Dark `danger` (`#ff6b6b`) | `#ff6b6b` | 5.94:1 | 5.45:1 | 4.89:1 | **4.10:1** | **FAIL on accent** | PASS |
| Dark `info` (`#6cb6ff`) | `#6cb6ff` | 7.67:1 | 7.04:1 | 6.32:1 | 5.29:1 | PASS | PASS |
| Dark `live` (`#ff7a00`) | `#ff7a00` | 6.31:1 | 5.79:1 | 5.20:1 | **4.35:1** | **FAIL on accent** | PASS |

#### Light theme contrast table

| Text Token | Effective Hex | On Background (`#f5f5f2`) | On Surface-Soft (`#efeeea`) | On Card (`#ffffff`) | On Accent (`#ebeae5`) | WCAG AA Normal | WCAG AA Large |
|---|---|---|---|---|---|---|---|
| `--foreground` | `#252525` | 14.03:1 | 13.20:1 | 15.33:1 | 12.72:1 | PASS | PASS |
| `--muted` (corrected) | `#6a6964` | 5.04:1 | 4.74:1 | 5.50:1 | 4.57:1 | PASS | PASS |
| `--subtle` (same as muted) | `#6a6964` | 5.04:1 | 4.74:1 | 5.50:1 | 4.57:1 | PASS | PASS |
| `--disabled` | `#b5b3ad` | 1.92:1 | 1.81:1 | 2.10:1 | 1.74:1 | exempt (inactive UI only) | FAIL |
| Light `success` text | `#166534` | 6.53:1 | 6.14:1 | 7.13:1 | 5.92:1 | PASS | PASS |
| Light `danger` text | `#b91c1c` | 5.92:1 | 5.57:1 | 6.47:1 | 5.37:1 | PASS | PASS |
| Light `info` text | `#0369a1` | 5.43:1 | 5.11:1 | 5.93:1 | 4.93:1 | PASS | PASS |
| Light `live` text | `#9a3412` | 6.69:1 | 6.29:1 | 7.31:1 | 6.07:1 | PASS | PASS |
| Light `success` icon/border | `#15803d` | 4.59:1 | 4.32:1 | 5.02:1 | 4.16:1 | PASS (non-text >= 3:1) | PASS |
| Light `danger` icon/border | `#dc2626` | 4.42:1 | 4.16:1 | 4.83:1 | 4.01:1 | PASS (non-text >= 3:1) | PASS |
| Light `info` icon/border | `#0284c7` | 3.75:1 | 3.53:1 | 4.10:1 | 3.40:1 | PASS (non-text >= 3:1) | PASS |
| Light `live` icon/border | `#c2410c` | 4.74:1 | 4.46:1 | 5.18:1 | 4.30:1 | PASS (non-text >= 3:1) | PASS |

#### Contrast-driven usage restrictions

1. **`subtle` text restriction:** Subtle text (`white/.5`) must never be used on `accent` surfaces (`#3a3a3a`). On accent surfaces, use `--muted` (`white/.65`).
2. **`disabled` text restriction:** Disabled text (dark `white/.35`, light `#b5b3ad`) is below 4.5:1 on every surface. WCAG 1.4.3 exempts text inside inactive controls, so use it only there, never for readable content, and never as the sole signal that a control is disabled: pair it with `opacity-50`, `aria-disabled="true"` or an icon.
3. **Border contrast rationale:** Neutral container borders (`#3a3a3a` dark, `#d9d7d0` light) measure `1.2:1` to `1.45:1` against adjacent surfaces, failing WCAG 1.4.11's 3:1 non-text threshold if viewed in isolation. Under WCAG 1.4.11, container borders are decorative structural containment paired with background colour stepping; they are not the sole means of identifying component boundaries. This matches the tested production patterns in MonMap and Jobs Board.
4. **Yellow focus ring in light mode:** In light mode, yellow outline rings fail non-text contrast (< 1.3:1). Focus rings must switch to charcoal `--ring: #252525`.
5. **Status text on selected rows:** Dark `danger` (`#ff6b6b`, 4.10:1) and `live` (`#ff7a00`, 4.35:1) fail as text on `--accent` (`#3a3a3a`). On accent surfaces, set the label in `--foreground` and carry the status with a coloured icon or dot (both clear the 3:1 non-text minimum).
6. **Light `subtle` equals `muted`:** No grey lighter than `#6a6964` reaches 4.5:1 on the light `--accent` (`#ebeae5`), so the light theme has two readable text tiers: `--foreground` and `--muted` (`--subtle` aliases it).

### 3.7 Pastel feature panels and mascot rules

**Pastel feature panels (Option C)** are reserved for marketing moments, hero feature introductions, and external links:

| Panel Name | Fill Hex | Ink Hex | Mascot Assigned | Citation |
|---|---|---|---|---|
| Lavender | `#DAD4FF` | `#C3B8FF` | Min & Max Duo | monashcoding-site: components/home/QuickLinksSection.tsx:40-47 |
| Butter | `#FFF0A3` | `#FFE36B` | Min with MAC Logo | monashcoding-site: components/home/QuickLinksSection.tsx:52-59 |
| Mint | `#C8EED9` | `#A5E2C2` | Max Arms Up | monashcoding-site: components/home/QuickLinksSection.tsx:64-71 |
| Peach | `#FFD3C2` | `#FFBBA1` | Min Arms Up | monashcoding-site: components/home/QuickLinksSection.tsx:76-83 |
| Sky | `#CDE6FF` | `#A9D3FF` | Max Join MAC | monashcoding-site: components/home/QuickLinksSection.tsx:88-95 |

- **Text on pastels:** Always `#252525` text.
- **Organic radii (48px to 190px):** Allowed only on pastel feature panels. **Never** apply organic radii to UI buttons, cards, dialogs, or inputs. (*eox-vote decision (round 1)*).

**Mascot rules (Option B):**
- Mascot art features Min & Max in indigo `#5757D3`. Indigo is restricted to mascot vector artwork and is never used as general UI backgrounds or borders. (*monashcoding-site: .impeccable.md:15*).

**One-pastel-moment-per-viewport rule:**
At most one pastel feature panel (Option C) may appear within a single viewport or scroll range. If another illustrated moment is required within the same screen, it must use a mascot on a neutral card surface (Option B). (*eox-vote decision (round 1)*).

### 3.8 Explicit colour don'ts

- **Don't** use yellow `#ffe330` as a general card background, page background, or hover wash.
- **Don't** put yellow text on yellow-tinted surfaces.
- **Don't** put white text on yellow surfaces (always use `#252525`).
- **Don't** put yellow text or yellow icons on white or light paper surfaces.
- **Don't** use raw hex codes in component code; always reference semantic variables.
- **Don't** use mascot indigo `#5757D3` for standard UI buttons, borders, or text.
- **Don't** use organic radii (48-190px) on interactive controls.
- **Don't** introduce a warning colour; use `live` orange (`#ff7a00` / `#9a3412`) instead.

---

## 4. Typography

### 4.1 Family and weights

- **Family:** Poppins, loaded via `next/font/google` with weights `400`, `500`, `600`, `700`, `800`.
- **Variable:** `--font-sans` applied to `<body>`. Heading font maps directly to `--font-sans`.
- **Weights:**
  - `400` (Regular): Standard body copy, form descriptions
  - `500` (Medium): Interactive labels, table cells, metadata, tooltips
  - `600` (SemiBold): Headings, dialog titles, button labels, eyebrows
  - `700` (Bold): Section title emphasis, stat numerals
  - `800` (ExtraBold): Display headlines, hero banners, 404/500 headers
- *Sources: monmap: packages/webapp/app/layout.tsx:12-18; monashcoding-site: .impeccable.md:16; mploy-app: frontend/src/app/layout.tsx:43-46.*

### 4.2 Type scale

| Level / Role | Tailwind Classes | Weight | Tracking / Leading | Example Citation |
|---|---|---|---|---|
| Display / Hero | `text-[clamp(2.5rem,5.5vw,4.5rem)]` | 800 | `tracking-tight leading-none` | derived from monashcoding-site: components/hero/Hero.tsx:196 (`lg:text-[clamp(2.75rem,4.6vw,5.4rem)]`) |
| Page H1 | `text-2xl sm:text-3xl` (24-30px) | 600 | `tracking-tight leading-tight` | monmap: packages/webapp/app/search/page.tsx:177 |
| Section H2 | `text-lg sm:text-xl` (18-20px) | 600 | `leading-snug` | monmap: packages/webapp/components/handbook/frame.tsx:313 |
| Card / Dialog H3 | `text-base` (16px) | 600 | `leading-normal` | monmap: packages/webapp/components/ui/dialog.tsx:124 |
| Body (standard) | `text-sm` (14px) | 400 | `leading-relaxed` | derived from monmap: packages/webapp/app/globals.css:254-258 (handbook prose, line-height 1.7) |
| Small / Metadata | `text-xs` (12px) | 500 | `leading-normal` | monmap: packages/webapp/components/ui/badge.tsx:8 |
| Micro / Eyebrow | `text-[10px] sm:text-[11px]` | 600 | `uppercase tracking-[0.12em]` | monmap: packages/webapp/app/plans/plan-card.tsx:193; mac-study: src/components/app-shell.tsx:457 |

### 4.3 Eyebrow and micro-label pattern

```tsx
<span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
  VOTING OPEN
</span>
```
All overlines, categories, and fieldset legends must be uppercase, semibold, 10-12px, with `tracking-[0.08em]` to `[0.2em]`. (*consensus of all four repos*).

### 4.4 Poppins numerals caveat and live counter recipe

**Caveat:** Poppins has **no `tnum` (tabular numbers) OpenType feature**. Declaring `tabular-nums` in CSS is a no-op; proportional digits cause dynamic numbers like `"11,111"` (31px wide) to jump when changing to `"88,888"` (52px wide).

**Counter recipe for live tallies and countdowns:**

```tsx
// Recipe: enforce right alignment, inline-block layout, and reserve minimum width
<span className="inline-block min-w-[5ch] text-right font-semibold tabular-nums">
  {voteCount.toLocaleString()}
</span>
```
- Set `min-w-[Nch]` where `N` matches the maximum digit count including comma separators.
- Always right-align (`text-right`) so digits increment leftward without causing parent container jitter.
- Retain `tabular-nums` in class lists for forward compatibility.
- *Sources: monmap: packages/webapp/components/handbook/frame.tsx:196; mploy-app: frontend/src/app/globals.css:743.*

---

## 5. Shape (radius roles)

Tailwind v4 theme aliases map directly onto three functional roles rather than arbitrary sizes:

| Token | Formula / Value | Functional Usage | Applied Tailwind Aliases |
|---|---|---|---|
| `--radius-tag` | `4px` (`calc(var(--radius) * 0.5)`) | Inline labels < 16px tall, status pills, micro tags | `rounded-tag`, `rounded-xs` |
| `--radius-control` | `6px` (`calc(var(--radius) * 0.75)`) | Buttons, inputs, selects, chips, badges, menu items | `rounded-control`, `rounded-sm`, `rounded-md`, `rounded-lg` |
| `--radius-panel` | `12px` (`calc(var(--radius) * 1.5)`) | Cards, dialogs, popovers, menus, sheets, toasts | `rounded-panel`, `rounded-xl`, `rounded-2xl`, `rounded-3xl` |
| `rounded-full` | `9999px` | Avatars, status dots, progress bar fills only | `rounded-full` |

*Sources: monmap: packages/webapp/app/globals.css:82-91; eox-vote decision (round 1).*

---

## 6. Borders and depth

### 6.1 Containment borders

- **Standard containers:** Cards, inputs, secondary buttons, dialogs, and popovers use `2px solid var(--border)` (`#3a3a3a` dark, `#d9d7d0` light). (*mploy-app: frontend/src/components/jobs/job-card.tsx:24, frontend/src/components/jobs/job-details.tsx:158*).
- **Internal dividers:** Dividers inside a component use `1px solid var(--border)`. (*mploy-app: frontend/src/app/globals.css:349*).
- **Emphasized boundaries:** Active focus borders and notes editor cards use `2px solid var(--border-strong)`. (*mploy-app: frontend/src/app/globals.css:25*).

### 6.2 Elevation and shadows

| Surface Layer | Dark Theme Shadow | Light Theme Shadow | Citation |
|---|---|---|---|
| In-flow cards & inputs | `none` (depth via border and background steps) | `0 1px 0 rgba(0,0,0,.02), 0 4px 10px -4px rgba(37,37,37,.12), 0 6px 14px -8px rgba(37,37,37,.12)` | monashcoding-site: .impeccable.md:17; monmap: packages/webapp/app/globals.css:242-247 |
| Popovers, menus, dropdowns | `0 16px 48px rgba(0, 0, 0, 0.5)` | `0 12px 32px rgba(37, 37, 37, 0.16)` | mploy-app: frontend/src/app/globals.css:1394; light value derived from monmap: packages/webapp/app/globals.css:174 (`--shadow-tint`) |
| Dialog windows & modal sheets | `0 24px 72px rgba(0, 0, 0, 0.58)` | `0 12px 32px rgba(37, 37, 37, 0.16)` | mploy-app: frontend/src/app/globals.css:1442; mac-study: src/components/app-dialog.tsx:168; light value derived as above |

---

## 7. Illustration and mascot rules

### 7.1 Asset inventory

| Asset | File Format | Source Repository Path | Purpose & Standard Dimensions |
|---|---|---|---|
| MAC brand logo (badge) | PNG | monmap: packages/webapp/public/brand-logo.png | Navbar breadcrumb badge (28x28px circular) |
| MAC logo (vector) | SVG | mploy-app: frontend/public/mac.svg | Primary header brand logo (40x40px) |
| Min and Max mascots (21 poses) | SVG | This repo: [`assets/mascots/`](assets/mascots/README.md), copied from monashcoding-site `public/mascot/`, mac-study `public/mascots/` and a Figma export | Empty, error and celebration states. Use `study/` for small sizes (it has more poses) and `site/` for large hero art |
| Min 404 | SVG | [`assets/mascots/site/min-404.svg`](assets/mascots/site/min-404.svg) | 404 not found views |
| Max join MAC | SVG | [`assets/mascots/site/max-join-mac.svg`](assets/mascots/site/max-join-mac.svg) | Hero CTA peek animation |
| Fluid blob clip-paths | SVG | monashcoding-site: public/cutouts/variant-1.svg to variant-6.svg | Marketing and sponsor organic imagery |

### 7.2 Permitted contexts for illustration

- **Hero & featured moments:** One pastel panel (Option C) allowed per viewport.
- **Empty states & error views:** Min mascot on a neutral card surface (Option B).
- **Interactive UI forms & tables:** Strictly no illustrations.

---

## 8. Iconography

- **Library:** `lucide-react` exclusively. No Tabler icons, FontAwesome, or other icon sets. (*monmap: packages/webapp/components.json:13; mac-study: src/app/globals.css*).
- **Default size:** `size-4` (16px) across standard buttons, inputs, and menu rows. (*monmap: packages/webapp/components/ui/button.tsx:7*).
- **Small size:** `size-3.5` (14px) or `size-3` (12px) for tags, badges, and inline status chips. (*monmap: packages/webapp/components/ui/badge.tsx:8*).
- **Touch size:** `size-5` (20px) to `size-6` (24px) inside mobile navigation bar items. (*derived; mac-study: src/components/app-shell.tsx:591 uses 22px*).
- **Stroke width:** Lucide default `2px` stroke.
- **Brand icons:** Dedicated vector SVGs only for Google and GitHub authentication. (*monmap: packages/webapp/components/icons/*).

---

## 9. Layout and containers

- **Max content width:** `max-w-7xl` (1280px / 80rem) centered with `mx-auto`. (*mploy-app: frontend/src/components/layout/nav-bar.tsx:9; mac-study: src/components/app-shell.tsx:502*).
- **Page gutters:** `px-4 sm:px-6 lg:px-8`. (*mac-study: src/components/app-shell.tsx:526*).
- **Prose reading constraint:** `max-w-[75ch] text-sm leading-[1.7]`. (*monmap: packages/webapp/app/globals.css:256*).
- **Breakpoints:** Standard Tailwind v4 defaults (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
- **Z-index ladder:**
  - `z-20`: Sticky section headers, filter rails
  - `z-40`: Sticky top navbar (`h-14`)
  - `z-50`: Modals, dialogs, drawers, popovers, mobile bottom navigation
  - `z-60`: Transient toasts (Sonner toaster)

---

## 10. Density and control sizes

*Decision: Compact on desktop (`md:` and above), touch-first on mobile (below `md`).* (*eox-vote decision (round 2)*).

| Control Category | Desktop (`md:` and above) | Mobile (below `md`) | Responsive Class Pattern | Citation |
|---|---|---|---|---|
| Primary action buttons | `h-9 px-3 text-sm font-semibold` | `h-12 w-full px-4 text-base font-semibold` | `h-12 w-full md:h-9 md:w-auto text-base md:text-sm` | monmap: packages/webapp/components/ui/button.tsx:24; mac-study: src/app/(auth)/auth/access/page.tsx:92 |
| Secondary / outline buttons | `h-9 px-3 text-sm font-medium` | `h-11 px-4 text-base font-medium` | `h-11 md:h-9 px-4 md:px-3 text-base md:text-sm` | monmap: packages/webapp/components/ui/button.tsx:24; mac-study: src/app/(auth)/auth/access/page.tsx:101 |
| Text inputs & selects | `h-9 px-3 py-1 text-sm` | `h-11 px-3 py-2 text-base` | `h-11 md:h-9 text-base md:text-sm` | monmap: packages/webapp/components/ui/input.tsx:12; monmap: packages/webapp/app/globals.css:393-406 |
| Icon-only buttons | `size-9` (36x36px) | `size-11` (44x44px) | `size-11 md:size-9` | monmap: packages/webapp/components/ui/button.tsx:28; mac-study: src/components/app-dialog.tsx:194 |
| Small / compact buttons | `h-8 px-2.5 text-xs` | `h-10 px-3 text-sm` | `h-10 md:h-8 px-3 md:px-2.5 text-sm md:text-xs` | monmap: packages/webapp/components/ui/button.tsx:26 |

*Mobile input zoom guard:* In accordance with iOS Safari behavior, all input, select, and textarea controls must render at `>= 16px` (`text-base`) below the `md` breakpoint to prevent involuntary page zooming. (*monmap: packages/webapp/app/globals.css:393-406*).

---

## 11. Casing

*Decision: Sentence case everywhere by default; uppercase only for micro-labels, eyebrows, and tags; Title Case only for proper nouns.* (*eox-vote decision (round 2)*).

- **Headings & page titles:** Sentence case (*e.g. "Search ballots and candidates", "Cast your vote", "Election results"*).
- **Buttons & actions:** Sentence case (*e.g. "Submit ballot", "Change vote", "View full results", "Back to list"*).
- **Navigation links & tabs:** Sentence case (*e.g. "Active ballots", "My votes", "Past elections", "About"*).
- **Dialog titles & toasts:** Sentence case (*e.g. "Confirm your vote", "Vote recorded successfully"*).
- **Micro-labels, eyebrows & tags:** Strictly **UPPERCASE** (*e.g. "VOTING OPEN", "CLOSES IN 2D", "PROJECT OF THE YEAR", "CATEGORY"*).
- **Proper nouns:** Title Case reserved strictly for brand names (*"MAC Study"*, *"MonMap"*, *"Jobs Board"*, *"Monash University"*).

---

## 12. Motion

*Decision: Functional baseline everywhere + signature moments on hero and results.* (*eox-vote decision (round 2)*).

### 12.1 Baseline motion

- **Transition durations:** `120ms` to `220ms`.
- **Easing curve:** `cubic-bezier(0.22, 1, 0.36, 1)`. (*monashcoding-site: .impeccable.md:26*).
- **Displacement distance:** Subtle translates `<= 8px` on entrance fades (`translate-y-2` to `translate-y-0`).
- **Tactile press feedback:** Active scale depression `active:scale-[0.98]` or vertical step `active:translate-y-px`. (*monmap: packages/webapp/components/ui/button.tsx:7; mac-study: src/components/social/nudge-pill.tsx:25*).

### 12.2 Signature moments (at most one per view)

1. **Yellow-bar text-reveal wipe:** Sliding yellow highlighter block entrance on display headline. (*monashcoding-site: .impeccable.md:27*).
2. **45-degree arrow kick:** Pill link hover rotates arrow icon by 45 degrees: `group-hover:rotate-45 transition-transform duration-200`. (*monashcoding-site: components/home/QuickLinksSection.tsx:223*).
3. **Card hover lift:** Interactive cards elevate on hover with `hover:-translate-y-0.5 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]`. (*monashcoding-site: components/hero/Hero.tsx:683*).
4. **Confetti celebration burst:** Fired when election results are published and the winner is revealed: `animation: apps-column-confetti 1180ms cubic-bezier(0.2, 0.9, 0.25, 1) forwards;`. (*mploy-app: frontend/src/app/globals.css:1857, 2151*).

### 12.3 Reduced motion compliance

When `prefers-reduced-motion: reduce` is enabled:
- All transforms and positional animations are bypassed (`motion-reduce:transform-none`).
- Slide wipes convert to pure opacity crossfades (`motion-reduce:transition-opacity`).
- Confetti bursts and particle sparks are disabled.
- *Sources: monashcoding-site: .impeccable.md:35; mac-study: src/app/globals.css:370-388.*

---

## 13. Emphasis flourish

*Decision: Combine highlighter block and underline-fancy based on hierarchy.* (*eox-vote decision (round 2)*).

### 13.1 Highlighter block (display headline / winner)

Used at most once per viewport, strictly on a hero display headline or the declared election winner:

```tsx
<span className="inline-block rounded-tag bg-primary px-1.5 py-0.5 font-bold text-primary-foreground">
  Project of the Year
</span>
```
- Background: `--primary` (`#ffe330`) in both dark and light modes.
- Text: `--primary-foreground` (`#252525`) in both dark and light modes.
- Radius: `--radius-tag` (4px).

### 13.2 Yellow underline (`.underline-fancy`)

Used everywhere else for inline text emphasis and highlighted title words:

```css
.underline-fancy {
  text-decoration: underline;
  text-decoration-color: var(--emphasis);
  text-underline-offset: 4px;
  text-decoration-thickness: 2px;
}
```
- Underline colour: `--emphasis`.
  - In dark mode: `--emphasis` is `#ffe330` (MAC yellow).
  - In light mode: `--emphasis` is `#252525` (charcoal ink, because yellow underlines vanish on white paper).
- *Sources: mploy-app: frontend/src/app/globals.css:49-55; monmap: packages/webapp/app/globals.css:130.*

---

## 14. Navigation pattern

*Decision: MAC Study pattern adapted to Jobs dark background.* (*eox-vote decision (round 2)*).

### 14.1 Desktop navigation (`md:` and above)

- **Structure:** Full-bleed sticky top navigation header, height `h-14` (56px).
- **Surface:** `bg-card/95 backdrop-blur-xl border-b-2 border-border`.
- **Layout:** Centered container `max-w-7xl mx-auto px-6 flex items-center justify-between`. Left: circular MAC badge + app name. Center: navigation tabs. Right: theme toggle + user profile.
- *Sources: monmap: packages/webapp/components/app-header.tsx:62-63; mac-study: src/components/app-shell.tsx:501-522.*

### 14.2 Mobile navigation (below `md`)

- **Structure:** Fixed bottom navigation bar with safe-area padding:
  ```css
  --mobile-nav-content-height: 3.75rem; /* 60px */
  --mobile-nav-height: calc(var(--mobile-nav-content-height) + env(safe-area-inset-bottom, 0px));
  ```
- **Surface:** Glassmorphic container with 14px blur:
  - Dark: `background: rgb(31 31 31 / 0.94); backdrop-filter: blur(14px);`
  - Light: `background: rgb(245 245 242 / 0.94); backdrop-filter: blur(14px);`
- **Destinations:** 3 to 5 primary tabs evenly spaced in a grid.
- **Item layout:** 22px icon + 10px label.
- **Active state:** Marked in yellow (`text-primary`), paired with a non-colour indicator (e.g. solid filled icon variant and top active bar dot).
- **Keyboard auto-hide:** Must automatically hide when an input is focused or a keyboard/composer is active (`pointer-events-none opacity-0`).
- *Sources: mac-study: src/app/globals.css:21-29, 255-276.*

---

## 15. Accessibility standards

1. **Touch targets:** Interactive elements on mobile must maintain a minimum bounding box of `44x44px` (`min-h-11 min-w-11`). (*adopted without asking, decisions/round-1.md; mac-study: .superdesign/design-system.md:53; monmap: CLAUDE.md:108-111*).
2. **Text inputs on mobile:** Inputs must have `text-base` (16px) font size below `md` to avoid iOS Safari page zoom. (*monmap: packages/webapp/app/globals.css:393-406*).
3. **User zoom preservation:** Meta viewport must never include `maximum-scale=1` or `user-scalable=no`. (*adopted without asking, decisions/round-1.md; mac-study's src/app/layout.tsx:35-36 disables zoom and is deliberately not followed*).
4. **Non-colour signaling:** Selection, active tabs, and validation states must never be communicated by colour alone. Always pair colour changes with icons, checkmarks, weight shifts, or structural borders. (*mac-study: .superdesign/design-system.md:51*).
5. **Mobile dialog transformation:** Dialogs convert to bottom sheets on mobile devices below `sm` width, with touch swipe dismissal. (*monmap: packages/webapp/components/ui/sheet.tsx; mac-study: src/app/globals.css:514-526*).
6. **Print:** not a design target. `:root` holds the dark tokens, so a page that must print adds its own `@media print` block with the light values from §3.2. MonMap prints light because its dark mode is screen-only (*monmap: packages/webapp/app/globals.css:15-21*); that does not carry over when dark is the default.

---

## 16. Copy rules

1. **No em dashes:** Never use em dashes (—). Use plain hyphens (`-`) flanked by spaces or rewrite the sentence. (*monmap: CLAUDE.md:114; monashcoding-site: .impeccable.md:22*).
2. **No middle dots:** Never use middle dots (·) in UI text. Use hyphens, commas, or CSS separator borders. (*monmap: CLAUDE.md:114*).
3. **No emoji in UI:** Emoji are forbidden in UI chrome, alerts, and navigation labels. Use clean Lucide SVG icons. (*adopted without asking, decisions/round-1.md*).
4. **Tone:** Student-first, confident, pragmatic, direct, and unpretentious.

---

## 17. Component recipes

All components are built using shadcn/ui on Base UI (`@base-ui/react`), with tokens mapped through Tailwind CSS v4 and `cva`.

### 17.1 Button

*Adapted from monmap: packages/webapp/components/ui/button.tsx:7-38 with responsive density rules.*

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-control font-medium whitespace-nowrap transition-all outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-transparent",
        outline:
          "border-2 border-border bg-card text-foreground hover:bg-accent hover:border-border-strong",
        secondary:
          "bg-surface-soft text-foreground border-2 border-border hover:bg-accent",
        ghost:
          "border-2 border-transparent hover:bg-accent hover:text-foreground",
        destructive:
          "border-2 border-danger/40 bg-danger/10 text-danger hover:bg-danger/20",
        link:
          "text-primary underline-offset-4 hover:underline border-none p-0 h-auto",
      },
      size: {
        default:
          "h-11 md:h-9 px-4 md:px-3 text-base md:text-sm gap-2 md:gap-1.5",
        sm: "h-9 md:h-8 px-3 text-sm md:text-xs gap-1.5 md:gap-1",
        lg: "h-12 md:h-10 px-5 md:px-4 text-base gap-2",
        icon: "size-11 md:size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### 17.2 Input and Textarea

*Adapted from monmap: packages/webapp/components/ui/input.tsx:11-14 with mobile zoom guard.*

```tsx
// Input recipe
<input
  className={cn(
    "h-11 md:h-9 w-full min-w-0 rounded-control border-2 border-border bg-field px-3 py-1 text-base md:text-sm text-foreground placeholder:text-subtle transition-colors outline-none",
    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
    "disabled:pointer-events-none disabled:opacity-50",
    className
  )}
  {...props}
/>

// Textarea recipe
<textarea
  className={cn(
    "min-h-24 w-full min-w-0 rounded-control border-2 border-border bg-field p-3 text-base md:text-sm text-foreground placeholder:text-subtle transition-colors outline-none",
    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
    "disabled:pointer-events-none disabled:opacity-50",
    className
  )}
  {...props}
/>
```

### 17.3 Select

*Adapted from monmap: packages/webapp/components/ui/select.tsx.*

- **Trigger:** `flex h-11 md:h-9 w-full items-center justify-between rounded-control border-2 border-border bg-field px-3 text-base md:text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25`.
- **Popover Portal:** `rounded-panel border-2 border-border bg-card p-1 shadow-float text-foreground min-w-[8rem]`.
- **Item:** `relative flex cursor-pointer select-none items-center rounded-control px-3 py-2 text-sm text-foreground outline-none hover:bg-accent data-[highlighted]:bg-accent`.

### 17.4 Badge and Tag

*Adapted from monmap: packages/webapp/components/ui/badge.tsx:8.*

```tsx
const badgeVariants = cva(
  "inline-flex w-fit items-center justify-center gap-1 overflow-hidden whitespace-nowrap transition-all font-semibold",
  {
    variants: {
      variant: {
        default: "rounded-tag bg-primary px-2 py-0.5 text-[11px] text-primary-foreground",
        live: "rounded-tag bg-live/10 border border-live/50 px-2 py-0.5 text-[11px] text-live",
        success: "rounded-tag bg-success/10 border border-success/50 px-2 py-0.5 text-[11px] text-success",
        outline: "rounded-control border-2 border-border bg-surface-soft px-2.5 py-1 text-xs text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

### 17.5 Card

*Adapted from mploy-app: frontend/src/components/jobs/job-card.tsx:24-25 and monmap: packages/webapp/app/globals.css:242.*

```tsx
<div
  className={cn(
    "rounded-panel border-2 border-border bg-card p-4 sm:p-6 shadow-card transition-colors",
    className
  )}
>
  {children}
</div>
```

### 17.6 Dialog and mobile bottom sheet

*Adapted from monmap: packages/webapp/components/ui/dialog.tsx:34, 55 and mac-study: src/app/globals.css:514-526.*

- **Overlay:** `fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-open:animate-fade-in`.
- **Desktop Window (`sm:` and above):** `fixed top-1/2 left-1/2 z-50 grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-6 rounded-panel border-2 border-border bg-card p-6 shadow-dialog outline-none`.
- **Mobile Sheet (below `sm`):** `fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-panel border-t-2 border-x-2 border-border bg-card p-5 shadow-dialog outline-none overflow-y-auto`.

### 17.7 Toast (Sonner)

*Adapted from monmap: packages/webapp/app/layout.tsx:128-133 and mac-study: src/components/transient-toast.tsx:47.*

- CSS variables for Sonner:
  ```css
  --normal-bg: var(--card);
  --normal-border: var(--border);
  --normal-text: var(--foreground);
  --border-radius: var(--radius-panel);
  ```
- Toast container class: `rounded-panel border-2 border-border bg-card shadow-float px-4 py-3 text-sm text-foreground flex items-center gap-2`.
- Check icon rule: Check icon is `#42d392` on dark; in light mode, check icon is green `#15803d` or charcoal `#252525`. **Never yellow on white.**

### 17.8 Tabs

*Adapted from monmap: packages/webapp/components/ui/tabs.tsx:27.*

- **List:** `inline-flex h-11 md:h-9 items-center justify-center rounded-control border-2 border-border bg-surface-soft p-1 text-muted`.
- **Trigger:** `inline-flex items-center justify-center rounded-control border-2 border-transparent px-3 py-1 text-sm font-medium transition-colors data-active:border-border data-active:bg-card data-active:text-foreground`.

### 17.9 Tooltip

*Adapted from monmap: packages/webapp/components/ui/tooltip.tsx:53.*

- **Bubble:** `z-50 inline-flex rounded-control border-2 border-border bg-card px-3 py-1.5 text-xs text-foreground shadow-float`.

### 17.10 Skeleton and loading states

*Adapted from monmap: packages/webapp/components/planner/planner-skeleton.tsx:10-29 and mac-study: src/app/globals.css:16.*

- **Skeleton:** `animate-pulse rounded-panel bg-surface-soft/60 motion-reduce:animate-none`.
- **Spinner:** `<Loader2 className="size-4 animate-spin text-primary" />`.

### 17.11 Empty and error states

*Adapted from mploy-app: frontend/src/app/jobs/[id]/not-found.tsx:7 and mac-study: src/components/empty-state-cta.tsx:8.*

- Container: `rounded-panel border-2 border-border bg-card p-8 md:p-12 text-center flex flex-col items-center justify-center`.
- Mascot illustration: Centered SVG mascot (Min arms up or Min 404) on neutral card background.
- Heading: `text-xl font-semibold text-foreground mt-4`.
- Description: `text-sm text-muted mt-2 max-w-sm`.
- CTA: `Button variant="default" className="mt-6"`.

### 17.12 Voting specific component recipes

#### A. Vote option row (radio ballot card)

```tsx
interface VoteOptionRowProps {
  id: string;
  title: string;
  description?: string;
  count?: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function VoteOptionRow({
  id,
  title,
  description,
  count,
  isSelected,
  onSelect,
}: VoteOptionRowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(id)}
      className={cn(
        "group relative flex w-full items-center justify-between rounded-panel border-2 p-4 text-left transition-all outline-none",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        isSelected
          ? "border-primary bg-accent/70 shadow-sm"
          : "border-border bg-card hover:bg-accent/40"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Dual visual indicator: radio circle + inner dot (not colour alone) */}
        <div
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted group-hover:border-foreground"
          )}
        >
          {isSelected && (
            <div className="size-2 rounded-full bg-primary-foreground" />
          )}
        </div>
        <div>
          <div
            className={cn(
              "text-base md:text-sm font-semibold transition-colors",
              isSelected ? "text-foreground font-bold" : "text-foreground"
            )}
          >
            {title}
          </div>
          {description && (
            <div className="text-xs text-muted mt-0.5">{description}</div>
          )}
        </div>
      </div>

      {count !== undefined && (
        <span className="inline-block min-w-[5ch] text-right text-xs md:text-sm font-semibold text-muted tabular-nums">
          {count.toLocaleString()}
        </span>
      )}
    </button>
  );
}
```

#### B. Results tally bar

```tsx
interface ResultsBarProps {
  label: string;
  votes: number;
  totalVotes: number;
  isWinner?: boolean;
}

export function ResultsBar({ label, votes, totalVotes, isWinner }: ResultsBarProps) {
  const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-sm">
        <span className={cn("font-medium", isWinner && "font-bold text-foreground")}>
          {label} {isWinner && <span className="ml-1 text-xs text-primary font-bold">(Winner)</span>}
        </span>
        <span className="inline-block min-w-[4ch] text-right font-semibold tabular-nums text-muted">
          {percentage}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-surface-soft border border-border/50">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isWinner ? "bg-primary" : "bg-muted"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

---

## 18. Complete `app/globals.css` token file

This file is ready to paste into any Next.js + Tailwind CSS v4 project.

```css
@import "tailwindcss";

/*
 * MAC Design System - Complete Design Tokens
 * Dark = default (:root). Light = opt-in (.light class via next-themes).
 * Functional radius aliases enforce consistent 4px, 6px, and 12px geometry.
 */

/* ------------------------------------------------------------------ */
/*  Dark variant for next-themes attribute="class". Rarely needed:    */
/*  :root already holds the dark tokens.                              */
/* ------------------------------------------------------------------ */
@custom-variant dark (&:where(.dark, .dark *));

/* ------------------------------------------------------------------ */
/*  Light theme variant for next-themes attribute="class"             */
/* ------------------------------------------------------------------ */
@custom-variant light (&:where(.light, .light *));

@theme inline {
  /* --- Typography --- */
  --font-sans: var(--font-poppins), ui-sans-serif, system-ui, sans-serif;

  /* --- Colour Tokens --- */
  --color-background: var(--background);
  --color-surface-soft: var(--surface-soft);
  --color-card: var(--card);
  --color-accent: var(--accent);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-subtle: var(--subtle);
  --color-disabled: var(--disabled);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-field: var(--field);
  --color-ring: var(--ring);
  --color-emphasis: var(--emphasis);
  --color-success: var(--success);
  --color-danger: var(--danger);
  --color-info: var(--info);
  --color-live: var(--live);

  /* --- Radius Roles --- */
  --radius-tag: 4px;
  --radius-control: 6px;
  --radius-panel: 12px;

  /* Tailwind scale alias mappings onto 3 fixed roles */
  --radius-xs: var(--radius-tag);
  --radius-sm: var(--radius-control);
  --radius-md: var(--radius-control);
  --radius-lg: var(--radius-control);
  --radius-xl: var(--radius-panel);
  --radius-2xl: var(--radius-panel);
  --radius-3xl: var(--radius-panel);
  --radius-4xl: var(--radius-panel);
}

/* ------------------------------------------------------------------ */
/*  Dark Theme Tokens (Default brand state)                           */
/* ------------------------------------------------------------------ */
:root {
  color-scheme: dark;

  /* Canvas and surfaces */
  --background: #1f1f1f;
  --surface-soft: #262626;
  --card: #2e2e2e;
  --accent: #3a3a3a;

  /* Structural borders */
  --border: #3a3a3a;
  --border-strong: #4a4a4a;

  /* Typography */
  --foreground: #ffffff;
  --muted: rgb(255 255 255 / 0.65);
  --subtle: rgb(255 255 255 / 0.5);
  --disabled: rgb(255 255 255 / 0.35);

  /* Brand Yellow */
  --primary: #ffe330;
  --primary-foreground: #252525;

  /* Form controls */
  --field: #262626;
  --ring: #ffe330;
  --emphasis: #ffe330;

  /* Semantic status tokens */
  --success: #42d392;
  --danger: #ff6b6b;
  --info: #6cb6ff;
  --live: #ff7a00;

  /* Elevation and shadows */
  --shadow-card: none;
  --shadow-float: 0 16px 48px rgba(0, 0, 0, 0.5);
  --shadow-dialog: 0 24px 72px rgba(0, 0, 0, 0.58);

  /* Motion timing */
  --ease-reveal: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-overlay: cubic-bezier(0.76, 0, 0.24, 1);

  /* Mobile layout heights */
  --mobile-nav-content-height: 3.75rem;
  --mobile-nav-height: calc(var(--mobile-nav-content-height) + env(safe-area-inset-bottom, 0px));
}

/* ------------------------------------------------------------------ */
/*  Light Theme Tokens (Opt-in via .light class)                      */
/* ------------------------------------------------------------------ */
.light {
  color-scheme: light;

  /* Canvas and surfaces */
  --background: #f5f5f2;
  --surface-soft: #efeeea;
  --card: #ffffff;
  --accent: #ebeae5;

  /* Structural borders */
  --border: #d9d7d0;
  --border-strong: #c8c6bf;

  /* Typography (WCAG AA verified) */
  --foreground: #252525;
  --muted: #6a6964;
  --subtle: #6a6964;
  --disabled: #b5b3ad;

  /* Brand Yellow */
  --primary: #ffe330;
  --primary-foreground: #252525;

  /* Form controls */
  --field: #f8f8f6;
  --ring: #252525;
  --emphasis: #252525;

  /* Semantic status tokens (light variants) */
  --success: #166534;
  --danger: #b91c1c;
  --info: #0369a1;
  --live: #9a3412;

  /* Elevation and shadows */
  --shadow-card: 0 1px 0 rgba(0, 0, 0, 0.02),
                 0 4px 10px -4px rgba(37, 37, 37, 0.12),
                 0 6px 14px -8px rgba(37, 37, 37, 0.12);
  --shadow-float: 0 12px 32px rgba(37, 37, 37, 0.16);
  --shadow-dialog: 0 12px 32px rgba(37, 37, 37, 0.16);
}

/* ------------------------------------------------------------------ */
/*  Text Underline Flourish                                           */
/* ------------------------------------------------------------------ */
.underline-fancy {
  text-decoration: underline;
  text-decoration-color: var(--emphasis);
  text-underline-offset: 4px;
  text-decoration-thickness: 2px;
}

/* ------------------------------------------------------------------ */
/*  Mobile Input Zoom Guard (iOS Safari)                             */
/* ------------------------------------------------------------------ */
@media (width < 48rem) {
  input:not([type="checkbox"]):not([type="radio"]),
  select,
  textarea {
    font-size: 16px !important;
  }
}

/* ------------------------------------------------------------------ */
/*  Signature Winner Confetti Animation                               */
/* ------------------------------------------------------------------ */
@keyframes apps-column-confetti {
  0% {
    opacity: 0;
    transform: translate3d(-50%, 0, 0) rotate(0deg) scale(0.35);
  }
  35% {
    opacity: 1;
    transform: translate3d(-50%, -48px, 0) rotate(140deg) scale(1.15);
  }
  100% {
    opacity: 0;
    transform: translate3d(-50%, 85px, 0) rotate(320deg) scale(0.7);
  }
}

@utility animate-winner-confetti {
  animation: apps-column-confetti 1180ms cubic-bezier(0.2, 0.9, 0.25, 1) forwards;
}

/* ------------------------------------------------------------------ */
/*  Fade-in Animation (Dialog overlay)                                */
/* ------------------------------------------------------------------ */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@utility animate-fade-in {
  animation: fade-in 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* ------------------------------------------------------------------ */
/*  Utility Elevation Helpers                                         */
/* ------------------------------------------------------------------ */
@utility shadow-card {
  box-shadow: var(--shadow-card);
}

@utility shadow-float {
  box-shadow: var(--shadow-float);
}

@utility shadow-dialog {
  box-shadow: var(--shadow-dialog);
}
```
