# monashcoding-site styling audit

Source: https://github.com/monashcoding/monashcoding-site
Commit: b2064ea76af01bdd6a1cdefdd7afbcc33ab96a19
Audited: 2026-11-02
Line numbers refer to that commit; paths are relative to the repo root.

---

## 1. Stack

| Dimension | Value / Technology | Citation |
| :--- | :--- | :--- |
| **Framework** | Next.js `^16.0.6` (App Router, SSG output: standalone), React `^19.2.0`, React DOM `^19.2.0` | `package.json:47,51,52`, `docs/deploy.md:23-24,31` |
| **Styling System** | Tailwind CSS v4 (`tailwindcss: ^4.1.18`, `@tailwindcss/postcss: ^4.1.17`, `postcss: ^8.5.6`) with PostCSS plugin | `package.json:66,77,78`, `postcss.config.mjs:1-8` |
| **Animation Plugins** | `tailwindcss-animate: ^1.0.7`, `tw-animate-css: ^1.4.0` | `package.json:57,59`, `app/globals.css:2,4` |
| **shadcn/ui Configuration** | Style `new-york`, baseColor `neutral`, cssVariables `true`, RSC `true`, iconLibrary `lucide` | `components.json:1-13` |
| **Component Libs** | Custom React components; React Bits creative registry (`https://reactbits.dev/r/{name}.json`) | `components.json:21-23` |
| **3D & Graphics Libs** | `@react-three/fiber: ^9.5.0`, `@react-three/drei: ^10.7.7`, `three: ^0.167.1`, `ogl: ^1.0.11`, `postprocessing: ^6.38.2` | `package.json:33-35,49,50,58` |
| **CMS & Data** | `next-sanity: ^12.0.12`, `sanity: ^5.4.0`, `@portabletext/react: ^6.0.2`, `@sanity/image-url: ^2.0.3` | `package.json:30,36,48,54` |
| **Email Tools** | `@react-email/components: ^1.0.6`, `@react-email/render: ^2.0.4`, `resend: ^6.7.0` | `package.json:31,32,53` |
| **Icon Library** | `lucide-react: ^0.562.0` plus custom vector SVGs | `package.json:45` |
| **Animation Libraries** | `framer-motion: ^12.26.2`, `motion: ^12.26.2`, `gsap: ^3.14.2` | `package.json:40,41,46` |
| **Font Loading** | `next/font/google` (`Poppins` Latin weights 400–900, variable `--font-poppins`) | `app/layout.tsx:5-9` |
| **Theme Provider** | none found (site is permanently dark; locked via `darkreader-lock`) | `app/layout.tsx:13`, `app/globals.css:9-45` |

*(Note: `styled-components: ^6.3.8` in `package.json:55` is a peer dependency for Sanity Studio internals under `app/studio`; it is not used in site components).*

---

## 2. Color

### Dark Theme Tokens (`app/globals.css:9-45`)
*Light mode tokens: none found (system is strictly dark-only; `.impeccable.md:17`).*

| Token Name | Defined Value | Role / Usage | Active Component Usage |
| :--- | :--- | :--- | :--- |
| `--color-background` | `#252525` | Canvas background | Base html/body, cards, sections (`app/globals.css:10,60`) |
| `--color-foreground` | `#FFFFFF` | Primary text | Global body text, headings (`app/globals.css:11,61`) |
| `--color-card` | `#252525` | Surface container | Cards, committee popup (`app/globals.css:12`) |
| `--color-card-foreground`| `#FFFFFF` | Surface text | Popup text (`app/globals.css:13`) |
| `--color-popover` | `#252525` | Flyout container | Popover backgrounds (`app/globals.css:14`) |
| `--color-popover-foreground`| `#FFFFFF` | Flyout text | Popover text (`app/globals.css:15`) |
| `--color-primary` | `#FFFFFF` | Inverse text / highlight | Button texts (`app/globals.css:16`) |
| `--color-primary-foreground`| `#252525` | Inverse background | Primary chip text (`app/globals.css:17`) |
| `--color-secondary` | `#FFE330` | Alternate accent | Brand yellow secondary (`app/globals.css:18`) |
| `--color-secondary-foreground`| `#252525` | High-contrast ink | Text on brand yellow (`app/globals.css:19`) |
| `--color-muted` | `#252525` | Muted backgrounds | Inactive surfaces (`app/globals.css:20`) |
| `--color-muted-foreground` | `#a0a0a0` | Subdued text | Page counters, secondary copy (`app/globals.css:21`) |
| `--color-accent` | `#FFE330` | MAC Brand Yellow | CTAs, active tabs, highlights, rings (`app/globals.css:22`) |
| `--color-accent-foreground`| `#252525` | Text on Accent | Text on buttons, badges (`app/globals.css:23`) |
| `--color-destructive` | `#dc2626` | Destructive action | Error states (`app/globals.css:24`) |
| `--color-border` | `#404040` | Default border | Structural hairlines (`app/globals.css:25,55`) |
| `--color-input` | `#252525` | Input background | Input control base (`app/globals.css:26`) |
| `--color-ring` | `#FFE330` | Focus ring | Focus-visible outlines (`app/globals.css:27`) |

### Gold / Yellow Palette Tokens (`app/globals.css:29-39`)
*Built around primary brand yellow `#FFE330` (`.impeccable.md:14-15`)*

| Token | Hex Value | Active Component Usage |
| :--- | :--- | :--- |
| `--color-gold-50` | `#fffef5` | Defined in theme (`app/globals.css:30`); 0 component usages |
| `--color-gold-100` | `#fffce6` | Defined in theme (`app/globals.css:31`); 0 component usages |
| `--color-gold-200` | `#fff8cc` | Defined in theme (`app/globals.css:32`); 0 component usages |
| `--color-gold-300` | `#fff299` | Hover states (`components/OWeekPageClient.tsx:256`) |
| `--color-gold-400` | `#ffeb66` | Overlay button background (`components/OWeekPageClient.tsx:256`) |
| `--color-gold-500` | `#FFE330` | Form success status icon (`components/contact/ContactForm.tsx:261`) |
| `--color-gold-600` | `#FFE330` | Defined in theme (`app/globals.css:36`) |
| `--color-gold-700` | `#FFE330` | Input focus rings & buttons (`components/contact/ContactForm.tsx:139,313`) |
| `--color-gold-800` | `#FFE330` | Hover submit button (`components/contact/ContactForm.tsx:313`) |
| `--color-gold-900` | `#FFE330` | Defined in theme (`app/globals.css:39`) |

### Blue / Indigo Mascot Palette (`app/globals.css:41-45`)
| Token | Hex Value | Active Component Usage |
| :--- | :--- | :--- |
| `--color-blue` | `#5757D3` | Event reminder CTA button (`components/events/EventReminderForm.tsx:77`), tags (`lib/events/eventTags.ts:37`) |
| `--color-blue-light` | `#7070e0` | Event reminder button border (`components/events/EventReminderForm.tsx:77`), tags (`lib/events/eventTags.ts:37`) |
| `--color-blue-dark` | `#4545a8` | Defined in theme (`app/globals.css:44`) |

### Semantic & Special Effect Colors
- **Success**: `#4CAF50` (Industry tag in `lib/events/eventTags.ts:30`), `green-500/10` & `text-green-400` (`components/events/EventReminderForm.tsx:53`).
- **Warning**: none found (yellow is reserved strictly for accent/action, never warning; `.impeccable.md:31`).
- **Danger / Destructive**: `#dc2626` (`app/globals.css:24`), `border-red-500` / `focus:ring-red-500/30` / `text-red-600` (`components/contact/ContactForm.tsx:138,149,203`), `text-[#ff8a80]` (`components/launcher/AppLauncher.tsx:125`).
- **Info**: none found.
- **Scrollbar & Selection**:
  - `::selection`: background `#FFE330`, text `#252525` (`app/globals.css:71-74`).
  - Scrollbar track: `#252525`, thumb: `rgba(255, 255, 255, 0.15)`, thumb hover: `#FFE330`, border: `#404040` (`app/globals.css:76-103`).

### Top Hardcoded Color Hotspots in Components
*(Counted via grep across `components/` and `app/`)*

| Color Code | Usage Count | Common Contexts & Citations |
| :--- | :--- | :--- |
| `#FFE330` | 38 | Brand yellow: cursor ribbons (`components/GlobalRibbons.tsx:12`), ClickSpark (`app/(site)/layout.tsx:37`), text wipe (`components/hero/Hero.tsx:79`), tab highlights (`components/CommitteePageClient.tsx:220`) |
| `#252525` | 26 | Brand charcoal: ribbon text inversion (`components/RibbonText.tsx:111`), card fills (`components/hero/Hero.tsx:685`, `components/home/Footer.tsx:54`, `components/home/QuickLinksSection.tsx:214`) |
| `#1E1E1E` / `#1e1e1e` | 11 | Card surface step 1: event cards (`components/events/EventCard.tsx:63`), committee grid (`components/CommitteePageClient.tsx:215,344`), app stage (`components/hero/AppStage.tsx:113`) |
| `#151515` / `#141414` / `#161616` | 9 | Deep container backgrounds: announcement banner (`components/hero/AnnouncementBanner.tsx:120,133`), app headers (`components/hero/AppStage.tsx:119`), tooltips (`components/hero/Hero.tsx:349`) |
| `#5757D3` / `#5757D2` | 8 | Mascot illustration & button: 404 button (`app/not-found.tsx:19`), mascot SVGs (`components/sponsor/SponsorLogosGrid.tsx:70,82`) |
| `#1A1A1A` / `#1a1a1a` | 5 | Secondary card surface step 2: button backdrop (`components/hero/Hero.tsx:710`), aside articles (`components/events/EventPageClient.tsx:240`), email card (`components/contact/EmailTemplate.tsx:50`) |
| `#404040` | 4 | Structural borders (`app/globals.css:25,80`, `components/contact/EmailTemplate.tsx:164`) |
| `#e6c800` | 4 | Darker gold hover for active menu buttons (`components/Navigation.tsx:287`, `components/launcher/AppLauncher.tsx:109,262`) |
| `#dadada` / `#3d3d3d` | 4 | Legacy light-grey form inputs in `components/contact/ContactForm.tsx:136,163,190` |

### Gradients
- `bg-[linear-gradient(135deg,#5757D3_0%,#252525_50%,rgba(255,227,48,0.38)_100%)]` (`components/events/EventPageClient.tsx:86`)
- `bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.5)_45%,#252525_100%)]` (`components/events/EventPageClient.tsx:90`)
- `bg-linear-to-l from-[#161616] via-[#161616]/80 to-transparent` (`components/hero/Hero.tsx:172`)
- `bg-linear-to-b from-transparent to-[#252525]` (`components/hero/Hero.tsx:173`)
- `bg-[linear-gradient(120deg,transparent_25%,rgba(255,255,255,0.35)_50%,transparent_75%)]` (CTA shimmer in `components/hero/Hero.tsx:686`)
- `bg-gradient-to-br from-[#FFE330]/50 to-[#FFE330]/20` (Avatar initials background in `components/CommitteePageClient.tsx:333,483`)
- `bg-gradient-to-r from-[#151515]/80 via-transparent to-[#151515]/80` (`components/hero/AnnouncementBanner.tsx:133`)

---

## 3. Typography

### Font Families
- **Primary / UI**: `Poppins` Latin via `next/font/google` (`app/layout.tsx:5-9`). Weights loaded: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold), `800` (ExtraBold), `900` (Black). Exported as CSS variable `--font-poppins`. Single-font brand rule (`.impeccable.md:16`).
- **Monospace**: `font-mono` (Tailwind system mono fallback) used for page pagination counters (`components/OWeekPageClient.tsx:290`).
- **Fallbacks**: `system-ui, sans-serif` (`components/ChromaGrid.css:95`), `Arial, sans-serif` (`components/contact/EmailTemplate.tsx:12`).

### Observed Type Scale
| Level / Role | Tailwind Classes / Font Size | Weight | Tracking / Leading | File Anchor |
| :--- | :--- | :--- | :--- | :--- |
| **Display / Hero H1** | `text-[clamp(2.6rem,10.5vw,3.75rem)] lg:text-[clamp(2.75rem,4.6vw,5.4rem)]` | `font-extrabold` (800) | `tracking-[-0.035em] leading-[0.98]` | `components/hero/Hero.tsx:196` |
| **Page H1** | `text-[clamp(3rem,7vw,88px)]` | `font-semibold` (600) | `leading-none` | `components/AboutUsPageClient.tsx:366` |
| **Event Title H1** | `text-[clamp(2.1rem,6.3vw,5rem)]` | `font-semibold` (600) | `leading-[0.95]` | `components/events/EventPageClient.tsx:142` |
| **Section H2** | `text-[clamp(2.2rem,4.9vw,4rem)]` | `font-semibold` (600) | `leading-[0.98]` | `components/home/EventsSection.tsx:210` |
| **Section H2 (Alt)** | `text-[clamp(2rem,4vw,3rem)]` | `font-bold` (700) | `mb-4 text-center` | `components/sponsor/SponsorPageClient.tsx:224` |
| **Card H3 (Featured)**| `text-[clamp(1.5rem,2.1vw,2.2rem)]`| `font-semibold` (600) | `leading-[1.14]` | `components/events/EventCard.tsx:108` |
| **Card H3 (Standard)**| `text-[clamp(1.15rem,1.4vw,1.45rem)]`| `font-semibold` (600) | `leading-[1.14]` | `components/events/EventCard.tsx:108` |
| **Nav Overlay Links** | `text-[clamp(3rem,6vw,5rem)]` (lg) / `text-[clamp(2rem,8vw,3rem)]` (sm) | `font-semibold` (600) | `leading-[1.2]` | `app/globals.css:47-50`, `components/Navigation.tsx:112,126` |
| **Body (Lead)** | `text-[clamp(1rem,2.5vw,24px)]` | `font-normal` (400) | `leading-normal` | `components/AboutUsPageClient.tsx:402,432` |
| **Body (Standard)** | `text-[15px] xl:text-[17px]` | `font-normal` (400) | `leading-[1.8]` | `components/hero/Hero.tsx:658` |
| **Body (Muted)** | `text-sm md:text-base` | `font-normal` (400) | `leading-relaxed text-white/55` | `components/home/EventsSection.tsx:214-215` |
| **Eyebrows / Badges** | `text-[10px]`, `text-[0.68rem]`, `text-xs` | `font-semibold` (600) | `uppercase tracking-[0.14em]` to `[0.2em]` | `components/launcher/AppLauncher.tsx:305`, `components/events/EventPageClient.tsx:175,182` |
| **Small / Metadata** | `text-[0.74rem]`, `text-xs` | `font-medium` (500) | `tracking-normal text-white/60` | `components/events/EventCard.tsx:118`, `components/home/EventsSection.tsx:229,263,290` |

### Casing Conventions
- **Uppercase**:
  - Buttons: All interactive CTA buttons (`Become a Member`, `All MAC apps`, `Join MAC`, `Menu`, `Close`, `Apps`, `View event`, `Load more events`).
  - Eyebrows & Micro-labels: Section headers (`NAVIGATION`, `EVENT DETAILS`, `FEATURED EVENT`, `APPS`, `COMMITTEE`, `BACKED BY`).
  - Category / status tags: `EVENT`, `HACKATHON`, `INDUSTRY`, `SOCIAL`, `RECRUITMENT`, `ARCHIVES` (`lib/events/eventTags.ts:10-53`, `components/events/EventCard.tsx:95`).
- **Title Case**: Page titles and nav targets ("About Us", "Meet the Team", "Sponsor Us").
- **Sentence Case**: Body copy, event descriptions, error messages.

---

## 4. Layout & Spacing

### Max-Width Containers
- `max-w-[96rem]` (1536px): Hero section wrapper (`components/hero/Hero.tsx:543`).
- `max-w-[1440px]`: Extended mission container on desktop (`components/AboutUsPageClient.tsx:417`).
- `max-w-[1240px]`: Events section and grid (`components/home/EventsSection.tsx:202`).
- `max-w-[1200px]`: Standard content constraint (`components/home/Footer.tsx:53`, `components/events/EventPageClient.tsx:92,167`, `components/sponsor/SponsorPageClient.tsx:222`, `components/ChromaGrid.css:10`).
- `max-w-[900px]`: Contact & sponsor forms (`components/sponsor/SponsorPageClient.tsx:243`).
- `max-w-2xl` (672px): Floating announcement banner (`components/hero/AnnouncementBanner.tsx:118`).
- `max-w-lg` (512px): Committee member modal dialog (`components/CommitteePageClient.tsx:454`).
- `sm:w-[26rem]` (416px): App launcher popover panel (`components/launcher/AppLauncher.tsx:288`).

### Padding & Gutters
- **Header Island**: `pl-4 pr-6 py-4 lg:pl-10 lg:pr-12 lg:py-6` (`components/Navigation.tsx:218`).
- **Hero Grid**: `px-5 pb-10 pt-32 sm:px-8 lg:px-12 lg:pt-36` (`components/hero/Hero.tsx:543`).
- **Major Sections**: `py-24 px-8` (`components/home/Footer.tsx:51`, `components/sponsor/SponsorPageClient.tsx:220`); `py-[clamp(4rem,8vw,6rem)] px-6 md:px-8` (`components/AboutUsPageClient.tsx:414`).
- **Cards**: `p-5 md:p-6` (standard event card), `p-7 md:p-8` (featured event card) (`components/events/EventCard.tsx:106`).

### Grid & Flex Layout Patterns
- **Hero**: Asymmetric 2-column: `grid grid-cols-1 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] gap-14 lg:gap-16 xl:gap-24` (`components/hero/Hero.tsx:543`).
- **Event Detail**: `grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]` (`components/events/EventPageClient.tsx:167`).
- **Events Grid**: 3-column responsive: `grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3` (`components/home/EventsSection.tsx:275`).
- **Footer**: Auto-fit column wrap: `grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-12` (`components/home/Footer.tsx:55`).
- **QuickLinks**: Asymmetric staggered flex row with dynamic flex-grow factors (`grow: 1.2`, `grow: 1.1`, `grow: 0.95`) (`components/home/QuickLinksSection.tsx:44,56,80,195-196`).
- **Chroma Grid**: `grid-template-columns: repeat(var(--cols, 3), 320px)` (`components/ChromaGrid.css:6`).

### Breakpoints & Sticky Elements
- Breakpoints: Tailwind defaults (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`). Custom CSS breakpoints: `1124px`, `480px` (`components/ChromaGrid.css:20,28`).
- Navbar Height: Header items maintain `h-10.5` (42px) on mobile and `h-10`–`h-12` (48px) on desktop; outer container padded `py-4` / `lg:py-6` (approx. 72px–88px height zone).
- Sticky / Fixed Elements:
  - Header: `fixed top-0 left-0 right-0 z-50` (`components/Navigation.tsx:218`).
  - Nav Fullscreen Overlay: `fixed inset-0 z-40` / `z-45` (`components/Navigation.tsx:327,341`).
  - App Launcher Popover: `fixed left-4 right-4 top-[4.75rem] z-[60] sm:left-auto lg:right-12 lg:top-[5.75rem]` (`components/launcher/AppLauncher.tsx:288`).
  - Announcement Banner: `fixed top-[10%] left-1/2 -translate-x-1/2 z-50` (`components/hero/AnnouncementBanner.tsx:118`).
  - Global WebGL Cursor Ribbon: Fixed document overlay (`components/GlobalRibbons.tsx:32-35`).

---

## 5. Shape

### Radius Tokens & Actual Element Radii
- **Base Theme Token**: `--radius: 0.625rem` (10px) (`app/globals.css:7`).
- **Buttons (`rounded-md` = 6px standard)**:
  - Hero CTAs: `rounded-md` (`components/hero/Hero.tsx:683,710`).
  - Nav CTA & Menu toggle: `rounded-md` (`components/Navigation.tsx:250,263,285`).
  - Form actions: `rounded-md` (`components/events/EventReminderForm.tsx:77`, `components/sponsor/SponsorPageClient.tsx:324`).
  - Outliers: `rounded-lg` (8px, `components/contact/ContactForm.tsx:313`, `app/not-found.tsx:19`), `rounded-full` (`components/CommitteePageClient.tsx:218`).
- **Cards (`rounded-lg` = 8px & `rounded-xl` = 12px standard)**:
  - Event Cards: `rounded-lg` outer, `rounded-lg` inner media (`components/events/EventCard.tsx:63,71`).
  - Social Cards: `rounded-lg` (`components/home/CommunitySection.tsx:95`).
  - Aside / Detail Panels: `rounded-xl` (`components/events/EventPageClient.tsx:169,181,240`, `components/hero/AnnouncementBanner.tsx:120`, `components/sponsor/SponsorPageClient.tsx:243`).
  - App Stage: `rounded-xl` (12px) (`components/hero/AppStage.tsx:111`).
  - Asymmetric Quicklink Shapes:
    - About: `rounded-[64px]` (`components/home/QuickLinksSection.tsx:42,208`).
    - Team: `56px 190px 56px 56px` (`components/home/QuickLinksSection.tsx:54,208`).
    - Sponsor: `190px 56px 56px 56px` (`components/home/QuickLinksSection.tsx:66,208`).
    - Contact: `999px 999px 56px 56px` (`components/home/QuickLinksSection.tsx:78,208`).
    - O-Week: `48px` (`components/home/QuickLinksSection.tsx:90,208`).
- **Inputs**: `rounded-xl` (`components/events/EventReminderForm.tsx:72`, `components/sponsor/SponsorPageClient.tsx:274`), `rounded-lg` (`components/contact/ContactForm.tsx:136`).
- **Badges / Chips**: `rounded-md` (`components/events/EventCard.tsx:95,99`), `rounded-full` (`components/launcher/AppLauncher.tsx:185`).
- **Modals / Sheets**: `rounded-t-xl sm:rounded-xl` (`components/CommitteePageClient.tsx:454`).
- **Torn Edge Effect**: Sawtooth tear mask `.receipt-tear` (`app/globals.css:138-142`).
- **Organic Cutouts**: Fluid blob clip-paths `variant-1.svg` to `variant-6.svg` (`components/AboutUsPageClient.tsx:437-450`, `components/sponsor/SponsorPageClient.tsx:20-36`).

### Border Widths & Colors
- **Hairlines (1px standard)**: `border border-white/10` (`components/hero/Hero.tsx:349`, `components/home/Footer.tsx:50`, `components/hero/AnnouncementBanner.tsx:120`), `border border-white/12` (`components/events/EventPageClient.tsx:169`), `border border-white/14` (`components/events/EventReminderForm.tsx:72`), `border border-white/15` (`components/Navigation.tsx:288`, `components/launcher/AppLauncher.tsx:263`).
- **Thick Borders (2px)**: Used for primary hero CTA buttons (`border-2 border-accent` in `components/hero/Hero.tsx:683`, `border-2 border-white/25` in `components/hero/Hero.tsx:710`).
- **Avatar Ring (4px)**: `border-4 border-[#FFE330]/30` on committee profile photo modal (`components/CommitteePageClient.tsx:473`).

---

## 6. Depth & Effects

- **Drop Shadows**: Deliberately omitted (`.impeccable.md:17-18`: "No drop shadows: depth comes from surface lightness steps, hairlines and hover lifts").
  - Only Three.js scene uses a contact shadow: `ContactShadows` (`opacity={0.4} blur={7}` in `components/MacLogo3D.tsx:31-32,225-230`).
- **Surface Elevation Hierarchy**:
  1. Base canvas: `#252525` (`app/globals.css:10`).
  2. Floating nav backing: `#0c0c0c/90` with `backdrop-blur-sm` and `border-white/10` (`components/Navigation.tsx:242`).
  3. Floating popovers / tooltips: `#141414` / `#151515` / `#161616` (`components/launcher/AppLauncher.tsx:288`, `components/hero/AnnouncementBanner.tsx:120`, `components/hero/Hero.tsx:349`).
  4. Interactive cards & asides: `#1e1e1e` / `#1a1a1a` (`components/events/EventCard.tsx:63`, `components/events/EventPageClient.tsx:169,240`).
- **Blur & Glass**:
  - `backdrop-blur-sm` on navigation island backing (`components/Navigation.tsx:242`).
  - `backdrop-blur-sm` on showcase pill container (`components/hero/Hero.tsx:556`).
  - `bg-[#1e1e1e]/95` and `bg-[#1a1a1a]/95` frosted card overlays (`components/events/EventPageClient.tsx:169,240`).
- **Interactive Cursor Spotlight**: Radial glow following cursor coordinates in ChromaGrid cards: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)` (`components/ChromaGrid.css:61`).
- **Background Patterns**:
  - `Squares.tsx`: Dynamic HTML5 Canvas rendering animated yellow grid squares (`squareSize={25}`, `borderColor="rgba(255, 227, 48, 0.12)"`, `hoverFillColor="rgba(255, 227, 48, 0.08)"`) (`components/hero/AnnouncementBanner.tsx:123-129`).
  - `OceanWaves`: SVG layered sine-wave animation simulating drifting water boundaries (`components/OWeekPageClient.tsx:43-106`).

---

## 7. Motion

### Timing, Durations & Easings
- **Signature Reveal & Hover Easing**: `[0.22, 1, 0.36, 1]` (`.impeccable.md:26`, `components/hero/Hero.tsx:36`, `components/Navigation.tsx:267,312`, `components/events/EventCard.tsx:67`).
- **Signature Overlay & Wipe Easing**: `[0.76, 0, 0.24, 1]` (`.impeccable.md:26`, `components/hero/Hero.tsx:37`, `components/Navigation.tsx:118,133,299,333,371`).
- **Secondary Spring Easing**: `[0.33, 1, 0.68, 1]` (`components/Navigation.tsx:238,251`).
- **Durations**: Quick micro-lifts (`0.3s`–`0.35s`), entrance reveals (`0.45s`–`0.6s`), large clip-path wipes (`0.8s`), shimmer sweep (`0.7s`).

### Keyframe Animations (`app/globals.css:106-135`)
```css
/* app/globals.css:106-119 */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@utility animate-fade-in-up {
  animation: fade-in-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* app/globals.css:122-135 */
@keyframes hero-rail {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.hero-rail-progress {
  animation-name: hero-rail;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
```

### Signature Hover & Interactive Effects
1. **Button Hover Lift**: `hover:-translate-y-0.5` (-2px lift with `ease-[cubic-bezier(0.22,1,0.36,1)]`) (`components/hero/Hero.tsx:683,710`, `components/events/EventReminderForm.tsx:77`, `components/events/EventPageClient.tsx:217`).
2. **CTA Wipe + Shimmer**: Sliding charcoal background `group-hover:translate-x-0` paired with diagonal highlight `group-hover:translate-x-[130%]` (`components/hero/Hero.tsx:685-686`).
3. **Mascot Peek**: Mascot (`max-join-mac.svg`) springs out from behind button on hover (`components/hero/Hero.tsx:691-705`).
4. **Yellow-Duplicate Text Slide**: Vertical sliding text transition in fullscreen nav menu: original slides to `-100%`, yellow duplicate slides in from `100%` to `0%` using `[0.76, 0, 0.24, 1]` (`components/Navigation.tsx:111-137`).
5. **Arrow Kick**: 45-degree arrow rotation inside pill on card/button hover: `group-hover:rotate-45` (`components/home/QuickLinksSection.tsx:223`, `components/sponsor/SponsorLogosGrid.tsx:100,188`).
6. **Click Sparks**: Canvas particles emitting 8 yellow `#FFE330` sparks on every user click across the site (`app/(site)/layout.tsx:36-44`).
7. **WebGL Cursor Ribbon**: Dynamic ribbon follows cursor and inverts overlapping text from white to `#252525` via SVG clip-paths (`components/GlobalRibbons.tsx:32-35`, `components/RibbonText.tsx:111`).
8. **3D Tilt Card**: Interactive card tilt with spotlight on social tiles (`components/home/CommunitySection.tsx:80-104`).

### Accessibility (`prefers-reduced-motion`)
- Checked across core animated modules (`components/hero/Hero.tsx:6,450`, `components/launcher/AppLauncher.tsx:4,295`, `components/home/QuickLinksSection.tsx:4`, `components/home/CommunitySection.tsx:4`).
- Transforms, clipPath sweeps, and slide animations are bypassed in favor of simple opacity crossfades (`components/launcher/AppLauncher.tsx:295-300`). Auto-advancing carousels and progress rails pause (`components/hero/Hero.tsx:471`, `.impeccable.md:35-36`).

---

## 8. Components

### Button
| Variant | Exact Classes | Citation |
| :--- | :--- | :--- |
| **Primary Brand CTA** | `group relative inline-flex items-center justify-center overflow-hidden rounded-md border-2 border-accent bg-accent px-7 py-3 text-sm font-extrabold uppercase tracking-[0.09em] text-accent-foreground no-underline transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/40` | `components/hero/Hero.tsx:683` |
| **Secondary Brand** | `inline-flex items-center gap-2.5 rounded-md border-2 border-white/25 bg-[#1a1a1a]/60 px-5 py-3 text-sm font-bold uppercase tracking-[0.09em] text-white transition-[border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/50` | `components/hero/Hero.tsx:710` |
| **Nav Header CTA** | `hidden lg:inline-flex items-center rounded-md bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-accent-foreground` | `components/Navigation.tsx:263` |
| **Header Toggle** | `relative flex h-10.5 shrink-0 cursor-pointer items-center gap-2.5 rounded-md border px-3 transition-colors duration-300 lg:h-auto lg:px-4 lg:py-2` (open: `border-accent bg-accent text-accent-foreground hover:bg-[#e6c800]`, closed: `border-white/15 bg-white/[0.06] text-white hover:border-white/40`) | `components/launcher/AppLauncher.tsx:260-264`, `components/Navigation.tsx:285-289` |
| **Blue Accent Action**| `group flex w-full items-center justify-center gap-2 rounded-md border border-blue-light bg-blue px-5 py-3 text-center text-sm font-semibold tracking-[0.08em] uppercase text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-50` | `components/events/EventReminderForm.tsx:77` |
| **Form Submit** | `w-full py-3 px-6 bg-accent text-background font-semibold rounded-md hover:bg-accent/90 transition-all disabled:opacity-50 cursor-pointer` | `components/sponsor/SponsorPageClient.tsx:324` |
| **Pill Sign Link** | `group mt-5 inline-flex items-center gap-2.5 rounded-full bg-[#252525] py-2.5 pl-5 pr-2.5 text-sm font-bold text-white no-underline` | `components/sponsor/SponsorLogosGrid.tsx:185` |

### Card
- **Event Card**: `relative isolate h-full overflow-hidden rounded-lg bg-[#1e1e1e] transition-colors duration-300` with inner image wrapper `relative mx-3 mt-3 overflow-hidden rounded-lg aspect-2/1 bg-[#444040]` (`components/events/EventCard.tsx:63,71`).
- **Detail Aside Card**: `h-fit overflow-hidden rounded-xl border border-white/12 bg-[#1e1e1e]/95 p-5 md:p-6` (`components/events/EventPageClient.tsx:169`).
- **Interactive 3D Tilt Card**: `relative h-full overflow-hidden rounded-lg bg-[rgba(28,28,28,0.8)]` (`components/home/CommunitySection.tsx:95-103`).
- **Announcement Card**: `relative overflow-hidden rounded-xl border border-white/10 bg-[#151515]` (`components/hero/AnnouncementBanner.tsx:120`).

### Input & Textarea
- **Form Text Input**: `w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all` (`components/sponsor/SponsorPageClient.tsx:274`).
- **Reminder Input**: `w-full rounded-xl border border-white/14 bg-black/28 px-4 py-3 text-sm text-foreground placeholder:text-white/40 focus:border-accent/50 focus:outline-none disabled:opacity-50` (`components/events/EventReminderForm.tsx:72`).
- **Textarea**: `w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all resize-none` (`components/sponsor/SponsorPageClient.tsx:316`).
- **Select**: none found.

### Badge / Tag / Chip
- **Event Category Badge**: `inline-flex items-center justify-center rounded-md px-3 pt-[0.3rem] pb-[0.22rem] text-[0.68rem] leading-none font-semibold tracking-[0.12em] uppercase` (`components/events/EventCard.tsx:95`).
- **Featured Badge**: `inline-flex items-center justify-center rounded-md border border-accent bg-accent px-3 pt-[0.3rem] pb-[0.22rem] text-[0.63rem] leading-none font-semibold tracking-[0.14em] uppercase text-[#252525]` (`components/events/EventCard.tsx:99`).
- **Notification Badge**: `absolute -right-2 -top-1.5 rounded-full bg-accent px-1.5 py-[3px] text-[8px] font-extrabold uppercase leading-none tracking-[0.08em] text-accent-foreground ring-2 ring-[#1C1C1C]` (`components/launcher/AppLauncher.tsx:185`).

### Navbar / Header & Footer
- **Navbar Header**: `fixed top-0 left-0 right-0 z-50 flex items-center gap-3 pl-4 pr-6 py-4 lg:pl-10 lg:pr-12 lg:py-6 pointer-events-none` with backing island `rounded-[14px] border border-white/10 bg-[#0c0c0c]/90 backdrop-blur-sm` (`components/Navigation.tsx:218,241-242`).
- **Footer**: `RibbonAwareSection as="footer"`: `bg-background border-t border-white/10`, `py-24 px-8 pb-12` (`components/home/Footer.tsx:48-52`).

### Modal / Dialog / Drawer
- **Committee Member Dialog**: Backdrop `fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center` with card `relative w-full max-w-lg rounded-t-xl bg-card p-8 sm:rounded-xl` (`components/CommitteePageClient.tsx:447,454`). Serves as bottom sheet on mobile, centered modal on desktop.
- **App Launcher Modal**: `fixed left-4 right-4 top-[4.75rem] z-[60] max-h-[calc(100svh-6rem)] origin-top-right overflow-y-auto rounded-xl border border-white/[0.12] bg-[#1C1C1C] outline-none sm:left-auto sm:w-[26rem] lg:right-12 lg:top-[5.75rem]` (`components/launcher/AppLauncher.tsx:288`).

### Toast, Tooltip, Tabs & Status
- **Toast**: none found (inline form messages used instead).
- **Tooltip**: `pointer-events-none absolute right-full top-1/2 mr-2 w-60 -translate-y-1/2 rounded-xl border border-white/10 bg-[#141414] p-3.5 text-left` (`components/hero/Hero.tsx:349`).
- **Tabs**: `inline-flex flex-wrap items-center gap-2 rounded-lg bg-[#1e1e1e] p-2` with active indicator `layoutId="events-active-filter"` (`components/home/EventsSection.tsx:221-240`).
- **Loading Spinner**: `h-4 w-4 animate-spin rounded-full border-2 border-[#FFE330] border-t-transparent` (`components/CommitteePageClient.tsx:420`).
- **Empty State**: `rounded-lg border border-dashed border-white/20 bg-white/[0.02] py-14 text-center text-white/45` (`components/home/EventsSection.tsx:302`).
- **Error State**: Dedicated 404 page with mascot `/mascot/min-404.svg` (`app/not-found.tsx:1-24`).

---

## 9. Iconography & Imagery

- **Icon Set**: `lucide-react: ^0.562.0` (`X`, `ArrowUpRight`, `CalendarDays`). Default stroke: `strokeWidth={2}` to `strokeWidth={2.8}` (`package.json:45`).
- **Brand Logo Assets**:
  - 3D Interactive Model: `/logo/mac_logo.glb` rendered with Three.js canvas in `components/MacLogo3D.tsx:22,26` with `#FFD200`. Alternates: `/logo/mac_logo_chubby.glb`, `/logo/mac_logo_animated.glb`.
  - Static Bitmap: `/logo/logo.jpg` (`components/home/Footer.tsx:58`, `app/layout.tsx:20`).
- **Club Mascots (Min & Max)**:
  - SVGs located in `public/mascot/`:
    - `min-max.svg` (`components/home/QuickLinksSection.tsx:47`)
    - `min-mac-linked.svg` (`components/home/Footer.tsx:62`, `components/events/EventCard.tsx:75`)
    - `max-join-mac.svg` (`components/hero/Hero.tsx:701`)
    - `min-404.svg` (`app/not-found.tsx:8`)
    - `max-arms-up.svg` (`components/AboutUsPageClient.tsx:453`)
    - `min-arms-up.svg` (`components/home/QuickLinksSection.tsx:83`)
- **Custom Vector App Icons**: In `components/launcher/AppIcon.tsx:4-106` for MonMap, Jobs, Verify, and Study.
- **Organic Cutout Blobs**: `public/cutouts/variant-1.svg` through `variant-6.svg` applied as SVG clip-paths for event and mission photography (`components/AboutUsPageClient.tsx:437-450`, `components/sponsor/SponsorPageClient.tsx:20-36`).

---

## 10. Theme Mode

- **Default Theme**: Dark only (`app/globals.css:9-45`, `.impeccable.md:17`).
- **Toggle Mechanism**: none found (no light mode switcher exists).
- **Class vs Media Strategy**: Hardcoded CSS variables on `:root` / `@theme`; no `.dark` class toggling.
- **Extension Locking**: `other: { "darkreader-lock": "" }` in `app/layout.tsx:13` prevents extensions like Dark Reader from mutating colors.

---

## 11. Voice & Copy

- **Tone**: Direct, technical, student-built, confident.
- **Formatting Rules**: No em dashes, proper capitalization in navigation, zero emojis in system copy (`.impeccable.md:22`).
- **Capitalization**: Headings are Title Case; buttons and micro-labels are rendered uppercase.
- **Sample Verbatim Strings**:
  1. `"At MAC, we aim to impart technical skills and industry-relevant experiences to students to bridge the gap between the classroom and industry."` (`app/layout.tsx:16,19`, `components/hero/Hero.tsx:90-97`)
  2. `"Become a Member"` (`components/hero/Hero.tsx:688`, `components/Navigation.tsx:254,269`)
  3. `"All MAC apps"` (`components/hero/Hero.tsx:712`)
  4. `"Monash Association of Coding - Empowering students through code since 2019."` (`components/home/Footer.tsx:27`)
  5. `"No upcoming events in this category."` (`components/home/EventsSection.tsx:304`)
  6. `"Discover workshops, socials, and flagship projects. Filter by category and jump straight into what matters most this semester."` (`components/home/EventsSection.tsx:215`)
  7. `"This page doesn't exist."` (`app/not-found.tsx:15`)
  8. `"Join leading tech companies in supporting the next generation of developers."` (`components/sponsor/SponsorPageClient.tsx:58`)
  9. `"You're signed up! We'll email you closer to the event."` (`components/events/EventReminderForm.tsx:54`)
  10. `"Tell us about your sponsorship interests..."` (`components/sponsor/SponsorPageClient.tsx:317`)

---

## 12. Code Conventions

- **Helper Functions**: `cn()` defined in `lib/utils.ts:4` using `clsx` and `tailwind-merge` (`twMerge(clsx(inputs))`).
- **CVA**: `class-variance-authority: ^0.7.1` in `package.json:38`, but manual conditional template literals dominate components.
- **Class Ordering Plugin**: none found (`prettier-plugin-tailwindcss` is not present).
- **Linters & Formatters**:
  - ESLint: Extends `next/core-web-vitals` (`.eslintrc.json:2`).
  - Commitlint: Extends `@commitlint/config-conventional` (`commitlint.config.js:2`).
  - Prettier: none found.
- **Component File Structure**:
  - Structured by feature under `components/` (`hero/`, `events/`, `home/`, `launcher/`, `sponsor/`, `team/`, `navigation/`, `contact/`, `ui/`).
  - Client components open with `"use client"` or `'use client'` at line 1.
- **Accessibility Patterns**:
  - Focus outlines: `focus-visible:ring-4 focus-visible:ring-accent` (`components/sponsor/SponsorLogosGrid.tsx:91`), `focus-visible:ring-1 focus-visible:ring-accent` (`components/launcher/AppLauncher.tsx:180,324`).
  - Hidden labels: `sr-only` utility for screen readers on inputs (`components/events/EventReminderForm.tsx:61`).
  - ARIA attributes: `aria-expanded`, `aria-label`, `aria-controls`, `role="dialog"`, `role="alert"`.

---

## 13. Existing Design Docs

### `.impeccable.md` (Design Context)
Quoted rules verbatim:
- **Brand System Fixed Specs**:
  > *"The brand system is fixed: charcoal `#252525`, surfaces `#1E1E1E`/`#1A1A1A`, hairline borders `white/10`, one accent `#FFE330` (always with `#252525` text on it), indigo `#5757D3` only for mascots and illustration. Poppins only (400-900); brand consistency overrides the two-font default. Dark only. No drop shadows: depth comes from surface lightness steps, hairlines and hover lifts. `rounded-md` buttons, `rounded-lg` cards, `rounded-full` logo. All-caps `font-semibold` micro-labels at `tracking-[0.08em]`-`[0.2em]`. Giant clamp() `font-extrabold` headlines."* (`.impeccable.md:14-20`)
- **Copy Restrictions**:
  > *"Copy rules: no em dashes, proper capitalisation in nav and links, no invented statistics."* (`.impeccable.md:22`)
- **Motion Vocabulary**:
  > *"Hackathon-landing energy: loud type, yellow used like a highlighter, hairline structure. Motion vocabulary: `[0.22,1,0.36,1]` for reveals and hovers, `[0.76,0,0.24,1]` for overlays and wipes. Signature moves: yellow bar text-reveal wipes, yellow-duplicate vertical slide on link hover, CTA wipe plus shimmer, `y:-2` hover lifts, yellow click sparks, the cursor ribbon."* (`.impeccable.md:25-28`)
- **Core Principles**:
  > *1. "Yellow is scarce: it marks the action, the active item and the newest thing, never decoration."*
  > *2. "Show the work: MAC's apps are presented as living miniatures in MAC's own visual language, not as screenshots of other people's UI chrome."*
  > *3. "One account, one front door: the launcher is the same everywhere and reflects who is signed in."*
  > *4. "Respect `prefers-reduced-motion` (no autoplay, crossfades instead of slides)."*
  > *5. "Every auto-advancing thing can be paused."* (`.impeccable.md:31-36`)

---

## 14. Signature

What makes this repo's look immediately recognizable at a glance:

1. **Highlighter Yellow on Charcoal Contrast**: A high-impact dark aesthetic founded on `#252525` charcoal, strictly using piercing neon yellow (`#FFE330`) like a highlighter for active pills, CTA buttons, and key headings—always accompanied by `#252525` dark ink on top of yellow.
2. **Interactive WebGL Cursor Ribbon with Inverted SVG Masking**: A continuous neon ribbon traces the mouse pointer across the screen, calculating real-time dynamic clip-paths that flip white text to `#252525` charcoal wherever the ribbon crosses underneath.
3. **Hackathon-Grade Fluid Typography**: Giant `clamp()` headlines in `Poppins` extra-bold (up to `5.4rem`) contrasting against micro-labels and buttons set in all-caps semi-bold with wide tracking (`0.08em`–`0.2em`) and yellow-bar sweep reveals.
4. **No-Shadow Layered Hairline Architecture**: Zero drop shadows throughout the entire application; visual depth is rendered cleanly using surface lightness steps (`#0C0C0C` -> `#141414` -> `#1A1A1A` -> `#1E1E1E`), subtle `white/10` borders, and `-translate-y-0.5` micro-hover lifts.
5. **Playful Mascot Chemistry & Tactile Sparks**: Indigo `#5757D3` mascots (Min & Max) popping out from behind buttons, 45-degree arrow kicks on interactive pills, an interactive 3D tilted logo, and yellow `#FFE330` particle click sparks dancing on every tap.
