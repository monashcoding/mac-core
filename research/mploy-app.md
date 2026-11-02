# mploy-app styling audit

Source: https://github.com/monashcoding/mploy-app
Commit: e7b33095b09465cf8771e0a69acd8d4e233d2554
Audited: 2026-11-02
Line numbers refer to that commit; paths are relative to the repo root.

## 1. Stack
- **Framework & Version:** Next.js 16.2.3 (`frontend/package.json:31`), React 19.0.0 (`frontend/package.json:35`), TypeScript 5 (`frontend/package.json:52`).
- **Styling System:** Hybrid Tailwind CSS v3.4.1 (`frontend/package.json:51`, `frontend/tailwind.config.ts:4-30`) + Mantine v7.17.0 (`@mantine/core` `frontend/package.json:16`, `@mantine/hooks` `frontend/package.json:17`). Includes `@tailwindcss/typography` 0.5.16 (`frontend/package.json:21`).
- **Component Libraries:** Mantine Core v7 (`@mantine/core`), `@dnd-kit/core` 6.3.1 (`frontend/package.json:13`), `@dnd-kit/sortable` 10.0.0 (`frontend/package.json:15`). No shadcn/ui or Radix UI (uses Mantine primitives).
- **Icon Library:** `@tabler/icons-react` 3.30.0 (`frontend/package.json:20`).
- **Animation Library:** `motion` 12.38.0 (`motion/react`) (`frontend/package.json:30`, `frontend/src/components/statistics/applications-statistics-client.tsx:9`).
- **Font Loading Method:** `next/font/google` loading `Poppins` (`frontend/src/app/layout.tsx:47-50`).
- **Theme Provider:** Mantine `<MantineProvider theme={theme} defaultColorScheme="dark">` (`frontend/src/app/layout.tsx:63`) + `<ColorSchemeScript defaultColorScheme="dark" />` (`frontend/src/app/layout.tsx:56`).

---

## 2. Color

### Token Definitions (Light + Dark)
CSS custom properties are defined in `frontend/src/app/globals.css:19-47` and configured in Mantine `frontend/src/lib/theme.ts:5-56`:

| Token Name | Defined Value (`frontend/src/app/globals.css`) | Mantine Theme (`frontend/src/lib/theme.ts`) | Usage / Purpose |
| :--- | :--- | :--- | :--- |
| `--selected` | `#3a3a3a` (`frontend/src/app/globals.css:20,42`) | `["#f1f3f5", ..., "#3a3a3a", "#3a3a3a", "#3a3a3a"]` (`frontend/src/lib/theme.ts:30-41`) | Active card backgrounds, borders, segmented picker active |
| `--background` | `#1f1f1f` (`frontend/src/app/globals.css:21,43`) | `["#ffffff", ..., "#1f1f1f", "#1f1f1f", "#1f1f1f"]` (`frontend/src/lib/theme.ts:6-17`) | Foundation canvas dark background |
| `--secondary` | `#2e2e2e` (`frontend/src/app/globals.css:22,44`) | `["#ffffff", ..., "#2e2e2e", "#2e2e2e", "#2e2e2e"]` (`frontend/src/lib/theme.ts:18-29`) | Unselected job card, stat cell, modal dropdown container |
| `--bg-soft` | `#262626` (`frontend/src/app/globals.css:23`) | *none defined* | Stats panel background, kanban column background |
| `--border` | `#3a3a3a` (`frontend/src/app/globals.css:24`) | *mapped via dark palette* | Card, modal & stats grid borders |
| `--border-2` | `#4a4a4a` (`frontend/src/app/globals.css:25`) | *none defined* | Notes editor border |
| `--accent` | `#ffe22f` (`frontend/src/app/globals.css:26,45`) | `colorsTuple("#ffe22f")` (`frontend/src/lib/theme.ts:54`) | High-voltage MAC yellow; primary CTA & active role dot |
| `--muted-1` | `rgba(255, 255, 255, 0.65)` (`frontend/src/app/globals.css:28`) | *none defined* | Primary readable body text, neutral role solid |
| `--muted-2` | `rgba(255, 255, 255, 0.5)` (`frontend/src/app/globals.css:29`) | *none defined* | Subtitles, metadata labels, search icons |
| `--muted-3` | `rgba(255, 255, 255, 0.35)` (`frontend/src/app/globals.css:30`) | *none defined* | Micro labels, column drag handles, inactive indicators |
| `--role-neutral` | `rgba(255, 255, 255, 0.65)` (`frontend/src/app/globals.css:32`) | *none defined* | Neutral pipeline stage text |
| `--role-neutral-muted`| `rgba(255, 255, 255, 0.06)` (`frontend/src/app/globals.css:33`) | *none defined* | Neutral stage background pill |
| `--role-active` | `#ffe22f` (`frontend/src/app/globals.css:34`) | *none defined* | In-progress / interview stages |
| `--role-active-muted` | `rgba(255, 226, 47, 0.14)` (`frontend/src/app/globals.css:35`) | *none defined* | Active stage badge fill |
| `--role-win` | `#9ddfb0` (`frontend/src/app/globals.css:36`) | *none defined* | Accepted / offer status fill & dot |
| `--role-win-muted` | `rgba(157, 223, 176, 0.14)` (`frontend/src/app/globals.css:37`) | *none defined* | Win stage badge fill |
| `--role-loss` | `rgba(255, 115, 81, 0.9)` (`frontend/src/app/globals.css:38`) | *none defined* | Rejected status stroke & dot |
| `--role-loss-muted`| `rgba(255, 115, 81, 0.1)` (`frontend/src/app/globals.css:39`) | *none defined* | Rejection badge fill |
| Mantine `dark` | 10-shade array (`#c9c9c9` to `#141414`) | `frontend/src/lib/theme.ts:42-53` | Mantine default internal dark palette |

### Semantic Gradients
- Rejection progress fill: `linear-gradient(90deg, rgba(255, 115, 81, 0.42), #ff7351)` (`frontend/src/app/globals.css:802`).
- Outcome mix conic donut: `conic-gradient(#ffe22f 0 ${activePct}%, #9ddfb0 ${activePct}% ${acceptedStop}%, #ff7351 ${acceptedStop}% 100%)` (`frontend/src/components/statistics/applications-statistics-client.tsx:729`).
- Auth panel card: `linear-gradient(135deg, rgba(46, 46, 46, 0.96), rgba(31, 31, 31, 0.98))` with dot grid overlay (`frontend/src/app/globals.css:89`).
- Stats drawer header gradient: `linear-gradient(180deg, rgba(255, 255, 255, 0.055), transparent 220px), #202020` (`frontend/src/app/globals.css:889-890`).

### Recurring Hardcoded Hex / RGB Hotspots
1. `#3a3a3a` (38+ occurrences in components, e.g. `frontend/src/components/applications/applications-kanban.tsx:734,798,812`, `frontend/src/components/applications/my-applications-client.tsx:653,658,673,803`): borders & popover input backgrounds.
2. `#2e2e2e` (15+ occurrences in components, e.g. `frontend/src/components/applications/applications-kanban.tsx:733,797`, `frontend/src/components/applications/notes-modal.tsx:57,61`): dropdown and modal content surfaces.
3. `#ffe22f` / `MAC_YELLOW` (18+ occurrences in components, e.g. `frontend/src/components/applications/my-applications-client.tsx:70,869,950`, `frontend/src/components/applications/notes-modal.tsx:88`): buttons, highlighted text, and active indicators.
4. `#1f1f1f` (12+ occurrences in components, e.g. `frontend/src/components/applications/applications-kanban.tsx:846`, `frontend/src/components/applications/notes-modal.tsx:89`): on-accent dark button label text.
5. `#1a1a1a` (5 occurrences, e.g. `frontend/src/app/globals.css:442,1389`, `frontend/src/components/statistics/applications-statistics-client.tsx:1133,1276`): Sankey canvas fill & notes popover.
6. `#e03131` (1 occurrence, `frontend/src/components/applications/applications-kanban.tsx:751`): destructive clear button fill.

---

## 3. Typography

- **Families:**
  - `Poppins` via `next/font/google` (`frontend/src/app/layout.tsx:47-50`), weights `400`, `500`, `600`, `700`.
  - Mantine `fontFamily: "Poppins"` (`frontend/src/lib/theme.ts:4`).
- **Roles:**
  - Display / Hero: Poppins Extrabold / Bold (`frontend/src/app/page.tsx:51-53`, `frontend/src/app/globals.css:124-126`).
  - Headings / Section titles: Poppins Bold (`frontend/src/app/privacy/page.tsx:37,50`, `frontend/src/components/layout/heading-text.tsx:3`).
  - Body: Poppins Regular (`400`) & Medium (`500`).
  - Monospace / Tabular numbers: `font-variant-numeric: tabular-nums` (`frontend/src/app/globals.css:743,1691`).
- **Observed Type Scale:**
  - Hero `h1`: `text-3xl md:text-5xl font-bold` (`frontend/src/app/page.tsx:51`), or clamp: `clamp(30px, 4.5vw, 50px)` (`frontend/src/app/globals.css:124`).
  - Section `h1`: `clamp(28px, 4vw, 36px) font-extrabold` (`frontend/src/components/applications/my-applications-client.tsx:755`).
  - Modal / Card `h1` / `h2`: `text-2xl font-semibold` (`frontend/src/app/sign-in/page.tsx:35`), `text-xl lg:text-2xl font-bold` (`frontend/src/components/jobs/job-header.tsx:24`).
  - Section headings: `text-lg` (`frontend/src/components/ui/section-heading.tsx:11`, `frontend/src/components/layout/nav-links.tsx:13`).
  - Card titles: `text-sm lg:text-md font-bold` (`frontend/src/components/jobs/job-card.tsx:42`).
  - Body copy: `text-xs` (`frontend/src/components/jobs/job-card.tsx:45,58`, `frontend/src/components/jobs/job-description.tsx:24`), `text-sm` (`frontend/src/app/privacy/page.tsx:40`).
  - Metadata / Micro copy: `text-xs` (`frontend/src/components/jobs/job-card.tsx:50`), `10px` (`frontend/src/app/globals.css:1458,1570`).
- **Tracking & Leading:**
  - Letter spacing: `-0.02em` on major titles (`frontend/src/components/applications/my-applications-client.tsx:756`); `1px` or `1.5px` uppercase tracking on micro labels (`frontend/src/app/globals.css:1422,1460`).
  - Line height: `leading-tight` on job card headers (`frontend/src/components/jobs/job-card.tsx:42,45`), `leading-relaxed` on job description prose (`frontend/src/components/jobs/job-description.tsx:24`).
- **Casing Conventions:**
  - Uppercase kicker / eyebrows: `.auth-required-kicker` (`frontend/src/app/globals.css:108`), `.apps-stat-label` (`frontend/src/app/globals.css:1642`), `.apps-notes-pop-label` (`frontend/src/app/globals.css:1419-1422`).
  - Button text: Title Case / Sentence Case mix (`"Apply Now"`, `"Browse jobs"`, `"Submit Feedback"`).
  - Status badges: Title case generated via `formatCapString()` (`frontend/src/lib/utils.ts:106-121`).

---

## 4. Layout & Spacing

- **Container Max-Widths:**
  - Main app shell: `max-w-7xl mx-auto` (`frontend/src/app/jobs/layout.tsx:4`, `frontend/src/components/layout/nav-bar.tsx:9`).
  - Hero / Privacy text: `max-w-4xl` (`frontend/src/app/page.tsx:51`), `max-w-3xl` (`frontend/src/app/privacy/page.tsx:40`).
- **Page & Section Padding:**
  - Root viewport padding: `px-6` (`frontend/src/app/layout.tsx:65`).
  - Navbar vertical spacing: `pt-4 pb-2 lg:pt-6 lg:pb-4` (`frontend/src/components/layout/nav-bar.tsx:8`).
  - Card inner padding: `p-4` (`frontend/src/components/jobs/job-card.tsx:25`), `padding: clamp(24px, 5vw, 52px)` (`frontend/src/app/globals.css:94`).
- **Gaps & Grids:**
  - Card stack gap: `gap-2` (`frontend/src/components/jobs/job-card.tsx:28`), `gap-4` (`frontend/src/components/jobs/job-details.tsx:174`).
  - Kanban grid: 5-column stage flow with `gap: 12px` (`frontend/src/app/globals.css:1708-1710`).
  - Stats KPI grid: 5-column grid with 1px border separator `gap: 1px; background: var(--border)` (`frontend/src/app/globals.css:266-271,1624-1627`).
- **Breakpoints:** Tailwind defaults: `md` (768px), `lg` (1024px) (e.g. `hidden lg:flex` in `frontend/src/components/layout/nav-bar.tsx:14`, `lg:text-2xl` in `frontend/src/components/jobs/job-header.tsx:24`).
- **Navbar & Fixed Elements:**
  - Fixed navbar/header height: `min-h-14` (`frontend/src/components/layout/nav-bar.tsx:9`).
  - Fixed feedback trigger: `fixed bottom-4 right-6 z-50` (`frontend/src/components/ui/feedback-button.tsx:94`).
  - Fixed privacy link: `fixed bottom-5 left-6 z-40` (`frontend/src/app/layout.tsx:72`).
  - Toast notification top offset: `.mploy-notifications[data-position="top-right"] { top: 72px; }` (`frontend/src/app/globals.css:70-72`).

---

## 5. Shape

- **Border Radii:**
  - Cards & Panels: `rounded-xl` (`0.75rem`) (`frontend/src/components/jobs/job-card.tsx:25`, `frontend/src/components/jobs/job-details.tsx:158`), `border-radius: 8px` (`frontend/src/app/globals.css:81,270,328`).
  - Buttons: `border-radius: 8px` (`frontend/src/app/globals.css:145`), `border-radius: 0.5rem` (`frontend/src/components/applications/applications-kanban.tsx:753,847`), `rounded-lg` (`frontend/src/app/jobs/[id]/not-found.tsx:14`).
  - Inputs & Dropdowns: `border-radius: 0.65rem` (`frontend/src/components/applications/my-applications-client.tsx:654,674,804`), `border-radius: 0.4rem` (`frontend/src/components/applications/applications-kanban.tsx:814,828`).
  - Badges / Pills: `radius="md"` / `radius="lg"` (`frontend/src/components/ui/badge.tsx:24`), `border-radius: 999px` (`frontend/src/app/globals.css:425,785,1827`).
  - Modals: `radius="lg"` (`frontend/src/components/ui/feedback-button.tsx:109`), `borderRadius: "1rem"` (`frontend/src/components/applications/notes-modal.tsx:59`).
- **Border Widths & Colors:**
  - Standard border width: `2px solid #3a3a3a` or `bd="2px solid selected"` (`frontend/src/components/jobs/job-card.tsx:24`, `frontend/src/components/jobs/job-details.tsx:158`, `frontend/src/components/applications/my-applications-client.tsx:653,688,803`).
  - Hairline border width: `1px solid rgba(255, 255, 255, 0.1)` (`frontend/src/app/globals.css:80,181`), `1px solid var(--border)` (`frontend/src/app/globals.css:327`).
  - Accent / Focus borders: `border: 1px solid rgba(255, 226, 47, 0.32)` (`frontend/src/app/globals.css:113`), `outline: 2px dashed var(--accent)` (`frontend/src/app/globals.css:1767`).

---

## 6. Depth & Effects

- **Shadows:**
  - Modals / Flyouts: `box-shadow: 0 24px 72px rgba(0, 0, 0, 0.58)` (`frontend/src/app/globals.css:1442`).
  - Popovers: `box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5)` (`frontend/src/app/globals.css:1394`), `box-shadow: 0 22px 54px rgba(0, 0, 0, 0.52)` (`frontend/src/app/globals.css:1520`).
  - Side drawers: `box-shadow: -24px 0 52px rgba(0, 0, 0, 0.28)` (`frontend/src/app/globals.css:891`).
  - Floating glow on accent element: `box-shadow: 0 8px 18px rgba(255, 226, 47, 0.22)` (`frontend/src/app/globals.css:1836`).
- **Blur & Glass:**
  - Backdrop blur on features: `backdrop-filter: blur(14px)` (`frontend/src/app/globals.css:189`).
  - Backdrop blur on modal overlays: `backdrop-filter: blur(5px)` (`frontend/src/app/globals.css:880`), `backdropFilter: blur(2px)` (`frontend/src/components/applications/notes-modal.tsx:62`).
- **Glows & Text Shadows:**
  - Accent text glow: `text-shadow: 0 0 18px rgba(255, 226, 47, 0.18)` (`frontend/src/app/globals.css:814`).
  - Accent focus halo: `box-shadow: 0 0 0 2px rgba(255, 226, 47, 0.08)` (`frontend/src/app/globals.css:1511`).
- **Background Patterns:**
  - Dot matrix pattern: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 1px, transparent 0) 0 0 / 24px 24px` (`frontend/src/app/globals.css:83-88`).
  - SVG export dot pattern: `<pattern id="stats-export-dot-pattern" width="25" height="25">` with `fill="#ffffff"` opacity `0.08` (`frontend/src/components/statistics/applications-statistics-client.tsx:1136-1155`).

---

## 7. Motion

- **Transitions:**
  - Durations: `0.12s ease` (`frontend/src/app/globals.css:155-156,1199`), `0.14s ease` (`frontend/src/app/globals.css:534`), `0.3s ease` (`frontend/src/components/jobs/job-details.tsx:189,200`).
  - Standard hover transforms: `transform: translateY(-1px); filter: brightness(1.04);` (`frontend/src/app/globals.css:170-171,954,1597`).
- **Keyframe Animations:**
  - `apps-column-accepted` (2000ms cubic-bezier(0.2, 0.9, 0.25, 1)) (`frontend/src/app/globals.css:1728`).
  - `apps-column-blackout` (`frontend/src/app/globals.css:1743`).
  - `apps-column-congrats` (`frontend/src/app/globals.css:1837`).
  - `apps-column-confetti` (1180ms cubic-bezier(0.2, 0.9, 0.25, 1)) (`frontend/src/app/globals.css:1857`).
- **Animation Libraries:**
  - `motion/react`: `AnimatePresence`, `motion.div` on Sankey nodes, drawer entrance, and KPI cards (`frontend/src/components/statistics/applications-statistics-client.tsx:9,684,898,1304`).
- **Prefers-Reduced-Motion Handling:**
  - Checked via `useReducedMotion()` from `motion/react` (`frontend/src/components/statistics/applications-statistics-client.tsx:9,1012`). Disables entrance animation when enabled:
    `initial={shouldReduceMotion ? false : pageMotion.initial}` (`frontend/src/components/statistics/applications-statistics-client.tsx:1301`).

---

## 8. Components

- **Button (`@mantine/core` Button & custom classes):**
  - Primary Accent Button: `bg="accent" c="black"` (`frontend/src/components/jobs/job-details.tsx:177-178`), `.auth-required-primary` (`background: var(--accent); color: #1f1f1f; min-height: 40px; border-radius: 8px; font-weight: 900;` `frontend/src/app/globals.css:144-145,152,159-161`).
  - Secondary / Outline Button: `.auth-required-secondary` (`border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.78);` `frontend/src/app/globals.css:163-166`).
  - Subtle / Action Button: `color="selected"` (`frontend/src/components/jobs/job-details.tsx:195`), `compactBtn` (`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[0.65rem] text-xs font-medium cursor-pointer border: 2px solid #3a3a3a` `frontend/src/components/applications/my-applications-client.tsx:694-697`).
  - Destructive Button: `backgroundColor: "#e03131", color: "white", borderRadius: "0.5rem"` (`frontend/src/components/applications/applications-kanban.tsx:751-753`).
- **Card:**
  - `Box` with `bg={isSelected ? "selected" : "secondary"} bd="2px solid selected" className="p-4 rounded-xl"` (`frontend/src/components/jobs/job-card.tsx:22-25`).
  - `Card` with `bd="2px solid selected" className="h-full rounded-xl flex flex-col"` (`frontend/src/components/jobs/job-details.tsx:158`).
- **Input / Select:**
  - Mantine `TextInput` & `Select` styled with custom styles object: `input: { backgroundColor: "#3a3a3a", border: "none", borderRadius: "0.4rem", color: "white" }` (`frontend/src/components/applications/applications-kanban.tsx:811-815`); notes Textarea uses `borderRadius: "0.5rem"` (`frontend/src/components/applications/notes-modal.tsx:74-78`).
  - Search bar: `padding: "20px", paddingLeft: "42px"` (`frontend/src/components/search/search-bar.tsx:49-50`).
  - Cycle selector: `backgroundColor: "transparent", border: "2px solid #3a3a3a", borderRadius: "0.65rem"` (`frontend/src/components/applications/my-applications-client.tsx:672-674,802-804`).
- **Badge / Tag / Chip:**
  - `Badge` component (`frontend/src/components/ui/badge.tsx:15-27`): wraps `MantineBadge` with `fw={300} tt="none" color={color} size={size} radius={size === "lg" ? "lg" : "md"} autoContrast`. Default color: `"dark.4"`.
  - Sponsored badge: `color="accent"` (`frontend/src/components/jobs/job-card.tsx:65`).
  - Micro stage count pills: `.apps-count-pill` (`border-radius: 9999px; font-size: 11.5px; padding: 0 8px;` `frontend/src/app/globals.css:1172-1184`).
- **Navbar / Header:**
  - `NavBar` (`frontend/src/components/layout/nav-bar.tsx`): max-w-7xl, desktop vs mobile toggle, sticky/static layout.
  - Mobile Menu: `NavBarMobile` (`frontend/src/components/layout/nav-bar-mobile.tsx`) with Mantine `Menu` / hamburger.
- **Footer:**
  - Root Layout Footer: `fixed bottom-5 left-6 z-40 text-xs font-semibold text-white/45` (`frontend/src/app/layout.tsx:72`).
- **Modal / Dialog / Drawer:**
  - Mantine `Modal` (`frontend/src/components/ui/feedback-button.tsx:104-114`, `frontend/src/components/jobs/job-details.tsx:132-137`, `frontend/src/components/applications/notes-modal.tsx:54-63`): `borderRadius: "1rem"`, `backgroundColor: "#2e2e2e"`, `border: "2px solid #3a3a3a"`.
  - Custom slide-over drawer: `.stats-drilldown-drawer` with backdrop `.stats-drilldown-backdrop` (`frontend/src/app/globals.css:868-901`).
- **Toast:**
  - `@mantine/notifications`: `<Notifications className="mploy-notifications" />` (`frontend/src/app/layout.tsx:66`), anchored 72px from top (`frontend/src/app/globals.css:70-72`).
- **Table / List:**
  - KPI Stat Grid: `.stats-grid` (`display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 1px; background: var(--border);` `frontend/src/app/globals.css:264-271`).
  - Kanban Board: `frontend/src/components/applications/applications-kanban.tsx` / `.apps-kanban-grid` (`frontend/src/app/globals.css:1708-1711`).
- **Tabs / Segmented Control:**
  - Mantine `SegmentedControl` styled with `backgroundColor: "transparent", border: "2px solid #3a3a3a", indicator: { backgroundColor: "#3a3a3a" }` (`frontend/src/components/applications/my-applications-client.tsx:652-660,1001`).
- **Tooltip / Hover Card:**
  - Custom notes tooltip: `.apps-notes-pop` (`frontend/src/app/globals.css:1384-1418`).
- **Loading States:**
  - `JobDetailsLoading` (`frontend/src/components/layout/job-details-loading.tsx`).
  - `JobListLoading` (`frontend/src/components/layout/job-list-loading.tsx`).
  - `LoadingDots` (`frontend/src/components/ui/loading_dots.tsx`).
- **Empty & Error States:**
  - Empty search / filters: `NoResults` (`frontend/src/components/ui/no-results.tsx`).
  - 404 Mascot: `Image src="/min-404.svg"` (`frontend/src/app/jobs/[id]/not-found.tsx:7`).
  - Route error fallbacks: `Error` (`frontend/src/app/error.tsx:6`, `frontend/src/app/jobs/error.tsx:7`).

---

## 9. Iconography & Imagery

- **Icon Set:** Tabler Icons (`@tabler/icons-react` 3.30.0).
- **Default Sizing & Stroke:** Sized 14px–20px (e.g. `size={14}` in `frontend/src/components/applications/my-applications-client.tsx:781`, `size={16}` in `frontend/src/components/jobs/job-details.tsx:179,191`, `size={20}` in `frontend/src/components/ui/feedback-button.tsx:101`). Stroke width `1.5` (`frontend/src/components/jobs/job-description.tsx:17`, `frontend/src/components/jobs/job-summary.tsx:13`).
- **Logo Files & Usage:**
  - `frontend/public/mac.svg` referenced in `frontend/src/components/layout/logo.tsx:8` (width 40, height 40).
  - `frontend/public/OgImage.png` referenced in metadata (`frontend/src/app/layout.tsx:40`).
  - `frontend/public/min-404.svg` referenced in `frontend/src/app/jobs/[id]/not-found.tsx:7`.
- **Company Logos:** Rendered via `CompanyLogo` (`frontend/src/components/jobs/company-logo.tsx`), fallbacks to first letter of company name in a rounded box.
- **Decorative Backgrounds:** Radial dot grids (`frontend/src/app/globals.css:83-88`) and SVG Sankey exports with dot matrices (`frontend/src/components/statistics/applications-statistics-client.tsx:1136-1155`).

---

## 10. Theme Mode

- **Default:** Dark mode default (`<html lang="en" data-mantine-color-scheme="dark">` `frontend/src/app/layout.tsx:54`, `<ColorSchemeScript defaultColorScheme="dark" />` `frontend/src/app/layout.tsx:56`, `MantineProvider defaultColorScheme="dark"` `frontend/src/app/layout.tsx:63`).
- **Strategy:** Tailwind `darkMode: "class"` (`frontend/tailwind.config.ts:5`).
- **Toggle Mechanism:** None provided to users. The application is hardcoded and locked to Dark theme. All CSS variables in `:root` and `.dark` have identical values (`frontend/src/app/globals.css:19-47`).

---

## 11. Voice & Copy

- **UI Copy Tone:** High-energy, supportive, professional, engineer-focused, and direct.
- **Capitalization Convention:**
  - Headings: Sentence case with selective highlights (`"Find Internships and Student Jobs"`, `"Track your applications"`, `"Sign in to manage your application tracker"`).
  - Buttons: Title Case (`"Apply Now"`, `"Browse jobs"`, `"Submit Feedback"`, `"Copy Link"`).
  - Badges & Tags: Title case via formatter (`"Visa Sponsored"`, `"Internship"`).
- **Emoji Use:** None found in UI code; clean SVGs and typography only.
- **Sample Verbatim Strings:**
  1. `"Stay ahead with the job board that never sleeps."` (`frontend/src/app/layout.tsx:37`, `frontend/src/app/page.tsx:52-54`)
  2. `"Find Internships and Student Jobs"` (`frontend/src/components/layout/heading-text.tsx:4-5`)
  3. `"Clicking Apply adds this job to your applications."` (`frontend/src/components/jobs/job-details.tsx:206`)
  4. `"Jobs you click Apply on are auto-added"` (`frontend/src/components/applications/my-applications-client.tsx:783-785`)
  5. `"Sign in to unlock your application statistics"` (`frontend/src/components/auth/auth-required-panel.tsx:35`)
  6. `"This job post is no longer taking applications or it does not exist."` (`frontend/src/app/jobs/[id]/not-found.tsx:10`)
  7. `"Tell us about any bugs, features, missing listings or anything you want to say!"` (`frontend/src/components/ui/feedback-button.tsx:128`)

---

## 12. Code Conventions

- **Class Handling:** Native string concatenation and template literals (e.g. `` `p-4 rounded-xl transition-colors flex flex-col justify-between` `` in `frontend/src/components/jobs/job-card.tsx:25`). `clsx`, `cva`, or `cn()` helper utilities are **not used** (none found in repo).
- **Tailwind Plugin Configuration:** `typography` (`@tailwindcss/typography`) loaded in `frontend/tailwind.config.ts:11`. No `prettier-plugin-tailwindcss` installed.
- **Prettier & ESLint:**
  - Prettier: `.prettierrc` specifies only `{"endOfLine": "auto"}` (`frontend/.prettierrc:1-3`).
  - ESLint: Flat config `frontend/eslint.config.mjs` using `eslint-config-next/core-web-vitals` & `typescript` (`frontend/eslint.config.mjs:1-6`).
- **CSS Variable Naming:** Semantic prefixes (`--role-*`, `--muted-*`, `--border-*`) along with standard tokens (`--background`, `--secondary`, `--selected`, `--accent`) (`frontend/src/app/globals.css:19-40`).
- **Accessibility Patterns:**
  - `focus-visible:text-accent focus-visible:outline-none` (`frontend/src/app/layout.tsx:74`).
  - Explicit `aria-label`, `aria-expanded`, `aria-hidden` heavily applied on custom interactive buttons and icon controls (`frontend/src/components/applications/applications-kanban.tsx:614,634,724,1287`, `frontend/src/components/applications/application-date-picker.tsx:105,120`).
  - Modals and drawers use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` (`frontend/src/components/statistics/applications-statistics-client.tsx:917-919`).

---

## 13. Existing Design Docs vs. Actual Code

`DESIGN.md` in the root outlines an editorial job board concept, but **the actual frontend implementation diverges significantly**:

| Design Aspect | `DESIGN.md` Specification | Actual Code Implementation | Citation & Evidence |
| :--- | :--- | :--- | :--- |
| **Fonts** | Manrope for Headlines (`DESIGN.md:44`), Inter for Body (`DESIGN.md:45`) | Neither used; uses **Poppins** exclusively across all UI | `frontend/src/app/layout.tsx:47-50`, `frontend/src/lib/theme.ts:4` |
| **Primary Yellow** | `#ffdd73` (`DESIGN.md:18`) | `#ffe22f` / `MAC_YELLOW` | `frontend/src/app/globals.css:26`, `frontend/src/lib/theme.ts:54`, `frontend/src/components/applications/my-applications-client.tsx:70` |
| **Primary Text** | `on-primary: #624e00` (`DESIGN.md:19`) | `#1f1f1f` / `#000000` on yellow | `frontend/src/app/globals.css:161,491`, `frontend/src/components/jobs/job-details.tsx:178`, `frontend/src/app/jobs/[id]/not-found.tsx:14` |
| **Background Color** | `#0e0e0e` (`DESIGN.md:20`) | `#1f1f1f` | `frontend/src/app/globals.css:21`, `frontend/src/lib/theme.ts:14-16` |
| **Surface Hierarchy**| `#131313`, `#1a1a1a`, `#20201f` (`DESIGN.md:21-24`) | `#2e2e2e` (`--secondary`), `#3a3a3a` (`--selected`), `#262626` (`--bg-soft`) | `frontend/src/app/globals.css:20-23`, `frontend/src/lib/theme.ts:26-28,38-40` |
| **Borders Rule** | "The 'No-Line' Rule: Standard 1px borders are strictly prohibited for sectioning" (`DESIGN.md:30-32`) | **Heavy 2px borders** everywhere (`bd="2px solid selected"`, `border: 2px solid #3a3a3a`) | `frontend/src/components/jobs/job-card.tsx:24`, `frontend/src/components/jobs/job-details.tsx:158`, `frontend/src/components/applications/my-applications-client.tsx:653,803` |
| **Divider Lines** | "Forbid the use of divider lines... Don't use dividers between list items" (`DESIGN.md:78,105`) | Divider borders used in lists & panel heads (`border-bottom: 1px solid var(--border)`) | `frontend/src/app/globals.css:349,901,1780` |
| **Button Radius** | `md (0.75rem)` (`DESIGN.md:67`) | Inconsistent: `8px`, `0.5rem`, `0.65rem`, `0.75rem` | `frontend/src/app/globals.css:145`, `frontend/src/components/applications/applications-kanban.tsx:753,847`, `frontend/src/components/applications/notes-modal.tsx:90`, `frontend/src/components/applications/my-applications-client.tsx:694` |

---

## 14. Signature (5 Bullets)

1. **Obsidian Canvas with High-Voltage Acid Yellow:** Dark charcoal background (`#1f1f1f`) accented with punchy MAC yellow (`#ffe22f`), contrasting sharply against muted text layers.
2. **Distinctive "Underline-Fancy" Flourish:** Key title words highlighted with a thick yellow bottom line (`underline-fancy`: `text-decoration-color: var(--mantine-color-accent-0); text-underline-offset: 4px; text-decoration-thickness: 2px;` `frontend/src/app/globals.css:49-55`).
3. **Structured 2px Solid Borders:** Rejection of invisible borders in favor of bold, tactile container outlines (`bd="2px solid #3a3a3a"` and `rounded-xl`).
4. **Interactive Dot-Matrix Sheen:** Technical radial dot grids (`24px x 24px` pattern at 8% opacity) on auth gate panels and SVG data visualizations (`frontend/src/app/globals.css:83-88`, `frontend/src/components/statistics/applications-statistics-client.tsx:1136-1155`).
5. **Color-Coded Application Lifecycle Badges:** Strict 4-role pipeline palette: Yellow for active/interview, Mint green (`#9ddfb0`) for win/offer, Coral (`#ff7351`) for rejection, and Muted white for neutral.
