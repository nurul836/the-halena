import type {User} from '@supabase/supabase-js';
export const validEmail=(value:string)=>value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function validatePassword(password:string,confirmation:string){
 if(password.length<12||password.length>128)return 'Use a password between 12 and 128 characters.';
 if(password!==confirmation)return 'The passwords do not match.';
 return '';
}
export function validateName(name:string){return name.trim().length<2||name.trim().length>80?'Use a display name between 2 and 80 characters.':'';}
export function initials(name:string){return name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(v=>Array.from(v)[0]).join('').toUpperCase()||'H';}
export function trustedOAuthAvatar(user:User|null){
 const identity=user?.identities?.find(i=>i.provider==='google'&&i.identity_data?.email_verified===true);
 const raw=identity?.identity_data?.avatar_url||identity?.identity_data?.picture;
 try{const url=new URL(String(raw));return url.protocol==='https:'&&!url.username&&!url.password&&(url.hostname==='lh3.googleusercontent.com'||/^lh[0-9]+\.googleusercontent\.com$/.test(url.hostname))?url.href:null;}catch{return null;}
}
export const ownedAvatar=(id:string,path:string)=>new RegExp(`^${id}/[a-f0-9-]{36}\\.jpg$`).test(path);
