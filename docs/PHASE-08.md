# Phase 8 — production audit and deployment report

Audit date: 16 November 2026, Asia/Dhaka. Workspace: `E:\The Halena`.

**Outcome: local preparation completed; launch blocked; not pushed or deployed.**
All existing pages, visual design, navigation, animations, catalog, manual studio,
AI generator and backend source are retained. No remote repository was overwritten.

## 1. Production build

- `npm install`: passed. The test bundler `esbuild` is now a direct development
  dependency rather than relying on Vite's transitive dependency.
- `npm run build`: passed, including environment validation, strict frontend and
  backend TypeScript checks, Vite production build and 39 prerendered routes + 404.
- `npm test`: Phase 2–8 suites passed. No lint script/configuration is present.
- Node 24.x is declared for reproducible runtime selection; audit used 24.21.0.
- npm reported unapproved esbuild postinstall hooks under the local npm policy.
  The installed platform binaries successfully built/tested the app. A clean
  Vercel/Linux install and function packaging still need deployment verification.

## 2. Functional results

| Area | Evidence / result | Limits |
| --- | --- | --- |
| Home/About/Services/details | Rendered route, heading, internal-link and asset checks pass | Browser visual interactions unverified |
| Projects/details/filtering | Concept coverage, destinations and generated markup pass | Interactive gallery animation not browser-tested |
| Materials/details | 12 stable IDs, nine families, all facets/search/clear/empty cases pass | Browser filter/drawer interaction unverified |
| Studio material handoff | All 12 selected-material routes and invalid IDs checked | Real navigation/hydration needs browser test |
| Local image handling | Type/signature/size/dimension validation and real image decoding tested | File-picker/drop interaction unverified |
| Material try-on | Real canvas texture rendering, perspective corners, clipping, adjustment controls, history/undo/redo and PNG pixel checks pass | Browser pointer/keyboard interactions unverified |
| Export | 111,421 wall pixels changed and zero outside-mask changes in test fixture; decoded PNG matches composition | Device download interaction unverified |
| AI request/download | Provider contract, failure handling, ownership, deletion, duplicate prevention and blob workflow reviewed/tested where automated | No real provider request/result/download |
| Backend | Request validation, auth/origin/cron rejection, PostgreSQL quotas/rate/budget/idempotency and RLS restrictions pass | Embedded PostgreSQL/test doubles, not deployed Supabase |
| Contact | International brief validation, file constraints, error feedback and local download tests pass | Submission backend absent; UI correctly says nothing is sent |
| Legal/SEO | Updated factual notices, unique metadata, domain guards, canonical/structured-data fixture tests pass | Business/legal review and production-domain verification pending |

Local HTTP smoke test served all 39 built routes, robots.txt and sitemap.xml with
HTTP 200. This was Vite preview, not Vercel runtime validation. The custom 404
artifact and Vercel clean-URL configuration are verified locally; deployed unknown
route status remains to be checked. All 20 local raster image headers decode;
public assets total 11,418,109 bytes, largest asset 2,983,667 bytes. Remote reference
image availability was not comprehensively tested.

Browser access again failed with “Browser Use could not read config.” Therefore
360/390/768/1024/1440/1920px visual QA, keyboard/pointer workflows, real hydration,
CSP behavior and Lighthouse remain unverified. No scores/certification are claimed.

## 3. Security findings and fixes

- Live `npm audit` reported **zero known vulnerabilities** across all severities.
  This is registry advisory evidence at audit time, not a security guarantee.
- Heuristic source/build scanning found no common API-key, private-key or
  service-role JWT patterns. Values are never printed by the scanner. Arbitrary
  secrets and unavailable remote history cannot be conclusively excluded.
- Added public-env allowlisting and rejection of service-role/secret Supabase keys
  in browser variables. Production builds require a verified HTTPS origin; AI
  activation checks required secrets, matching projects/origins and cron-secret
  length. These checks do not validate credentials against providers.
- Added explicit Vercel build/install/output settings, Node version, stronger Git
  and deployment exclusions, and current setup/deployment documentation.
- Corrected stale privacy/terms assertions that uploads and accounts did not exist.
  Notices now distinguish browser-local editing, optional external AI processing,
  private storage, expiry versus scheduled deletion and retained usage records.
- Backend review: verified bearer auth through Supabase, no wildcard CORS, exact
  origin checks for writes, bounded JSON/images, actual image decoding and metadata
  removal, atomic database quotas, private storage and short-lived owned result
  links. Paid provider POSTs are never automatically retried. Logs use coarse error
  codes/random job IDs, not image/prompt/token contents.
- Public status/auth surfaces still require hosting/Auth abuse monitoring. Verify
  live RLS, cleanup, SMTP and signed-result policies before enabling AI. Current
  CSP supports standard Supabase domains; custom domains need explicit review.

The stale legal-source hash assertion was replaced by factual legal-content checks;
route, form, security and studio regressions remain. No functionality was removed
to make the build pass.

## 4. AI integration status

Real OpenAI image-edit adapter and Supabase integration are implemented. No API
keys, Supabase project settings or enabled accounts were supplied. Environment is
unconfigured and generation fails closed. **Real AI generation, live storage and
AI result download are not verified.** Test doubles never become public results.

## 5. Material Try-On

Local canvas implementation passes substantive rendering/export/history tests.
HLM-011 and HLM-012 have actual textures; other catalog studies remain clearly
reference-only. User photos stay local unless explicitly submitted to the separate
configured AI generator. Real-device interaction acceptance remains outstanding.

## 6. Contact backend

`inquiryGateway` is null. Validation and local brief downloads work in automated
checks. No email, database submission or reference upload is sent. A real delivery
provider, recipient, server implementation and acceptance test are required for
full contact functionality. No successful submission is simulated.

## 7–9. GitHub and Vercel

- GitHub account authentication verified: `nurul836`.
- Local Git initialized on `main`; source prepared/staged with exclusions.
- Repository URL: **not provided; no remote added or repository created**.
- Commit URL: **none; not committed/pushed**. Commit author identity is unset.
- Vercel deployment URL: **none; not deployed**.
- Vercel account/team/project, domain and deployment access are unconfirmed.
- Hourly cleanup is retained. Current Vercel Hobby cron limits reject an hourly
  schedule; confirm a supporting plan/scheduler before deployment. No purchase or
  plan change was made. See the official references in `DEPLOYMENT.md`.

## 10. Required environment variables

The complete public/server variable table, defaults and scopes are in
`DEPLOYMENT.md` and `.env.example`. Production needs `VITE_SITE_URL`; real AI needs
the public Supabase URL/key plus server-only `OPENAI_API_KEY`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `APP_ORIGIN`, `CRON_SECRET`, and enabled AI settings.
Real business contact details also remain missing. Never paste secrets into chat.

## 11. Remaining blockers

1. Exact GitHub URL and remote-history review; approved Git author identity.
2. Verified Vercel account/team/project/access, suitable plan and production origin.
3. Real provider/Supabase/SMTP configuration, applied migration and enabled accounts.
4. Live AI, private-storage, cleanup and cross-account acceptance tests.
5. Chosen and implemented contact delivery backend, or explicit acceptance of a
   limited launch with genuine published contact details.
6. Real-browser/device, hydration, accessibility and performance validation.
7. Business/legal/privacy/retention/image-rights review before commercial launch.

## 12. Final launch checklist

Follow `DEPLOYMENT.md` for exact manual setup, environment entry, nonempty-remote
handling, live route/API checks and rollback. Do not claim launch until the actual
HTTPS URL, target commit, server functions and intended live workflows have been
verified. Current domain-free build is intentionally noindex with an empty sitemap.
