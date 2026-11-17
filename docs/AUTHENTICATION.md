# Account foundation — 17 November 2026

## Implemented

- Bottom-of-sidebar account control and mobile-drawer account entry. Signed-out icon, signed-in avatar/name/email, loading state and account menu.
- Lazy-loaded glass modal: Sign In / Create Account, email/password forms, confirmation, visibility toggle, errors, loading states and forgot-password flow. Native modal focus containment, Escape, scroll lock and focus restoration are implemented but not browser-verified.
- Shared Supabase client and reusable AuthProvider: one session for the account UI and existing AI generator; supported persistent sessions, token refresh, subscriptions and cleanup. No app password table or custom login simulation.
- Registration requests email verification; password recovery uses Supabase PKCE and a fixed same-origin callback. Password update requires an authenticated recovery session. Application redirect targets never come from arbitrary URL parameters. Callback parameters are cleared after processing.
- Profile display-name editing, private avatar upload/removal, account email and sign-out. Avatars are validated as JPG/PNG/WebP up to 2 MB, decoded under existing image bounds, square-cropped and re-encoded as a metadata-free 256px JPEG. Storage accepts JPEG only, up to 2 MB, in the authenticated user's folder.
- Avatar order: uploaded private image via short-lived signed URL; verified Google identity image from an allowlisted Google host; initials. No lookup by email address. The UI does not use an arbitrary user-metadata avatar URL.
- Google OAuth integration is prepared but disabled. Enable it only after real provider configuration and testing.
- My Designs explicitly says coming soon. A repository contract is supplied for future persistence; no fake designs. Existing secure AI request history remains available in AI Studio.
- Privacy text now accurately describes persistent Supabase sessions and private profiles/avatars. Existing AI account allowances and backend restrictions remain unchanged; new accounts receive no automatic AI allowance.

## Current configuration status

Both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are absent. Google is disabled. No live signup, password sign-in, recovery, email delivery, profile upload or refresh-persistence success is claimed. The migration below exists locally and has been tested locally, **not applied to a live project**. The interface fails closed while unconfigured.

## Exact setup

1. Select the intended Supabase project. Review existing schemas and policies before applying `supabase/migrations/202611170001_profiles.sql`, after the existing AI migration. The new migration creates `public.profiles`, backfills existing users, adds the signup trigger, owner-only RLS and a private `profile-avatars` bucket. It intentionally fails on conflicting existing table/bucket names rather than overwriting them.
2. Set in `.env.local` for development, and Vercel project environment variables for deployment:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
   VITE_GOOGLE_AUTH_ENABLED=false
   ```

   Use the same Supabase project as the existing AI backend. Never put a service-role key, Google secret or SMTP password in a VITE_ variable. Restart Vite after local changes; rebuild for production.
3. In Supabase Authentication, enable email/password signup and **Confirm email**. Configure a server-enforced minimum password length of 12 (the UI requires 12–128), appropriate password security settings and Auth rate limits. Review secure password-change/reauthentication settings. Supabase enforces endpoint rate limits; browser loading states are not an abuse barrier.
4. Configure custom SMTP with a verified sender and test confirmation/recovery delivery. Retain working ConfirmationURL links in signup and recovery templates. Existing generator OTP templates must also retain the token if that sign-in path is used. Do not rely on the demonstration email service for public registration.
5. Set Supabase Site URL to the verified production origin. Add exact allowed callback URLs for the origins actually used:
   - `http://localhost:5173/?auth=callback`
   - `http://localhost:5174/?auth=callback` only if that local port is used
   - `https://YOUR_PRODUCTION_DOMAIN/?auth=callback`

   PKCE email links must be opened in the browser that initiated the flow. If the verifier is unavailable or the link expires, request a fresh link. Do not add broad production wildcard redirects.
6. Google: follow [GOOGLE-AUTH.md](GOOGLE-AUTH.md) for the dedicated `/auth/callback` flow and exact dashboard setup. Copy the real Supabase callback from the dashboard; never guess it. Google remains disabled until the provider and public environment are configured.
7. Keep `AI_ENABLED=false` until the existing separate AI deployment setup is complete. Registration alone does not populate or enable `ai_accounts`.

## Security and operational limits

Profiles expose only the current user's row. Browser roles cannot change IDs/timestamps, delete profiles, read another user's row, or make the avatar bucket public. Restrictive policies defend against broad pre-existing storage policies. Profile photos use random owned paths and private URLs; old uploaded objects are deleted after a successful replacement/removal. Failed cleanup is reported, and operators should review orphaned objects after interrupted uploads. Browser image sanitation is a UX protection; storage enforces ownership, size and declared MIME, not a full malware scanner.

Passwords go directly to Supabase Auth. Sessions are persisted by its supported SDK and are not HTTP-only cookies; maintain the existing CSP and avoid unsafe HTML/script injection. Google avatar loading sends an image request to the allowlisted provider with no referrer. No legal-compliance certification is claimed. Define operational retention/account-deletion procedures before public launch; self-service deletion is not implemented in this scope.

## Tests actually completed

- `npm run build`: frontend/backend TypeScript and production build passed; 39 routes plus 404.
- `npm test`: existing Phase 2–8 regression suite passed, including material rendering/export and secure AI endpoint/database tests. AI provider tests use test doubles, not live paid generation.
- `npm run test:auth`: local PostgreSQL/PGlite migration execution passed; existing-user backfill and signup trigger; owner reads/updates; forbidden cross-user changes; immutable IDs/timestamps; name/path constraints; private avatar access despite broad policies; protected bucket; upload MIME/size configuration. Also tests name/email/password validation, initials and trusted avatar URL selection.
- `npm run check:security`: no common credential-pattern matches in source/build. This is a heuristic check, not proof of absence of all secrets.
- Browser test attempted, blocked by `Browser Use could not read config`. Modal opening/tabs, actual mobile focus, layout, email delivery, session refresh and sign-out visuals remain unverified.

## Live acceptance checklist (required before launch)

1. Open the modal from desktop and mobile; switch tabs and close with Escape; verify focus restoration and no navigation overlap at short viewport heights.
2. Register a test user; verify no success is shown for a failed request; follow the confirmation email and sign in.
3. Verify initials/name/email, update the profile, upload and remove a valid image; reject invalid/oversized files.
4. Refresh and open another tab; verify persistent session and sign-out propagation. Attempt user A access to user B's profile and avatar via the actual API; verify rejection.
5. Request recovery, follow the same-browser link, change password; test expired/invalid links and reauthentication settings.
6. Enable/test Google only with the actual provider configured; verify provider picture and initials fallback.
7. Confirm new users cannot generate paid AI images without an enabled studio allowance.

## Reference documentation

- [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords)
- [Redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls)
- [Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)
- [Google provider setup](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)

Google OAuth implementation and dashboard setup: [Google authentication](GOOGLE-AUTH.md). Dedicated Google callback: `/auth/callback`; email recovery retains `/?auth=callback`.
