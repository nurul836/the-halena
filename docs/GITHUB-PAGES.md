# GitHub Pages deployment

The previous blank page served the source index.html, which requested the nonexistent /src/main.tsx. Deploy the compiled dist artifact, not repository source.

The Pages workflow runs npm ci and npm run build with GITHUB_PAGES=true. This sets the Vite and router base to /the-halena/. Default local development and Vercel builds retain /. Images, textures, SEO URLs and authentication redirects follow the same base. Known routes are prerendered as directory index files; 404.html bootstraps the router for other paths without discarding query parameters.

In repository Settings → Pages, set Source to GitHub Actions. The workflow deploys pushes to main and can also be started manually from Actions. The production URL is https://nurul836.github.io/the-halena/.

## Optional authentication configuration

Set repository Actions variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the existing project's public values. Set VITE_GOOGLE_AUTH_ENABLED=true only after configuring the Supabase Google provider. Rebuild after changes. Never place service-role credentials, Google client secrets or OpenAI keys in these variables or browser code.

Allow the exact frontend redirect URLs in Supabase:

- https://nurul836.github.io/the-halena/auth/callback
- https://nurul836.github.io/the-halena/?auth=callback

Google Cloud's authorized provider redirect remains the actual Supabase callback URL shown in the Supabase dashboard. It is not the frontend callback above. Use the site's production URL for Supabase Site URL. Keep approved localhost redirects separately for development.

## Static hosting limitations

Material Try-On, upload, manual surface editing and export run locally in the browser. GitHub Pages cannot execute api/ai, api/cleanup or scheduled server functions. All original server and authentication code remains in the repository. AI generation needs the existing full application deployed to a serverless host such as Vercel with its server-only environment variables; this Pages build reports that requirement rather than making a fake generation request. Connecting Pages to a separately hosted API would additionally require a reviewed API origin and CORS configuration.

Supabase email/password and Google authentication can work directly from this static frontend after public settings, provider configuration and redirect allow lists are supplied. Contact submission still requires its configured real submission service. No live OAuth, AI or contact success should be inferred from a successful static deployment.
