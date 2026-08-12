# Project Plan — Astro Marketing (clearcutoff.in/go/*)

## Overview

Main site (landing, blog, dashboard — Next.js / Turborepo) runs on a **VPS**.
This repo is a **separate, standalone repo** for marketing / course landing pages, built with **Astro**, deployed to **Cloudflare Pages** as static HTML.

Pages are served under the path `clearcutoff.in/go/*` (not a subdomain) — this keeps SEO authority on the main domain while keeping the two codebases fully decoupled. No shared design system: each page can have its own one-off design for fast turnaround.

## Why this architecture

- Marketing pages will carry ad-campaign traffic spikes — routing them through Cloudflare Pages (edge, static) means the VPS (dashboard/landing) is never affected.
- Domain DNS is on Cloudflare → a Cloudflare Worker can route `/go/*` directly to Cloudflare Pages at the edge, without the request ever touching the VPS.
- Subdirectory (`/go/`) instead of subdomain (`go.clearcutoff.in`) → inherits main domain's SEO authority.
- Separate repo, no shared design system → building/iterating new landing pages fast, without coupling to the Turborepo.

## Routing

```
User → Cloudflare edge
         ├── /go/*  → Worker → Cloudflare Pages (this repo's static build)
         └── other  → VPS (Next.js landing/blog/dashboard)
```

- Cloudflare Worker route: `clearcutoff.in/go/*`
- Worker forwards request to this repo's Cloudflare Pages deployment
- **Important:** Worker must strip the `/go` prefix before forwarding — Astro's `base` config does NOT change build output paths, so `/go/react-course` on the domain maps to `/react-course` on the Pages deployment (same for assets, e.g. `/go/_astro/style.css` → `/_astro/style.css`).

Fallback option (if DNS were ever not on Cloudflare): Nginx `location /go/` proxy on the VPS to the Pages deployment — works, but routes traffic through the VPS, losing the load-isolation benefit. Not needed for this setup.

## Required Astro config (`astro.config.mjs`)

```js
export default defineConfig({
  site: 'https://clearcutoff.in',   // NOT the *.pages.dev URL — keeps canonical tags correct
  base: '/go',                       // required, or assets 404 on the live domain
  trailingSlash: 'never',            // must match the Worker/proxy's expectation, or redirect loops
})
```

## Common failure points (checklist before shipping a page)

- [ ] `base: '/go'` set in astro.config.mjs — missing this is the #1 cause of "page loads but totally unstyled"
- [ ] Worker strips `/go` prefix when forwarding to Pages
- [ ] `trailingSlash` matches between Astro config and the Worker/proxy (avoid redirect loops)
- [ ] Cloudflare Pages deployment has `_headers` file setting `X-Robots-Tag: noindex` (prevents `*.pages.dev` being indexed as duplicate content)
- [ ] Astro's generated sitemap (`/go/sitemap.xml`) is manually added to the **main site's** `robots.txt` (served from the VPS) — this does not happen automatically

## Repo structure

```
astro-marketing/  (this repo — standalone, outside the Turborepo)
└── src/pages/
    ├── react-course.astro      → clearcutoff.in/go/react-course
    ├── python-bootcamp.astro   → clearcutoff.in/go/python-bootcamp
    └── ...
```

## Design system

No shared component library / layout with the main app — keeps this repo fast to iterate on, each page still free to lay itself out however it wants.

**Colors ARE shared at the token level (added later, see below):** Tailwind CSS v4 is installed, with brand colors defined once in `src/styles/global.css` via an `@theme` block, mirrored from the real values in `apps/landing/project-style-guide.md` (brand blue `#0083FF`, success green `#00A251`, text/border grays, etc.). Tailwind v4 auto-generates utilities from these — `--color-brand` gives `bg-brand`, `text-brand`, `border-brand`, etc. Every page should `import "../styles/global.css"` and use these utility classes instead of hardcoding hex colors, so the whole site stays on-brand without a shared npm package.

## Turborepo (`D:\clearcutoff-projects\clearcut-master`) — integration notes

Checked the `landing` app (Next 16, React 19, next-intl 4). Findings relevant to this integration:

- **No `next.config.ts` rewrite needed for `/go`.** Routing happens at the Cloudflare edge (Worker), so `/go/*` requests never reach the VPS/Next app at all — confirmed there's currently no `/go` rewrite in `apps/landing/next.config.ts`, and none needs to be added.
- **Next 16 renamed `middleware.ts` to `proxy.ts`.** The active file is `apps/landing/src/proxy.ts`, wrapping `next-intl`'s `createMiddleware(routing)`. Its matcher (`/((?!api|trpc|_next|_vercel|.*\..*).*)`) does not exclude `/go`, but since the Worker intercepts `/go/*` before it hits origin, this is moot — it's noted here only in case the Worker/routing setup ever changes and `/go` traffic starts reaching the VPS directly (e.g. Nginx-fallback path). If that happens, exclude `/go` from this matcher too: `localePrefix` is `as-needed` with `defaultLocale: "en"` and `localeDetection: false` (`packages/i18n/routing.ts`), so it would likely pass `/go/*` through unaffected regardless, but excluding it outright removes any doubt.
- **Sitemap wiring is simpler than initially planned.** `apps/landing/src/app/robots.ts` is a dynamic `MetadataRoute.Robots` (no static `robots.txt` file exists). Its `sitemap` field currently is a single string (`https://clearcutoff.in/sitemap.xml`) but Next's type allows `string | string[]` — so adding the Astro sitemap is a one-line change to an array: `sitemap: ["https://clearcutoff.in/sitemap.xml", "https://clearcutoff.in/go/sitemap.xml"]`.
- **`_headers` noindex nuance (new):** the Pages `_headers` rule (`X-Robots-Tag: noindex`) is meant only for direct `*.pages.dev` visits. Since the Worker fetches from Pages and returns that response for `clearcutoff.in/go/*`, the header would otherwise leak onto the real, indexable `/go/*` pages too. **The Worker script must strip `X-Robots-Tag` from the upstream Pages response** before returning it on the `clearcutoff.in` host.

## Astro project — scaffolded

Done in this repo:
- `npm create astro@latest` (minimal + TypeScript strict template), deps installed
- `astro.config.mjs` — `site: 'https://clearcutoff.in'`, `base: '/go'`, `trailingSlash: 'never'`
- `public/_headers` — `X-Robots-Tag: noindex` (for direct pages.dev access; see Worker note above)
- `src/pages/index.astro` — placeholder page, demonstrates the required pattern for static asset links: `import.meta.env.BASE_URL` (normalized, trailing slash stripped) prefixed onto every asset path, e.g. `${base}/favicon.svg` → builds to `/go/favicon.svg`. **Every future page must follow this pattern** — a hardcoded `href="/whatever.svg"` will 404 in production even with `base` configured correctly, since `base` only affects paths Astro itself generates, not literal strings you write.
- Verified with `npm run build`: output HTML correctly resolves to `/go/favicon.svg` etc., and confirmed build output stays at `dist/index.html` (not `dist/go/index.html`) — reconfirms the Worker's job of stripping `/go` before forwarding to Pages.

## Cloudflare Worker — done

Lives in `worker/` (separate `package.json`/`wrangler.toml`, deployed independently from the Astro site itself):
- `worker/src/index.ts` — strips `/go` prefix on the way in, strips `Host` header before the upstream fetch, strips `X-Robots-Tag` on the way out (see "New nuance" above). Guards against the prefix matching `/gophers`-style paths (`isGoPath` requires an exact `/go` or a `/go/` boundary).
- `worker/wrangler.toml` — routes for both `clearcutoff.in/go` and `clearcutoff.in/go/*`; `PAGES_ORIGIN` var is currently the placeholder `https://cc-marketing.pages.dev`, **must be updated once the real Pages project exists**.
- Verified: `tsc --noEmit` clean, `wrangler dev` boots and proxies correctly (tested against the placeholder domain — got Cloudflare's expected 404 for a non-existent pages.dev site, confirming the request path/logic itself works).
- See `worker/README.md` for setup/deploy steps.

## First marketing page — done

`src/pages/htet.astro` → `clearcutoff.in/go/htet`. Content pulled from real data in the Turborepo rather than invented:
- Exam facts (full name, BSEH conducting body, biannual frequency, PRT/TGT/PGT levels) from `apps/landing/src/lib/data/staticExams.ts`
- Hero copy (PYQ-based tests/notes/videos framing) matches the real copy already in `apps/landing/src/components/sections/heros/HomeHero.tsx`
- Pricing (₹499, was ₹900) from the same `staticExams.ts` record
- Brand blue (`#0083FF`) pulled from `apps/landing/project-style-guide.md` for a light brand touch — page is otherwise self-contained (inline `<style>`, no shared design system, per the earlier decision)
- CTA links out to the real course page: `https://clearcutoff.in/exam/htet`
- Deliberately did NOT claim things not confirmed in the data (e.g. AI evaluation — `ai_evaluation_supported` is `null` for HTET; specific question/marks counts — not in the data) to avoid a false claim on a public page

Verified via `npm run build` (canonical resolves to `https://clearcutoff.in/go/htet`, assets to `/go/...`) and visually in-browser via `astro preview`.

**Design pass (round 2):** sticky blurred navbar, hero decorative gradient blobs + eyebrow badge + logo in a circular frame, icon-accented facts strip and feature cards (inline SVGs, no icon library dependency), redesigned pricing card (badge, checklist, shadow), FAQ with a rotating chevron, gradient footer CTA, and a mobile-only sticky bottom price/CTA bar (`@media max-width:640px`, hidden on desktop). Checked in-browser: hero, facts, features, pricing badge, and FAQ toggle/chevron all render and interact correctly. The mobile sticky bar was verified at the compiled-CSS level (`dist/_astro/htet.*.css` — confirmed `display:none` by default, `position:fixed`/`flex` only inside the `640px` media query) since the browser tool's window-resize didn't reflect in this environment's live viewport.

**Design pass (round 3) — migrated to Tailwind CSS v4:**
- Added `tailwindcss` + `@tailwindcss/vite`, wired into `astro.config.mjs` via `vite.plugins: [tailwindcss()]` (Tailwind v4's Vite-plugin setup, no `tailwind.config.js` needed)
- `src/styles/global.css` — `@import "tailwindcss";` plus an `@theme` block with the brand color tokens (see Design system section above). Every page imports this file.
- Rewrote `htet.astro`'s hand-written `<style>` block entirely as Tailwind utility classes (only a couple of lines of raw CSS remain, for the mobile-CTA `main` padding toggle — cleaner as plain CSS than a `sm:`-prefixed utility chain). FAQ chevron rotation now uses Tailwind's `group`/`group-open:rotate-90` pattern instead of a custom CSS selector.
- Verified: `npm run build` succeeds, confirmed in the compiled output that `.bg-brand`/`.text-brand` (and other token utilities) exist and correctly reference `--color-brand: #0083ff` from the `@theme` block — i.e. the "global level" color wiring is real, not just visually coincidental. Re-checked the page in-browser (hero, facts, features, pricing, FAQ chevron open/close) — pixel-identical to the pre-Tailwind version, all interactions intact.
- `index.astro` also imports `global.css` now, for consistency across pages, though it's still just a minimal placeholder.

**Follow-up cleanup — confirmed nothing was left outside Tailwind:** a check turned up two loose ends, both fixed:
- A leftover plain `<style>` block (mobile-CTA padding-bottom toggle) — replaced with `pb-[72px] sm:pb-0` directly on `<main>`, so `src/pages/*.astro` now has zero raw `<style>` blocks.
- The rating-star fill color was a hardcoded `fill-[#f5a623]` arbitrary value, not a theme token — added `--color-rating: #f5a623` to `global.css`'s `@theme` (noted as this repo's own addition, not from the Turborepo tokens) and switched to `fill-rating`.
- Verified via `grep` there are no `<style>` blocks and no hardcoded hex colors left in `src/pages/`, and confirmed in the compiled CSS that both `.fill-rating` and `.sm:pb-0` resolve correctly (the latter scoped inside `@media (width>=40rem)`).

**Design pass (round 4) — messaging/narrative rework:** the page had facts and a feature grid but never actually stated the *problem* the visitor has before pitching the solution. Restructured the flow into a proper problem → solution → proof → offer sequence:
- Hero (attention) — unchanged
- New **"Sound familiar?" problem section** — 3 honest, relatable friction points (scattered notes across YouTube/Telegram/PDFs, practice that doesn't match the real pattern, not knowing which sections are weak). Deliberately phrased as relatable statements, not fabricated statistics ("90% fail because...") — nothing here is a claim that needs data backing.
- Replaced the old flat "What's included" 2x2 feature grid with a **numbered "How it works" 3-step process** (Practice by section → Simulate exam day → Close the gaps), with a connecting line between numbered circles (CSS-only stepper: a full-width line behind the circles, each circle given a `ring-8 ring-white` halo to visually break the line at each node). This reframes the same real features as a logical progression instead of an unordered list, which is a stronger sell.
- Exam facts strip moved to *after* the how-it-works section, right before pricing — functions as final credibility/legitimacy proof (real exam, real conducting body) right before the ask, rather than sitting disconnected near the top.
- Pricing, FAQ, footer, mobile sticky CTA — unchanged.
- Checked in-browser: problem cards, connected step circles, and full scroll-through all render correctly.

## Deployment — done, live in production

`https://clearcutoff.in/go/htet` is live end-to-end (DNS → Worker → Pages → Astro). What it took:

- **GitHub repo confusion, resolved:** the user's first local `git init`/push accidentally targeted a differently-named, pre-existing repo (`clearcut-astro`) instead of the one actually intended (`Astro-marketing-clearcut`, created empty via GitHub's UI). Fixed by pointing `origin` at the correct repo and re-pushing. `clearcut-astro` was left as-is on GitHub (not deleted) — still contains an early copy of the code, harmless but not the repo in active use.
- **Cleaned a real mistake before pushing:** `worker/.wrangler/` (local miniflare dev cache/db, bundled temp JS) had been committed by accident. Untracked it and added `.wrangler/` to `.gitignore`.
- **Cloudflare Pages project created** via dashboard → Workers & Pages → Create → Pages → "Import an existing Git repository" → GitHub → `Astro-marketing-clearcut`. Had to grant the "Cloudflare Workers and Pages" GitHub App access to this repo first (Settings → Applications → Cloudflare Workers and Pages → Repository access) — it only had `clearcut-turbo` authorized initially. Framework preset `Astro` auto-filled `npm run build` / `dist`; added `NODE_VERSION=22` env var (Astro 7 needs Node ≥22.12). Live at `astro-marketing-clearcut.pages.dev`.
- **`worker/wrangler.toml`** `PAGES_ORIGIN` updated to the real Pages URL; `npx wrangler login` (OAuth, browser-driven) then `npx wrangler deploy` from `worker/` — deployed cleanly, both routes registered.
- **Root-cause bug #1 — DNS not proxied:** first live test 404'd. `clearcutoff.in`'s DNS record was "DNS only" (grey cloud) — nameservers were on Cloudflare but the record itself bypassed Cloudflare's edge entirely, so the Worker route never fired; every request went straight to the VPS. Confirmed safe (other subdomains on the same origin IP were already proxied) and switched to "Proxied" in DNS → Records. This affects the *entire* site's traffic, not just `/go` — flagged to the user and got explicit confirmation before changing it, since it's live production DNS.
- **Root-cause bug #2 — redirect dropped the `/go` prefix:** with DNS fixed, `/go/htet` returned a 308 to `/htet/` (no `/go`). Cause: Astro's directory-style output (`dist/htet/index.html`) makes Cloudflare Pages 308-redirect `/htet` → `/htet/` to add the trailing slash, and that `Location` header passes through the Worker unmodified — the browser resolves it against `clearcutoff.in`, losing `/go`. Fixed at the source: added `build: { format: 'file' }` to `astro.config.mjs`, so Astro emits `dist/htet.html` (flat file) instead — Pages serves it directly with no redirect needed at all.
- Verified: `curl -v https://clearcutoff.in/go/htet` → `200 OK` via Cloudflare (`server: cloudflare`, `cf-ray` present), and confirmed visually in-browser — fully styled, matches the local dev version exactly. Also re-checked `https://clearcutoff.in` itself post-DNS-change — main site unaffected.

## HTET page rebuilt to mirror the real production course page

The original custom-designed hero/problem/steps layout was replaced with a faithful copy of the actual live page at `clearcutoff.in/teaching/htet-v1` (rendered by `apps/landing` from `courses.ts`'s `htet-v1` entry: `courseHero` + `singlePricing` sections, via `SectionRenderer` → `sectionRegistry`). Research was done by reading the real components rather than reverse-engineering rendered HTML:

- **`CoursePageHero`** (`apps/landing/src/components/sections/heros/CoursePageHero.tsx`) → our hero: heading/subtext copy, "Continue Free Prep »" + "3-day free trial" CTAs, "No card or payment required" line, `4.9` rating chip, 3 right-side feature cards (`OverViewFeatureCard`) with a green check-badge icon.
- **`CourseLogoCarousal`/`CourseLogoCarousalData`/`LogoCarousel`** → the "Trusted by 10,000+ students to pass TET exams across India" section with real exam logos (from `staticExams.ts`: HTET, ugcnet, REET, CTET, UPTET, HPTET, UP PGT, UP TGT, UGC — same logo URLs, same S3 bucket). The source animates this with framer-motion's `useAnimationFrame` (linear, constant speed, pause-on-hover) — reproduced as a plain CSS `@keyframes` marquee (`animate-marquee` in `global.css`) since linear/no-easing motion is visually identical either way, without needing a React island. Logo list is duplicated once and translated `-50%` for a seamless loop; respects `prefers-reduced-motion`.
- **`SinglePricingSection`/`PricingCard`/`GuaranteeBadge`** → the pricing section. Real price is **₹99 for a 6-month subscription** (source hardcodes this regardless of any per-exam price field) — corrects the earlier page's invented ₹499/₹900 figures, which were wrong. Same 4 checklist points, same guarantee-badge image and copy, same "10,000+ students" stat block.
- **No comparison table or FAQ** — `htet-v1`'s real `courses.ts` entry only declares `courseHero` + `singlePricing`, so this page doesn't invent sections the source doesn't have. (The richer `htet` slug, not `htet-v1`, is the one with `comparison`/`faqs` — out of scope here since the user pointed at `htet-v1` specifically.)
- **Design tokens added to `global.css`:** the source uses a fluid `clamp()`-based typography scale (`display-small`, `heading-xlarge`, `body-large`, etc. from `@clearcut/design-tokens`) — these are custom classes, not stock Tailwind utilities. Copied the actual clamp() values in verbatim (only the sizes this page uses, not the full scale) so headings/body text scale identically to production across viewport widths, rather than jumping at Tailwind's fixed breakpoints.
- **Real assets copied from `apps/landing/public/`:** `guarantee-badge-img.webp` → `public/guarantee-badge.webp`, `courseBadge/course-badge-green-dark.svg` → `public/badge-green.svg`.
- Verified: built locally, compared side-by-side against the live page section-by-section (hero, marquee, pricing) via screenshots — matches. Pushed and confirmed live at `clearcutoff.in/go/htet`.

## `/go/landing` — full homepage rebuild, "100% match"

Added `src/pages/landing.astro` — a from-scratch rebuild of the real production homepage (`clearcutoff.in/`, `apps/landing/src/components/pages/LandingPage.tsx`). Section order and every real content piece (copy, ₹99 pricing × 3 exams, exam-logo data, all 20 FAQ answers across 4 tabs) were pulled from the actual source components via research agents, not guessed — see the section-by-source-file list below.

**Sections (in order), source component each was rebuilt from:**
- Header — `layout/headers/Header.tsx` + `HeaderWraper.tsx` (scroll shadow) + `ui/NavLink.tsx` (hover-underline indicator, smooth scroll-to-section)
- Hero — `sections/heros/HomeHero.tsx` + `HeroActions.tsx`
- Logo marquee — `sections/carousal/CourseLogoCarousal.tsx` + `LogoCarousel.tsx` (real exam-logo data, "explore all courses" CTA line)
- Features — `sections/FeaturesSection.tsx` (3-item icon list)
- How it works — `sections/howitwork/HowItWorksSection.tsx` + `HowItWorkStep.tsx` + `hooks/useActiveStep.tsx` (3 numbered steps; the "closest step to 20%-of-viewport" scroll-highlighting algorithm was copied verbatim as plain JS, not approximated with IntersectionObserver)
- Comparison — `sections/ComparisonSection.tsx` + `shared/ComparisonTable.tsx` (full 7-row table, Clear Cutoff column outlined + logo)
- Pricing — `sections/pricing/PricingSectionWrapper.tsx` + `PricingSection.tsx` + `ui/cards/PricingCard.tsx` (3 cards: HTET/CTET/REET, all ₹99/6-month — confirmed the source hardcodes this price regardless of exam) + `GuaranteeBadge.tsx` + `global/StudentTrustBlock.tsx`
- FAQ — `sections/FAQsSection.tsx` + `shared/FAQAccordion.tsx` (4 tabs × 5 real Q&As each — all 20 answers, not just titles, fetched from source)
- Footer — `layout/Footer.tsx` (real phone/WhatsApp/social links, hardcoded `#006BD1` bar color — deliberately not the `--color-brand-dark` token, since the source hardcodes a different legacy blue there)

**Framer-motion → plain CSS/JS translations** (no React runtime on this static site): logo marquee (linear `useAnimationFrame` → CSS `@keyframes`, already established for the htet page), FAQ tab sliding pill (`layoutId` → JS `getBoundingClientRect` positioning + CSS transition), step-highlight badges (already CSS transitions in the source, ported directly), accordion open/close (already plain state in the source, ported directly).

**Bugs hit and fixed:**
1. **Scoped `<style>` blocks silently dropped** — a page-level `<style>.faq-answer{display:none}</style>` never made it into either the dev-server or production output (verified via curl: zero `<style>` tags rendered). Root cause not fully diagnosed; workaround was moving the rule into `global.css`, which reliably compiles — confirmed present in `dist/_astro/*.css` after the fix. Symptom before the fix: every FAQ answer in the active tab rendered open at once instead of just the first.
2. **Stale dev server processes** — over the course of the session, `astro dev` had been started multiple times in the background without killing prior instances (14 stray `node.exe` processes accumulated). One of the old instances kept answering on port 4321 with pre-fix compiled CSS, making the style-block fix look like it wasn't working. Fixed by `taskkill /F /IM node.exe` and starting a single fresh instance — always do this before trusting a "still broken" result during a long session.
3. **Browser edge/client cache showing the old `index.astro` placeholder** momentarily on the first live load of `/go/landing` right after deploy — `curl` already showed the correct page; a hard reload in-browser resolved it. Not a real bug, just propagation/cache lag immediately post-deploy.

Verified: local build + dev-server walkthrough (hero → footer, including clicking a FAQ tab to confirm the sliding pill and tab-switch), then pushed and re-verified the same walkthrough on `https://clearcutoff.in/go/landing`.

## `/go/landing` mobile pass — floating CTA bar + point-by-point fixes

The user flagged that a mobile-only floating CTA bar (visible on the real site on phones) was missing. Root cause: initial research covered the 8 main sections but not `global/FloatingButton.tsx`, which the page tree renders separately (`Header → LandingPage → FloatingButton → FooterWrap`). A follow-up research pass fetched it plus a broader "what else differs between mobile and desktop beyond simple reflow" check, which turned up several real gaps beyond just the floating button:

- **Floating CTA bar** (new) — `md:hidden` sticky bottom bar, "Start 3-day FREE trial", placed between `<main>` and the footer to match DOM order.
- **Shimmer/arrow-nudge animation** — both the header's desktop CTA and the new floating bar use `showShimmer`, which idles until the visitor's first click/scroll/keydown/touch, then cycles a 4.5s arrow-nudge phase and a 2.5s shimmer-sweep phase forever. Reimplemented with CSS `@keyframes` (`shimmer-sweep`, `arrow-nudge`) + a small vanilla-JS phase loop, since there's no framer-motion/React here.
- **Hero CTA arrow removed** — the source explicitly passes `showIcon={false}` to that one button only; every other CTA on the page keeps the arrow.
- **Step buttons got their (static) arrow icon** — `showIcon` defaults `true` there, it had been left off.
- **Mobile vs desktop step badges are different elements, not one reflowed one** — mobile's 32px badge only swaps color when active; desktop's 40px badge additionally scales up (`scale-110`) and gets a shadow. Was wrongly applying the desktop treatment to both.
- **Footer phone link text differs by breakpoint** — mobile shows "Phone", desktop shows the literal number. Source does this with a `useIsMobile()` JS hook at the 768px breakpoint; replicated as plain CSS `md:hidden` / `hidden md:inline` text swap for the same visual result without extra JS.
- **Confirmed, not changed:** mobile header has no hamburger menu on the real site — nav links and the header CTA are simply hidden below `md`, and the floating bar is the *only* persistent mobile CTA path. A `MobileMenu.tsx` exists in the source but is unused dead code (not imported anywhere) — correctly did not build a hamburger menu here either, even though its existence might suggest one was planned.

Verification note: the browser tool's `resize_window` does not actually change `window.innerWidth` in this environment (confirmed again — same limitation hit earlier in the session), so mobile behavior was verified two ways instead of visually resizing: (1) reading the real component source for exact Tailwind breakpoint classes rather than guessing, (2) checking `getComputedStyle(...).display` on the built page at the current (desktop) width to confirm `md:hidden` correctly evaluates to `none` there — which by construction means it evaluates to visible below 768px, the same mechanism already proven working elsewhered on this page (`hidden md:flex` on the nav, which **is** visibly correct on desktop in every screenshot taken).

## `/go/landing` — login modal (desktop) / right-slide panel (mobile)

The user asked to replicate the login modal every CTA button opens, and specifically to check the mobile version (which they described as a "bottom sheet"). Researched the actual source (`packages/auth/src/{auth-modal,screens/login-screen,ui/modal,ui/drawer-sheet}.tsx`) rather than guessing:

- **Correction to the "bottom sheet" assumption:** it's not a bottom sheet. Mobile gets a full-screen panel that slides in from the **right** (`drawer-sheet.tsx`'s `x: "100%" → x: 0`, square corners), desktop gets a centered, rounded, drop-shadow modal. Built as one shared DOM structure repositioned by the same `md:` (768px) breakpoint used everywhere else on the page, rather than two separate component trees like the source — same visual result, simpler to maintain here.
- **Wired to every CTA on the page** — header, hero, 3 pricing cards, 3 step buttons, the mobile floating bar, and the guarantee-badge banner (which is a whole clickable block calling `goToLogin()` directly in the source, not a button) — all open the same modal via a shared `[data-open-auth]` click handler, matching the source's `ContinueFreeButton` always calling the same `goToLogin()`.
- **Content matches source verbatim**: heading, subtext, flag + label, `+91 -` input, italic helper text, button label, trial pill, mobile-only trust line, terms/privacy footer line. One deliberate improvement: the source renders "Terms & Conditions"/"Privacy Policy" as plain colored `<span>`s with no real link — made them real links to the site's actual policy pages instead, since that's strictly better and doesn't misrepresent anything.
- **Phone input** reproduces the real resting/focused/valid border+background colors and digit-only filtering.
- **Deliberate deviation, and why:** the real site's next step after a valid number is an OTP-entry screen that says "OTP sent via SMS and WhatsApp." This static site has no backend to send one — building that screen would show a false "sent" claim to real visitors. Redirects to the real `clearcutoff.in` instead once a valid 10-digit number is entered, where the actual OTP flow can happen for real.
- **Bug found while testing, worth remembering:** `requestAnimationFrame` does not reliably fire in this dev/automation browser environment (looks like backgrounded-tab throttling), which silently ate the open animation — the modal would open (become un-hidden) but never transition in. Fixed by forcing a synchronous reflow (`void el.offsetHeight`) before toggling the transition classes instead of deferring to rAF — more robust in general, not just a workaround for this environment.
- Verified: opened via every trigger type, typed a real 10-digit test number and confirmed the color states + the redirect actually firing (tab navigated to `clearcutoff.in`), confirmed Escape and backdrop-click both close it. Re-verified the same on the live deployed page.

## `/go/landing` — FAQ section animations made same-to-same

The accordion previously toggled `display:none`/`block` instantly, with plain `duration-300 ease-out` on the tab pill and chevron. The real site drives this with framer-motion springs (pill: stiffness 500/damping 35, chevron: stiffness 260/damping 20, accordion height: stiffness 120/damping 18 + a separate 0.2s opacity fade). CSS can't do springs or transition to/from `height:auto`, so:

- `.faq-answer` base state in `global.css` changed from `display:none` to `height:0; opacity:0; overflow:hidden` with a `height .4s cubic-bezier(.22,1,.36,1), opacity .2s` transition (a smooth decelerate curve — no overshoot, since an overshooting height would show a visible gap).
- `openFaqItem`/`closeFaqItem` in `landing.astro` were merged into one `setFaqItemState(item, open, animate)`: on open it measures `answer.scrollHeight`, sets height to `0px`, forces a synchronous reflow (`void answer.offsetHeight` — same rAF-unreliability workaround as the auth modal, see above), then sets height to the measured px value so it animates, and swaps to `height:auto` on `transitionend` so it stays correct if content reflows later (e.g. window resize). On close it reads the current rendered height via `getBoundingClientRect()` first (can't transition away from `auto`), fixes it to that px value, forces reflow, then sets `0px`. The `animate` flag is `false` for instant sets (initial page load, tab switches) where no transition should play.
- Tab-pill (`#faq-tab-indicator`) and chevron transitions changed from `ease-out` to arbitrary `cubic-bezier()` easings approximating their respective spring's overshoot — pill gets a subtle one (`cubic-bezier(.33,1.1,.68,1)`, higher damping ratio ≈ 0.78), chevron gets a more pronounced one (`cubic-bezier(.34,1.56,.64,1)`, damping ratio ≈ 0.62, more underdamped).
- Verified: initial page load opens the first "Refund guarantee" question with `height:auto` already set (no animation on first paint); clicking a different question animates the previous one closed and the new one open (single-open accordion behavior preserved); switching tabs correctly repositions the pill and opens that group's first question, both instantly (no jarring animation during a tab switch); confirmed in the compiled `dist/_astro/*.css` output after a production build.

## `/go/landing` — final size/color/spacing parity audit against real source

User asked for one last pass to confirm literally everything (colors, spacing, sizes) matches the real site, not just copy and animations. Two things found along the way, worth remembering:

- **Real bug, not a personalization issue:** `.body-large/medium/small/xsmall` in `global.css` hardcoded `font-weight: 400`. Because these rules are declared *after* Tailwind's utility layer in source order, they silently beat `font-semibold`/`font-medium` at equal specificity — every `body-* font-semibold` combo (14 spots in `landing.astro`, 3 in `htet.astro`) rendered at weight 400 regardless of the utility class, e.g. the "3-day free trial" pill was visibly thinner/lighter than production. Fixed by removing `font-weight` from those four rules entirely — the class comment already said weight was supposed to be layered on separately; the property just contradicted its own comment.
- **False alarm, documented so it isn't re-investigated:** browsing `https://clearcutoff.in/` directly in the testing browser showed a short, single-exam "returning visitor" variant (no Features/Comparison/Pricing/FAQ) instead of the full marketing homepage. A cookie-less `curl` fetch of the same URL confirmed the full page *is* what's served (Features/Comparison/Pricing/FAQ text all present) — the browser's condensed view is this profile's own leftover state from earlier deployment testing on the real domain, not a site redesign. `document.cookie` couldn't clear it (likely httpOnly), so verification switched to reading the actual Turborepo source directly instead of fighting the browser session — see below.

Since the browser couldn't be trusted for a clean comparison, verification was done by reading the real component source in `D:\clearcutoff-projects\clearcut-master` (`apps/landing/src/components/sections/*`, `packages/ui/src/{text,button,card}.tsx`, `packages/design-tokens/tokens.css`) directly against `landing.astro`, section by section, via six parallel research agents (read-only, no edits) — Header/Hero, Features/How-it-works, Comparison, Pricing, FAQ/Footer/Floating-CTA, Auth modal. Confirmed mismatches found and fixed:

- **Header/Hero:** logo width 150→190px; hero mobile top/bottom padding 32px→16px; trusted-by logo images 64→88px with gap-2→gap-4; "Preparing for other exams…" line was `body-medium` regular → `heading-small font-semibold`; "See all courses" button padding 20/8px→12/4px.
- **Features/How-it-works:** section heading `display-small`→`display-medium`; section vertical padding 40/64px→16/32px (both sections); eyebrow margin 8px→4px; intro paragraphs were `body-large` (caps at 16px) → `heading-small font-normal` (real default, scales to 18px); step title→subtitle gap 8px→20px; step CTA button undersized (`text-sm px-5 py-2 w-[220px]` → `text-base px-6 py-2 min-h-[44px] w-[250px]`).
- **Comparison table:** the check/cross icons were using the filled-green-circle badge (`CheckIconGreen`, correct for pricing checklists) instead of the real table's plain outlined stroke checkmark — added a new `checkOutline` icon and swapped both table usages to it; section padding 40/64px→16/32px; "Clear Cutoff" column logo 150×36→200×48px; eyebrow/description same pattern as above; note-row color/icon/gap fixed to the real muted gray (`#566c82`), a 24px filled flame icon (`fireFilled`), and `gap-1`.
- **Pricing:** card padding 24px→8px, radius 12px→6px; price-block background was brand blue at 9% → the real `#006bd1` at 9% (a distinct "brand-dark-legacy" token, not the main brand color) with gap 16px→20px; added `mr-1` between ₹ and the price; guarantee badge image 120×96→150×120px and its button padding 16px→24px; student-trust block gap 12px→32px; section padding 40/64px→16/32px.
- **FAQ/Footer:** FAQ answer text color was `text-subtle` → `text-normal` (real default); chevron 20px→24px; tab-pill row now bleeds edge-to-edge on mobile (`-mx-3 md:mx-0`, matching production); footer bar 24px padding/no min-height → 12px padding + `min-height:88px`; row gap 12px→8px; phone/WhatsApp links dropped an incorrect `font-medium`; Instagram icon 20→24px, phone icon 20→22px.
- **Auth modal:** the phone input was a fully-bordered rounded box (`border-2 rounded-lg`, 16/12px padding) → real is underline-only (`border-b-2`, no radius, 12/6px padding) — this also required fixing the JS `setInputState()` function, which was re-applying `border-radius:0.5rem;border-width:2px` inline on every focus/blur/valid state change and would have silently undone the markup fix; panel padding was uniform 32px → real's asymmetric per-breakpoint values (mobile `28/40/28px` top/bottom/sides, desktop `12/24/40px`); heading `heading-large`→`heading-medium`; label `body-medium`→`body-small`; "+91 -" `font-bold`→`font-semibold`; two muted-text colors corrected to the real `#566c82`/`#768ea7` tokens instead of near-black/wrong-gray; trial pill border 2px→1px with 9% opacity background; footer terms text `body-small`→`body-medium`.

Rebuilt (`npm run build`, clean pass) and re-verified visually after every batch of fixes — accordion still opens/closes and animates correctly, comparison table now shows plain checkmarks, pricing cards are visibly tighter, auth modal input is now an underline field, footer is more compact. No regressions found.

## Still open / TODO

- [ ] Build out more marketing pages under `src/pages/` (CTET, REET, etc. — same `staticExams.ts` pattern)
