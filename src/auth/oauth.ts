import {withBase,withoutBase} from '../config/paths';
import {googleEnabled} from './config';

const returnKey='halena.auth.return';
/** Relative app routes only; never accept an external callback destination. */
export function safeReturnPath(value:unknown){
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\x00-\x20]/.test(value))return '/';
 const url=new URL(value,'https://halena.invalid');
 if(url.origin!=='https://halena.invalid'||url.pathname.startsWith('/auth/'))return '/';
 if(!/^\/(?:$|about$|services(?:\/[^/]+)?$|projects(?:\/[^/]+)?$|materials(?:\/[^/]+)?$|material-try-on$|ai-studio$|contact$|privacy-policy$|terms-of-service$)/.test(url.pathname))return '/';
 for(const key of ['code','auth','access_token','refresh_token','error','error_description'])url.searchParams.delete(key);
 return url.pathname+url.search+(url.hash.includes('token=')?'':url.hash);
}
export function consumeReturnPath(){
 try{const raw=sessionStorage.getItem(returnKey);sessionStorage.removeItem(returnKey);if(!raw)return '/';const {path,time}=JSON.parse(raw);return typeof time==='number'&&Date.now()-time>=0&&Date.now()-time<900000?safeReturnPath(path):'/';}catch{return '/';}
}
export async function startGoogleSignIn(){
 if(!googleEnabled)throw new Error('Google sign-in is not configured yet. The studio must enable its Supabase Google provider.');
 const {authClient}=await import('./client');if(!authClient)throw new Error('Account services are unavailable.');
 try{sessionStorage.setItem(returnKey,JSON.stringify({path:safeReturnPath(withoutBase(location.pathname)+location.search+location.hash),time:Date.now()}));}catch{/* Login can still return home when storage is restricted. */}
 const {error}=await authClient.auth.signInWithOAuth({provider:'google',options:{redirectTo:new URL(withBase('/auth/callback'),location.origin).href,queryParams:{prompt:'select_account'}}});
 if(error)throw new Error('Google sign-in could not be started. Please retry or contact the studio.');
}
/** The SDK exchanges PKCE once, even when StrictMode remounts the callback. */
let callback:Promise<void>|undefined;
export function completeGoogleCallback(){
 return callback??=(async()=>{
  const url=new URL(location.href),hash=new URLSearchParams(url.hash.slice(1));
  if(url.searchParams.has('error')||hash.has('error'))throw new Error('Google sign-in was cancelled or denied. Please try again.');
  const code=url.searchParams.get('code');if(!code)throw new Error('This sign-in link is incomplete. Start Google sign-in again.');
  const {authClient}=await import('./client');if(!authClient)throw new Error('Account services are not configured.');
  const {data,error}=await authClient.auth.exchangeCodeForSession(code);
  if(error||!data.session||!data.user)throw new Error('This sign-in link expired or could not be verified. Start again in the same browser.');
 })().finally(()=>history.replaceState(history.state,'',withBase('/auth/callback')));
}
