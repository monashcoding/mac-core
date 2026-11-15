# mac-study styling audit

Source: https://github.com/monashcoding/mac-study
Commit: ec539128237885819bf9c6dc42779e75fa6c9346
Audited: 2026-11-02
Line numbers refer to that commit; paths are relative to the repo root.

---

## 1. Stack

| Dimension | Value / Specification | Citation |
| :--- | :--- | :--- |
| **Framework** | Next.js `16.3.8` (App Router, Turbopack, React 19 canary/latest) | `package.json:17,29` |
| **Styling System** | Tailwind CSS v4 (`tailwindcss: latest`, `@tailwindcss/postcss: latest` via `@import "tailwindcss";`, no `tailwind.config.*`) | `package.json:37,45`, `src/app/globals.css:1` |
| **CSS Utilities** | Custom utility layer (`.mac-panel`, `.mac-raised`, `.mac-muted-panel`, `.mac-focus`) + CSS variables in `:root` | `src/app/globals.css:5-27,548-576` |
| **Class Utilities** | `clsx` (`latest`) + `tailwind-merge` (`latest`) in custom `cn()` helper | `package.json:13,20`, `src/lib/utils.ts:4-6` |
| **Component Libs** | **None** (zero third-party UI libraries: no Radix primitives, no Mantine, no shadcn CLI package, no Headless UI) | `package.json:11-23` |
| **Icon Library** | `lucide-react` (`latest`) | `package.json:26` |
| **Animation Lib** | **None** (zero Framer Motion, zero GSAP; 100% native CSS `@keyframes` and transitions) | `package.json:11-23`, `src/app/globals.css:180-366` |
| **Font Loading** | System font stack with local/system `Inter` fallback (no `next/font`, no `@font-face`, no Google Fonts CDN) | `src/app/globals.css:93-100` |
| **Theme Provider** | **None** (hardcoded dark mode: `color-scheme: dark;` on `html`, no `next-themes` or light/dark toggle) | `src/app/globals.css:79`, `src/app/layout.tsx:48` |
| **PWA / Standalone** | Native PWA with Web Push (`web-push: ^3.6.7`), custom service worker (`public/sw.js`), standalone media query variants | `package.json:31`, `src/app/globals.css:3,39-47`, `src/app/layout.tsx:16-24` |

---

## 2. Color

### 2.1 CSS Variable Tokens (Dark-Only Palette)

The app is exclusively dark mode (`color-scheme: dark;` at `src/app/globals.css:79`). There are no light mode token counterparts.

| Token Name | Defined Value | Role & Usage Notes | Citation | Used In Components? |
| :--- | :--- | :--- | :--- | :--- |
| `--color-background` | `#171717` | Root viewport & app canvas background | `src/app/globals.css:11` | Yes (25+ callsites) |
| `--color-surface` | `#1c1c1c` | Base cards, dialogs, inputs, muted surfaces | `src/app/globals.css:13` | Yes (20+ callsites) |
| `--color-surface-raised`| `#232323` | Popovers, active state containers, elevated cards | `src/app/globals.css:14` | Yes (15+ callsites) |
| `--color-border` | `#34342f` | Standard 1px boundary lines, dividers | `src/app/globals.css:15` | Yes (60+ callsites) |
| `--color-text` | `#f7f7f2` | Primary high-contrast text | `src/app/globals.css:16` | Yes (30+ callsites) |
| `--color-text-muted` | `#a9a99f` | Secondary copy, metadata, unselected nav labels | `src/app/globals.css:17` | Yes (150+ callsites) |
| `--color-mac-yellow` | `#ffe330` | MAC brand yellow: active nav, CTAs, focus rings | `src/app/globals.css:12` | Yes (100+ callsites) |
| `--color-danger` | `#ff6b6b` | Destructive buttons, error alerts, unread dots | `src/app/globals.css:19` | Yes (30+ callsites) |
| `--color-success` | `#42d392` | Available username status, studying avatar halo | `src/app/globals.css:18` | **Sparse** (2 callsites only) |
| `--color-info` | `#6cb6ff` | Onboarding preview indicator | `src/app/globals.css:20` | **Sparse** (1 callsite only) |

### 2.2 Shared 6-Color Accent Palette (Subjects & Profiles)

Identical 6-color categorical palette defined across `timer-dashboard.tsx:75-81`, `units-dashboard.tsx:104-110`, and `src/lib/social-state.ts:16-23`:

| Color Name | Hex Value | RGB Alpha Equivalent | Primary Usage |
| :--- | :--- | :--- | :--- |
| Yellow | `#FFE330` | `rgb(255 227 48)` | Default subject & brand profile color |
| Blue | `#6CB6FF` | `rgb(108 182 255)` | Subject 2 / Friend candidate default (`PROFILE_COLORS[1]`) |
| Green | `#42D392` | `rgb(66 211 146)` | Subject 3 / Profile avatar tint |
| Orange | `#FF8A65` | `rgb(255 138 101)` | Subject 4 / Profile avatar tint |
| Purple | `#B388FF` | `rgb(179 136 255)` | Subject 5 / Profile avatar tint |
| Pink | `#F06292` | `rgb(240 98 146)` | Subject 6 / Profile avatar tint |

### 2.3 Raw Hex & RGB Hotspots in Components

The codebase frequently bypasses CSS variables for hardcoded hex and alpha-blended values:

| Literal Color / Class | Occurrences (Approx.) | Where & Why It Is Used | Key Citations |
| :--- | :--- | :--- | :--- |
| `#141414` | **50+** | Mandatory dark foreground on brand yellow backgrounds (`bg-[var(--color-mac-yellow)] text-[#141414]`) for WCAG AA contrast. | `src/app/globals.css:545`, `src/components/app-shell.tsx:579,764`, `src/components/transient-toast.tsx:47` |
| `rgb(255 227 48 / α)` | **40+** | Tints of brand yellow: `/0.1` and `/0.12` for badge/icon fills; `/0.4` and `/0.42` for active borders; `/0.18` for rings and progress track. | `src/components/groups/groups-dashboard.tsx:2139`, `src/components/app-dialog.tsx:242` |
| `rgb(255 255 255 / α)` | **85+** | Layered dark UI: `/0.025`–`/0.045` for button/card translucent fills; `/0.055`–`/0.08` for borders and skeletons; `/0.15`–`/0.2` for hover outlines. | `src/components/ui/skeleton.tsx:16,54`, `src/components/app-shell.tsx:452,679` |
| `rgb(255 107 107 / α)` | **16+** | Danger tints: `/0.07`–`/0.08` for error backgrounds; `/0.45`–`/0.55` for destructive button borders. | `src/components/app-dialog.tsx:256`, `src/components/auth/login-form.tsx:156` |
| `#ff7a00` & `#ff9a3d` | **8** | Vibrant flame/orange accents reserved for live "studying now" status indicators, pulse dots, and timers. | `src/components/groups/groups-dashboard.tsx:1157,1283,2008,2010`, `src/components/auth/login-preview.tsx:89` |
| `#1f1f1f` & `#1d1c16` | **5** | Hardcoded off-surface backgrounds for onboarding cards and desktop live preview cards. | `src/components/auth/login-preview.tsx:37,83,197`, `src/components/onboarding/getting-started-card.tsx:98` |
| `#2b2b28` & `#111` | **2** | Hardware mockup border and bezel for PWA mobile installation preview figure. | `src/components/pwa/install-onboarding.tsx:548` |

### 2.4 Gradients

1. **Slider Track Fill**: `linear-gradient(to right, var(--color-mac-yellow) 0, var(--color-mac-yellow) var(--duration-progress), var(--color-border) var(--duration-progress), var(--color-border) 100%)` (`src/app/globals.css:454-460`).
2. **Studying Member Tile**: `radial-gradient(circle_at_50%_38%,rgb(255_122_0/0.14),transparent_62%),rgb(255_122_0/0.035)` (`src/components/groups/groups-dashboard.tsx:1254`).

---

## 3. Typography

### 3.1 Families & Loading

- **Body & Display Family**: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` (`src/app/globals.css:93-100`).
- **Monospace Family**: Tailwind default monospace (`font-mono`) used for all study session timers, clock counters, and leaderboard ranks (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`).
- **Loading Mechanism**: **Zero web fonts downloaded**. Relies entirely on system/OS installed `Inter` or falls back to system sans-serif.

### 3.2 Observed Type Scale & Heading Hierarchy

| Role | Classes / Size | Weight | Tracking / Leading | Example File & Line |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Display H1** | `text-3xl sm:text-4xl` (30–36px) | `font-semibold` | `tracking-tight` | `src/app/(auth)/auth/login/page.tsx:46` |
| **Desktop Page Title**| `text-3xl` (30px) | `font-semibold` | `tracking-[-0.025em]` | `src/components/app-shell.tsx:516` |
| **Mobile Header Title**| `text-xl` (20px) | `font-semibold` | Normal / truncate | `src/components/app-shell.tsx:506` |
| **Modal / Dialog H2** | `text-lg` (18px) | `font-semibold` | Truncate | `src/components/app-dialog.tsx:183` |
| **Section Header** | `text-lg` or `text-base` (16–18px)| `font-semibold` | Normal | `src/components/statistics/statistics-dashboard.tsx:423` |
| **Eyebrow / Category** | `text-[0.68rem]`, `text-xs` (10–12px)| `font-semibold` | `uppercase tracking-[0.14em]` to `[0.2em]` | `src/components/app-shell.tsx:457`, `src/components/ui/list-section.tsx:17` |
| **Body (Default)** | `text-sm` (14px) | `font-normal` / `font-medium` | `leading-5` or `leading-6` | `src/components/empty-state-cta.tsx:33`, `src/app/(auth)/auth/access/page.tsx:61` |
| **Metadata / Micro** | `text-xs` (12px), `text-[10px]`, `text-[9px]` | `font-medium` / `font-semibold` | Normal | `src/components/groups/group-chat.tsx:1091`, `src/components/app-shell.tsx:577` |
| **Timer Hero Values** | `text-[44px]` or `text-[35px]` | `font-semibold` | `font-mono leading-none tabular-nums` | `src/components/auth/login-preview.tsx:50-53` |
| **Inline Timers** | `text-xl`, `text-sm`, `text-xs` | `font-semibold` | `font-mono tabular-nums tracking-tight` | `src/components/timer/sidebar-study-timer.tsx:163`, `src/components/timer/timer-dashboard.tsx:955` |

### 3.3 Casing Conventions

- **Eyebrows / Overlines**: Exclusively **UPPERCASE** with wide letter tracking:
  - `uppercase tracking-[0.18em]` for Workspace header (`src/components/app-shell.tsx:457`).
  - `uppercase tracking-[0.2em]` for "STUDIED TODAY" (`src/components/timer/timer-dashboard.tsx:830`).
  - `uppercase tracking-[0.14em]` for section titles (`src/components/ui/list-section.tsx:17`).
  - `uppercase tracking-[0.12em]` for "YOU" badges and chat date dividers (`src/components/groups/groups-dashboard.tsx:1939`, `src/components/groups/group-chat.tsx:951`).
- **Headings & Buttons**: Exclusively **Sentence case** ("Start a session", "Discard unsaved changes?", "Keep editing", "Set up your profile", "Past units", "Device alerts"). Title Case is strictly reserved for brand names ("MAC Study") and external platform names ("Home Screen", "Windows Taskbar").

---

## 4. Layout & Spacing

### 4.1 Shell Architecture & Max Widths

- **Desktop Shell Breakpoint**: `64rem` / `1024px` (`lg:` breakpoint in Tailwind).
  - Defined in CSS media queries: `@media (max-width: 63.999rem)` and `@media (min-width: 64rem)` (`src/app/globals.css:106,169`).
- **Desktop Sidebar Navigation Rail**: Exactly `17.5rem` (280px) wide (`src/components/app-shell.tsx:449`).
- **Main Centered Content Constraint**: `max-w-[80rem]` (1280px) (`src/components/app-shell.tsx:501,526`).
- **Mobile Container Constraint**: `max-w-6xl` (`src/components/app-shell.tsx:449`).
- **Modal / Form Constraints**:
  - `AppDialog`: Defaults to `max-w-xl` (576px) (`src/components/app-dialog.tsx:32`).
  - Auth Cards: `max-w-md` (448px) (`src/app/(auth)/auth/access/page.tsx:32`, `src/app/(auth)/auth/profile/page.tsx:54`).
  - Confirmation Alerts: `max-w-sm` (384px) (`src/components/app-dialog.tsx:242`).
  - Mobile Bottom Nav: `max-w-[32rem]` (`src/app/globals.css:309`).

### 4.2 Page & Section Padding

- **Mobile Viewport Gutters**: `px-4 pb-4 pt-3` (`src/components/app-shell.tsx:526`).
- **Tablet (`sm`)**: `sm:px-6` (`src/components/app-shell.tsx:526`).
- **Desktop (`lg` / `xl`)**: `lg:px-8 lg:py-8 xl:px-12 xl:py-10` (`src/components/app-shell.tsx:3`).
- **Vertical Rhythm**: Grid and flex gaps standardise on `gap-1.5` (6px), `gap-2` (8px), `gap-3` (12px), and `space-y-4` (16px).

### 4.3 Navigation Heights & Safe Area Offsets

- **Mobile Bottom Navigation Height Token**:
  - `--mobile-nav-content-height: 3.75rem` (60px) (`src/app/globals.css:21`).
  - `--mobile-nav-control-bottom`: `clamp(0px, calc(var(--safe-area-bottom) - 2.25rem), 0.5rem)` (`src/app/globals.css:22-26`). In standalone PWA mode: `max(0px, calc(var(--safe-area-bottom) - 1.25rem))` (`src/app/globals.css:42-45`).
  - Total reserved height: `--mobile-nav-height: calc(var(--mobile-nav-content-height) + var(--safe-area-bottom))` (`src/app/globals.css:27-29`).
- **Mobile Sticky Header**: `sticky top-0 z-20 pb-3 pt-[calc(var(--safe-area-top)+0.85rem)] px-4` (`src/components/app-shell.tsx:501`).
- **Chat Floating Form**: `pb-[max(0.75rem,var(--safe-area-bottom))] pt-3` (`src/components/friends/direct-messages.tsx:759`).

---

## 5. Shape

### 5.1 Radius Tokens & Tailwind Class Overrides

Tailwind v4 classes are deliberately re-mapped in `src/app/globals.css:48-60` to enforce a squarer, compact geometry:

```css
:root {
  --radius-md: 0.5rem;   /* 8px */
  --radius-lg: 0.625rem; /* 10px */
}
.rounded-md { border-radius: var(--radius-md); } /* 8px */
.rounded-lg { border-radius: var(--radius-md); } /* 8px (mapped to --radius-md!) */
.rounded-xl { border-radius: var(--radius-lg); } /* 10px */
.rounded-2xl, .rounded-3xl { border-radius: 0.75rem; } /* 12px */
```

### 5.2 Component Radius Breakdown

| Element Category | Applied Radius Class | Resolved Pixels | File & Line Citation |
| :--- | :--- | :--- | :--- |
| **Buttons (Default)** | `rounded-md` | 8px | `src/app/(auth)/auth/access/page.tsx:92` |
| **Buttons (Nav / Large)**| `rounded-lg` | 8px | `src/components/friends/friends-dashboard.tsx:1420` |
| **Buttons (Pills / Action)**| `rounded-full` | 9999px | `src/components/transient-toast.tsx:47` |
| **Panels & Base Cards** | `.mac-panel`, `.mac-raised` | 10px (`--radius-lg`) | `src/app/globals.css:551,558` |
| **Inputs, Textareas, Selects**| `rounded-md`, `rounded-lg` | 8px | `src/app/globals.css:496`, `src/components/custom-select.tsx:201` |
| **Dropdown Menus** | `rounded-xl` | 10px | `src/components/custom-select.tsx:249` |
| **Desktop Dialog Window**| `rounded-2xl` | 12px (`0.75rem`) | `src/components/app-dialog.tsx:168` |
| **Mobile Dialog Window** | `rounded-2xl` / sheet override| 12px (`0.75rem`) | `src/app/globals.css:70` |
| **Status Pills & Chips** | `rounded-full` | 9999px | `src/components/empty-state-cta.tsx:40` |
| **Avatars (User & Friend)**| `rounded-full` or `rounded-md`| 9999px or 8px | `src/components/friends/direct-messages.tsx:967`, `src/components/app-shell.tsx:764` |
| **Heatmap Cells** | `rounded-[3px]` | 3px | `src/components/study-heatmap.tsx:144` |

### 5.3 Borders & Focus Rings

- **Default Border**: `1px solid var(--color-border)` (`#34342f`) (`src/app/globals.css:550`).
- **Muted Panel Border**: `1px solid color-mix(in srgb, var(--color-border) 75%, transparent)` (`src/app/globals.css:563`).
- **Translucent Overlays**: `border border-[rgb(255_255_255/0.055)]` or `0.08` (`src/components/ui/skeleton.tsx:54`).
- **Focus Rings**:
  - Global Keyboard Focus: `.mac-focus { outline: 2px solid transparent; outline-offset: 2px; } .mac-focus:focus-visible { outline-color: var(--color-mac-yellow); }` (`src/app/globals.css:568-575`).
  - Input Focus State: `border-color: rgb(255 227 48 / 0.7); box-shadow: 0 0 0 3px rgb(255 227 48 / 0.1);` (`src/app/globals.css:509-511`).

---

## 6. Depth & Effects

### 6.1 Shadow Scale

| Shadow Role | Exact CSS Value | Applied Component | Citation |
| :--- | :--- | :--- | :--- |
| **Subtle Inset Highlight** | `inset 0 1px 0 rgb(255 255 255 / 0.025)` | Form controls (`input`, `select`, `textarea`) | `src/app/globals.css:499` |
| **Soft Surface Highlight** | `--shadow-soft: 0 1px 0 rgb(255 255 255 / 0.04)` | `.mac-panel` base surfaces | `src/app/globals.css:26,553` |
| **Active Nav Highlight** | `shadow-[0_10px_28px_rgb(255_227_48/0.08)]` | Desktop sidebar active link tile | `src/components/app-shell.tsx:678` |
| **Mobile Nav Elevation** | `box-shadow: 0 -8px 24px rgb(0 0 0 / 0.18)` | Bottom navigation inner container | `src/app/globals.css:314` |
| **Dropdown Menu Elevation**| `shadow-[0_18px_50px_rgb(0_0_0/0.52)]` | Custom select listbox portal | `src/components/custom-select.tsx:249` |
| **Primary Toast Elevation**| `shadow-[0_16px_42px_rgb(0_0_0/0.38)]` | Transient toast notification | `src/components/transient-toast.tsx:47` |
| **Modal Elevation** | `shadow-[0_32px_90px_rgb(0_0_0/0.65)]` | `AppDialog` default container | `src/components/app-dialog.tsx:168` |
| **Discard Alert Elevation**| `shadow-[0_22px_70px_rgb(0_0_0/0.7)]` | Unsaved changes confirmation box | `src/components/app-dialog.tsx:242` |

### 6.2 Glass, Blur & Transparency

- **Backdrops**:
  - Dialog backdrop: `bg-black/58 backdrop-blur-sm` (`src/components/app-dialog.tsx:157`).
  - Discard prompt backdrop: `bg-black/72 backdrop-blur-[2px]` (`src/components/app-dialog.tsx:234`).
- **Navigation & Headers**:
  - Mobile bottom navigation: `background: rgb(23 23 23 / 0.94); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);` (`src/app/globals.css:294-298`).
  - Desktop left navigation rail: `bg-[rgb(17_17_17/0.94)] backdrop-blur-xl` (`src/components/app-shell.tsx:454`).
  - Sticky header: `bg-[rgb(23_23_23/0.94)] backdrop-blur` (`src/components/app-shell.tsx:501`).
  - Floating direct message / chat headers: `bg-[rgb(23_23_23/0.96)] backdrop-blur-xl` (`src/components/friends/direct-messages.tsx:634`).
- **Noise / Grain**: None found.
- **Borders-as-Depth Pattern**: Heavy reliance on low-contrast stacked borders (`border-[rgb(255_255_255/0.08)]` over `bg-[rgb(255_255_255/0.02)]`) rather than elevated drop-shadows.

---

## 7. Motion

### 7.1 Keyframes & Timing

| Animation Name | Duration & Easing | Transform / Opacity Sequence | Citation |
| :--- | :--- | :--- | :--- |
| `mac-view-enter` | `120ms ease-out` | `opacity: 0` → `1` | `src/app/globals.css:319` |
| `mac-toast-enter` | `180ms cubic-bezier(0.22, 1, 0.36, 1)` | `opacity: 0, translateY(-0.4rem)` → `1, 0` | `src/app/globals.css:198-212` |
| `mac-pwa-launch-logo-in` | `220ms cubic-bezier(0.22, 1, 0.36, 1)` | `transform: scale(0.96)` → `scale(1)` | `src/app/globals.css:186-216` |
| `mac-chat-screen-enter`| `180ms cubic-bezier(0.22, 1, 0.36, 1)` | `opacity: 0.82, translate3d(1rem,0,0)` → `1, 0` | `src/app/globals.css:332` |
| `mac-chat-screen-exit` | `160ms cubic-bezier(0.4, 0, 1, 1)` | `opacity: 1, translate3d(0,0,0)` → `0.82, 1rem` | `src/app/globals.css:347` |
| `mac-study-period-forward`| `180ms cubic-bezier(0.22, 1, 0.36, 1)` | `opacity: 0, translateX(0.55rem)` → `1, 0` | `src/app/globals.css:340-356` |
| `mac-study-period-back`| `180ms cubic-bezier(0.22, 1, 0.36, 1)` | `opacity: 0, translateX(-0.55rem)` → `1, 0` | `src/app/globals.css:374` |
| `mac-pwa-launch-progress`| `860ms cubic-bezier(0.5, 0, 0.2, 1) infinite`| `translateX(-110%) scaleX(0.55)` → `(180%)` | `src/app/globals.css:243-253` |
| `mac-auth-progress` | `1s cubic-bezier(0.4, 0, 0.2, 1) infinite` | `translateX(-110%)` → `translateX(210%)` | `src/app/globals.css:393` |

### 7.2 Micro-Interactions & Hover/Press

- **Press Scale**: Standardised on tactile depression: `active:scale-[0.98]` (`src/components/social/nudge-pill.tsx:25`), `active:scale-[0.99]` (`src/components/groups/groups-dashboard.tsx:1460`), `active:scale-95` (`src/components/friends/friends-dashboard.tsx:1240`).
- **Hover Micro-transforms**: `group-hover:rotate-45` on settings gear (`src/components/app-shell.tsx:775`); `group-hover:-translate-y-0.5` on mascot avatars (`src/components/groups/groups-dashboard.tsx:3114`).
- **Mascot Grayscale Filter Transition**: `transition: filter 300ms ease, opacity 300ms ease;` with `data-active="false"` having `filter: grayscale(1) brightness(0.85); opacity: 0.6;` (`src/app/globals.css:579-588`).

### 7.3 Prefers-Reduced-Motion

Strict accessibility handling across `src/app/globals.css:413` resetting all 6 major animations to `animation: none` and `transition: none`. Component classes explicitly apply `motion-reduce:animate-none`, `motion-reduce:transition-none`, and `motion-reduce:group-hover:rotate-0` (`src/components/app-shell.tsx:775`, `src/components/ui/switch.tsx:29`, `src/components/ui/skeleton.tsx:16`).

---

## 8. Components

### 8.1 Button Variants & Exact Classes

There is no dedicated `Button` component; styling is applied via utility composition:

| Variant | Height & Shape | Exact Class String | Example File & Line |
| :--- | :--- | :--- | :--- |
| **Primary (Yellow)** | `h-11` or `h-12`, `rounded-md` | `mac-focus inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-mac-yellow)] px-4 font-semibold text-[#141414] disabled:opacity-50` | `src/app/(auth)/auth/access/page.tsx:92` |
| **Secondary (Ghost/Border)**| `h-11`, `rounded-md` | `mac-focus inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[rgb(255_255_255/0.04)] hover:text-[var(--color-text)]` | `src/app/(auth)/auth/access/page.tsx:101`, `src/components/profile/profile-dashboard.tsx:293` |
| **Destructive (Solid)**| `h-11` or `h-12`, `rounded-md` | `mac-focus inline-flex h-11 items-center justify-center rounded-md bg-[var(--color-danger)] text-sm font-semibold text-white` | `src/components/timer/timer-dashboard.tsx:845,1083` |
| **Destructive (Bordered)**| `h-11`, `rounded-md` | `mac-focus h-11 rounded-md border border-[rgb(255_107_107/0.55)] bg-[rgb(255_107_107/0.07)] text-sm font-semibold text-[var(--color-danger)]` | `src/components/app-dialog.tsx:256` |
| **Nudge Pill** | `h-10`, `rounded-md` | `mac-focus inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-[var(--color-mac-yellow)] px-3 text-xs font-semibold text-[#141414] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45` | `src/components/social/nudge-pill.tsx:25` |
| **Icon-Only Touch Control**| `h-10 w-10` or `h-11 w-11` | `mac-focus inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]` | `src/components/app-dialog.tsx:193` |

### 8.2 Component Inventory

- **Card**: `.mac-panel` (`border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); box-shadow: var(--shadow-soft);` at `src/app/globals.css:549-554`).
- **Input / Textarea**: `input.rounded-md, textarea.rounded-md` (`border-color: rgb(255 255 255 / 0.1); background: rgb(255 255 255 / 0.035); box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.025);` at `src/app/globals.css:39`).
- **Select (Custom Listbox)**: `CustomSelect` (`src/components/custom-select.tsx:8`). Trigger is `h-11 px-3 rounded-lg border bg-[var(--color-surface)]`; portal dropdown is `fixed z-[120] rounded-xl border border-[var(--color-border)] bg-[rgb(30_30_30/0.99)] p-1.5 shadow-[0_18px_50px_rgb(0_0_0/0.52)] backdrop-blur-xl`.
- **Switch**: `Switch` (`src/components/ui/switch.tsx:5`). Track: `h-7 w-12 rounded-full p-0.5`. Checked track is `bg-[var(--color-mac-yellow)]` with thumb `translate-x-5 bg-[#141414]`. Unchecked track is `bg-[var(--color-surface-raised)]` with thumb `translate-x-0 bg-[var(--color-text-muted)]`.
- **Date/Time Field**: `DateTimeField` (`src/components/date-time-field.tsx:24`). Segmented toggle between date picker and 3-column CustomSelect time (Hour, Minute, Period).
- **Badge / Tag / Chip**:
  - Unread dot: `NavUnreadDot` (`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--color-danger)] ring-2 ring-[var(--color-background)]` at `src/components/app-shell.tsx:592`).
  - Unread count pill: `h-5 min-w-5 rounded-full bg-[var(--color-mac-yellow)] px-1.5 text-[10px] font-bold text-[#141414]` (`src/components/friends/direct-messages.tsx:862`).
  - "You" pill: `rounded bg-[var(--color-mac-yellow)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#141414]` (`src/components/groups/groups-dashboard.tsx:1939`).
- **Navbar / Header**:
  - Header: Sticky top header with blur (`src/components/app-shell.tsx:500-522`).
  - Mobile Bottom Nav: Fixed 6-column grid in floating glass container (`src/app/globals.css:262-300`, `src/components/app-shell.tsx:567-611`).
  - Desktop Left Nav: Fixed sticky rail `17.5rem` (`src/components/app-shell.tsx:449`).
- **Footer**: No global footer. Contextual sticky bottom chat form (`src/components/friends/direct-messages.tsx:759`) and dialog sticky footer (`src/components/app-dialog.tsx:221`).
- **Modal / Dialog / Drawer**:
  - `AppDialog` (`src/components/app-dialog.tsx:24`). Variants: `default` (`rounded-2xl bg-[var(--color-surface)] shadow-[0_32px_90px_rgb(0_0_0/0.65)]`) and `confirmation` (`rounded-lg bg-[var(--color-background)]`). Includes focus trapping, backdrop escape, dirty-state discard confirmation modal.
  - Mobile responsive constraint: Below `40rem`, automatically converts to bottom-padded sheet (`src/app/globals.css:514-526`).
  - `StartStudyDialog` (`src/components/study/start-study-dialog.tsx:13`). Wraps `AppDialog` to select general study or enrolled unit subjects.
- **Toast**: `TransientToast` (`src/components/transient-toast.tsx:6`). Floating top pill `mac-toast-enter rounded-full bg-[var(--color-mac-yellow)] px-4 py-2.5 text-sm font-semibold text-[#141414] shadow-[0_16px_42px_rgb(0_0_0/0.38)]` with `Check` icon and optional action button. Auto-dismiss 2400ms.
- **Table / List**: `PaginatedList` (`src/components/paginated-list.tsx:6`) with 12 items/page and Chevron pagination; `ChunkedList` (`src/components/chunked-list.tsx:8`); `ListSection` (`src/components/ui/list-section.tsx:5`).
- **Tabs**:
  - Segmented pill tabs: `bg-[var(--color-mac-yellow)] text-[#141414]` (active) vs `text-[var(--color-text-muted)]` (inactive) (`src/components/groups/groups-dashboard.tsx:1191-1196`).
  - Underline tabs: `border-b-2 border-[var(--color-mac-yellow)] text-[var(--color-text)]` (active) vs `border-transparent text-[var(--color-text-muted)]` (inactive) (`src/components/statistics/statistics-dashboard.tsx:334-337`).
- **Tooltip**: Help popover: `absolute left-0 top-full z-20 mt-2 w-64 rounded-md border border-[rgb(255_255_255/0.1)] bg-[var(--color-surface)] px-3 py-2.5 text-sm leading-5 shadow-[0_16px_34px_rgb(0_0_0/0.4)]` (`src/components/units/units-dashboard.tsx:1076`). Also native `title="..."` attributes.
- **Loading (Skeleton / Spinner)**: `Skeleton`, `ListRowSkeleton`, `ListSkeleton` (`src/components/ui/skeleton.tsx:4-89`) using `bg-[rgb(255_255_255/0.07)] animate-pulse motion-reduce:animate-none`. Spinner: `<LoaderCircle className="animate-spin text-[var(--color-mac-yellow)]" />` (`src/app/(auth)/auth/logout/page.tsx:34-36`).
- **Empty & Error States**:
  - Empty: `EmptyStateCta` (`src/components/empty-state-cta.tsx:8`) with 80×80px mascot SVG illustration, title, description, badge feature list, and primary CTA.
  - Error: `rounded-md border border-[rgb(255_107_107/0.45)] bg-[rgb(255_107_107/0.08)] p-3 text-sm text-[var(--color-danger)]` (`src/components/auth/login-form.tsx:156`, `src/components/auth/profile-identity-form.tsx:134`).

---

## 9. Iconography & Imagery

### 9.1 Icons

- **Set**: `lucide-react`.
- **Default Sizes**:
  - Subtext/eyebrow: `13px` (`src/components/ui/list-section.tsx:18`).
  - Small / pill: `14px`, `15px` (`src/components/social/nudge-pill.tsx:29`).
…
  - Hero / empty state: `28px`, `30px` (`src/components/friends/direct-messages.tsx:749`).
…

…

…
5. **Restrained, Frameless Depth**: Layered dark translucency (`rgb(255 255 255 / 0.035)`), subtle inset highlights, thin borders (`#34342f`), and fast 120–220ms native CSS transitions with zero third-party animation libraries or elevated heavy drop-shadows.

[Showing lines 1-300 of 424. Use :301 to continue]

---

## 10. Theme Mode

- **Strategy**: **Exclusively Dark Mode**.
- **Default**: Dark.
- **Toggle Mechanism**: **None**. No toggle exists in settings or profile.
- **Root Enforcement**: `color-scheme: dark;` declared on `html` (`src/app/globals.css:79`).
- **PWA Theme Color**: `#171717` in Next.js `Viewport` export (`src/app/layout.tsx:39`) and `manifest.ts:13`.

---

## 11. Voice & Copy

### 11.1 Tone & Conventions

- **Tone**: Focused, encouraging, collegiate, concise, accountability-first.
- **Headings**: Sentence case throughout.
- **Actions / Buttons**: Short, imperative verb phrases in sentence case ("Start session", "Keep editing", "Discard", "Set up your profile", "Send nudge").
- **Emoji Usage**: **Zero**. No emojis appear in UI copy; all visual cues rely strictly on Lucide icons or mascot SVGs.

### 11.2 Verbatim Copy Samples

1. *"Study with your friends. Track your progress."* (`src/app/(auth)/auth/login/page.tsx:60-62`)
2. *"A study timer, group leaderboard, and accountability PWA for students."* (`src/app/layout.tsx:14-15`)
3. *"You are signed in as [student], but this account still needs an invite code before sessions count."* (`src/app/(auth)/auth/access/page.tsx:62-63`)
4. *"Discard unsaved changes?"* with actions *"Keep editing"* and *"Discard"* (`src/components/app-dialog.tsx:245-256`)
5. *"Nudge. Up to 10 per minute."* / *"Nudge again. 2 queued."* (`src/components/social/nudge-pill.tsx:24`)
6. *"Your study timer is still running. Keep it going or stop the session now. Timers stop automatically after 12 hours."* (`src/components/timer/timer-dashboard.tsx:1099-1100`)
7. *"Let people find you when adding friends."* (`src/components/profile/discoverability-setting.tsx:71`)
8. *"Only you two can see this chat."* (`src/components/friends/direct-messages.tsx:753`)
9. *"Start a session to fill your study split."* (`src/components/statistics/statistics-dashboard.tsx:480`)
10. *"It opens full screen like any other app, straight from your Home Screen."* (`src/components/pwa/install-onboarding.tsx:310-311`)

---

## 12. Code Conventions

### 12.1 Utility & Class Patterns

- **`cn()` Utility**: Defined via `clsx` and `twMerge` in `src/lib/utils.ts:4-6`:
  ```ts
  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```
- **CVA (`class-variance-authority`)**: Present in `package.json:12` but **never imported or used anywhere in `src/`**.
- **Tailwind Prettier Plugin**: **Not installed** (`prettier-plugin-tailwindcss` is absent from dependencies; classes are manually ordered).
- **Linter**: ESLint 9 flat config using `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` (`eslint.config.mjs:1-6`).

### 12.2 Naming & Layout Structure

- **CSS Variables**: Prefixed semantically with `--color-*`, `--radius-*`, `--mobile-nav-*`, `--app-viewport-*`.
- **Custom Classes**: Prefixed with `.mac-*` (`.mac-panel`, `.mac-raised`, `.mac-muted-panel`, `.mac-focus`, `.mac-mascot`, `.mac-toast-enter`, `.mac-view-enter`, `.mac-mobile-nav`, `.mac-desktop-shell`, `.mac-app-scroll`).
- **Component File Structure**: Flat feature modules under `src/components/{feature}/{feature}-dashboard.tsx` with dedicated dialogs and sub-components colocated.
- **Accessibility Practices**:
  - Focus indicators use `.mac-focus` (`:focus-visible` yellow outline with 2px offset).
  - Explicit screen-reader announcements using `.sr-only` (`src/components/app-dialog.tsx:198`, `src/components/ui/skeleton.tsx:32`, `src/components/app-shell.tsx:723`).
  - Full keyboard trapping and focus restoration in dialogs (`src/components/app-dialog.tsx:76-83,140-155`).

---

## 13. Existing Design Docs & Code Mismatches

### 13.1 Documentation Summary

Key design documents inspected:
1. `.superdesign/design-system.md`
2. `.superdesign/init/theme.md`
3. `.superdesign/init/components.md`
4. `.superdesign/init/layouts.md`
5. `UI_UX_AUDIT.md` (Dated 23 July 2026)

Key rules quoted verbatim:
- *"Dark, focused, compact, and friendly."* (`.superdesign/design-system.md:7`)
- *"Brand yellow #ffe330 is reserved for active navigation, primary actions, selected states, progress, and small highlights."* (`.superdesign/design-system.md:10`)
- *"Keep edges slightly squared with restrained rounding: controls 8px, large panels 10px, dialogs 12px. Reserve fully rounded shapes for avatars, status dots, and intentional pills."* (`.superdesign/design-system.md:14`)
- *"Prefer one clear surface per section. Reduce nested cards, repeated explanatory copy, and large empty top regions."* (`.superdesign/design-system.md:33`)
- *"Motion: 120–220ms, small fade/translate/scale only, with reduced-motion support."* (`.superdesign/design-system.md:45`)

### 13.2 Discrepancies Between `.superdesign` Docs and Actual Code

| Feature / File | What `.superdesign` Documents State | What the Actual Code Implements | Citations |
| :--- | :--- | :--- | :--- |
| **`globals.css` Source Size** | `.superdesign/init/theme.md:23` states: *"The complete 387-line source is src/app/globals.css"*. | `src/app/globals.css` is **588 lines long** (has expanded PWA standalone handling, slider track gradients, mascot filters, and dialog query rules). | `.superdesign/init/theme.md:23` vs `src/app/globals.css:1-588` |
| **`AppShell` Source Size** | `.superdesign/init/layouts.md:62` states: *"The complete implementation remains in src/components/app-shell.tsx (523 lines)"*. | `src/components/app-shell.tsx` is **788 lines long** (contains mobile warm-routing, unread badge polling, presence management). | `.superdesign/init/layouts.md:62` vs `src/components/app-shell.tsx:1-788` |
| **`StartStudyDialog` Structure**| `.superdesign/init/components.md:5-89` details a raw 93-line modal with manual backdrop, Lucide `X` import, and inline styling. | Real `StartStudyDialog` was refactored to wrap the centralized `<AppDialog>` component; it no longer imports `X` or manages backdrops. | `.superdesign/init/components.md:5-89` vs `src/components/study/start-study-dialog.tsx:1-71` |
| **`NudgePill` Touch Target** | `.superdesign/init/components.md:113` shows height as `h-8` (`32px`). | Actual code uses `h-10` (`40px`) to meet the UI/UX audit minimum touch target rule. | `.superdesign/init/components.md:113` vs `src/components/social/nudge-pill.tsx:25` |
| **Nav Destination Naming** | `UI_UX_AUDIT.md:46` orders: *"Rename the list destination from 'Group' to 'Groups'"*. | Code still defines `label: "Group"`, `title: "Group"` in singular form. | `UI_UX_AUDIT.md:46` vs `src/components/app-shell.tsx:60` |
| **Root Viewport Scaling** | `UI_UX_AUDIT.md:33` instructs removing `userScalable: false` and `maximumScale: 1` to restore zoom accessibility. | `src/app/layout.tsx:35-36` still enforces `maximumScale: 1` and `userScalable: false`. | `UI_UX_AUDIT.md:33` vs `src/app/layout.tsx:35-36` |
| **Viewport Widget Resize** | `.superdesign/init/layouts.md:13-19` omits `interactiveWidget` from the viewport export. | Code specifies `interactiveWidget: "resizes-content"` for mobile virtual keyboard stabilization. | `.superdesign/init/layouts.md:13-19` vs `src/app/layout.tsx:38` |
| **Desktop Radial Ambience** | `.superdesign/design-system.md:13` states: *"The desktop background may use extremely subtle yellow/blue radial ambience."* | Desktop shell uses a flat, solid `#171717` background with no radial ambient gradient. | `.superdesign/design-system.md:13` vs `src/app/globals.css:170-172` |
| **Radius Class Mapping** | Docs suggest standard 8px/10px/12px Tailwind steps. | CSS overrides both `.rounded-md` and `.rounded-lg` to the same 8px (`--radius-md`) value. | `.superdesign/init/theme.md:13` vs `src/app/globals.css:48-52` |

---

## 14. Signature

What makes the `mac-study` aesthetic immediately recognizable at a glance:

1. **Brand Yellow on Near-Black High Contrast**: Dominant `#171717` background punctuated by electric `#ffe330` brand yellow for active bottom-nav tiles, floating toasts, and primary buttons, always paired with deep `#141414` text for crisp legibility.
2. **Restrained Squared Radii**: Controls (8px), cards/panels (10px), and dialogs (12px) avoid bubbly modern curves in favor of compact, slightly squared geometry, reserving full pill radii exclusively for avatars, notification badges, and the nudge button.
3. **PWA Mobile-First Shell Architecture**: Locked full-viewport layout on phones with a fixed blur-backed 6-icon bottom navigation bar, touch-tailored 44px hit targets, and safe-area inset compensation that transitions into a sticky 280px left rail on desktop.
4. **Min & Max Mascot Personality**: Playful, deterministically hashed SVG mascots (Min and Max) that bring warm student community energy to empty states, leaderboard plinths, and study status tiles.
5. **Restrained, Frameless Depth**: Layered dark translucency (`rgb(255 255 255 / 0.035)`), subtle inset highlights, thin borders (`#34342f`), and fast 120–220ms native CSS transitions with zero third-party animation libraries or elevated heavy drop-shadows.
