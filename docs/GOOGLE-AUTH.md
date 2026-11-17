# Google account authentication — 17 November 2026

## Implementation and current status

Google uses Supabase `signInWithOAuth`, PKCE, and the existing shared auth client. The same button signs in returning users and lets Supabase create first-time users. The application does not create a second user or link identities by trusting a browser-supplied email. Supabase owns identity linking. Keep secure email verification enabled and test an existing email/password account with Google before launch.

The dedicated `/auth/callback` page exchanges the code once, including under React StrictMode. SDK automatic URL detection is disabled only on that route to avoid a competing exchange. Existing email confirmation/recovery callbacks at `/?auth=callback` continue using SDK detection. Invalid, cancelled, missing and expired OAuth callbacks show an error, never success based on a previously stored session. Callback query parameters are removed after processing.

The original page is stored in sessionStorage for up to 15 minutes. Only recognized same-origin relative app routes can be restored. No URL `next` parameter is trusted. If storage is blocked, return defaults to Home; session persistence across reloads requires browser storage. The shared SDK restores and refreshes sessions, updates the sidebar and handles sign-out. Google API access/refresh tokens are stripped from persistent storage; Supabase session tokens remain for authentication. No Gmail API access or token logging is added. Google account chooser uses `prompt=select_account`.

Existing profiles migration supplies `auth.users.id` linkage, owner-only RLS, validated names/owned avatar paths, signup trigger and private avatar storage. Uploaded avatars take precedence over a verified Google identity image; missing/failed images fall back to initials. New accounts do not automatically receive paid AI allowance. My Designs retains its existing coming-soon status.

**This workspace has no configured Supabase URL/public key and Google is disabled. No live dashboard provider status can be verified. No project callback URL or production domain is known.** The disabled Google button explains the configuration requirement. No live migration was applied.

## Configure the existing project

1. Open the same Supabase project used by THE HALENA backend. In Authentication → Sign In / Providers → Google, copy the exact **Callback URL** shown there. This is the Google-to-Supabase redirect URI. Do not substitute the website's `/auth/callback`, and do not guess the project reference. Supply this copied value when configuring Google below.
2. In Google Cloud select the intended project, then Google Auth Platform → Branding (OAuth consent screen). Set THE HALENA app name, monitored support/developer emails, verified website domain, homepage and privacy/terms URLs using the real published site. In Audience choose the appropriate external audience for international clients; add test users while in Testing. Complete Data Access with only the basic OpenID/email/profile scopes. Follow Google's publication/verification requirements before broad access.
3. In Google Auth Platform → Clients create an OAuth client of type **Web application**. Add the exact copied Supabase Callback URL under **Authorized redirect URIs**. Save the client ID and client secret securely.
4. This implementation redirects through Supabase and does not use the Google Identity Services browser SDK. If Google asks for Authorized JavaScript Origins, use only the actual website origins: `http://localhost:5173` and, only if used, `http://localhost:5174`; add the verified production HTTPS origin when available. Origins have no path. They are distinct from redirect URIs.
5. Enable Google in Supabase's provider settings. Put the Google client ID and secret there only. Keep nonce/security checks enabled; do not enable insecure email exceptions. Neither credential is required in the React environment. Never put the Google secret or Supabase service-role key in a `VITE_` variable.
6. In Supabase Authentication → URL Configuration, set **Site URL** to the real production HTTPS origin (or the actual localhost origin for a development-only project). Add these exact frontend redirect URLs only for the ports you use:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5174/auth/callback`
   - The verified production origin followed by `/auth/callback` once that domain is known.
   Retain the existing `/?auth=callback` URLs for email confirmation/password reset. Do not add broad production wildcards. A `127.0.0.1` origin is different from `localhost`; explicitly approve its callback only if intentionally used.
7. Set `.env.local` and the matching deployment environment with the actual public values from this same Supabase project:
   ```dotenv
   VITE_SUPABASE_URL=<copy project URL>
   VITE_SUPABASE_ANON_KEY=<copy public anon or publishable key>
   VITE_GOOGLE_AUTH_ENABLED=true
   ```
   Restart Vite or rebuild/redeploy. These values are public client configuration; they do not replace RLS. Review/apply the existing `supabase/migrations/202611170001_profiles.sql` after checking for existing schema conflicts; see AUTHENTICATION.md. Do not rerun it blindly against an already migrated database.

## Verification and remaining acceptance tests

Automated callback contract tests use Supabase test doubles, not real Google accounts. They check Google request/chooser/redirect parameters, safe destination handling, one-time code exchange, missing/cancelled/expired callbacks, URL cleanup and Google token removal. Existing auth tests execute the profiles/storage policies in local PostgreSQL/PGlite.

Browser automation could enumerate the local tabs but could not attach: `Browser Use could not read config`. Desktop/mobile popup appearance and real OAuth redirects therefore remain unverified. After setup, test with authorized test accounts:

1. First Google signup: consent/account chooser → callback → original page. Verify exactly one auth user and profile row.
2. Returning Google login and an existing verified email/password identity: verify intended identity linking in Supabase; do not manually duplicate users.
3. Confirm Google name/email/photo in expanded sidebar and circular photo when collapsed; test photo failure/initials and uploaded-photo precedence.
4. Refresh the page, navigate to Material Try-On/AI Studio, sign out, and simulate an expired/revoked session. Verify protected endpoints reject unauthorized requests.
5. Cancel Google consent; try a missing/expired code or callback in a different browser. Errors must remain explicit; no fake authenticated state.
6. At 1440px, 768px and 390px, verify modal focus, Escape, outside close, hidden scrollbars, keyboard/touch scrolling, tabs and recovery flow. Test storage restrictions and long account names/emails.

The official Google SVG is locally hosted at `public/images/google-signin.svg`, downloaded unmodified from Google's branding examples. Sources: [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [Google branding guidelines](https://developers.google.com/identity/branding-guidelines), [official SVG](https://developers.google.com/static/identity/images/branding_guideline_sample_lt_sq_sl.svg).

### Automated results

- `npm run build`: passed, including frontend/backend TypeScript and 40 prerendered routes plus 404.
- `npm run test:google-auth`: passed the callback/request/security contracts described above (test doubles).
- `npm run test:auth`: passed local profile/ownership/storage migration and validation tests.
- `npm test`: passed existing Phase 2–8 regression suite, including native canvas material application/export and backend contract tests.
- Live Google/Supabase and rendered browser viewport checks: not run for the configuration/browser-tool blockers stated above.
