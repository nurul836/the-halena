# Phase 7 — editorial refinement and production foundations

Implemented in the existing React/Vite application. The backend, material IDs,
texture rendering, private AI workflow and routes are retained. No Phase 8 work
or deployment was performed.

## Design, motion and accessibility

- Refined hero typography, small-screen composition, CTA spacing and overlay.
- Added local 640/960/1440/1920 WebP hero variants with responsive source selection,
  intrinsic dimensions and high fetch priority. They derive from the existing
  Unsplash reference photograph, not a new commission or generated result:
  https://images.unsplash.com/photo-1600607687920-4e2a09cf159d
- Added keyboard parity for image and CTA hover effects, 44px navigation/gallery
  controls, a named mobile dialog, decorative tooltip semantics, scrollable drawer,
  mobile 16px form fields and focus treatment inside the sidebar.
- Retained Motion as the only animation controller. Refined route movement and
  gallery image fades; retained headline masks, scroll entrances, timelines,
  project filtering and parallax. Reduced-motion CSS safeguards disable visual
  transforms on key imagery/headlines. No heavy 3D or scroll controller added.
- Corrected stale homepage availability copy. Existing workspace upload labels,
  status/error announcements, local export and real-provider availability remain.
- Hash navigation waits for asynchronously loaded page content, handles malformed
  hashes safely, and focuses the destination. This preserves material handoff links.
- All styles load in a deliberate global order so footer styling and refinements
  are identical on direct entry to any lazy route.

## SEO and deployment

`src/seo.ts` is shared by client navigation and build-time rendering. The build
prerenders all 39 known routes plus `404.html`, with real page content, unique
titles/descriptions and Open Graph metadata. When the domain is configured it
also emits canonical URLs, WebPage/WebSite/Organization JSON-LD and a populated
sitemap. No addresses, awards, statistics or final domain are invented.

Set `VITE_SITE_URL` to the actual HTTPS origin, without a path, then rebuild.
Until then every page is noindex, robots.txt disallows crawling and sitemap.xml
has no URLs. Studio workspaces and unknown pages remain noindex even with an
origin configured. These are preview safeguards, not a production SEO launch.
No speculative alternate language URLs or hreflang are emitted.

The architecture follows [Vite's prerendering approach](https://vite.dev/guide/ssr).
Vercel `cleanUrls` serves the generated `.html` routes. The blanket SPA rewrite
has been removed so missing routes return the custom 404 rather than a homepage
with HTTP 200. API function configuration, cron and security headers remain.
See [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json).
Production routing still needs a deployed smoke test; it was not deployed here.

Hydration uses the same shared application and explicit server page registry.
Query-dependent material/workspace entries mount fresh to avoid hydrating a
filter/selection that was not present in build-time HTML. Public content remains
available without JavaScript; interactive workspaces require it. New catalog
entries require rebuilding the static output (or a future dynamic SSR layer).

## Performance evidence

- Main JS: 303.76 kB / 96.72 kB gzip, down from Phase 6's 397.24 / 124.55 kB.
- Homepage dependency closure: 466,190 bytes / 151,266 bytes gzip. This includes
  its route and Motion; Supabase and both studio routes are excluded. Previous
  eager JS was approximately 773 kB / 233 kB gzip. This is bundle measurement,
  not a measured network waterfall or a Core Web Vitals score.
- Hero variants: 27,926 / 51,522 / 97,686 / 168,788 bytes respectively.
- Global CSS: 92.44 kB / 19.50 kB gzip. Shared styles stay eager to avoid layout
  flashes and route-dependent cascade changes.
- Removed unused display-font weights from the Google Fonts request. Existing
  preconnect and swap behavior remain. Fonts and other reference images still
  have external network dependencies.

## Verification and limitations

`npm run build` includes strict client and server TypeScript checks, Vite client
compilation and prerendering. `npm test` covers the Phase 2–7 regression suites.
No lint script/configuration is available.

Checks include public routes, internal links, one h1/no header, navigation markup,
unique prerendered metadata, production-origin validation, structured data,
static 404 configuration, stable material IDs/search/filter/handoff, real canvas
texture rendering/export/history, private API authorization and PostgreSQL quota,
rate, budget and idempotency behavior. Provider contract tests use test doubles;
no live AI generation or live Supabase test was run without credentials.

The browser tool failed with “Browser Use could not read config.” Consequently,
360, 390, 768, 1024, 1440 and 1920px viewport screenshots, interactive keyboard
testing, hydration in a real browser and Lighthouse remain unverified. Responsive
CSS and canvas coordinate invariance were checked, but are not substitutes for
visual/device testing. No WCAG certification or Lighthouse score is claimed.

Historical tests now use the explicit server page registry. Obsolete Phase 3
byte-for-byte homepage/navigation preservation checks were retired because this
phase explicitly changes those files; route, content and navigation assertions
remain. The homepage availability assertion now matches shipped functionality.

Before launch: configure the production origin and approved business details;
complete browser/device and deployed route QA; configure/test the real backend
using the Phase 6 instructions; review legal copy against actual operations.
