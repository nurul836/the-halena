# THE HALENA

Luxury interior design, material exploration and private AI visualization platform.
React 19, TypeScript, Vite, Tailwind, Motion, React Router and Lucide. Existing pages, animations, sidebar, mobile navigation and studio features are preserved.

**Launch status:** locally audited; not pushed or deployed. Contact submission is not connected. Real AI/Supabase acceptance tests require configured infrastructure and credentials.

## Development and checks

Use Node.js 24.x and npm:

```sh
npm install
npm run dev
```

Copy `.env.example` to ignored `.env.local` when configuring integrations. In a second terminal run `npm run dev:api` (loopback port 8787). Set `APP_ORIGIN` to the exact frontend origin printed by Vite. The frontend proxies `/api` to the local API. Never put server secrets in `VITE_` variables.

```sh
npm run build
npm test
npm run check:security
npm audit
```

Build validates environment safety, checks client/server TypeScript, builds the frontend and prerenders 39 routes plus 404. Run build before tests. `npm run typecheck` is also available. No lint configuration is present. Use `npm ci` with the committed lockfile in deployment.

## Structure

- `src/pages`, `src/components`, `src/styles`: preserved pages and visual system.
- `src/catalog`: twelve stable material studies, filtering and selection.
- `src/studio`: local upload validation, polygons, texture renderer, history/export.
- `src/ai`: invited-account client and real API request helpers.
- `src/services/inquiries.ts`: validated local briefs; submission gateway remains null.
- `src/seo.ts`, `src/entry-server.tsx`: shared metadata and prerendering.
- `api`, `server`: Vercel functions, authenticated generation and private storage.
- `supabase/migrations`: disabled-by-default AI settings, quotas and bucket policies.
- `public/images`: reference imagery and licensed rendering textures.
- `scripts`: environment/security checks and Phase 2–8 regressions.

Routes: `/`, `/about`, `/services`, `/services/:slug`, `/projects`, `/projects/:slug`, `/materials`, `/materials/:slug`, `/ai-studio`, `/ai-studio/generator`, `/contact`, `/privacy-policy`, `/terms-of-service`.

## Feature status

Manual try-on is browser-local. Nine materials have rendering textures; three remain reference-only. AI uses a real OpenAI edit adapter and private Supabase storage, invited accounts and atomic quotas; it fails closed until configured. Test doubles exist only in tests. Contact validates and downloads a local brief; nothing is sent. Publishing an email does not connect a submission backend.

Concept studies are not completed commissions. Material suitability is not supplier-verified. Legal notices describe current behavior but need business identity, retention and legal review.

## Production

Deploy the repository, not only `dist`, so Vercel includes Node API functions. Configuration specifies Vite, `npm ci`, `npm run build`, `dist`, clean URLs, function durations and hourly cleanup. There is no blanket homepage rewrite: known routes are prerendered and unknown URLs should return a genuine 404.

Set `VITE_SITE_URL` to the verified HTTPS production origin. Vercel production builds fail without it; unconfigured local/preview builds remain noindex. Public Supabase keys are checked against accidental service-role exposure.

Read [deployment instructions](docs/DEPLOYMENT.md) and [the audit report](docs/PHASE-08.md). The ignored `.openai` directory is historical static-hosting state and does not deploy the backend.

Material readiness audit: see docs/MATERIAL-READINESS.md. Run npm run test:materials for every eligible material.


Account authentication and private profile setup: see docs/AUTHENTICATION.md. Run npm run test:auth for migration/ownership validation. Live Supabase configuration is required; accounts do not receive AI generation allowances automatically.

Google OAuth implementation and dashboard setup: [Google authentication](docs/GOOGLE-AUTH.md). Dedicated Google callback: `/auth/callback`; email recovery retains `/?auth=callback`.
