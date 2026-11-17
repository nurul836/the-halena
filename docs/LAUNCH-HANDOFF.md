# THE HALENA launch handoff — 17 November 2026

## Verified locally

- Exact lockfile installation (`npm ci`) completed; npm reported zero vulnerabilities.
- Production build passed, including frontend/backend TypeScript and 40 prerendered routes plus 404.
- Source/build credential-pattern scan passed. Git index scan covered 151 files (126 text files), with no matching credentials or excluded private paths. These are heuristic checks, not proof that arbitrary secrets cannot exist.
- The complete source, assets, API functions, migrations, environment example and documentation are prepared on local `main`. The Git author uses the verified account's GitHub noreply identity.
- No website design, rendering logic, authentication, AI or backend behavior was changed for this publishing task.

## External status

The connected GitHub account is `nurul836`. The requested target is `https://github.com/nurul836/the-halena`; the authenticated repository lookup returned 404 (missing or inaccessible). The connector cannot create repositories, and local Git Credential Manager has no saved GitHub login. A device authorization attempt did not produce a usable flow; it was stopped. Browser attachment also failed. No remote was added, no push completed, and no GitHub commit URL exists yet.

Vercel is available as an integration but is not connected. No local Vercel login, project link or deployment URL was found. No deployment was made and no live-site checks are claimed.

## Unblock GitHub

In the user's own PowerShell, run:

```powershell
git credential-manager github login --username nurul836 --browser
```

Complete GitHub's browser authorization. Do not paste credentials into chat. Once authenticated, recheck the target before creating a private repository. If creating it manually at https://github.com/new, choose owner `nurul836`, name `the-halena`, Private, and do not initialize a README, license or gitignore. If the repository already exists, inspect its contents/history first. Never force-push or replace unrelated history.

For a verified empty repository only:

```powershell
Set-Location 'E:\The Halena'
git ls-remote https://github.com/nurul836/the-halena.git
git remote add origin https://github.com/nurul836/the-halena.git
git push -u origin main
```

If origin already exists, inspect and preserve it when correct instead of running `remote add` again. Verify GitHub's branch SHA equals `git rev-parse HEAD` and verify source/config/assets before reporting upload success.

## Exact Vercel import steps after push

1. Sign in to the intended Vercel account/team. Search existing projects for a connection to `nurul836/the-halena`; reuse it if present. Otherwise select Add New → Project and import that repository, granting the GitHub integration access to the private repository.
2. Root directory: repository root. Framework: **Vite**. Node: **24.x**. Install: **npm ci**. Build: **npm run build**. Output: **dist**. Production branch: **main**.
3. Preserve `api/ai.ts`, `api/cleanup.ts`, security headers, clean URLs and existing redirect rules. The build prerenders all known public/detail/callback routes; do not add a blanket rewrite that intercepts API routes.
4. Confirm the plan supports the existing hourly `0 * * * *` cleanup and 180-second function duration. Hobby permits only daily cron jobs and rejects this schedule. Do not silently lower cleanup frequency; use a suitable plan or separately review a different cleanup service/retention design.
5. Configure real environment values in Project Settings → Environment Variables. Never enter dummy credentials. Set `AI_ENABLED=false` until backend setup and live tests are complete. Keep Google disabled until its provider configuration is complete.
6. Copy the actual assigned production domain from Vercel project settings, or connect the verified owned domain. Set `VITE_SITE_URL` and `APP_ORIGIN` to that HTTPS origin. Rebuild after changing Vite variables; without a production origin the build intentionally remains noindex and has no production sitemap URLs.
7. Deploy. Inspect build/function logs without exposing secrets. Verify the actual live URL, all routes and assets, Material Try-On upload/four-corner/material/export flow, sidebar/mobile controls and auth UI. Test real AI, Google OAuth, storage and contact delivery only after their infrastructure is configured.

Current Vercel references: https://vercel.com/docs/git/vercel-for-github and https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing.

## Missing configuration

No real local `.env` file was present; `.env.example` contains placeholders/defaults only.

| Variables | What they enable |
| --- | --- |
| `VITE_SITE_URL` | Verified production canonical URLs, indexing and sitemap |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Account/session and Google frontend integration; use public project keys only |
| `VITE_GOOGLE_AUTH_ENABLED` | Set true only after Google/Supabase OAuth setup |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Server-side AI data/storage integration |
| `OPENAI_API_KEY` | Real AI image provider calls |
| `APP_ORIGIN` | Exact allowed production browser origin |
| `CRON_SECRET` | Protected cleanup execution; use a cryptographically random secret |
| `AI_ENABLED` | Keep false until infrastructure and controlled AI acceptance tests pass |

Additional defaults and limits are documented in `.env.example` and DEPLOYMENT.md. Google Client ID/Secret belong in Supabase's provider settings, never browser environment variables. Apply/review the existing database migrations and private-storage RLS in the intended Supabase project. See GOOGLE-AUTH.md for exact callback setup.

Material Catalog and free browser-based Material Try-On do not require paid API credentials. Account login/registration, Google login and real AI remain unavailable until configured. Contact submission still requires the real inquiry delivery gateway described in INQUIRY-INTEGRATION.md; setting an email alone does not activate it.
