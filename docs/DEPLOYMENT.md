# GitHub and Vercel deployment

## Confirm targets first

Required: exact GitHub repository URL, Vercel account/team/project, verified
production domain (or actual assigned Vercel domain), and Git commit author
name/email. GitHub authentication was verified for `nurul836`; no repository was
selected. Vercel access is unavailable. Enter secrets directly in the approved
environment settings, not chat, source files or Git remote URLs.

The local repository is initialized on `main` with no commits or remote. Before
adding a remote, inspect its files, default branch and history:

```sh
git ls-remote CONFIRMED_REPOSITORY_URL
```

If nonempty, clone the remote into a separate checkout, compare contents and
integrate this source on a new branch. Do not overwrite history or force push.
For a verified empty remote, replace the placeholders with confirmed values:

```sh
git config user.name "APPROVED AUTHOR NAME"
git config user.email "APPROVED AUTHOR EMAIL"
npm run check:security
git status --short
git diff --cached --stat
git commit -m "Prepare THE HALENA for production launch"
git remote add origin CONFIRMED_REPOSITORY_URL
git push -u origin main
```

Review staged files before committing. Dependencies, build/test output, local env
files, Vercel state, historical hosting state and private-key files are ignored.
The non-secret `.env.example` is included.

## Configure infrastructure

Follow `PHASE-06.md` for the Supabase migration and account activation. Review the
target project and its existing policies first. Verify the private `ai-private`
bucket, restrictive browser policies, table RLS and service-role-only quota RPC.
Configure invited-account email OTP, real SMTP delivery, token email templates
and Auth abuse controls. Enable only intended accounts with conservative quotas.
Verify OpenAI project access, billing and the selected model. No live service
credentials or acceptance tests were available during this audit.

## Import the repository in Vercel

1. Sign in and verify the account/team; import the exact reviewed repository.
2. Use the repository root, Vite framework, Node 24.x, install `npm ci`, build
   `npm run build`, output `dist`. These settings are recorded in `vercel.json`.
3. Configure the confirmed production domain. If using an assigned Vercel domain,
   copy the actual domain from the project; do not guess it.
4. In Project Settings → Environment Variables, configure the values below.
   Scope production secrets to Production. Use separate non-production services
   if activating AI on Preview; otherwise leave Preview AI disabled.
5. Confirm plan support for hourly cleanup and 180-second Node function duration.
   Verify Fluid compute/runtime settings. The hourly cron cannot deploy on Hobby,
   which only permits daily cron execution. Do not reduce cleanup frequency merely
   to pass deployment. Revisit retention and monitoring before changing scheduling.
6. Deploy only after account, repository, domain and environment checks pass.
   Leave `AI_ENABLED=false` and DB generation disabled until authentication,
   storage, cleanup and controlled acceptance testing are ready.

References checked during the audit:
[Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json),
[Node functions](https://vercel.com/docs/functions/runtimes/node-js),
[cron limits](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing),
[function limits](https://vercel.com/docs/functions/limitations).

## Environment variables

| Variable | Scope and requirement |
| --- | --- |
| `VITE_SITE_URL` | Public; verified HTTPS origin, no path/trailing slash; production required |
| `VITE_BUSINESS_EMAIL` | Public; approved business contact email |
| `VITE_BUSINESS_PHONE`, `VITE_BUSINESS_ADDRESS` | Public; optional verified details |
| `VITE_INSTAGRAM_URL`, `VITE_PINTEREST_URL`, `VITE_LINKEDIN_URL` | Public; optional verified HTTPS profiles |
| `VITE_SUPABASE_URL` | Public; HTTPS project origin, required for AI sign-in |
| `VITE_SUPABASE_ANON_KEY` | Public anon JWT/publishable key; never service role; paired with URL |
| `AI_ENABLED` | Server; `false` until activation checks pass, then `true` |
| `AI_PROVIDER` | Server; `openai` |
| `OPENAI_API_KEY` | Server secret; required for real AI |
| `OPENAI_IMAGE_MODEL` | Server; default `gpt-image-1.5`, verify project model access |
| `SUPABASE_URL` | Server; same project origin as public Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server secret; never VITE-prefixed |
| `APP_ORIGIN` | Server; exact production browser origin matching `VITE_SITE_URL` |
| `CRON_SECRET` | Server secret; at least 32 cryptographically random characters |
| `AI_RETENTION_HOURS` | Server; default 24, allowed 1–168 |
| `AI_TIMEOUT_MS` | Server; default 120000, allowed 10000–150000 |
| `AI_RESERVATION_CENTS` | Server; default 100, budget reservation rather than a price quote |

Rebuild after Vite variable changes. CSP allows standard `*.supabase.co`
connections; custom Supabase domains require explicit CSP review. Environment
checks validate configuration shape, not credential validity, billing, applied
database policies or account ownership. Publishing an email does not activate
contact-form submission: a real gateway still must be chosen and implemented.

## Launch checklist

- Verify the actual HTTPS deployment URL and certificate; record it and the pushed
  GitHub commit URL. Never infer deployment success from a project name.
- Load and reload every route family, including query-string material handoff.
  Confirm unknown paths return HTTP 404 and both API functions are deployed.
- Verify canonical/OG URLs, sitemap and robots against the real production origin.
  Keep non-production deployments protected/noindex as appropriate.
- Test sidebar, drawer, keyboard focus, Escape, reduced motion and 360/390/768/
  1024/1440/1920px layouts; inspect console hydration/CSP errors.
- Use a non-sensitive room photo to test upload, polygons, material changes,
  adjustment controls, undo/redo and actual exported image pixels.
- Verify unauthorized/cross-origin AI requests fail. Sign in as an enabled test
  account, run one controlled paid request, view/download its output, test another
  account cannot access it, and delete stored images.
- Verify authenticated cleanup actually runs and removes expired images. Monitor
  failures/backlog; expiry access control is not proof of physical deletion.
- Implement/test contact delivery with server validation, abuse controls and real
  receipt, or explicitly accept a limited launch with a genuine published contact.
- Obtain review of business identity, privacy contact, retention, service terms,
  international notices and image rights. No legal compliance claim is made.

## Operations and rollback

Retain a verified prior deployment for rollback. Stop paid generation by disabling
`AI_ENABLED` and `public.ai_settings.enabled`; keep cleanup operating. Monitor API
error codes, quotas, provider spend, OTP delivery and expiry without logging
photographs, prompts, tokens or signed URLs. Schema changes need a separately
reviewed backup/rollback procedure; frontend rollback does not undo migrations.
