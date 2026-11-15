# monmap styling audit

Source: https://github.com/monashcoding/monmap
Commit: 405de871d2aa2c5df23d872884236c22cc97cb0b
Audited: 2026-11-02
Line numbers refer to that commit; paths are relative to the repo root.

## 1. Stack
- **Framework & Version:** Next.js 16.4.3 (`packages/webapp/package.json:38`), React 19.3.0 (`packages/webapp/package.json:43`), React DOM 19.3.0 (`packages/webapp/package.json:44`).
- **Styling System:** Tailwind CSS v4.3.3 via `@tailwindcss/postcss` (`packages/webapp/package.json:51,60`). PostCSS 8.5.29 (`packages/webapp/package.json:57`).
- **Component Primitives / Base Library:** `@base-ui/react` ^1.8.0 (`packages/webapp/package.json:23`).
- **shadcn/ui Configuration:** Style `base-luma`, baseColor `neutral`, cssVariables `true`, iconLibrary `lucide` (`packages/webapp/components.json:3-13`). Note: `@base-ui/react` primitives are wrapped inside `packages/webapp/components/ui/` instead of Radix UI.
- **Component Libraries:** `cmdk` ^1.1.1 (`packages/webapp/package.json:33`), `boring-avatars` 2.0.4 (`packages/webapp/package.json:30`), `@dnd-kit/core` ^6.3.1 (`packages/webapp/package.json:25`), `@xyflow/react` ^12.12.0 (`packages/webapp/package.json:28`), `@dagrejs/dagre` ^3.1.1 (`packages/webapp/package.json:24`).
- **Icon Library:** `lucide-react` ^1.53.0 (`packages/webapp/package.json:37`, `packages/webapp/components.json:13`). Custom SVG brand icons for Google and GitHub in `packages/webapp/components/icons/` (`packages/webapp/components/icons/google.tsx:1`, `packages/webapp/components/icons/github.tsx:1`).
- **Animation Library / Utilities:** `tw-animate-css` ^1.4.0 (`packages/webapp/package.json:47`, imported in `packages/webapp/app/globals.css:2`), View Transitions API (`packages/webapp/app/globals.css:342-346`, `packages/webapp/components/theme-toggle.tsx:73-124`).
- **Font Loading:** `next/font/google` (`Poppins` Latin weights 400, 500, 600, 700, 800) injected via CSS variable `--font-sans` (`packages/webapp/app/layout.tsx:12-18`, `packages/webapp/app/globals.css:23-25`). Local TTFs also stored in `packages/webapp/public/fonts/` (Poppins-Medium, Poppins-Bold, Poppins-Black).
- **Theme Provider:** `next-themes` ^0.4.6 (`packages/webapp/package.json:39`) configured with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange` (`packages/webapp/components/theme-provider.tsx:14-18`).

---

## 2. Color

### Token Map (`packages/webapp/app/globals.css:94-234`)
| Token Name | Light Value | Dark Value | Citation |
|---|---|---|---|
| `--monash-yellow` | `#ffe330` | `#ffe330` | `packages/webapp/app/globals.css:96` |
| `--monash-yellow-ink` | `#252525` | `#252525` | `packages/webapp/app/globals.css:97` |
| `--mac-charcoal` | `#252525` | `#252525` | `packages/webapp/app/globals.css:98` |
| `--background` | `#f5f5f2` (warm paper) | `#161616` | `packages/webapp/app/globals.css:100, 181` |
| `--foreground` | `#252525` | `#ffffff` | `packages/webapp/app/globals.css:101, 182` |
| `--card` | `#ffffff` | `#202020` | `packages/webapp/app/globals.css:103, 184` |
| `--card-foreground` | `#252525` | `#ffffff` | `packages/webapp/app/globals.css:104, 185` |
| `--popover` | `#ffffff` | `#2a2a2a` | `packages/webapp/app/globals.css:106, 187` |
| `--popover-foreground` | `#252525` | `#ffffff` | `packages/webapp/app/globals.css:107, 188` |
| `--primary` | `var(--monash-yellow)` (`#ffe330`) | `var(--monash-yellow)` (`#ffe330`) | `packages/webapp/app/globals.css:109, 96` |
| `--primary-foreground` | `var(--monash-yellow-ink)` (`#252525`) | `var(--monash-yellow-ink)` (`#252525`) | `packages/webapp/app/globals.css:110, 97` |
| `--secondary` | `#efeeea` | `#2c2c2c` | `packages/webapp/app/globals.css:118, 190` |
| `--secondary-foreground` | `#252525` | `#ffffff` | `packages/webapp/app/globals.css:119, 191` |
| `--muted` | `#f0efeb` | `#272727` | `packages/webapp/app/globals.css:121, 193` |
| `--muted-foreground` | `#6b6a65` | `#a3a3a3` | `packages/webapp/app/globals.css:122, 194` |
| `--accent` | `#ebeae5` | `#313131` | `packages/webapp/app/globals.css:125, 196` |
| `--accent-foreground` | `#252525` | `#ffffff` | `packages/webapp/app/globals.css:126, 197` |
| `--emphasis` | `#252525` | `var(--monash-yellow)` (`#ffe330`) | `packages/webapp/app/globals.css:130, 199` |
| `--emphasis-soft` | `color-mix(in oklch, var(--monash-yellow) 32%, #ffffff)` | `color-mix(in oklch, var(--monash-yellow) 16%, #202020)` | `packages/webapp/app/globals.css:131, 200` |
| `--destructive` | `oklch(0.58 0.22 27)` | `oklch(0.7 0.19 22)` | `packages/webapp/app/globals.css:133, 202` |
| `--star` | `#f5b000` | `var(--monash-yellow)` (`#ffe330`) | `packages/webapp/app/globals.css:136, 204` |
| `--warning` | `oklch(0.72 0.16 60)` | `oklch(0.78 0.15 65)` | `packages/webapp/app/globals.css:137, 205` |
| `--warning-foreground` | `oklch(0.42 0.11 50)` | `oklch(0.85 0.12 75)` | `packages/webapp/app/globals.css:138, 206` |
| `--warning-soft` | `oklch(0.95 0.06 75)` | `oklch(0.32 0.06 60)` | `packages/webapp/app/globals.css:139, 207` |
| `--success` | `oklch(0.62 0.14 155)` | `oklch(0.72 0.15 155)` | `packages/webapp/app/globals.css:140, 208` |
| `--success-foreground` | `oklch(0.38 0.09 155)` | `oklch(0.83 0.12 155)` | `packages/webapp/app/globals.css:141, 209` |
| `--success-soft` | `oklch(0.94 0.06 160)` | `oklch(0.3 0.05 155)` | `packages/webapp/app/globals.css:142, 210` |
| `--info` | `oklch(0.6 0.16 245)` | `oklch(0.72 0.13 245)` | `packages/webapp/app/globals.css:143, 211` |
| `--info-foreground` | `oklch(0.38 0.11 245)` | `oklch(0.83 0.1 245)` | `packages/webapp/app/globals.css:144, 212` |
| `--info-soft` | `oklch(0.94 0.05 245)` | `oklch(0.3 0.06 245)` | `packages/webapp/app/globals.css:145, 213` |
| `--border` | `#d9d7d0` | `#383838` | `packages/webapp/app/globals.css:147, 215` |
| `--field` | `#f8f8f6` | `#272727` | `packages/webapp/app/globals.css:150, 216` |
| `--input` | `#e2e0da` | `#3a3a3a` | `packages/webapp/app/globals.css:151, 217` |
| `--ring` | `var(--emphasis)` | `var(--emphasis)` | `packages/webapp/app/globals.css:152` |
| `--year-strip` | `var(--mac-charcoal)` (`#252525`) | `#343434` | `packages/webapp/app/globals.css:155, 220` |
| `--shadow-tint` | `rgba(37, 37, 37, 0.12)` | `rgba(0, 0, 0, 0.6)` | `packages/webapp/app/globals.css:174, 232` |
| `--chart-1` | `#ffe330` | `#ffe330` | `packages/webapp/app/globals.css:157` |
| `--chart-2` | `#252525` | `#ffffff` | `packages/webapp/app/globals.css:158, 222` |
| `--chart-3` | `#6b6a65` | `#a3a3a3` | `packages/webapp/app/globals.css:159, 223` |
| `--chart-4` | `#b5b3ac` | `#5c5c5c` | `packages/webapp/app/globals.css:160, 224` |
| `--chart-5` | `#c9a800` | `#c9a800` | `packages/webapp/app/globals.css:161` |

### Faculty Rail Palette (`packages/webapp/lib/planner/faculty-color.ts:36-76`)
- FIT (IT): `bg-[#5b2d90] dark:bg-[#7c4dbd]`
- ENG / MEC / CIV / ELE (Engineering): `bg-[#d35400]`
- SCI / MAT / MTH (Science): `bg-teal-600`
- PHY / CHM: `bg-teal-700 dark:bg-teal-600`
- BIO / BMS: `bg-emerald-600`
- BUS / ECF / ECC / MGF / MGW / MKF (Business): `bg-blue-600`
- ACF / ACX / ACB: `bg-blue-700 dark:bg-blue-600`
- LAW / JUR (Law): `bg-rose-700 dark:bg-rose-600`
- ART / ATS (Arts): `bg-pink-600`; HIS: `bg-pink-700 dark:bg-pink-600`; MUS / THE: `bg-fuchsia-600`
- MED / PHH (Medicine): `bg-red-600`; NUR: `bg-red-700 dark:bg-red-600`; PHA / OCC: `bg-red-500`
- PSY: `bg-purple-600`; EDF / EDU (Education): `bg-sky-600`
- ARC / DES / IND: `bg-amber-600`
- Fallback slots (`packages/webapp/lib/planner/faculty-color.ts:24-33`): `violet-500`, `sky-500`, `rose-500`, `amber-500`, `teal-500`, `fuchsia-500`, `lime-600`, `slate-500`.

### Monash Grade Palette (`packages/webapp/lib/planner/grades.ts:17-36`)
- HD: `bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300`
- D: `bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300`
- C: `bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300`
- P: `bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300`
- N: `bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300`

### Recurring Raw Hex Hotspots
- `#252525` (Charcoal): 8 occurrences in print stylesheet (`packages/webapp/components/planner/print-sheet.tsx:172,186,199,297,419`), avatar palette (`packages/webapp/components/reviews/review-avatar.tsx:6`), viewport dark theme color (`packages/webapp/app/layout.tsx:79`).
- `#ffe330` (MAC yellow): In avatar palette (`packages/webapp/components/reviews/review-avatar.tsx:6`), README badge (`README.md:9`).
- `#fafaf7`: Viewport light theme color (`packages/webapp/app/layout.tsx:78`).
- `#8e918f`, `#131314`, `#e3e3e3`, `#1f1f20`, `#2a2a2b`: In Google Sign-in button dark mode (`packages/webapp/components/google-sign-in-button.tsx:57`).

---

## 3. Typography
- **Families:**
  - `font-sans`: `Poppins`, sans-serif (`packages/webapp/app/layout.tsx:12-18`, `packages/webapp/app/globals.css:25`).
  - `font-heading`: mapped directly to `var(--font-sans)` (`packages/webapp/app/globals.css:24`).
- **Weights:** `400` (normal), `500` (medium), `600` (semibold), `700` (bold), `800` (extrabold) (`packages/webapp/app/layout.tsx:16`).
- **Observed Type Scale:**
  - Display / 404 / 500: `text-6xl font-extrabold tracking-tight sm:text-7xl` (`packages/webapp/app/not-found.tsx:15`, `packages/webapp/app/error.tsx:24`).
  - Entity Hero / H1: `text-3xl leading-tight font-semibold text-balance sm:text-4xl` (`packages/webapp/components/handbook/frame.tsx:195`, `packages/webapp/components/handbook/hub-page.tsx:44`).
  - Page Titles / Search H1: `text-2xl font-semibold sm:text-3xl` (`packages/webapp/app/search/page.tsx:177`), `packages/webapp/app/admin/reviews/page.tsx:105`, `packages/webapp/app/my-reviews/page.tsx:40`.
  - Section Headings / H2: `text-lg font-semibold` (`packages/webapp/components/handbook/frame.tsx:313`) or `text-base leading-tight font-bold` (`packages/webapp/app/plans/plan-card.tsx:169`).
  - Card Headings / Sub-sections / H3 / DialogTitle: `text-base font-medium` (`packages/webapp/components/ui/dialog.tsx:124`), `text-sm font-semibold` (`packages/webapp/components/handbook/curriculum-tree.tsx:148`).
  - Body: `text-sm` (standard UI text across buttons, inputs, prose), with handbook prose at `max-w-[75ch] text-sm leading-[1.7]` (`packages/webapp/app/globals.css:254-260`).
  - Small / Micro / Labels: `text-xs` (badges, hints, metadata: `packages/webapp/components/ui/badge.tsx:8`), `text-[11px]` (table headers, sidebar chips: `packages/webapp/components/planner/print-sheet.tsx:199`), `text-[10px]` (faculty rail labels, unit badges: `packages/webapp/components/app-header.tsx:117`).
- **Tracking & Casing Conventions:**
  - Eyebrows & Fieldset Legends: uppercase with tracking: `text-[10px] font-semibold tracking-wide text-muted-foreground/70 uppercase` (`packages/webapp/app/plans/plan-card.tsx:193`), `text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase` (`packages/webapp/app/plans/new-plan-button.tsx:79`), `text-xs font-semibold tracking-wide text-muted-foreground uppercase` (`packages/webapp/components/handbook/frame.tsx:333`, `packages/webapp/app/search/page.tsx:544`).
  - Numbers: `tabular-nums` enforced on unit codes, credit points, marks, and dates (`packages/webapp/components/handbook/frame.tsx:196`, `packages/webapp/components/planner/unit-card.tsx:236`, `packages/webapp/app/plans/plan-card.tsx:206`).

---

## 4. Layout & Spacing
- **Container Max-Widths:**
  - Default Page Shell: `max-w-[1500px]` (`packages/webapp/components/page-shell.tsx:9`).
  - Handbook prose reading width: `max-w-[75ch]` (`packages/webapp/app/globals.css:256`).
  - Mobile Menu Sheet: `w-[min(280px,80vw)]` (`packages/webapp/components/app-header.tsx:159`).
  - Dialogs: `max-w-[calc(100%-2rem)] sm:max-w-md` (`packages/webapp/components/ui/dialog.tsx:56`).
  - Tooltips: `max-w-xs` (`packages/webapp/components/ui/tooltip.tsx:53`).
- **Page & Section Padding:**
  - Shell padding: `px-3 pt-3 pb-12 sm:px-5 sm:pt-5` (`packages/webapp/components/page-shell.tsx:9`).
  - Card/Dialog padding: `p-6` (`packages/webapp/components/ui/dialog.tsx:56`), `p-4` or `p-5` on cards.
- **Gaps:**
  - Page stack: `gap-3 sm:gap-5` (`packages/webapp/components/page-shell.tsx:9`).
  - Dialog / Form vertical stack: `gap-6` (`packages/webapp/components/ui/dialog.tsx:56`).
  - Button icon gap: `gap-1.5` (default), `gap-1` (sm/xs) (`packages/webapp/components/ui/button.tsx:24-27`).
- **Breakpoints:**
  - Tailwind v4 defaults (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
  - Custom media query checks: `width < 48rem` (`md: 768px`) for mobile input zoom guard (`packages/webapp/app/globals.css:393-407`), and `(min-width: 601px) and (max-width: 767.98px)` for Sonner toast offset (`packages/webapp/app/globals.css:415-419`).
- **Navbar / Header Height & Stickiness:**
  - Navbar height: `h-14` (56px) (`packages/webapp/components/app-header.tsx:69`).
  - Navbar behavior: Full-bleed sticky: `sticky top-0 z-40 mx-[calc(50%_-_50vw)] -mt-3 flex h-14 items-center gap-2 px-[calc(50vw_-_50%)] sm:-mt-5 sm:gap-3` (`packages/webapp/components/app-header.tsx:69`).
- **Sticky / Fixed Elements:**
  - Header: `sticky top-0 z-40` (`packages/webapp/components/app-header.tsx:69`).
  - Mobile progress FAB: `fixed right-4 bottom-4 z-30` (`packages/webapp/components/planner/right-sidebar.tsx:85`).
  - Sonner toaster: `bottom: 80px` (mobile/tablet override) (`packages/webapp/app/globals.css:417`, `packages/webapp/app/layout.tsx:132`).

---

## 5. Shape

### Corner Radii Role System (`packages/webapp/app/globals.css:71-91`)
Tailwind v4 theme aliases mapped by function rather than arbitrary size:
| Token | Formula / Value | Intended Usage | Applied Classes |
|---|---|---|---|
| `--radius` | `0.5rem` (8px) | Base variable (`packages/webapp/app/globals.css:163`) | - |
| `--radius-tag` | `calc(var(--radius) * 0.5)` (4px) | Inline labels < 16px tall, status pills (`packages/webapp/app/globals.css:82`) | `rounded-tag` |
| `--radius-control` | `calc(var(--radius) * 0.75)` (6px) | Buttons, inputs, selects, chips, badges, menu items, unit cards, slots (`packages/webapp/app/globals.css:83`) | `rounded-control`, `rounded-sm`, `rounded-md`, `rounded-lg` |
| `--radius-panel` | `calc(var(--radius) * 1.5)` (12px) | Cards, sidebars, popovers, menus, dialogs, sheets, toasts (`packages/webapp/app/globals.css:84`) | `rounded-panel`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-4xl` |
| `rounded-full` | `9999px` | Avatars, dots, progress rings, pill toggles only (`packages/webapp/app/globals.css:78`) | `rounded-full` |

### Border Widths & Colors
- Default base border: `border border-border` (`#d9d7d0` light, `#383838` dark) (`packages/webapp/app/globals.css:147, 215, 356`).
- Input border: `border border-input` (`#e2e0da` light, `#3a3a3a` dark) with `bg-field` (`#f8f8f6` light, `#272727` dark) (`packages/webapp/components/ui/input.tsx:12`, `packages/webapp/app/globals.css:150-151, 216-217`).
- Active sidebar tab accent: `border-b-[3px] border-primary` (`packages/webapp/components/planner/right-sidebar.tsx:204-206`).
- Dashed borders: `border border-dashed` on empty slots (`packages/webapp/components/planner/semester-slot.tsx:103`), finish line (`packages/webapp/components/planner/finish-line.tsx:59`), and new plan buttons (`packages/webapp/app/plans/new-plan-button.tsx:136`).

---

## 6. Depth & Effects
- **Elevation / Box Shadows:**
  - `shadow-card` (Tailwind `@utility` in `packages/webapp/app/globals.css:242-247`):
    ```css
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.02),
      0 4px 10px -4px var(--shadow-tint),
      0 6px 14px -8px var(--shadow-tint);
    ```
    Where `--shadow-tint` is `rgba(37, 37, 37, 0.12)` in light and `rgba(0, 0, 0, 0.6)` in dark (`packages/webapp/app/globals.css:174, 232`).
  - Top Bar Shadow: `shadow-[0_1px_0_var(--border),0_4px_12px_-6px_var(--shadow-tint)]` (`packages/webapp/components/app-header.tsx:70`).
  - Popover / Dropdown Shadow: `shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10` (`packages/webapp/components/ui/select.tsx:136`).
  - Dialog Shadow: `shadow-xl ring-1 ring-foreground/5 dark:ring-foreground/10` (`packages/webapp/components/ui/dialog.tsx:56`).
- **Blur / Glass:**
  - Header Glassmorphism: `backdrop-blur-xl backdrop-saturate-150 bg-card/95` (`packages/webapp/components/app-header.tsx:70`).
  - Modal Backdrop Overlay: `bg-black/30 supports-backdrop-filter:backdrop-blur-sm` (`packages/webapp/components/ui/dialog.tsx:34`).
- **Glows / Background Gradients / Noise:**
  - None found (no raster noise textures or ambient blur blobs used; the UI strictly adheres to clean "warm paper" and flat charcoal surfaces).

---

## 7. Motion
- **Transitions & Timings:**
  - Standard interactive transition: `transition-all` or `transition-colors` (`packages/webapp/components/ui/button.tsx:7`, `packages/webapp/components/theme-toggle.tsx:47`).
  - Unit cards & draggable rows: `transition-[transform,box-shadow,border-color,opacity] duration-200` (`packages/webapp/components/planner/unit-card.tsx:182`, `packages/webapp/components/planner/draggable-unit-row.tsx:85`).
  - Progress bar width: `transition-[width] duration-500 ease-out` (`packages/webapp/components/planner/requirements-panel.tsx:270`).
  - Radial SVG gauge: `transition: stroke-dasharray 0.5s ease-out` (`packages/webapp/components/planner/right-sidebar.tsx:406`).
- **Keyframes & Custom Animations:**
  - Validation pulse (`packages/webapp/app/globals.css:322-335`):
    ```css
    @keyframes validation-flash {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); transform: scale(1); }
      50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.25); transform: scale(1.02); }
    }
    @utility animate-validation-flash {
      animation: validation-flash 0.55s ease-in-out 3;
    }
    ```
  - Spinner: `animate-spin` on Lucide `Loader2Icon` / `LoaderCircleIcon` (`packages/webapp/components/ui/sonner.tsx:24`, `packages/webapp/components/handbook/search-box.tsx:112-113`).
  - Pulse: `animate-pulse` on skeleton blocks and saving indicator (`packages/webapp/components/planner/save-status-badge.tsx:20`, `packages/webapp/components/planner/planner-skeleton.tsx:13`).
- **Hover / Press Micro-interactions:**
  - Button click press-down: `active:not-aria-[haspopup]:translate-y-px` (`packages/webapp/components/ui/button.tsx:7`).
  - Card hover lift: `hover:-translate-y-px` (`packages/webapp/components/planner/unit-card.tsx:185`, `packages/webapp/components/planner/draggable-unit-row.tsx:86`).
  - Accordion / collapsible carets: `transition-transform duration-200 group-open:rotate-90` or `rotate-180` (`packages/webapp/components/handbook/curriculum-tree.tsx:53`, `packages/webapp/components/handbook/mobile-collapsible.tsx:42`).
- **Prefers-Reduced-Motion Handling:**
  - Enforced in theme switch view transition: `window.matchMedia("(prefers-reduced-motion: reduce)").matches` bypasses circle expansion and snaps immediately (`packages/webapp/components/theme-toggle.tsx:79-87`).
  - Standard CSS view-transition reset: `:root.theme-switching::view-transition-old(root), :root.theme-switching::view-transition-new(root) { animation: none; mix-blend-mode: normal; }` (`packages/webapp/app/globals.css:342-346`).

---

## 8. Components

### Button (`packages/webapp/components/ui/button.tsx:6-39`)
- **Base:** `group/button inline-flex shrink-0 items-center justify-center rounded-control border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`
- **Variants:**
  - `default`: `bg-primary text-primary-foreground hover:bg-primary/80` (6 usages)
  - `outline`: `border-border bg-card hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-transparent dark:hover:bg-input/30` (14 usages)
  - `secondary`: `bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground` (2 usages)
  - `ghost`: `hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50` (38 usages)
  - `destructive`: `bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40` (4 usages)
  - `link`: `text-primary underline-offset-4 hover:underline` (0 usages)
- **Sizes:** `default` (`h-9 gap-1.5 px-3`), `xs` (`h-6 gap-1 px-2.5 text-xs`), `sm` (`h-8 gap-1 px-3`), `lg` (`h-10 gap-1.5 px-4`), `icon` (`size-9`), `icon-xs` (`size-6`), `icon-sm` (`size-8`), `icon-lg` (`size-10`).

### Card (`packages/webapp/components/planner/unit-card.tsx:181-203`, `packages/webapp/app/plans/plan-card.tsx:147-245`)
- Pattern: `rounded-panel border bg-card p-6 shadow-card` or unit-card: `rounded-control border bg-card shadow-card`.
- Unit cards display a vertical left rail coloured by faculty prefix (`facultyStyle(code).railClass`, `packages/webapp/components/planner/unit-card.tsx:208`).

### Input & Textarea (`packages/webapp/components/ui/input.tsx:6-19`, `packages/webapp/components/ui/textarea.tsx:5-16`)
- Pattern: `h-9 w-full min-w-0 rounded-control border border-input bg-field px-3 py-1 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 md:text-sm`
- Textarea: `flex field-sizing-content min-h-16 w-full resize-none rounded-control border border-input bg-field px-3 py-3 text-base`.

### Select (`packages/webapp/components/ui/select.tsx:80-207`)
- Trigger: `flex w-fit items-center justify-between gap-1.5 rounded-control border border-input bg-field px-3 py-2 text-sm whitespace-nowrap outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 data-[size=default]:h-9 data-[size=sm]:h-8`.
- Popup: `rounded-panel bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10`.
- Item: `rounded-control py-2 pr-8 pl-3 text-sm font-medium focus:bg-accent focus:text-accent-foreground`.

### Badge / Tag / Chip (`packages/webapp/components/ui/badge.tsx:7-28`)
- Base: `group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-control border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:size-3!`
- Variants: `default` (`bg-primary text-primary-foreground`), `secondary` (`bg-secondary text-secondary-foreground`), `destructive` (`bg-destructive/10 text-destructive`), `outline` (`border-border text-foreground`), `ghost` (`hover:bg-muted`), `link` (`text-primary underline`).

### Navbar / Header (`packages/webapp/components/app-header.tsx:60-133`)
- Height `h-14`, sticky full-bleed (`mx-[calc(50%_-_50vw)] px-[calc(50vw_-_50%)]`), `bg-card/95 backdrop-blur-xl backdrop-saturate-150`, breadcrumb bug with MAC logo + MonMap link + 2027 update pill badge.

### Footer (`packages/webapp/components/handbook-attribution.tsx:14-51`, `packages/webapp/components/home-about.tsx:33-92`)
- No dedicated global `<footer/>` tag; pages embed handbook attribution and contributor links inside `<main>` via `handbook-attribution.tsx` with `text-xs text-muted-foreground` and links to `monashcoding.com`.

### Modal / Dialog / Drawer (`packages/webapp/components/ui/dialog.tsx:43-80`, `packages/webapp/components/ui/sheet.tsx:39-75`)
- Dialog: `fixed top-1/2 left-1/2 z-50 rounded-panel bg-popover p-6 shadow-xl ring-1 ring-foreground/5 dark:ring-foreground/10 sm:max-w-md`.
- Sheet: Drawer anchored to side with `rounded-none bg-popover shadow-xl data-[side=left]:w-[min(280px,80vw)]`.

### Toast (`packages/webapp/components/ui/sonner.tsx:13-42`)
- Sonner toaster mounted in `RootLayout` (`packages/webapp/app/layout.tsx:128-133`) with `richColors`, `closeButton`, `mobileOffset={{ bottom: 80 }}`. CSS variables: `--normal-bg: var(--popover)`, `--normal-border: var(--border)`, `--border-radius: var(--radius-panel)`.

### Table / List (`packages/webapp/components/handbook/unit-page.tsx:382-414`, `packages/webapp/app/globals.css:303-314`)
- Wrapper: `overflow-x-auto rounded-control border`.
- Table: `<table className="w-full text-sm">`, `<thead className="bg-muted/50 text-left text-xs text-muted-foreground">`, `<th>` and `<td>` with `px-4 py-2.5`, `<tbody className="divide-y">`.

### Tabs (`packages/webapp/components/ui/tabs.tsx:26-70`)
- List variants: `default` (`bg-muted rounded-control p-1`), `line` (`gap-1 bg-transparent`).
- Trigger: `rounded-control px-3 py-1 text-sm font-medium data-active:bg-card data-active:text-foreground data-active:shadow-card dark:data-active:bg-input/30`.

### Tooltip (`packages/webapp/components/ui/tooltip.tsx:28-64`)
- Bubble: `rounded-control bg-foreground px-3 py-1.5 text-xs text-background shadow-md`, arrow `rotate-45 rounded-[2px] bg-foreground fill-foreground`.

### Loading (Skeleton / Spinner) (`packages/webapp/components/planner/planner-skeleton.tsx:6-30`)
- Skeletons: `animate-pulse rounded-panel bg-muted/40` or `bg-muted/60`.
- Spinners: `Loader2Icon` / `LoaderCircleIcon` with `animate-spin size-4 text-muted-foreground` (`packages/webapp/components/handbook/search-box.tsx:112-115`).

### Empty & Error States (`packages/webapp/app/not-found.tsx:10-27`, `packages/webapp/app/error.tsx:20-48`, `packages/webapp/app/search/page.tsx:322-329`)
- Container: `rounded-panel border bg-card px-6 py-20 text-center shadow-card sm:py-28`.
- Content: `text-6xl font-extrabold` error code, `text-lg text-muted-foreground` message, accompanied by `Button size="lg"` or link to `"Back to planner"`.
- Empty Search/Reviews: `rounded-panel border bg-card px-5 py-10 text-center shadow-card` with `font-medium` header and `text-sm text-muted-foreground` subtitle.

---

## 9. Iconography & Imagery
- **Icon Set:** `lucide-react` ^1.53.0 (`packages/webapp/package.json:37`, `packages/webapp/components.json:13`). Default sizes: `size-4` (standard buttons/inputs), `size-3.5` (sub-items/badges), `size-3` (micro icons). Default stroke: Lucide standard (2px).
- **Logo Files & Usage:**
  - MAC Brand Logo: `/brand-logo.png` (28x28 circular badge in top navbar breadcrumb, `packages/webapp/components/app-header.tsx:91-100`).
- **Illustrations & Avatars:**
  - `boring-avatars` (Beam variant) in `packages/webapp/components/reviews/review-avatar.tsx:6-37` using a 5-color palette: `["#252525", "#ffe330", "#f5b000", "#d9d7d0", "#f5f5f2"]`.
- **Photos / Decorative Backgrounds:**
  - None found. Backgrounds are solid semantic tokens (`--background`, `--card`, `--muted`, `--field`).

---

## 10. Theme Mode
- **Strategy:** Class-based (`.dark` on `<html>`) managed by `next-themes` (`packages/webapp/components/theme-provider.tsx:14-18`).
- **Default:** `system` with fallback following OS preference (`packages/webapp/components/theme-provider.tsx:16`, `packages/webapp/components/theme-toggle.tsx:21`).
- **Toggle Mechanism:**
  - Desktop Header: Dropdown menu trigger (`packages/webapp/components/theme-toggle.tsx:64-164`) utilizing the View Transitions API for a circular expansion reveal animating from the button's coordinates (`packages/webapp/components/theme-toggle.tsx:73-124`, `packages/webapp/app/globals.css:342-346`).
  - Mobile Sheet: 3-button segmented radio row (Light / Dark / System) (`packages/webapp/components/theme-toggle.tsx:29-55`).
- **Status Bar Sync:** `ThemeColorSync` (`packages/webapp/components/theme-provider.tsx:34-50`) dynamically swaps `meta[name="theme-color"]` to `#fafaf7` (light) or `#252525` (dark) based on active state (`packages/webapp/app/layout.tsx:78-79`).
- **Print Handling:** `@custom-variant dark { @media screen { &:where(.dark, .dark *) { @slot; } } }` (`packages/webapp/app/globals.css:15-20`). Dark mode styles strictly ignore print media; printing always uses light mode.

---

## 11. Voice & Copy
- **UI Copy Tone:** Pragmatic, direct, student-first, clear, and unpretentious. Explanations clarify Monash handbook subtleties without bureaucratic jargon.
- **Punctuation Rule:** Plain hyphens only (`-`); em dashes (—) and middle dots (·) are forbidden in UI strings (`CLAUDE.md:114`).
- **Capitalization Conventions:**
  - Headings & Page Titles: Sentence case (`"Search units & courses"`, `"Review moderation"`, `"Sign in to view your course maps"`, `"My reviews"`).
  - Buttons & Interactive Controls: Sentence case (`"New plan"`, `"Back to planner"`, `"Skip for now"`, `"Try again"`, `"Enter marks"`).
  - Fieldset Eyebrows & Section Sub-tags: Uppercase (`"MANAGING FACULTY"`, `"LAST UPDATED"`, `"STARTING YEAR"`, `"DEGREE"`, `"TEACHING PERIOD"`).
- **Verbatim Sample Strings:**
  1. `"Plan your Monash degree: drag units into semesters, check prerequisites and track your WAM."` (`packages/webapp/app/layout.tsx:24`)
  2. `"Yellow surfaces pair with text-primary-foreground, never text-primary"` (`CLAUDE.md:81`)
  3. `"Save your plan to your account so it follows you across devices."` (`packages/webapp/app/sign-in/page.tsx:17`)
  4. `"Others see your initials only."` (`packages/webapp/app/my-reviews/page.tsx:42`)
  5. `"No reviews yet"` (`packages/webapp/app/my-reviews/page.tsx:74`)
  6. `"Rate the units you have taken from their pages. Your reviews help other students plan."` (`packages/webapp/app/my-reviews/page.tsx:76`)
  7. `"Classifier down (timeout). Published without a check."` (`packages/webapp/app/admin/reviews/page.tsx:272-273`)
  8. `"This degree's units come from your chosen major or specialisation - pick one above, or browse the "` (`packages/webapp/components/planner/aos-templates.tsx:204`)

---

## 12. Code Conventions
- **Class Utilities:** `cn(...)` wrapping `clsx` and `tailwind-merge` (`packages/webapp/lib/utils.ts:19-21`). `cva` used for variant generation across buttons, badges, tabs (`packages/webapp/components/ui/button.tsx:6-39`, `packages/webapp/components/ui/badge.tsx:7-28`, `packages/webapp/components/ui/tabs.tsx:26-40`).
- **Tailwind Class Ordering & Prettier Config:**
  - `prettier-plugin-tailwindcss` ^0.8.1 enabled (`packages/webapp/package.json:59`).
  - Prettier settings (`packages/webapp/.prettierrc:1-11`): `semi: false`, `singleQuote: false`, `tabWidth: 2`, `trailingComma: "es5"`, `printWidth: 80`, `tailwindStylesheet: "app/globals.css"`, `tailwindFunctions: ["cn", "cva"]`.
- **CSS Variable Naming:** kebab-case `--color-*`, `--radius-*`, `--font-*` registered via Tailwind v4 `@theme inline` (`packages/webapp/app/globals.css:23-92`).
- **Component File Layout:**
  - Server components default; `"use client"` at file top only when state, hooks, or browser events are required.
  - Sub-features broken into co-located domain folders (`packages/webapp/components/planner/`, `packages/webapp/components/handbook/`, `packages/webapp/components/reviews/`, `packages/webapp/components/ui/`).
- **Accessibility & Touch Patterns:**
  - Focus rings: `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30` or `outline-none focus-visible:ring-2 focus-visible:ring-ring` (`packages/webapp/components/ui/button.tsx:7`, `packages/webapp/components/app-header.tsx:89`).
  - Accessible screen reader text: `<span className="sr-only">Close</span>` (`packages/webapp/components/ui/dialog.tsx:74`).
  - Touch targets on mobile: `TOUCH_HIT` (`size-11` or pseudo-element padding) and `max-md:min-h-11` (`CLAUDE.md:108-111`, `packages/webapp/components/planner/touch-target.ts:1-15`).
  - iOS Zoom prevention: Inputs forced to `font-size: 1rem` (16px) below `48rem` (`packages/webapp/app/globals.css:393-407`).

---

## 13. Existing Design Docs
Key rules summarized from `CLAUDE.md`:
- **Yellow / Foreground Pairing (`CLAUDE.md:81-88`):**
  > "`--primary` is Monash yellow (`#ffe330`). Yellow text on a yellow tint (`bg-primary/15 text-primary` and friends) is unreadable. The brand defines `--primary-foreground` as `#252525` (MAC charcoal ink) for exactly this pairing — use it on any yellow-tinted chip, badge, or pill, and bump the tint (≈`/40`) so the surface still reads as yellow rather than gray."
- **Dark Mode & Phone Responsiveness (`CLAUDE.md:104-114`):**
  > "Use the theme tokens in `app/globals.css`, never raw colours, so dark mode follows."
  > "Check every UI change at phone width (below the `md` breakpoint). Below `md`, give a small icon button a bigger tap area with `TOUCH_HIT` or `TOUCH_HIT_ROW` from `components/planner/touch-target.ts`, or with `max-md:min-h-11`."
  > "`app/globals.css` keeps text fields at 16px or more below `md`, so iOS does not zoom the page. Do not override it."
  > "In UI text, use plain hyphens, not middle dots (·) or em dashes (—)."

---

## 14. Signature: What Makes `monmap` Recognizable
1. **Warm Paper & Charcoal Foundation:** Light mode eschews clinical stark white for a warm paper tone (`#f5f5f2`), paired with a deep charcoal `#252525` ink instead of pure black (`packages/webapp/app/globals.css:98, 100`).
2. **Monash Yellow as Sole Brand Accent:** Yellow (`#ffe330`) is strictly reserved for primary actions, selections, and subtle brand identifiers; paired rigorously with charcoal foreground ink (`#252525`) rather than yellow text on dark surfaces (`CLAUDE.md:81`).
3. **Role-Driven Corner Radius Hierarchy:** Strict semantic radius separation: `rounded-tag` (4px) for inline micro labels, `rounded-control` (6px) for interactive elements, and `rounded-panel` (12px) for cards, dialogs, and popovers (`packages/webapp/app/globals.css:71-91`).
4. **Faculty Rail Coding:** Unit cards immediately communicate discipline at a glance using vertical color rails (`#5b2d90` IT purple, `#d35400` Engineering orange, `teal-600` Science, etc.) with dark-mode adjusted shades (`packages/webapp/lib/planner/faculty-color.ts:36-76`).
5. **Card Elevation with Variable Tint:** A single unified box shadow (`shadow-card`) using `--shadow-tint` that seamlessly deepens from subtle ink mist (`rgba(37, 37, 37, 0.12)`) in light mode to deep black (`rgba(0, 0, 0, 0.6)`) in dark mode, preventing dark-mode shadow glow (`packages/webapp/app/globals.css:242-247`).
