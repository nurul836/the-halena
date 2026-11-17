# Phase 6 — AI Interior Generator and private backend

## Status

The implementation is complete locally, but **real AI generation has not been activated or verified**. No OpenAI/Supabase credentials were present, no paid provider call was made, and nothing was deployed. The public UI truthfully displays **“AI generation not configured.”** until both server configuration and private infrastructure are ready.

The generator is at `/ai-studio/generator`, linked from the existing manual studio. The manual editor, catalog, homepage, business pages and sidebar/mobile navigation remain in place. No comparison feature or Phase 7 work was added.

## Delivered

- Shared local room-photo selection, file picker/drop, preview, replacement/removal and image validation.
- Eight room types, nine described styles with visual mood references, selected states and optional instructions (1,200 characters).
- Invited-account email-code authentication, fresh explicit processing consent, disabled/unconfigured states, submission lock, real request status, download, deletion and recent-request recovery.
- Browser creates a metadata-free JPEG copy up to 2048 pixels / 2 MB for AI processing; it does not upload until Generate is pressed with consent. The original remains local. Manual texture overlays are not sent.
- Node/Vercel API functions and local API server, separate from the retained Vite frontend.
- Modular provider, storage and orchestration interfaces; server-side validation and credentials; a real OpenAI Images Edits adapter.
- Private Supabase bucket migration, restricted browser access, server-verified user identity, enabled-account allowlist, atomic rate/daily/budget quotas, idempotency, usage metadata and scheduled file deletion.
- Unconfigured automatic segmentation interface only. Existing manual surface selection is still manual.

## Provider contract

The adapter uses the documented `POST https://api.openai.com/v1/images/edits` multipart API. Default model: `gpt-image-1.5`, one image, medium quality, automatic output size, PNG output and high input fidelity. `gpt-image-1-mini` is the alternate explicitly supported model; it omits high input fidelity. Other models fail configuration validation until their parameters/capabilities are reviewed.

The prompt asks for preserved perspective, proportions, windows/doors, realistic materials, lighting and furniture. Geometry preservation is a goal, not a guarantee. A prompt cannot enforce architectural correctness.

Official references checked on 2026-11-16:

- OpenAI image edits: https://developers.openai.com/api/reference/python/resources/images/methods/edit
- Supabase server user verification: https://supabase.com/docs/reference/javascript/auth-getuser
- Email code sign-in: https://supabase.com/docs/reference/javascript/auth-signinwithotp and https://supabase.com/docs/reference/javascript/auth-verifyotp
- Private storage: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Signed download access: https://supabase.com/docs/reference/javascript/storage-from-createsignedurl
- Vercel function limits: https://vercel.com/docs/functions/limitations

No live provider success is claimed. Automated provider responses are confined to the test script and never displayed in the product.

## Activation checklist

1. **Create/review a Supabase project.** Apply `supabase/migrations/202611160001_ai_generator.sql` through the Supabase migration workflow or SQL editor. It creates `ai_settings`, `ai_accounts`, `ai_jobs`, the atomic `reserve_ai_job` RPC, and the private `ai-private` bucket. Review any existing project-wide policies. The migration deliberately defaults generation to disabled.
2. **Configure Auth.** Provision/invite the intended accounts. Enable email OTP, configure delivery through your SMTP provider, and include `{{ .Token }}` in the email template so users can enter a code. Keep anonymous sign-in off. Configure Auth rate limits and production abuse controls. No self-registration is exposed by this application (`shouldCreateUser: false`).
3. **Enable specific accounts and set limits** using server/admin SQL, never browser credentials:

   ```sql
   insert into public.ai_accounts(user_id, enabled, daily_limit)
   values ('REPLACE-WITH-REAL-AUTH-USER-UUID', true, 3)
   on conflict(user_id) do update set enabled=true, daily_limit=3;

   update public.ai_settings
   set enabled=true, daily_job_limit=50, daily_budget_cents=5000
   where id=true;
   ```

4. **Configure the frontend public values:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These may be public; the service-role key must never be used here. Rebuild the frontend after changing Vite variables.
5. **Configure server secrets:** `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a cryptographically random `CRON_SECRET`. Enable access/billing for the selected image-editing model in the OpenAI project. Do not paste secrets into source files, issue reports or browser variables.
6. **Set server options:** `AI_ENABLED=true`, `AI_PROVIDER=openai`, `OPENAI_IMAGE_MODEL=gpt-image-1.5`, exact `APP_ORIGIN` (including port locally, no trailing slash), `AI_RETENTION_HOURS`, `AI_TIMEOUT_MS` and `AI_RESERVATION_CENTS`. See `.env.example` for defaults. Use `.env.local` for development; it is ignored by Git.
7. **Deploy the repository to Vercel**, not just `dist/`. Use a current supported Node runtime (development was tested on Node 24). Build command: `npm run build`; output: `dist`. Vercel also discovers `api/ai.ts` and `api/cleanup.ts`. `vercel.json` excludes `/api/` from the SPA rewrite, sets 180-second function durations, and defines hourly authenticated cleanup. Confirm your plan supports those durations and the hourly cron frequency. The legacy `.openai/hosting.json` is a static-site manifest and does not deploy this Node backend.
8. **Verify cleanup before enabling paid generation.** Vercel cron uses the configured `CRON_SECRET` bearer token. Alternatively, schedule an authenticated call to `/api/cleanup` from an approved scheduler. The handler processes up to 50 expired jobs per invocation; monitor backlog and increase scheduling frequency if needed.
9. **Run one explicit real acceptance test with a non-sensitive image** after credentials, account allowances and billing have been configured. Inspect the provider request in the dashboard, usage/job records, output download, deletion, expired-link denial and cleanup. Run browser/mobile QA before launch. This step has not been performed in this environment.

## Local development

Use two terminals:

```text
npm run dev:api
npm run dev
```

The API binds only to `127.0.0.1:8787`. Vite proxies `/api` to it. Set `APP_ORIGIN` to the actual Vite browser origin (for the current preview: `http://127.0.0.1:5176`). `.env` and then `.env.local` are read by the API command. Restart the API after server configuration changes. With no credentials, `/api/ai?action=status` returns HTTP 200 with `configured:false` and no private values.

## API behavior

| Route | Authorization | Purpose |
| --- | --- | --- |
| `GET /api/ai?action=status` | Public | Sanitized readiness; checks private bucket and enabled DB settings when server config is present |
| `POST /api/ai?action=generate` | Verified user bearer token, exact Origin, enabled account, consent | Validate, reserve once, store private input, call provider once, store private output |
| `GET /api/ai?action=jobs` | Verified user token | Last 20 own requests, without prompts, images, hashes or provider secrets |
| `GET /api/ai?action=result&id=UUID` | Verified owner token | Short-lived private result URL, only for unexpired successful jobs |
| `POST /api/ai?action=delete` | Verified owner token, exact Origin | Delete input/output objects before marking metadata deleted |
| `GET /api/cleanup` | Cron secret | Delete expired private image objects |

No anonymous paid generation is available. The server verifies tokens through Supabase Auth, rejecting anonymous and unconfirmed users. Client-supplied user IDs, model names, storage paths, URLs or prices are not accepted.

## Privacy, retention and failure semantics

- Local selection does not send photo pixels externally. Generation requires explicit consent to send the processed copy and instructions to OpenAI and private studio storage.
- Sharp validates decoded images, enforces input pixel limits, strips metadata and normalizes to PNG on the server. Arbitrary remote image URLs, SVG and animated images are not accepted. Provider results are decoded/validated too.
- Only service-role server operations can access the private bucket. Restrictive storage policies prevent accidentally broad existing browser policies from exposing it. RLS is enabled on job/account/settings tables with no browser grants.
- Result access is signed for 60 seconds and unavailable once the job expires. A URL issued just before expiry may remain valid for its remaining short lifetime. An already downloaded copy cannot be revoked.
- Retention defaults to 24 hours and can be configured from 1–168 hours. App access expires at the deadline; physical deletion occurs on the next successful cleanup run, normally within one hour if there is no backlog. Cleanup failures/backlogs need operator alerts. Merely setting the retention variable does not guarantee deletion if the scheduler is not deployed.
- Users can delete stored input/output files. Active processing cannot be deleted for ten minutes, preventing a running function from recreating objects after deletion. Old unconfirmed processing jobs are reconciled to `uncertain` during reads and can then be deleted.
- Minimal job metadata, consent timestamp/version, model, opaque provider request ID, status and usage counters remain after image deletion to enforce quotas and reconcile billing. Prompts and image base64 are not stored in job metadata. Define an audited metadata retention/anonymization policy before production, especially before deleting Supabase Auth users referenced by jobs.
- Deleting studio files does not delete any independently retained provider copy. Review provider data retention, vendor agreements and applicable international privacy requirements. No regulatory compliance claim is made.
- Images/results are not placed in localStorage. Auth sessions are memory-only; reloading requires signing in again. The backend's recent-request list recovers completed jobs after reconnecting. Auth changes clear private UI results; short-lived image object URLs are revoked.

## Quotas, costs and retries

`reserve_ai_job` runs under a transaction-level advisory lock. It enforces one start per account per minute, one active job per account, a UTC daily account allowance, a global daily job count and an internal reservation budget. Failures, unknown outcomes and deleted jobs still count, so deletion/retries cannot replenish allowances. Reusing an ID with the same user/content returns its existing job; changing content/user for that ID is rejected.

`AI_RESERVATION_CENTS` is an operator-set conservative accounting reservation per attempt, **not a quoted provider price or exact cost measurement**. The internal budget caps reservations, not the provider invoice. Set it using current provider pricing and a margin, retain the hard job-count limits, and monitor OpenAI project usage/spend separately. Actual usage varies with model, image size, quality and prompt. Storage, egress and hosting can also incur charges.

Successful provider usage counters and request IDs are recorded before output processing/storage, so a later storage failure can still be reconciled. Errors/timeouts may have no usage receipt and may still incur provider costs. Logs contain only a coarse error code and random job ID, never images, prompts, authorization tokens, private signed URLs or raw provider errors.

Paid image-edit POSTs are **not automatically retried**, including network timeouts and 5xx outcomes: provider acceptance may be ambiguous. Safe metadata/signing reads retry at most once with a short delay. Users must inspect existing requests and explicitly prepare/consent to a new design before another potentially billable attempt. Leaving the page does not cancel provider processing. Runtime timeouts can leave uncertain jobs; they are never automatically resubmitted.

Example admin monitoring query:

```sql
select model, status, count(*) as attempts,
       sum(reservation_cents) as reserved_cents,
       sum(coalesce((usage->>'total_tokens')::bigint,0)) as reported_tokens
from public.ai_jobs
where created_at >= now() - interval '24 hours'
group by model, status;
```

## Production limitations / review

- No live OpenAI, Supabase Auth, storage, SMTP or Vercel cron acceptance test has run.
- Browser controls remain unavailable (“Browser Use could not read config”), so real file picker/drop, sign-in email/code flow, mobile layouts, result download dispatch, token refresh and console checks remain unverified. Static route rendering is not browser QA.
- Add deployment-level WAF/IP limits and suitable Auth abuse controls; the implemented durable quotas protect paid generation starts, not every read endpoint or email-code request.
- Vercel CSP currently permits Supabase `*.supabase.co` endpoints. Adjust `connect-src` deliberately if using an approved custom Supabase domain. Do not widen it to arbitrary origins.
- Synchronous bounded generation is appropriate for this initial gated release. Longer jobs or higher volume should move to a durable queue/worker with provider-aware reconciliation; do not silently retry paid tasks.
- Review security, privacy language, vendor processing/retention, account offboarding, audit metadata retention and operational alerting before opening international public access.

## Files and verification

New: `src/ai/options.ts`, `client.ts`, `segmentation.ts`; `src/pages/InteriorGenerator.tsx`; `src/styles/generator.css`; `server/{config,errors,validation,provider,store,generation,http}.ts`; `api/{ai,cleanup}.ts`; migration SQL; `scripts/dev-api.ts`; `scripts/verify-phase6.mjs`; `tsconfig.server.json`.

Updated: App routing/metadata, one generator link in the manual studio, `.env.example`, Vite proxy/vendor chunk splitting, Vercel routing/headers/cron, package manifests. Supabase and Sharp are runtime dependencies; PGlite is development-only for database tests.

`npm run build` checks frontend and backend TypeScript and builds Vite. Vendor chunk splitting removes the earlier >500 kB chunk warning. All Phase 2–5 regression scripts and `node scripts/verify-phase6.mjs` pass.

Phase 6 tests include real image decoding and EXIF stripping, invalid image/request rejection, provider multipart contract and error paths, no repeated paid calls, safe-read retry, concurrent duplicate prevention, owner-only results/deletion, processing deletion guards, HTTP authorization/origin/cron rejection, all room/style options and unconfigured UI. The actual migration runs in embedded PostgreSQL and verifies disabled-by-default operation, allowlists, atomic daily/rate/global budgets, conflicting idempotency, concurrent reservations, RLS and private storage restrictions despite a deliberately broad existing policy.

Tests use fake provider responses only inside `scripts/verify-phase6.mjs`. Results: `outputs/phase6/results.json`. Real provider status: **not tested / not configured**.
