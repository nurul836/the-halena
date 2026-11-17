import {loadEnv} from 'vite';
import {pathToFileURL} from 'node:url';

const publicNames=new Set(['VITE_SITE_URL','VITE_BUSINESS_EMAIL','VITE_BUSINESS_PHONE','VITE_BUSINESS_ADDRESS','VITE_INSTAGRAM_URL','VITE_PINTEREST_URL','VITE_LINKEDIN_URL','VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY','VITE_GOOGLE_AUTH_ENABLED']);
function origin(value,local=false){try{const u=new URL(value);return !u.username&&!u.password&&u.pathname==='/'&&!u.search&&!u.hash&&(u.protocol==='https:'||(local&&u.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(u.hostname)));}catch{return false;}}
export function validateEnvironment(env){
 const errors=[];const production=env.VERCEL_ENV==='production';
 for(const name of Object.keys(env))if(name.startsWith('VITE_')&&!publicNames.has(name))errors.push(`Unapproved public environment variable: ${name}. Review it before exposing it in a client build.`);
 if(env.VITE_GOOGLE_AUTH_ENABLED&&!['true','false'].includes(env.VITE_GOOGLE_AUTH_ENABLED))errors.push('VITE_GOOGLE_AUTH_ENABLED must be true or false.');
 if(env.VITE_GOOGLE_AUTH_ENABLED==='true'&&(!env.VITE_SUPABASE_URL||!env.VITE_SUPABASE_ANON_KEY))errors.push('Google authentication requires public Supabase configuration.');
 const key=env.VITE_SUPABASE_ANON_KEY||'';
 if(key){let anon=key.startsWith('sb_publishable_');try{anon ||= JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString()).role==='anon';}catch{/* Not a legacy public JWT. */}if(!anon)errors.push('VITE_SUPABASE_ANON_KEY must be a public anon JWT or publishable key, never a service-role/secret key.');}
 if(Boolean(key)!==Boolean(env.VITE_SUPABASE_URL))errors.push('Configure both public Supabase values together.');
 if(env.VITE_SUPABASE_URL&&!origin(env.VITE_SUPABASE_URL))errors.push('VITE_SUPABASE_URL must be an HTTPS origin.');
 if(env.VITE_SITE_URL&&!origin(env.VITE_SITE_URL))errors.push('VITE_SITE_URL must be an HTTPS origin without a path.');
 if(production&&!env.VITE_SITE_URL)errors.push('Production deployment requires the verified VITE_SITE_URL.');
 if(env.AI_ENABLED==='true'){
  for(const name of ['OPENAI_API_KEY','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','APP_ORIGIN','CRON_SECRET','VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY'])if(!env[name])errors.push(`AI is enabled but ${name} is missing.`);
  if(!origin(env.APP_ORIGIN,!production))errors.push('APP_ORIGIN must be an exact HTTPS origin (HTTP loopback is allowed only outside production).');
  if(!origin(env.SUPABASE_URL))errors.push('SUPABASE_URL must be an HTTPS origin.');
  if(env.SUPABASE_URL!==env.VITE_SUPABASE_URL)errors.push('Server and browser Supabase projects must match.');
  if(production&&env.APP_ORIGIN!==env.VITE_SITE_URL)errors.push('APP_ORIGIN and VITE_SITE_URL must match for production AI requests.');
  if((env.CRON_SECRET||'').length<32)errors.push('CRON_SECRET must contain at least 32 random characters.');
 }
 return errors;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const env={...loadEnv('production',process.cwd(),''),...process.env};
 const errors=validateEnvironment(env);
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
 else console.log(`Environment safety checks passed. AI ${env.AI_ENABLED==='true'?'enabled in configuration; live infrastructure still needs verification':'disabled'}. ${env.VITE_SITE_URL?'Production origin supplied.':'No production origin: output remains noindex.'}`);
}
