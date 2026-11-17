const env=import.meta.env as Record<string,string|undefined>;
export const authUrl=env.VITE_SUPABASE_URL||'';
export const authKey=env.VITE_SUPABASE_ANON_KEY||'';
export const authConfigured=Boolean(authUrl&&authKey);
export const googleEnabled=authConfigured&&env.VITE_GOOGLE_AUTH_ENABLED==='true';
/** Fixed same-origin callback. Never use an untrusted next/redirect parameter. */
export const authRedirect=()=>new URL('/?auth=callback',window.location.origin).href;
